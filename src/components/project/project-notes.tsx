import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { STAGE_LABELS } from "@/constants/stages";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  insertProjectNote,
  type ProjectDetail,
  type Stage,
} from "../../../lib/projects";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type ProjectNotesProps = {
  project: ProjectDetail;
  stage: Stage;
  disabled?: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  /** Called after a Note is saved so the screen can reload the Project. */
  onChanged: () => Promise<void>;
};

/** Dated Notes journal; a new Note is tagged with the current Stage. */
export function ProjectNotes({
  project,
  stage,
  disabled,
  onBusyChange,
  onError,
  onChanged,
}: ProjectNotesProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const addNote = async () => {
    onError(null);
    setSaving(true);
    onBusyChange(true);
    const result = await insertProjectNote(project.id, draft, stage);
    if (result.error) {
      onError(result.error);
    } else {
      setDraft("");
      await onChanged();
    }
    setSaving(false);
    onBusyChange(false);
  };

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">Notes</ThemedText>

      {project.notes.map((note) => (
        <View
          key={note.id}
          style={[styles.noteRow, { backgroundColor: theme.surface }]}
        >
          <ThemedText type="small" themeColor="textSecondary">
            {STAGE_LABELS[note.stage]} · {formatDate(note.createdAt)}
          </ThemedText>
          <ThemedText>{note.content}</ThemedText>
        </View>
      ))}

      <TextInput
        accessibilityLabel="New note"
        editable={!disabled && !saving}
        value={draft}
        onChangeText={setDraft}
        placeholder="Where did you get to?"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[
          styles.input,
          {
            color: theme.textPrimary,
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add note"
        disabled={disabled || saving || !draft.trim()}
        onPress={() => {
          void addNote();
        }}
        style={({ pressed }) => [
          styles.addBtn,
          { backgroundColor: theme.primary },
          pressed && styles.pressed,
          (disabled || saving || !draft.trim()) && styles.disabled,
        ]}
      >
        {saving ? (
          <ActivityIndicator color={theme.onPrimary} />
        ) : (
          <ThemedText style={{ color: theme.onPrimary }}>Add note</ThemedText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  noteRow: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    textAlignVertical: "top",
  },
  addBtn: {
    alignSelf: "flex-end",
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
