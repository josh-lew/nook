import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { confirmDelete } from "@/components/confirm-delete";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  deleteMaterialOption,
  insertProjectMaterials,
  updateMaterialOption,
  uploadProjectPhoto,
  type DataResult,
  type ProjectDetail,
  type ProjectDetailMaterial,
} from "../../../lib/projects";

type Draft = {
  /** `new`, or the id of the Material Option being edited. */
  target: "new" | string;
  url: string;
  comment: string;
  /** The saved screenshot, kept unless removed or replaced. */
  photoUrl: string | null;
  picked: ImagePicker.ImagePickerAsset | null;
};

const emptyDraft: Draft = {
  target: "new",
  url: "",
  comment: "",
  photoUrl: null,
  picked: null,
};

type MaterialOptionsProps = {
  project: ProjectDetail;
  disabled?: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  /** Called after any write so the screen can reload. */
  onChanged: () => Promise<void>;
};

/** Candidate yarns and fabrics: add, edit, remove and (on a Project) mark chosen. */
export function MaterialOptions({
  project,
  disabled,
  onBusyChange,
  onError,
  onChanged,
}: MaterialOptionsProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const locked = disabled || busy;
  // Only a Project's Material Options can be marked chosen, not an Idea's
  const canChoose = project.status !== "idea";

  // Chosen materials lead on a Project, so what's in use is seen first
  const materials = canChoose
    ? [...project.materials].sort(
        (a, b) => Number(b.isSelected) - Number(a.isSelected),
      )
    : project.materials;

  /** Runs a write, reports its error, and closes the editor once it succeeds. */
  const run = async (work: () => Promise<DataResult<unknown>>) => {
    onError(null);
    setBusy(true);
    onBusyChange(true);
    const result = await work();
    if (result.error) {
      onError(result.error);
    } else {
      setDraft(null);
    }
    await onChanged();
    setBusy(false);
    onBusyChange(false);
  };

  const pickScreenshot = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      base64: true,
    });

    if (picked.canceled || !picked.assets?.length) {
      return;
    }

    setDraft((current) =>
      current ? { ...current, picked: picked.assets[0] } : current,
    );
  };

  const saveDraft = async () => {
    if (!draft) {
      return;
    }

    const url = draft.url.trim();
    if (!url && !draft.photoUrl && !draft.picked) {
      onError("Add a link or a screenshot.");
      return;
    }

    await run(async () => {
      let photoUrl = draft.photoUrl;
      if (draft.picked) {
        const upload = await uploadProjectPhoto(project.id, {
          uri: draft.picked.uri,
          name: draft.picked.fileName ?? "material.jpg",
          type: draft.picked.mimeType ?? "image/jpeg",
          base64: draft.picked.base64 ?? undefined,
        });
        if (upload.error || !upload.data) {
          return {
            data: null,
            error: `The screenshot didn’t upload: ${upload.error}`,
          };
        }
        photoUrl = upload.data.url;
      }

      const values = {
        url: url || null,
        photo_url: photoUrl,
        comment: draft.comment.trim() || null,
      };
      return draft.target === "new"
        ? insertProjectMaterials(project.id, [values])
        : updateMaterialOption(draft.target, values);
    });
  };

  const toggleChosen = async (material: ProjectDetailMaterial) => {
    await run(() =>
      updateMaterialOption(material.id, { is_selected: !material.isSelected }),
    );
  };

  const remove = async (material: ProjectDetailMaterial) => {
    const confirmed = await confirmDelete(
      "Remove this material?",
      "It will be removed from your options.",
    );
    if (!confirmed) {
      return;
    }

    await run(() => deleteMaterialOption(material.id));
  };

  const startEditing = (material: ProjectDetailMaterial) => {
    onError(null);
    setDraft({
      ...emptyDraft,
      target: material.id,
      url: material.url ?? "",
      comment: material.comment ?? "",
      photoUrl: material.photoUrl,
    });
  };

  const renderEditor = (current: Draft) => {
    const previewUri = current.picked?.uri ?? current.photoUrl;
    return (
      <View
        key={`editor-${current.target}`}
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <TextInput
          accessibilityLabel="Material link"
          editable={!locked}
          value={current.url}
          onChangeText={(url) => setDraft({ ...current, url })}
          placeholder="Link (shop or yarn page)"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={[
            styles.input,
            { color: theme.textPrimary, borderColor: theme.border },
          ]}
        />
        <TextInput
          accessibilityLabel="Material comment"
          editable={!locked}
          value={current.comment}
          onChangeText={(comment) => setDraft({ ...current, comment })}
          placeholder="Comment (colourway, weight, how much)"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[
            styles.input,
            styles.multiline,
            { color: theme.textPrimary, borderColor: theme.border },
          ]}
        />

        <View style={styles.screenshotRow}>
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={[styles.thumb, { backgroundColor: theme.border }]}
              contentFit="cover"
              accessibilityLabel="Material screenshot"
            />
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              previewUri ? "Replace screenshot" : "Add screenshot"
            }
            disabled={locked}
            onPress={() => {
              void pickScreenshot();
            }}
            style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
          >
            <ThemedText type="linkPrimary">
              {previewUri ? "Replace screenshot" : "Add screenshot"}
            </ThemedText>
          </Pressable>
          {previewUri ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove screenshot"
              disabled={locked}
              onPress={() =>
                setDraft({ ...current, photoUrl: null, picked: null })
              }
              style={({ pressed }) => [
                styles.textBtn,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="small" style={{ color: theme.error }}>
                Remove
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            disabled={locked}
            onPress={() => {
              onError(null);
              setDraft(null);
            }}
            style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
          >
            <ThemedText type="small" themeColor="textSecondary">
              Cancel
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save material"
            disabled={locked}
            onPress={() => {
              void saveDraft();
            }}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
              locked && styles.disabled,
            ]}
          >
            {busy ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <ThemedText style={{ color: theme.onPrimary }}>Save</ThemedText>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">Materials</ThemedText>

      {materials.length === 0 && !draft ? (
        <ThemedText type="small" themeColor="textSecondary">
          No materials yet.
        </ThemedText>
      ) : null}

      {materials.map((material) => {
        if (draft?.target === material.id) {
          return renderEditor(draft);
        }

        const chosen = canChoose && material.isSelected;
        const label = material.name?.trim() || "Material";
        return (
          <View
            key={material.id}
            style={[
              styles.card,
              styles.row,
              {
                backgroundColor: theme.surface,
                borderColor: chosen ? theme.primary : theme.border,
              },
              chosen && styles.chosenCard,
            ]}
          >
            {material.photoUrl ? (
              <Image
                source={{ uri: material.photoUrl }}
                style={[styles.thumb, { backgroundColor: theme.border }]}
                contentFit="cover"
                accessibilityLabel={`${label} screenshot`}
              />
            ) : null}
            <View style={styles.body}>
              {chosen ? (
                <View style={styles.chosenBadge}>
                  <SymbolView
                    name={{
                      ios: "checkmark.circle.fill",
                      android: "check_circle",
                      web: "check_circle",
                    }}
                    size={16}
                    tintColor={theme.primary}
                  />
                  <ThemedText type="smallBold" style={{ color: theme.primary }}>
                    Chosen
                  </ThemedText>
                </View>
              ) : null}
              {material.fromIdea ? (
                <ThemedText type="small" themeColor="textSecondary">
                  From the Idea
                </ThemedText>
              ) : null}
              {material.name?.trim() ? (
                <ThemedText type="smallBold">{material.name.trim()}</ThemedText>
              ) : null}
              {material.comment?.trim() ? (
                <ThemedText type="small">{material.comment.trim()}</ThemedText>
              ) : null}
              {material.url?.trim() ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={() => {
                    void Linking.openURL(material.url!.trim());
                  }}
                >
                  <ThemedText type="linkPrimary" numberOfLines={1}>
                    Open link
                  </ThemedText>
                </Pressable>
              ) : null}

              <View style={styles.actions}>
                {canChoose ? (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityLabel="Chosen material"
                    accessibilityState={{ checked: material.isSelected }}
                    disabled={locked || draft !== null}
                    onPress={() => {
                      void toggleChosen(material);
                    }}
                    style={({ pressed }) => [
                      styles.textBtn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText type="linkPrimary">
                      {material.isSelected ? "Unchoose" : "Choose"}
                    </ThemedText>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit material"
                  disabled={locked || draft !== null}
                  onPress={() => startEditing(material)}
                  style={({ pressed }) => [
                    styles.textBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText type="small" themeColor="textSecondary">
                    Edit
                  </ThemedText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove material"
                  disabled={locked || draft !== null}
                  onPress={() => {
                    void remove(material);
                  }}
                  style={({ pressed }) => [
                    styles.textBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText type="small" style={{ color: theme.error }}>
                    Remove
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}

      {draft?.target === "new" ? (
        renderEditor(draft)
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add material"
          disabled={locked || draft !== null}
          onPress={() => {
            onError(null);
            setDraft(emptyDraft);
          }}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed && styles.pressed,
            (locked || draft !== null) && styles.disabled,
          ]}
        >
          <SymbolView
            name={{ ios: "plus", android: "add", web: "add" }}
            size={18}
            tintColor={theme.textSecondary}
          />
          <ThemedText type="small">Add material</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
  },
  chosenCard: {
    borderWidth: 2,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Spacing.one,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  chosenBadge: {
    flexDirection: "row",
    alignItems: "center",
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
    minHeight: 72,
    textAlignVertical: "top",
  },
  screenshotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.three,
  },
  textBtn: {
    paddingVertical: Spacing.one,
  },
  saveBtn: {
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.6,
  },
});
