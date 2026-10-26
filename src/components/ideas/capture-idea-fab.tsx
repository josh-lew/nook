import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/** Diameter of the button, so screens can leave room for it below their content. */
export const CAPTURE_IDEA_FAB_SIZE = 56;

/** Floating bottom-right button that opens quick capture. */
export function CaptureIdeaFab() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Capture an idea"
      onPress={() => router.push("/capture-idea")}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: theme.primary },
        pressed && styles.pressed,
      ]}
    >
      <SymbolView
        name={{ ios: "plus", android: "add", web: "add" }}
        size={26}
        tintColor={theme.onPrimary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: Spacing.four,
    right: Spacing.five,
    width: CAPTURE_IDEA_FAB_SIZE,
    height: CAPTURE_IDEA_FAB_SIZE,
    borderRadius: CAPTURE_IDEA_FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
