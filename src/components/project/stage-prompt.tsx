import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MaterialOptions } from "@/components/project/material-options";
import { PatternOptions } from "@/components/project/pattern-options";
import { ProjectPattern } from "@/components/project/project-pattern";
import { ProjectPhotos } from "@/components/project/project-photos";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ProjectDetail } from "../../../lib/projects";

export type StagePromptKind = "start" | "complete";

const COPY: Record<StagePromptKind, { title: string; body: string }> = {
  start: {
    title: "Started!",
    body: "Confirm the Pattern and the materials you’re using, or skip and add them later.",
  },
  complete: {
    title: "Finished!",
    body: "Add some finished photos and pick the cover, or skip and add them later.",
  },
};

type StagePromptProps = {
  /** The prompt to show; null hides the sheet. */
  kind: StagePromptKind | null;
  project: ProjectDetail;
  onClose: () => void;
  /** Called after any write so the screen can reload the Project. */
  onChanged: () => Promise<void>;
};

/**
 * Shown after a Stage change has already been saved, so skipping it never
 * blocks the move.
 */
export function StagePrompt({
  kind,
  project,
  onClose,
  onChanged,
}: StagePromptProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setError(null);
    onClose();
  };

  const sectionProps = {
    project,
    disabled: busy,
    onBusyChange: setBusy,
    onError: setError,
    onChanged,
  };

  return (
    <Modal
      visible={kind !== null}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={styles.backdrop}
          onPress={busy ? undefined : close}
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              paddingBottom: Math.max(insets.bottom, Spacing.three),
              borderTopColor: theme.border,
            },
          ]}
        >
          {kind ? (
            <>
              <View style={styles.header}>
                <ThemedText type="smallBold" style={styles.headerTitle}>
                  {COPY[kind].title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {COPY[kind].body}
                </ThemedText>
              </View>

              <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                keyboardShouldPersistTaps="handled"
              >
                {kind === "start" ? (
                  <>
                    <ProjectPattern {...sectionProps} />
                    <PatternOptions {...sectionProps} />
                    <MaterialOptions {...sectionProps} />
                  </>
                ) : (
                  // Completed defaults new photos to Finished
                  <ProjectPhotos {...sectionProps} stage="completed" />
                )}
              </ScrollView>

              {error ? (
                <ThemedText type="small" style={{ color: theme.error }}>
                  {error}
                </ThemedText>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Skip"
                  disabled={busy}
                  onPress={close}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.pressed,
                    busy && styles.disabled,
                  ]}
                >
                  <ThemedText themeColor="textSecondary">Skip</ThemedText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Done"
                  disabled={busy}
                  onPress={close}
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: theme.primary },
                    pressed && styles.pressed,
                    busy && styles.disabled,
                  ]}
                >
                  <ThemedText style={{ color: theme.onPrimary }}>Done</ThemedText>
                </Pressable>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    maxHeight: "85%",
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    zIndex: 1,
  },
  header: {
    gap: Spacing.one,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    gap: Spacing.four,
    paddingBottom: Spacing.two,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
  },
  button: {
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
