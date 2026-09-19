/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, type ThemeColors } from "@/constants/theme";
import { usePreferredColorScheme } from "@/contexts/theme-preference-context";

export function useTheme(): ThemeColors {
  const scheme = usePreferredColorScheme();
  return Colors[scheme];
}
