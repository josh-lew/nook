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
      <Stack.Screen
        name="capture-idea"
        options={{
          presentation: "modal",
          headerShown: false,
          title: "New Idea",
        }}
      />
      <Stack.Screen
        name="idea/[id]"
        options={{
          title: "Idea",
        }}
      />
      <Stack.Screen
        name="project/[id]"
        options={{
          title: "Project",
        }}
      />
    </Stack>
  );
}
