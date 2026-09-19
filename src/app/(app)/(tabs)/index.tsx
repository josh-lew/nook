import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function Index() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Home</ThemedText>
      <ThemedText themeColor="textSecondary">Home screen</ThemedText>
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
});
