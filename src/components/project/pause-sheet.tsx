import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";

import { BottomSheet } from "@/components/bottom-sheet";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type PauseSheetProps = {
  visible: boolean;
  /** Set while the pause is being saved. */
  pausing: boolean;
  /** Why the last pause failed; the sheet stays open with the note kept. */
  error: string | null;
  /** Closes the sheet without pausing. */
  onCancel: () => void;
  /** Pauses the Project; a blank note is skipped. Resolves true once paused. */
  onPause: (note: string) => Promise<boolean>;
};

/** Asks where the maker got to before Pausing; the note can be skipped. */
export function PauseSheet({
  visible,
  pausing,
  error,
  onCancel,
  onPause,
}: PauseSheetProps) {
  const theme = useTheme();
  const [note, setNote] = useState("");

  const cancel = () => {
    setNote("");
    onCancel();
  };

  const pause = async (withNote: string) => {
    if (await onPause(withNote)) {
      setNote("");
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title="Pause this Project"
      subtitle="Leave a note on where you got to, or skip it."
      onDismiss={cancel}
      dismissLabel="Cancel"
      busy={pausing}
      primaryLoading
      error={error}
      secondaryAction={{
        label: "Skip",
        accessibilityLabel: "Skip note",
        onPress: () => {
          void pause("");
        },
      }}
      primaryAction={{
        label: "Pause",
        onPress: () => {
          void pause(note);
        },
      }}
    >
      <TextInput
        accessibilityLabel="Where you got to"
        editable={!pausing}
        value={note}
        onChangeText={setNote}
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
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    textAlignVertical: "top",
  },
});
