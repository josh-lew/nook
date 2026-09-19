import { Pressable, StyleSheet, TextInput, View } from "react-native";

import type { HobbyType, ProjectStatus } from "../../../lib/projects";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const HOBBY_OPTIONS: { value: HobbyType; label: string }[] = [
  { value: "crochet", label: "Crochet" },
  { value: "knit", label: "Knit" },
  { value: "sewing", label: "Sewing" },
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

type KeyDetailsStepProps = {
  title: string;
  hobbyType: HobbyType | null;
  status: ProjectStatus;
  titleError?: string | null;
  hobbyError?: string | null;
  onChangeTitle: (value: string) => void;
  onChangeHobby: (value: HobbyType) => void;
  onChangeStatus: (value: ProjectStatus) => void;
};

export function KeyDetailsStep({
  title,
  hobbyType,
  status,
  titleError,
  hobbyError,
  onChangeTitle,
  onChangeHobby,
  onChangeStatus,
}: KeyDetailsStepProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Title
        </ThemedText>
        <TextInput
          accessibilityLabel="Title"
          value={title}
          onChangeText={onChangeTitle}
          placeholder="e.g. Cosy winter scarf"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            {
              color: theme.textPrimary,
              backgroundColor: theme.surface,
              borderColor: titleError ? theme.error : theme.border,
            },
          ]}
        />
        {titleError ? (
          <ThemedText type="small" style={styles.error}>
            {titleError}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Hobby
        </ThemedText>
        <View style={styles.chips}>
          {HOBBY_OPTIONS.map((option) => {
            const selected = hobbyType === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChangeHobby(option.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? theme.border
                      : theme.surface,
                    borderColor: selected ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText type="small">{option.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
        {hobbyError ? (
          <ThemedText
            type="small"
            style={{ color: theme.error }}
          >
            {hobbyError}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Status
        </ThemedText>
        <View style={styles.chips}>
          {STATUS_OPTIONS.map((option) => {
            const selected = status === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChangeStatus(option.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? theme.border
                      : theme.surface,
                    borderColor: selected ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText type="small">{option.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
