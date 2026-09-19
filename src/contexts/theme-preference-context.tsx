import {
  createContext,
  PropsWithChildren,
  use,
  useState,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

type ThemePreferenceContextValue = {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(
  null,
);

function resolveSystemScheme(
  system: ReturnType<typeof useSystemColorScheme>,
): ColorScheme {
  return system === 'dark' ? 'dark' : 'light';
}

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemScheme = useSystemColorScheme();
  const [override, setOverride] = useState<ColorScheme | null>(null);

  const colorScheme = override ?? resolveSystemScheme(systemScheme);

  const toggleColorScheme = () => {
    setOverride((current) => {
      const active = current ?? resolveSystemScheme(systemScheme);
      return active === 'dark' ? 'light' : 'dark';
    });
  };

  return (
    <ThemePreferenceContext value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ThemePreferenceContext>
  );
}

export function useThemePreference() {
  const value = use(ThemePreferenceContext);
  if (!value) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  }
  return value;
}

export function usePreferredColorScheme(): ColorScheme {
  const value = use(ThemePreferenceContext);
  const systemScheme = useSystemColorScheme();
  return value?.colorScheme ?? resolveSystemScheme(systemScheme);
}
