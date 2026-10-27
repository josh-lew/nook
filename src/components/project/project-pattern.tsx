import { File } from "expo-file-system";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { confirmDelete } from "@/components/confirm-delete";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  deletePatternFile,
  insertPatternFile,
  resolveContentType,
  uploadPatternFile,
  type Pattern,
  type PatternFile,
  type ProjectDetail,
} from "../../../lib/projects";

type ProjectPatternProps = {
  project: ProjectDetail;
  disabled?: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  /** Called after any write so the screen can reload the Project. */
  onChanged: () => Promise<void>;
};

/** The Pattern section: its Pattern Files, which can be added (several) and removed. */
export function ProjectPattern({
  project,
  disabled,
  onBusyChange,
  onError,
  onChanged,
}: ProjectPatternProps) {
  const theme = useTheme();
  const [busy, setBusy] = useState(false);
  const files = project.pattern?.files ?? [];

  const run = async (work: () => Promise<void>) => {
    onError(null);
    setBusy(true);
    onBusyChange(true);
    try {
      await work();
      await onChanged();
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  };

  const addFiles = async () => {
    let picked: File[];
    try {
      const pickResult = await File.pickFileAsync({
        multipleFiles: true,
        mimeTypes: ["application/pdf", "image/*"],
      });
      if (pickResult.canceled || !pickResult.result.length) {
        return;
      }
      picked = pickResult.result;
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Could not open that file.",
      );
      return;
    }

    await run(async () => {
      for (const pickedFile of picked) {
        try {
          const file = {
            uri: pickedFile.uri,
            name: pickedFile.name,
            type: pickedFile.type || "application/octet-stream",
            base64: await pickedFile.base64(),
          };
          const uploadResult = await uploadPatternFile(project.id, file);
          const fileResult =
            uploadResult.error || !uploadResult.data
              ? uploadResult
              : await insertPatternFile(project.id, {
                  file_url: uploadResult.data.url,
                  name: file.name,
                  content_type: resolveContentType(file),
                });

          if (fileResult.error) {
            onError(`${file.name} didn’t upload: ${fileResult.error}`);
            break;
          }
        } catch (error) {
          onError(
            error instanceof Error
              ? error.message
              : `Could not prepare ${pickedFile.name}.`,
          );
          break;
        }
      }
    });
  };

  const removeFile = async (file: PatternFile) => {
    const confirmed = await confirmDelete(
      "Remove this Pattern File?",
      `“${file.name}” will be removed from the Pattern.`,
    );
    if (!confirmed) {
      return;
    }

    await run(async () => {
      const result = await deletePatternFile(file.id);
      if (result.error) {
        onError(result.error);
      }
    });
  };

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">Pattern</ThemedText>

      {files.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          No Pattern Files yet.
        </ThemedText>
      ) : null}

      {files.map((file) => (
        <View
          key={file.id}
          style={[styles.fileRow, { backgroundColor: theme.surface }]}
        >
          <SymbolView
            name={
              file.contentType === "application/pdf"
                ? { ios: "doc.text", android: "description", web: "description" }
                : { ios: "photo", android: "image", web: "image" }
            }
            size={20}
            tintColor={theme.textSecondary}
          />
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open ${file.name}`}
            onPress={() => {
              void Linking.openURL(file.fileUrl);
            }}
            style={styles.fileName}
          >
            <ThemedText type="linkPrimary" numberOfLines={1}>
              {file.name}
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${file.name}`}
            disabled={disabled || busy}
            onPress={() => {
              void removeFile(file);
            }}
            hitSlop={Spacing.two}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <SymbolView
              name={{ ios: "trash", android: "delete", web: "delete" }}
              size={18}
              tintColor={theme.error}
            />
          </Pressable>
        </View>
      ))}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add Pattern Files"
        disabled={disabled || busy}
        onPress={() => {
          void addFiles();
        }}
        style={({ pressed }) => [
          styles.addBtn,
          { backgroundColor: theme.surface, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={theme.textSecondary} />
        ) : (
          <>
            <SymbolView
              name={{ ios: "doc.badge.plus", android: "note_add", web: "note_add" }}
              size={20}
              tintColor={theme.textSecondary}
            />
            <ThemedText type="small">Add Pattern Files</ThemedText>
          </>
        )}
      </Pressable>
    </View>
  );
}

type PatternTarget = { key: string; label: string; url: string };

function patternTargets(pattern: Pattern): PatternTarget[] {
  const targets = pattern.files.map((file) => ({
    key: file.id,
    label: file.name,
    url: file.fileUrl,
  }));
  return pattern.url
    ? [{ key: "link", label: "Link", url: pattern.url }, ...targets]
    : targets;
}

/** One tap to the Pattern: a single link or file opens directly; several show a picker. */
export function OpenPatternButton({ pattern }: { pattern: Pattern }) {
  const theme = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const targets = patternTargets(pattern);

  const open = (url: string) => {
    setPickerOpen(false);
    void Linking.openURL(url);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Pattern"
        onPress={() => {
          if (targets.length === 1) {
            open(targets[0].url);
          } else {
            setPickerOpen(true);
          }
        }}
        style={({ pressed }) => [
          styles.openBtn,
          { backgroundColor: theme.primary },
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          name={{ ios: "book", android: "menu_book", web: "menu_book" }}
          size={20}
          tintColor={theme.onPrimary}
        />
        <ThemedText style={{ color: theme.onPrimary }}>Open Pattern</ThemedText>
      </Pressable>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.backdrop}>
          {/* A sibling, not a parent, so taps inside the sheet don't close it */}
          <Pressable
            accessibilityLabel="Close"
            onPress={() => setPickerOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            <ThemedText type="smallBold">Open which part?</ThemedText>
            {targets.map((target) => (
              <Pressable
                key={target.key}
                accessibilityRole="link"
                onPress={() => open(target.url)}
                style={({ pressed }) => [
                  styles.sheetRow,
                  { backgroundColor: theme.surface },
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText numberOfLines={1}>{target.label}</ThemedText>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => setPickerOpen(false)}
              style={({ pressed }) => [styles.sheetRow, pressed && styles.pressed]}
            >
              <ThemedText themeColor="textSecondary">Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  fileName: {
    flex: 1,
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
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderTopLeftRadius: Spacing.three,
    borderTopRightRadius: Spacing.three,
  },
  sheetRow: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
