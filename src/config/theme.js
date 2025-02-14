// config/theme.js
import { colors } from "../constants/colors";

const baseTheme = {
  typography: {
    fontFamily: {
      sans: "Inter",
      display: "Plus Jakarta Sans",
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
      "5xl": 48,
    },
    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 24,
    full: 9999,
  },
  shadows: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export const lightTheme = {
  ...baseTheme,
  colors: {
    ...colors,
    background: colors.grey[50],
    surface: colors.white,
    text: colors.grey[900],
    textSecondary: colors.grey[500],
    border: colors.grey[200],
  },
};

export const darkTheme = {
  ...baseTheme,
  colors: {
    ...colors,
    background: colors.grey[900],
    surface: colors.grey[800],
    text: colors.white,
    textSecondary: colors.grey[400],
    border: colors.grey[700],
    primary: colors.primaryLight,
    secondary: colors.secondaryLight,
  },
};
