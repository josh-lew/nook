import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type SheetAction = {
  label: string;
  /** Defaults to the label. */
  accessibilityLabel?: string;
  onPress: () => void;
};

type BottomSheetProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  /** Closes the sheet from the backdrop or the back gesture. */
  onDismiss: () => void;
  /** Accessibility label for the backdrop. */
  dismissLabel: string;
  /** While set, the sheet can't be dismissed and its actions are disabled. */
  busy: boolean;
  /** Shows a spinner in the primary action while busy. */
  primaryLoading?: boolean;
  error: string | null;
  secondaryAction: SheetAction;
  primaryAction: SheetAction;
  children?: ReactNode;
};

/** A sheet that slides up from the bottom, with a title, content and two actions. */
export function BottomSheet({
  visible,
  title,
  subtitle,
  onDismiss,
  dismissLabel,
  busy,
  primaryLoading = false,
  error,
  secondaryAction,
  primaryAction,
  children,
}: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dismiss = busy ? undefined : onDismiss;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={dismiss}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={dismissLabel}
          style={[styles.backdrop, { backgroundColor: theme.scrim }]}
          onPress={dismiss}
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
              {title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {subtitle}
            </ThemedText>
          </View>

          {children}

          {error ? (
            <ThemedText type="small" style={{ color: theme.error }}>
              {error}
            </ThemedText>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                secondaryAction.accessibilityLabel ?? secondaryAction.label
              }
              disabled={busy}
              onPress={secondaryAction.onPress}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              <ThemedText themeColor="textSecondary">
                {secondaryAction.label}
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                primaryAction.accessibilityLabel ?? primaryAction.label
              }
              disabled={busy}
              onPress={primaryAction.onPress}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.primary },
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              {busy && primaryLoading ? (
                <ActivityIndicator color={theme.onPrimary} />
              ) : (
                <ThemedText style={{ color: theme.onPrimary }}>
                  {primaryAction.label}
                </ThemedText>
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
  },
  sheet: {
    maxHeight: "85%",
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
