import { Alert, Platform } from "react-native";

/** Alert.alert is a no-op on web, so fall back to the browser's confirm there. */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  style: "default" | "destructive" = "default",
): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: confirmLabel, style, onPress: () => resolve(true) },
    ]);
  });
}

export function confirmDelete(title: string, message: string): Promise<boolean> {
  return confirmAction(title, message, "Delete", "destructive");
}
