import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { HobbyType } from "../../../lib/projects";

const HOBBY_OPTIONS: { value: HobbyType; label: string }[] = [
  { value: "crochet", label: "Crochet" },
  { value: "knit", label: "Knit" },
  { value: "sewing", label: "Sewing" },
];

type HobbyPickerProps = {
  value: HobbyType | null;
  onChange: (hobby: HobbyType) => void;
  disabled?: boolean;
  error?: string | null;
};

/** Single-choice hobby chips. Tapping the selected chip keeps it, so a hobby can change but never clear. */
export function HobbyPicker({
  value,
  onChange,
  disabled,
  error,
}: HobbyPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        Hobby
      </ThemedText>
      <View accessibilityRole="radiogroup" style={styles.chips}>
        {HOBBY_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: selected }}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.border : theme.surface,
                  borderColor: selected
                    ? theme.primary
                    : error
                      ? theme.error
                      : theme.border,
                },
              ]}
            >
              <ThemedText type="small">{option.label}</ThemedText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <ThemedText type="small" style={{ color: theme.error }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
