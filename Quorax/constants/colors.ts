/**
 * Theme Colors
 * Kurumsal, renkli ve anlaşılır renk paleti
 */

export const COLORS = {
  light: {
    // Brand - Canlı mor-mavi tonu
    primary: "#8A4FFF",
    primaryDark: "#6932E0",
    primarySoft: "#F0E8FF",

    // Backgrounds - Daha renkli ama okunabilir
    background: "#F5F3F8",
    backgroundSecondary: "#F8F6FA",
    surface: "#FFFFFF",
    surfaceMuted: "#FAF9FC",
    card: "#FFFFFF",
    cardSecondary: "#F5F3F8",

    // Text
    textPrimary: "#1A1625",
    textSecondary: "#5A5568",
    textTertiary: "#8B8499",
    textOnPrimary: "#FFFFFF",

    // Borders
    borderSubtle: "#E8E4ED",
    borderLight: "#F0ECF5",

    // Status
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",

    // Premium - Altın renkler
    premiumGold: "#FFD700",
    premiumGoldLight: "#F4D03F",
    premiumGoldDark: "#D4AF37",
    premiumGoldAccent: "#FFA500",

    // Module tints - Her modül için farklı canlı renkler
    moduleChat: "#F3E8FF", // Mor tonu
    moduleMath: "#ECFDF5", // Yeşil tonu
    moduleCalc: "#EFF6FF", // Mavi tonu
    moduleExamLab: "#FFF4E6", // Turuncu/amber tonu

    // Module colors - Her modül için primary, light, iconBg renkleri
    moduleChatPrimary: "#8B5CF6",
    moduleChatLight: "#F3E8FF",
    moduleChatIconBg: "#C4B5FD",
    
    moduleMathPrimary: "#10B981",
    moduleMathLight: "#ECFDF5",
    moduleMathIconBg: "#6EE7B7",
    
    moduleCalcPrimary: "#3B82F6",
    moduleCalcLight: "#EFF6FF",
    moduleCalcIconBg: "#93C5FD",
    
    moduleExamLabPrimary: "#F59E0B",
    moduleExamLabLight: "#FFF4E6",
    moduleExamLabIconBg: "#FCD34D",

    // Icon containers - Daha canlı renkler
    iconContainerPrimary: "#B794F6",
    iconContainerSecondary: "#E8E4ED",

    // Overlay
    overlay: "rgba(26, 22, 37, 0.4)",
    overlayStrong: "rgba(26, 22, 37, 0.6)",

    // === 2026 UI tokens ===

    // Brand gradient (button + hero)
    gradientPrimaryStart: "#A06BFF",
    gradientPrimaryEnd: "#6932E0",
    gradientPrimaryAccent: "#C8A9FF", // shimmer/glow accent

    // Module gradients (hero / featured cards)
    gradientChatStart: "#A78BFA",
    gradientChatEnd: "#7C3AED",
    gradientMathStart: "#34D399",
    gradientMathEnd: "#059669",
    gradientCalcStart: "#60A5FA",
    gradientCalcEnd: "#2563EB",
    gradientExamStart: "#FBBF24",
    gradientExamEnd: "#D97706",
    gradientPremiumStart: "#FFD580",
    gradientPremiumEnd: "#D4AF37",

    // Status gradients
    gradientSuccessStart: "#34D399",
    gradientSuccessEnd: "#059669",
    gradientErrorStart: "#FB7185",
    gradientErrorEnd: "#E11D48",
    gradientInfoStart: "#60A5FA",
    gradientInfoEnd: "#2563EB",

    // Glass / surface elevation
    glassFill: "rgba(255,255,255,0.65)",
    glassFillStrong: "rgba(255,255,255,0.82)",
    glassBorder: "rgba(255,255,255,0.5)",
    glassBorderSubtle: "rgba(20,16,38,0.06)",
    glassTint: "light", // expo-blur tint

    surfaceElevated: "#FFFFFF",
    surfaceSunken: "#EFEAF5",
    surfaceTransparent: "rgba(245,243,248,0.0)",

    // Interaction states (44pt pressed/hover/focus)
    pressedOverlay: "rgba(26,22,37,0.06)",
    hoverOverlay: "rgba(26,22,37,0.04)",
    focusRing: "rgba(138,79,255,0.35)",

    // Status soft (toast / inline banners)
    successSoft: "#D1FAE5",
    errorSoft: "#FEE2E2",
    warningSoft: "#FEF3C7",
    infoSoft: "#DBEAFE",
  },

  dark: {
    // Brand - Açık mor tonu
    primary: "#A78BFA",
    primaryDark: "#8B5CF6",
    primarySoft: "rgba(167,139,250,0.2)",

    // Backgrounds
    background: "#1A1625",
    backgroundSecondary: "#211D2E",
    surface: "#2A2538",
    surfaceMuted: "#1F1B2A",
    card: "#2A2538",
    cardSecondary: "#211D2E",

    // Text
    textPrimary: "#F5F3F8",
    textSecondary: "#C4BED1",
    textTertiary: "#8B8499",
    textOnPrimary: "#FFFFFF",

    // Borders
    borderSubtle: "#3A3447",
    borderLight: "#2F2A3C",

    // Status
    success: "#34D399",
    error: "#F87171",
    warning: "#FBBF24",
    info: "#60A5FA",

    // Premium - Altın renkler
    premiumGold: "#FFD700",
    premiumGoldLight: "#F4D03F",
    premiumGoldDark: "#D4AF37",
    premiumGoldAccent: "#FFA500",

    // Module tints - Koyu temada daha belirgin
    moduleChat: "rgba(167,139,250,0.2)",
    moduleMath: "rgba(52,211,153,0.2)",
    moduleCalc: "rgba(96,165,250,0.2)",
    moduleExamLab: "rgba(245,158,11,0.2)",

    // Module colors - Koyu tema için
    moduleChatPrimary: "#A78BFA",
    moduleChatLight: "rgba(167,139,250,0.2)",
    moduleChatIconBg: "rgba(196,181,253,0.4)",
    
    moduleMathPrimary: "#34D399",
    moduleMathLight: "rgba(52,211,153,0.2)",
    moduleMathIconBg: "rgba(110,231,183,0.4)",
    
    moduleCalcPrimary: "#60A5FA",
    moduleCalcLight: "rgba(96,165,250,0.2)",
    moduleCalcIconBg: "rgba(147,197,253,0.4)",
    
    moduleExamLabPrimary: "#FBBF24",
    moduleExamLabLight: "rgba(245,158,11,0.2)",
    moduleExamLabIconBg: "rgba(252,211,77,0.4)",

    // Icon containers
    iconContainerPrimary: "rgba(167,139,250,0.4)",
    iconContainerSecondary: "rgba(255,255,255,0.1)",

    // Overlay
    overlay: "rgba(26, 22, 37, 0.7)",
    overlayStrong: "rgba(0, 0, 0, 0.85)",

    // === 2026 UI tokens ===

    gradientPrimaryStart: "#B89AFF",
    gradientPrimaryEnd: "#6932E0",
    gradientPrimaryAccent: "#D8C0FF",

    gradientChatStart: "#C4B5FD",
    gradientChatEnd: "#7C3AED",
    gradientMathStart: "#6EE7B7",
    gradientMathEnd: "#059669",
    gradientCalcStart: "#93C5FD",
    gradientCalcEnd: "#2563EB",
    gradientExamStart: "#FCD34D",
    gradientExamEnd: "#D97706",
    gradientPremiumStart: "#FFE7A8",
    gradientPremiumEnd: "#D4AF37",

    gradientSuccessStart: "#34D399",
    gradientSuccessEnd: "#10B981",
    gradientErrorStart: "#FB7185",
    gradientErrorEnd: "#E11D48",
    gradientInfoStart: "#60A5FA",
    gradientInfoEnd: "#3B82F6",

    glassFill: "rgba(42,37,56,0.55)",
    glassFillStrong: "rgba(42,37,56,0.78)",
    glassBorder: "rgba(255,255,255,0.08)",
    glassBorderSubtle: "rgba(255,255,255,0.06)",
    glassTint: "dark",

    surfaceElevated: "#332C44",
    surfaceSunken: "#16121F",
    surfaceTransparent: "rgba(26,22,37,0.0)",

    pressedOverlay: "rgba(255,255,255,0.08)",
    hoverOverlay: "rgba(255,255,255,0.05)",
    focusRing: "rgba(167,139,250,0.45)",

    successSoft: "rgba(52,211,153,0.18)",
    errorSoft: "rgba(248,113,113,0.18)",
    warningSoft: "rgba(251,191,36,0.18)",
    infoSoft: "rgba(96,165,250,0.18)",
  },
};

export type ColorScheme = "light" | "dark";
export type ThemeColors = typeof COLORS.light;
