import {
  createContext,
  PropsWithChildren,
  use,
  useMemo,
  useState,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";
export type ThemePreference = "light" | "dark" | "system";

type ThemePreferenceContextValue = {
  /** Resolved scheme after applying preference + system. */
  colorScheme: ColorScheme;
  /** User preference: light, dark, or follow system (default). */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Cycles light → dark → system for a future settings toggle. */
  toggleColorScheme: () => void;
};

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

function resolveSystemScheme(
  system: ReturnType<typeof useSystemColorScheme>,
): ColorScheme {
  return system === "dark" ? "dark" : "light";
}

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");

  const colorScheme: ColorScheme =
    preference === "system"
      ? resolveSystemScheme(systemScheme)
      : preference;

  const value = useMemo(
    () => ({
      colorScheme,
      preference,
      setPreference,
      toggleColorScheme: () => {
        setPreference((current) => {
          if (current === "system") {
            return resolveSystemScheme(systemScheme) === "dark"
              ? "light"
              : "dark";
          }
          if (current === "light") {
            return "dark";
          }
          return "system";
        });
      },
    }),
    [colorScheme, preference, systemScheme],
  );

  return (
    <ThemePreferenceContext value={value}>{children}</ThemePreferenceContext>
  );
}

export function useThemePreference() {
  const value = use(ThemePreferenceContext);
  if (!value) {
    throw new Error(
      "useThemePreference must be used within ThemePreferenceProvider",
    );
  }
  return value;
}

export function usePreferredColorScheme(): ColorScheme {
  const value = use(ThemePreferenceContext);
  const systemScheme = useSystemColorScheme();
  return value?.colorScheme ?? resolveSystemScheme(systemScheme);
}
