import { Pressable, StyleSheet, View } from "react-native";

import {
  photoTypeOptionsForStage,
  type ProjectPhotoType,
} from "@/components/add-project/photo-type";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Stage } from "../../../lib/projects";

type PhotoTypeToggleProps = {
  stage: Stage;
  value: ProjectPhotoType;
  onChange: (value: ProjectPhotoType) => void;
};

export function PhotoTypeToggle({
  stage,
  value,
  onChange,
}: PhotoTypeToggleProps) {
  const theme = useTheme();
  const options = photoTypeOptionsForStage(stage);

  if (options.length === 0) {
    return null;
  }

  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? theme.border : theme.surface,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}
          >
            <ThemedText type="small">{option.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
