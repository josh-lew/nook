import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HobbyPicker } from "@/components/ideas/hobby-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  insertIdea,
  insertProjectPhoto,
  uploadProjectPhoto,
  type HobbyType,
  type UploadFile,
} from "../../../lib/projects";

type PhotoDraft = {
  id: string;
  file: UploadFile;
};

export default function CaptureIdeaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [title, setTitle] = useState("");
  const [hobbyType, setHobbyType] = useState<HobbyType | null>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [hobbyError, setHobbyError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ideaSaved, setIdeaSaved] = useState(false);

  /**
   * Set once the Idea row exists, so retrying a failed photo never duplicates it.
   * The text fields lock then too, since a retry only re-sends photos.
   */
  const ideaIdRef = useRef<string | null>(null);

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
      base64: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const next: PhotoDraft[] = result.assets.map((asset, index) => ({
      id: `${Date.now()}-${index}`,
      file: {
        uri: asset.uri,
        name: asset.fileName ?? `idea-${index + 1}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
        base64: asset.base64 ?? undefined,
      },
    }));

    setPhotos((current) => [...current, ...next]);
  };

  const removePhoto = (id: string) => {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  };

  const handleSave = async () => {
    const missingTitle = !title.trim();
    setTitleError(missingTitle ? "Title is required" : null);
    setHobbyError(hobbyType ? null : "Hobby is required");
    if (missingTitle || !hobbyType) {
      return;
    }

    setSubmitError(null);
    setSaving(true);

    let ideaId = ideaIdRef.current;
    if (!ideaId) {
      const result = await insertIdea({
        title: title.trim(),
        hobby_type: hobbyType,
        description: description.trim() || null,
      });

      if (result.error || !result.data) {
        setSubmitError(result.error ?? "Could not save idea.");
        setSaving(false);
        return;
      }

      ideaId = result.data.id;
      ideaIdRef.current = ideaId;
      setIdeaSaved(true);
    }

    for (const photo of photos) {
      const uploadResult = await uploadProjectPhoto(ideaId, photo.file);
      const photoResult =
        uploadResult.error || !uploadResult.data
          ? uploadResult
          : await insertProjectPhoto(ideaId, {
              image_url: uploadResult.data.url,
              // An Idea's photos become its Seed when Promoted
              stage: "idea",
              photo_type: "inspiration",
            });

      if (photoResult.error) {
        setSubmitError(
          `Your idea is saved, but a photo didn’t upload: ${photoResult.error}. Save again to retry, or close.`,
        );
        setSaving(false);
        return;
      }

      setPhotos((current) => current.filter((item) => item.id !== photo.id));
    }

    setSaving(false);
    router.back();
  };

  return (
    <ThemedView
      style={[
        styles.root,
        {
          paddingTop: insets.top + Spacing.three,
          paddingBottom: Math.max(insets.bottom, Spacing.three),
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="smallBold">New Idea</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Just a title and hobby. Add more whenever you like.
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Title
          </ThemedText>
          <TextInput
            accessibilityLabel="Title"
            autoFocus
            editable={!saving && !ideaSaved}
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              if (titleError && value.trim()) {
                setTitleError(null);
              }
            }}
            placeholder="e.g. Granny square tote"
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

        <HobbyPicker
          value={hobbyType}
          disabled={saving || ideaSaved}
          error={hobbyError}
          onChange={(hobby) => {
            setHobbyType(hobby);
            setHobbyError(null);
          }}
        />

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Photos
          </ThemedText>
          <View style={styles.photos}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoWrap}>
                <Image
                  source={{ uri: photo.file.uri }}
                  style={[styles.photo, { backgroundColor: theme.border }]}
                  contentFit="cover"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                  disabled={saving}
                  hitSlop={Spacing.two}
                  onPress={() => removePhoto(photo.id)}
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
              disabled={saving}
              onPress={() => {
                void pickPhotos();
              }}
              style={({ pressed }) => [
                styles.photo,
                styles.addPhoto,
                { backgroundColor: theme.surface, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{
                  ios: "photo.badge.plus",
                  android: "add_photo_alternate",
                  web: "add_photo_alternate",
                }}
                size={26}
                tintColor={theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Description
          </ThemedText>
          <TextInput
            accessibilityLabel="Description"
            editable={!saving && !ideaSaved}
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

        {submitError ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {submitError}
          </ThemedText>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
        >
          <ThemedText themeColor="textSecondary">
            {ideaSaved ? "Close" : "Cancel"}
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save idea"
          disabled={saving}
          onPress={() => {
            void handleSave();
          }}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
            saving && styles.disabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <ThemedText style={{ color: theme.onPrimary }}>Save</ThemedText>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    gap: Spacing.one,
    paddingBottom: Spacing.three,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  secondaryBtn: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  primaryBtn: {
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.6,
  },
});
