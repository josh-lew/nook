/**
 * Semantic color tokens for Nook light and dark themes.
 * Keys are interchangeable — swap palettes without renaming call sites.
 */

export type ThemeColors = {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  error: string;
};

export const lightColors: ThemeColors = {
  background: "#FDF6F3",
  surface: "#FBEEEA",
  primary: "#D98C8C",
  secondary: "#B8A9D9",
  textPrimary: "#4A3B3B",
  textSecondary: "#9C8888",
  border: "#F0DDD6",
  error: "#B5544A",
};

export const darkColors: ThemeColors = {
  background: "#2B2129",
  surface: "#362A33",
  primary: "#E8A8A8",
  secondary: "#C7B8E0",
  textPrimary: "#F5EAE7",
  textSecondary: "#B39FA5",
  border: "#453740",
  error: "#E89A8A",
};

/** @deprecated Prefer lightColors / darkColors — kept for keyed lookup */
export const Colors = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeColor = keyof ThemeColors;
