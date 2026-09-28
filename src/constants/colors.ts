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
  background: "#f8f7f2",
  surface: "#d8e3df",
  primary: "#cdefeb",
  secondary: "#B8A9D9",
  textPrimary: "#212121",
  textSecondary: "#415e66",
  border: "#F0DDD6",
  error: "#B5544A",
};
// keeping this for reference
// export const lightColors: ThemeColors = {
//   background: "#f8f7f2",
//   surface: "#d8e3df",
//   primary: "#9eb36b",
//   secondary: "#B8A9D9",
//   textPrimary: "#4A3B3B",
//   textSecondary: "#6C574B",
//   border: "#F0DDD6",
//   error: "#B5544A",
// };

// temporarily using light colors for dark theme
export const darkColors: ThemeColors = {
  background: "#f8f7f2",
  surface: "#d8e3df",
  primary: "#cdefeb",
  secondary: "#B8A9D9",
  textPrimary: "#212121",
  textSecondary: "#415e66",
  border: "#F0DDD6",
  error: "#B5544A",
};

// keeping this for reference
// export const darkColors: ThemeColors = {
//   background: "#2B2129",
//   surface: "#362A33",
//   primary: "#E8A8A8",
//   secondary: "#C7B8E0",
//   textPrimary: "#F5EAE7",
//   textSecondary: "#B39FA5",
//   border: "#453740",
//   error: "#E89A8A",
// };

/** @deprecated Prefer lightColors / darkColors — kept for keyed lookup */
export const Colors = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeColor = keyof ThemeColors;
