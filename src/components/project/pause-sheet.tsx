import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
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
  const insets = useSafeAreaInsets();
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={pausing ? undefined : cancel}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          style={styles.backdrop}
          onPress={pausing ? undefined : cancel}
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
          <View style={styles.header}>
            <ThemedText type="smallBold" style={styles.headerTitle}>
              Pause this Project
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Leave a note on where you got to, or skip it.
            </ThemedText>
          </View>

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

          {error ? (
            <ThemedText type="small" style={{ color: theme.error }}>
              {error}
            </ThemedText>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip note"
              disabled={pausing}
              onPress={() => {
                void pause("");
              }}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                pausing && styles.disabled,
              ]}
            >
              <ThemedText themeColor="textSecondary">Skip</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pause"
              disabled={pausing}
              onPress={() => {
                void pause(note);
              }}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.primary },
                pressed && styles.pressed,
                pausing && styles.disabled,
              ]}
            >
              {pausing ? (
                <ActivityIndicator color={theme.onPrimary} />
              ) : (
                <ThemedText style={{ color: theme.onPrimary }}>Pause</ThemedText>
              )}
            </Pressable>
          </View>
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
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    textAlignVertical: "top",
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
