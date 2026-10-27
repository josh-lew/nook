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
  choosePatternOption,
  deletePatternOption,
  insertPatternOption,
  updatePatternOption,
  uploadProjectPhoto,
  type ProjectDetail,
  type ProjectDetailPatternOption,
} from "../../../lib/projects";

type Screenshot =
  | { kind: "saved"; url: string }
  | { kind: "picked"; asset: ImagePicker.ImagePickerAsset };

type Draft = {
  /** The option being edited, or null when adding a new one. */
  optionId: string | null;
  url: string;
  comment: string;
  screenshot: Screenshot | null;
};

type PatternOptionsProps = {
  /** An Idea or a Project; they share a shape (see docs/adr/0001). */
  project: ProjectDetail;
  disabled?: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  /** Called after any write so the screen can reload. */
  onChanged: () => Promise<void>;
};

function draftFrom(option: ProjectDetailPatternOption): Draft {
  return {
    optionId: option.id,
    url: option.url ?? "",
    comment: option.comment ?? "",
    screenshot: option.photoUrl ? { kind: "saved", url: option.photoUrl } : null,
  };
}

/** Candidate patterns (link and/or screenshot), with choosing the Pattern on a Project. */
export function PatternOptions({
  project,
  disabled,
  onBusyChange,
  onError,
  onChanged,
}: PatternOptionsProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const locked = disabled || busy;
  // Only a Project can choose a Pattern; an Idea just collects options
  const canChoose = project.status !== "idea";

  /** Runs a write with the section busy, reports its error, then reloads; success closes the form. */
  const runWrite = async (
    write: () => Promise<{ error: string | null }>,
  ) => {
    onError(null);
    setBusy(true);
    onBusyChange(true);
    const { error } = await write();
    if (error) {
      onError(error);
    }
    await onChanged();
    if (!error) {
      setDraft(null);
    }
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

    if (picked.canceled || !picked.assets?.[0]) {
      return;
    }

    const asset = picked.assets[0];
    setDraft((current) =>
      current ? { ...current, screenshot: { kind: "picked", asset } } : current,
    );
  };

  const saveDraft = async (current: Draft) => {
    await runWrite(async () => {
      let photoUrl: string | null = null;
      if (current.screenshot?.kind === "saved") {
        photoUrl = current.screenshot.url;
      } else if (current.screenshot?.kind === "picked") {
        const { asset } = current.screenshot;
        const upload = await uploadProjectPhoto(project.id, {
          uri: asset.uri,
          name: asset.fileName ?? "pattern-option.jpg",
          type: asset.mimeType ?? "image/jpeg",
          base64: asset.base64 ?? undefined,
        });
        if (upload.error || !upload.data) {
          return { error: `The screenshot didn’t upload: ${upload.error}` };
        }
        photoUrl = upload.data.url;
      }

      const input = {
        url: current.url,
        photo_url: photoUrl,
        comment: current.comment,
      };
      return current.optionId
        ? updatePatternOption(current.optionId, input)
        : insertPatternOption(project.id, input);
    });
  };

  const removeOption = async (option: ProjectDetailPatternOption) => {
    const confirmed = await confirmDelete(
      "Remove this Pattern Option?",
      option.isSelected
        ? "It’s the chosen Pattern, so the Project will have no Pattern."
        : "It will be removed from the list.",
    );
    if (!confirmed) {
      return;
    }

    await runWrite(() => deletePatternOption(option.id));
  };

  const choose = async (optionId: string | null) => {
    await runWrite(() => choosePatternOption(project.id, optionId));
  };

  const renderDraft = (current: Draft) => {
    const screenshotUri =
      current.screenshot?.kind === "saved"
        ? current.screenshot.url
        : current.screenshot?.asset.uri;
    return (
      <View
        key={current.optionId ?? "new"}
        style={[styles.card, { backgroundColor: theme.surface }]}
      >
        <TextInput
          accessibilityLabel="Pattern link"
          editable={!locked}
          value={current.url}
          onChangeText={(url) => setDraft({ ...current, url })}
          placeholder="Link, e.g. ravelry.com/patterns/…"
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
          accessibilityLabel="Pattern comment"
          editable={!locked}
          value={current.comment}
          onChangeText={(comment) => setDraft({ ...current, comment })}
          placeholder="Comment (optional)"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[
            styles.input,
            { color: theme.textPrimary, borderColor: theme.border },
          ]}
        />
        <View style={styles.row}>
          {screenshotUri ? (
            <View>
              <Image
                source={{ uri: screenshotUri }}
                style={[styles.thumb, { backgroundColor: theme.border }]}
                contentFit="cover"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove screenshot"
                disabled={locked}
                hitSlop={Spacing.two}
                onPress={() => setDraft({ ...current, screenshot: null })}
                style={styles.removeThumb}
              >
                <SymbolView
                  name={{
                    ios: "xmark.circle.fill",
                    android: "cancel",
                    web: "cancel",
                  }}
                  size={20}
                  tintColor={theme.textPrimary}
                />
              </Pressable>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              screenshotUri ? "Replace screenshot" : "Add screenshot"
            }
            disabled={locked}
            onPress={() => {
              void pickScreenshot();
            }}
            style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
          >
            <ThemedText type="linkPrimary">
              {screenshotUri ? "Replace screenshot" : "Add screenshot"}
            </ThemedText>
          </Pressable>
        </View>
        <View style={[styles.row, styles.actions]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            disabled={locked}
            onPress={() => setDraft(null)}
            style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
          >
            <ThemedText type="small">Cancel</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save Pattern Option"
            disabled={locked}
            onPress={() => {
              void saveDraft(current);
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
              <ThemedText type="small" style={{ color: theme.onPrimary }}>
                Save
              </ThemedText>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">Pattern Options</ThemedText>

      {project.patternOptions.length === 0 && !draft ? (
        <ThemedText type="small" themeColor="textSecondary">
          No Pattern Options yet.
        </ThemedText>
      ) : null}

      {project.patternOptions.map((option) => {
        if (draft?.optionId === option.id) {
          return renderDraft(draft);
        }

        return (
          <View
            key={option.id}
            style={[
              styles.card,
              { backgroundColor: theme.surface },
              option.isSelected && {
                borderColor: theme.primary,
                borderWidth: 2,
              },
            ]}
          >
            <View style={styles.row}>
              {option.photoUrl ? (
                <Image
                  source={{ uri: option.photoUrl }}
                  style={[styles.thumb, { backgroundColor: theme.border }]}
                  contentFit="cover"
                  accessibilityLabel="Pattern screenshot"
                />
              ) : null}
              <View style={styles.body}>
                {option.isSelected ? (
                  <ThemedText type="smallBold" style={{ color: theme.primary }}>
                    The Pattern
                  </ThemedText>
                ) : null}
                {option.comment ? (
                  <ThemedText type="small">{option.comment}</ThemedText>
                ) : null}
                {option.url ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => {
                      void Linking.openURL(option.url!);
                    }}
                  >
                    <ThemedText type="linkPrimary" numberOfLines={1}>
                      {option.url.replace(/^https?:\/\//, "")}
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <View style={[styles.row, styles.actions]}>
              {canChoose ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    option.isSelected ? "Clear the Pattern" : "Choose as Pattern"
                  }
                  disabled={locked}
                  onPress={() => {
                    void choose(option.isSelected ? null : option.id);
                  }}
                  style={({ pressed }) => [
                    styles.textBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText type="linkPrimary">
                    {option.isSelected ? "Clear Pattern" : "Choose as Pattern"}
                  </ThemedText>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit Pattern Option"
                disabled={locked || draft !== null}
                onPress={() => setDraft(draftFrom(option))}
                style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
              >
                <ThemedText type="small">Edit</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove Pattern Option"
                disabled={locked}
                onPress={() => {
                  void removeOption(option);
                }}
                style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
              >
                <ThemedText type="small" style={{ color: theme.error }}>
                  Remove
                </ThemedText>
              </Pressable>
            </View>
          </View>
        );
      })}

      {draft?.optionId === null ? (
        renderDraft(draft)
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add Pattern Option"
          disabled={locked || draft !== null}
          onPress={() =>
            setDraft({ optionId: null, url: "", comment: "", screenshot: null })
          }
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed && styles.pressed,
            draft !== null && styles.disabled,
          ]}
        >
          <SymbolView
            name={{ ios: "plus", android: "add", web: "add" }}
            size={18}
            tintColor={theme.textSecondary}
          />
          <ThemedText type="small">Add Pattern Option</ThemedText>
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
    borderRadius: Spacing.two,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  actions: {
    justifyContent: "flex-end",
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Spacing.one,
  },
  removeThumb: {
    position: "absolute",
    top: -Spacing.two,
    right: -Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  textBtn: {
    paddingVertical: Spacing.one,
  },
  saveBtn: {
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
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
