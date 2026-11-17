import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { MaterialOptions } from "@/components/project/material-options";
import { PatternOptions } from "@/components/project/pattern-options";
import { ProjectPattern } from "@/components/project/project-pattern";
import { ProjectPhotos } from "@/components/project/project-photos";
import { Spacing } from "@/constants/theme";
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
    <BottomSheet
      visible={kind !== null}
      title={kind ? COPY[kind].title : ""}
      subtitle={kind ? COPY[kind].body : ""}
      onDismiss={close}
      dismissLabel="Dismiss"
      busy={busy}
      error={error}
      secondaryAction={{ label: "Skip", onPress: close }}
      primaryAction={{ label: "Done", onPress: close }}
    >
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
        ) : kind === "complete" ? (
          // Completed defaults new photos to Finished
          <ProjectPhotos {...sectionProps} stage="completed" />
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    gap: Spacing.four,
    paddingBottom: Spacing.two,
  },
});
