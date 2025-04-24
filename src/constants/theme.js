import { Dimensions } from "react-native";
import { COLORS } from "./colors";

const { width, height } = Dimensions.get("window");

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 14,

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

  // App dimensions
  width,
  height,
};

export const FONTS = {
  largeTitle: { fontFamily: "Inter-Bold", fontSize: SIZES.largeTitle },
  h1: { fontFamily: "Inter-Bold", fontSize: SIZES.h1, lineHeight: 36 },
  h2: { fontFamily: "Inter-Bold", fontSize: SIZES.h2, lineHeight: 30 },
  h3: { fontFamily: "Inter-SemiBold", fontSize: SIZES.h3, lineHeight: 22 },
  h4: { fontFamily: "Inter-SemiBold", fontSize: SIZES.h4, lineHeight: 22 },
  h5: { fontFamily: "Inter-SemiBold", fontSize: SIZES.h5, lineHeight: 22 },
  body1: { fontFamily: "Inter-Regular", fontSize: SIZES.body1, lineHeight: 36 },
  body2: { fontFamily: "Inter-Regular", fontSize: SIZES.body2, lineHeight: 30 },
  body3: { fontFamily: "Inter-Regular", fontSize: SIZES.body3, lineHeight: 22 },
  body4: { fontFamily: "Inter-Regular", fontSize: SIZES.body4, lineHeight: 22 },
  body5: { fontFamily: "Inter-Regular", fontSize: SIZES.body5, lineHeight: 22 },
};

// Varsayılan sabit gölge değerleri
export const DEFAULT_SHADOWS = {
  standard: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
};

export const getShadows = (isDark) => {
  return {
    standard: {
      ...DEFAULT_SHADOWS.standard,
      shadowColor: isDark ? "#000000" : "#000000",
      shadowOpacity: isDark ? 0.25 : 0.25,
    }
  };
};

// Doğrudan kullanılabilmesi için varsayılan shadows
export const SHADOWS = DEFAULT_SHADOWS;
