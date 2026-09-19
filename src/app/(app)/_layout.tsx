import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-project"
        options={{
          presentation: "modal",
          headerShown: false,
          title: "Add Project",
        }}
      />
    </Stack>
  );
}
