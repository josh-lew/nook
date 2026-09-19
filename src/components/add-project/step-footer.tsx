import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type StepFooterProps = {
  stepIndex: number;
  saving?: boolean;
  onCancel: () => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onSave: () => void;
};

export function StepFooter({
  stepIndex,
  saving = false,
  onCancel,
  onBack,
  onNext,
  onSkip,
  onSave,
}: StepFooterProps) {
  const theme = useTheme();
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === 3;
  const canSkip = stepIndex === 2 || stepIndex === 3;

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {isFirst ? (
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={onCancel}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          >
            <ThemedText themeColor="textSecondary">Cancel</ThemedText>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={onBack}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          >
            <ThemedText themeColor="textSecondary">Back</ThemedText>
          </Pressable>
        )}

        <View style={styles.rightActions}>
          {canSkip && !isLast ? (
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={onSkip}
              style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
            >
              <ThemedText type="small" themeColor="textSecondary">
                Skip
              </ThemedText>
            </Pressable>
          ) : null}

          {isLast ? (
            <>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={onSkip}
                style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
              >
                <ThemedText type="small" themeColor="textSecondary">
                  Skip
                </ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={onSave}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: theme.text },
                  pressed && styles.pressed,
                  saving && styles.disabled,
                ]}
              >
                {saving ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <ThemedText style={{ color: theme.background }}>Save</ThemedText>
                )}
              </Pressable>
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={onNext}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: theme.text },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={{ color: theme.background }}>Next</ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  secondaryBtn: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  skipBtn: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  primaryBtn: {
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
