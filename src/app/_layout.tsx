import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  type Theme,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import {
  ThemePreferenceProvider,
  usePreferredColorScheme,
} from "@/contexts/theme-preference-context";
import { darkColors, lightColors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

function navigationTheme(scheme: "light" | "dark"): Theme {
  const colors = scheme === "dark" ? darkColors : lightColors;
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.primary,
    },
  };
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemePreferenceProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const colorScheme = usePreferredColorScheme();

  useEffect(() => {
    if (!isLoading && !session) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, session]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={navigationTheme(colorScheme)}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
