import { Dimensions } from "react-native";
import { COLORS } from "./colors";

const { width, height } = Dimensions.get("window");

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 10,

  // Font sizes
  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 18,
  h4: 16,
  h5: 14,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,

  // Additional font sizes
  tiny: 10,
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 18,
  xxlarge: 20,

  // App dimensions
  width,
  height,
};

// Font Weights
export const FONT_WEIGHTS = {
  thin: "100",
  ultraLight: "200",
  light: "300",
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
  extraBold: "800",
  black: "900",
};

// Font Families
export const FONT_FAMILIES = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semiBold: "Inter-SemiBold",
  bold: "Inter-Bold",
  extraBold: "Inter-ExtraBold",
  light: "Inter-Light",
};

// Global Text Styles
export const TEXT_STYLES = {
  // Display styles (very large text)
  displayLarge: {
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 44,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 52,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 36,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 44,
    letterSpacing: -0.25,
  },
  displaySmall: {
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 32,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 40,
    letterSpacing: 0,
  },

  // Headline styles
  headlineLarge: {
    fontFamily: FONT_FAMILIES.bold,
    fontSize: 28,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 24,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 32,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 20,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 28,
    letterSpacing: 0,
  },

  // Title styles
  titleLarge: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 26,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  titleSmall: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Body styles
  bodyLarge: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  // Label styles
  labelLarge: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 14,
    letterSpacing: 0.5,
  },

  // Button styles
  buttonLarge: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 16,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 24,
    letterSpacing: 0.1,
    textTransform: "uppercase",
  },
  buttonMedium: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.semiBold,
    lineHeight: 20,
    letterSpacing: 0.25,
    textTransform: "uppercase",
  },
  buttonSmall: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Caption styles
  caption: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  overline: {
    fontFamily: FONT_FAMILIES.medium,
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
};

// Legacy FONTS object (backward compatibility)
export const FONTS = {
  largeTitle: { fontFamily: FONT_FAMILIES.bold, fontSize: SIZES.largeTitle },
  h1: { fontFamily: FONT_FAMILIES.bold, fontSize: SIZES.h1, lineHeight: 36 },
  h2: { fontFamily: FONT_FAMILIES.bold, fontSize: SIZES.h2, lineHeight: 30 },
  h3: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: SIZES.h3,
    lineHeight: 22,
  },
  h4: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: SIZES.h4,
    lineHeight: 22,
  },
  h5: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: SIZES.h5,
    lineHeight: 22,
  },
  body1: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: SIZES.body1,
    lineHeight: 36,
  },
  body2: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: SIZES.body2,
    lineHeight: 30,
  },
  body3: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: SIZES.body3,
    lineHeight: 22,
  },
  body4: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: SIZES.body4,
    lineHeight: 22,
  },
  body5: {
    fontFamily: FONT_FAMILIES.regular,
    fontSize: SIZES.body5,
    lineHeight: 22,
  },
};

// Spacing system
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius system
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
  circle: 9999,
};

// Global component styles
export const COMPONENT_STYLES = {
  // Card styles
  card: {
    backgroundColor: "transparent",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Input styles
  input: {
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: SIZES.body4,
    fontFamily: FONT_FAMILIES.regular,
    borderWidth: 1,
  },

  // Button styles
  button: {
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },

  // Container styles
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },

  // Section styles
  section: {
    marginBottom: SPACING.lg,
  },
};

// Utility functions for responsive design
export const responsive = {
  // Font size based on screen size
  fontSize: (size) => {
    const scale = width / 375; // iPhone X base width
    return Math.round(size * scale);
  },

  // Spacing based on screen size
  spacing: (space) => {
    const scale = width / 375;
    return Math.round(space * scale);
  },

  // Width percentage
  wp: (percentage) => {
    return (width * percentage) / 100;
  },

  // Height percentage
  hp: (percentage) => {
    return (height * percentage) / 100;
  },
};

// Animation durations
export const ANIMATION_DURATION = {
  fast: 200,
  medium: 300,
  slow: 500,
  verySlow: 1000,
};

// Z-index layers
export const Z_INDEX = {
  base: 1,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  overlay: 9999,
};

// Varsayılan sabit gölge değerleri
export const DEFAULT_SHADOWS = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xlarge: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const getShadows = (isDark) => {
  return {
    ...DEFAULT_SHADOWS,
    small: {
      ...DEFAULT_SHADOWS.small,
      shadowColor: isDark ? "#000000" : "#000000",
      shadowOpacity: isDark ? 0.3 : 0.05,
    },
    medium: {
      ...DEFAULT_SHADOWS.medium,
      shadowColor: isDark ? "#000000" : "#000000",
      shadowOpacity: isDark ? 0.4 : 0.1,
    },
    large: {
      ...DEFAULT_SHADOWS.large,
      shadowColor: isDark ? "#000000" : "#000000",
      shadowOpacity: isDark ? 0.5 : 0.15,
    },
    xlarge: {
      ...DEFAULT_SHADOWS.xlarge,
      shadowColor: isDark ? "#000000" : "#000000",
      shadowOpacity: isDark ? 0.6 : 0.2,
    },
  };
};

// Doğrudan kullanılabilmesi için varsayılan shadows
export const SHADOWS = DEFAULT_SHADOWS;

// Global theme object
export const THEME = {
  SIZES,
  FONTS,
  TEXT_STYLES,
  FONT_WEIGHTS,
  FONT_FAMILIES,
  SPACING,
  BORDER_RADIUS,
  COMPONENT_STYLES,
  SHADOWS,
  ANIMATION_DURATION,
  Z_INDEX,
  responsive,
  COLORS,
};

export default THEME;
