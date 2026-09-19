import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useThemePreference } from "@/contexts/theme-preference-context";
import { useTheme } from "@/hooks/use-theme";

export default function Index() {
  const theme = useTheme();
  const { colorScheme, setPreference } = useThemePreference();
  const isDark = colorScheme === "dark";

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Home</ThemedText>
      <ThemedText themeColor="textSecondary">Home screen</ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isDark ? "Switch to light mode" : "Switch to dark mode"
        }
        onPress={() => setPreference(isDark ? "light" : "dark")}
        style={({ pressed }) => [
          styles.toggle,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          name={{
            ios: isDark ? "sun.max.fill" : "moon.fill",
            android: isDark ? "light_mode" : "dark_mode",
            web: isDark ? "light_mode" : "dark_mode",
          }}
          size={20}
          tintColor={theme.primary}
        />
        <ThemedText type="smallBold">
          {isDark ? "Light mode" : "Dark mode"}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  toggle: {
    marginTop: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
