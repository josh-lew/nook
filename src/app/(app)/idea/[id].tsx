import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { confirmDelete } from "@/components/confirm-delete";
import { HobbyPicker } from "@/components/ideas/hobby-picker";
import { PatternOptions } from "@/components/project/pattern-options";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  deleteProject,
  deleteProjectPhoto,
  getProjectById,
  insertProjectPhoto,
  updateProject,
  uploadProjectPhoto,
  type HobbyType,
  type ProjectDetail,
} from "../../../../lib/projects";

export default function IdeaScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const ideaId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [idea, setIdea] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [hobbyType, setHobbyType] = useState<HobbyType | null>(null);
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [optionsBusy, setOptionsBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const busy = saving || photoBusy || optionsBusy || deleting;

  /** Reloads the Idea. With `resetFields`, the form takes the saved values too. */
  const load = useCallback(
    async (resetFields: boolean) => {
      if (!ideaId) {
        return;
      }

      const result = await getProjectById(ideaId);
      // Ideas share the projects table, so a Project id must not open here
      if (result.error || result.data?.status !== "idea") {
        setIdea(null);
        setLoadError(result.error ?? "Idea not found.");
        setLoading(false);
        return;
      }

      setIdea(result.data);
      setLoadError(null);
      if (resetFields) {
        setTitle(result.data.title);
        setHobbyType(result.data.hobbyType);
        setDescription(result.data.description ?? "");
      }
      setLoading(false);
    },
    [ideaId],
  );

  useFocusEffect(
    useCallback(() => {
      void load(true);
    }, [load]),
  );

  const dirty =
    idea !== null &&
    (title.trim() !== idea.title ||
      hobbyType !== idea.hobbyType ||
      (description.trim() || null) !== idea.description);

  const handleSave = async () => {
    if (!idea || !hobbyType) {
      return;
    }

    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }

    setActionError(null);
    setSaving(true);
    const result = await updateProject(idea.id, {
      title,
      hobby_type: hobbyType,
      description,
    });
    if (result.error) {
      setActionError(result.error);
      setSaving(false);
      return;
    }

    router.back();
  };

  const addPhotos = async () => {
    if (!idea) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
      base64: true,
    });

    if (picked.canceled || !picked.assets?.length) {
      return;
    }

    setActionError(null);
    setPhotoBusy(true);
    for (const [index, asset] of picked.assets.entries()) {
      const uploadResult = await uploadProjectPhoto(idea.id, {
        uri: asset.uri,
        name: asset.fileName ?? `idea-${index + 1}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
        base64: asset.base64 ?? undefined,
      });
      const photoResult =
        uploadResult.error || !uploadResult.data
          ? uploadResult
          : await insertProjectPhoto(idea.id, {
              image_url: uploadResult.data.url,
              // Ideas' photos move to the `idea` stage when Promote lands (ticket 08).
              stage: "planning",
              photo_type: "inspiration",
            });

      if (photoResult.error) {
        setActionError(`A photo didn’t upload: ${photoResult.error}`);
        break;
      }
    }

    await load(false);
    setPhotoBusy(false);
  };

  const removePhoto = async (photoId: string) => {
    setActionError(null);
    setPhotoBusy(true);
    const result = await deleteProjectPhoto(photoId);
    if (result.error) {
      setActionError(result.error);
    }
    await load(false);
    setPhotoBusy(false);
  };

  const handleDelete = async () => {
    if (!idea) {
      return;
    }

    const confirmed = await confirmDelete(
      "Delete this Idea?",
      `“${idea.title}” will be removed from your Ideas.`,
    );
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setDeleting(true);
    const result = await deleteProject(idea.id);
    if (result.error) {
      setActionError(result.error);
      setDeleting(false);
      return;
    }

    router.back();
  };

  if (loading && ideaId) {
    return (
      <ThemedView style={[styles.root, styles.state]}>
        <ActivityIndicator size="large" color={theme.textPrimary} />
      </ThemedView>
    );
  }

  if (loadError || !idea) {
    return (
      <ThemedView style={[styles.root, styles.state]}>
        <ThemedText themeColor="textSecondary" style={styles.stateText}>
          {loadError ?? "Idea not found."}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setLoading(true);
            void load(true);
          }}
          style={({ pressed }) => [
            styles.retry,
            { backgroundColor: theme.surface },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="smallBold">Retry</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, Spacing.four) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Title
          </ThemedText>
          <TextInput
            accessibilityLabel="Title"
            editable={!busy}
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              if (titleError && value.trim()) {
                setTitleError(null);
              }
            }}
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              {
                color: theme.textPrimary,
                backgroundColor: theme.surface,
                borderColor: titleError ? theme.error : theme.border,
              },
            ]}
          />
          {titleError ? (
            <ThemedText type="small" style={{ color: theme.error }}>
              {titleError}
            </ThemedText>
          ) : null}
        </View>

        <HobbyPicker value={hobbyType} disabled={busy} onChange={setHobbyType} />

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Description
          </ThemedText>
          <TextInput
            accessibilityLabel="Description"
            editable={!busy}
            value={description}
            onChangeText={setDescription}
            placeholder="What caught your eye?"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[
              styles.input,
              styles.multiline,
              {
                color: theme.textPrimary,
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save changes"
          disabled={busy || !dirty}
          onPress={() => {
            void handleSave();
          }}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
            (busy || !dirty) && styles.disabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <ThemedText style={{ color: theme.onPrimary }}>
              Save changes
            </ThemedText>
          )}
        </Pressable>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Photos
          </ThemedText>
          <View style={styles.photos}>
            {idea.photos.map((photo) => (
              <View key={photo.id} style={styles.photoWrap}>
                <Image
                  source={{ uri: photo.imageUrl }}
                  style={[styles.photo, { backgroundColor: theme.border }]}
                  contentFit="cover"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                  disabled={busy}
                  hitSlop={Spacing.two}
                  onPress={() => {
                    void removePhoto(photo.id);
                  }}
                  style={styles.removePhoto}
                >
                  <SymbolView
                    name={{
                      ios: "xmark.circle.fill",
                      android: "cancel",
                      web: "cancel",
                    }}
                    size={22}
                    tintColor={theme.textPrimary}
                  />
                </Pressable>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add photos"
              disabled={busy}
              onPress={() => {
                void addPhotos();
              }}
              style={({ pressed }) => [
                styles.photo,
                styles.addPhoto,
                { backgroundColor: theme.surface, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              {photoBusy ? (
                <ActivityIndicator color={theme.textSecondary} />
              ) : (
                <SymbolView
                  name={{
                    ios: "photo.badge.plus",
                    android: "add_photo_alternate",
                    web: "add_photo_alternate",
                  }}
                  size={26}
                  tintColor={theme.textSecondary}
                />
              )}
            </Pressable>
          </View>
        </View>

        <PatternOptions
          project={idea}
          canChoose={false}
          disabled={busy}
          onBusyChange={setOptionsBusy}
          onError={setActionError}
          onChanged={() => load(false)}
        />

        {actionError ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {actionError}
          </ThemedText>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete idea"
          disabled={busy}
          onPress={() => {
            void handleDelete();
          }}
          style={({ pressed }) => [
            styles.deleteBtn,
            { borderColor: theme.error },
            pressed && styles.pressed,
          ]}
        >
          {deleting ? (
            <ActivityIndicator color={theme.error} />
          ) : (
            <ThemedText style={{ color: theme.error }}>Delete idea</ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  state: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    padding: Spacing.four,
  },
  stateText: {
    textAlign: "center",
  },
  retry: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  photos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  photoWrap: {
    position: "relative",
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: Spacing.two,
  },
  addPhoto: {
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  removePhoto: {
    position: "absolute",
    top: -Spacing.two,
    right: -Spacing.two,
  },
  primaryBtn: {
    alignSelf: "flex-end",
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
  },
  deleteBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.four,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.6,
  },
});
