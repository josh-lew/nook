import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const TOTAL_STEPS = 4;

type StepHeaderProps = {
  stepIndex: number;
};

export function StepHeader({ stepIndex }: StepHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold">Add Project</ThemedText>
      <ThemedText themeColor="textSecondary" type="small">
        Step {stepIndex + 1} of {TOTAL_STEPS}
      </ThemedText>
      <View style={styles.dots}>
        {Array.from({ length: TOTAL_STEPS }, (_, index) => {
          const active = index === stepIndex;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: active ? theme.text : theme.textSecondary,
                  width: active ? 10 : 7,
                  height: active ? 10 : 7,
                  borderRadius: active ? 5 : 3.5,
                  opacity: active ? 1 : 0.45,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
    paddingBottom: Spacing.three,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  dot: {},
});
