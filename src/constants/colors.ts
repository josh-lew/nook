/**
 * Semantic color tokens for Nook light and dark themes.
 * Keys are interchangeable — swap palettes without renaming call sites.
 */

export type ThemeColors = {
  background: string;
  surface: string;
  primary: string;
  /** Text and icons drawn on top of `primary` */
  onPrimary: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  error: string;
};

// Cosy, earthy palette: oat and linen neutrals, sage accent, terracotta secondary
export const lightColors: ThemeColors = {
  background: "#F8F2E8", // oat
  surface: "#E9D6B8", // linen
  primary: "#5E6E44", // sage
  onPrimary: "#FBF4E9",
  secondary: "#A9512E", // terracotta
  textPrimary: "#2E2018", // cocoa
  textSecondary: "#5A4535", // walnut
  border: "#CDB089",
  error: "#9B2F2F",
};

export const darkColors: ThemeColors = {
  background: "#221A15", // dark walnut
  surface: "#3A2D24",
  primary: "#A8B98A", // soft sage
  onPrimary: "#221A15",
  secondary: "#E0895E", // warm clay
  textPrimary: "#F3E9DC",
  textSecondary: "#C4B19C",
  border: "#5A4838",
  error: "#E8857A",
};

/** @deprecated Prefer lightColors / darkColors — kept for keyed lookup */
export const Colors = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeColor = keyof ThemeColors;
