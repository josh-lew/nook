import { StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type NotesStepProps = {
  note: string;
  onChangeNote: (value: string) => void;
};

export function NotesStep({ note, onChangeNote }: NotesStepProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText type="small" themeColor="textSecondary">
        Optional notes for the planning stage — gauge, yarn amounts, or a little
        reminder for later you.
      </ThemedText>
      <TextInput
        accessibilityLabel="Planning notes"
        value={note}
        onChangeText={onChangeNote}
        placeholder="Write a note…"
        placeholderTextColor={theme.textSecondary}
        multiline
        textAlignVertical="top"
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.three,
    flex: 1,
  },
  input: {
    minHeight: 160,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
});
