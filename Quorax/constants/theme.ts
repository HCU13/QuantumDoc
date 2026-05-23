import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

/* -------------------------------------------------------------------------- */
/*  Screen Sizes                                                               */
/* -------------------------------------------------------------------------- */

export const SIZES = {
  width,
  height,
  contentMaxWidth: 420, // tablet / large phone guard
};

/* -------------------------------------------------------------------------- */
/*  Spacing System                                                             */
/*  Base: 4px                                                                  */
/*  NOT: xl ve xxl bilinçli olarak daraltıldı                                  */
/* -------------------------------------------------------------------------- */

export const SPACING = {
  xs: 4,     // icon gaps
  sm: 8,     // tight spacing
  md: 12,    // default vertical rhythm
  lg: 16,    // section spacing
  xl: 24,    // major separation
  xxl: 32,   // very rare (empty states only)
};

/* -------------------------------------------------------------------------- */
/*  Border Radius                                                              */
/* -------------------------------------------------------------------------- */

export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 10,     // cards / inputs
  lg: 14,     // hero cards
  xl: 18,     // very rare
  round: 9999,
};

/* -------------------------------------------------------------------------- */
/*  Fonts                                                                      */
/* -------------------------------------------------------------------------- */

export const FONTS = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }),
};

/* -------------------------------------------------------------------------- */
/*  Font Sizes                                                                 */
/*  (Bilinçli olarak sıkıştırıldı)                                             */
/* -------------------------------------------------------------------------- */

export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
};

/* -------------------------------------------------------------------------- */
/*  Text Styles                                                                */
/*  Gerçek ürün hiyerarşisi                                                    */
/* -------------------------------------------------------------------------- */

export const TEXT_STYLES = {
  /* Titles */
  titleLarge: {
    fontSize: FONT_SIZES.xxl,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  titleMedium: {
    fontSize: FONT_SIZES.xl,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  titleSmall: {
    fontSize: FONT_SIZES.lg,
    lineHeight: 22,
    fontWeight: '600' as const,
  },

  /* Body */
  bodyLarge: {
    fontSize: FONT_SIZES.lg,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
    fontWeight: '400' as const,
  },

  /* Labels */
  labelLarge: {
    fontSize: FONT_SIZES.md,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
  labelMedium: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  labelSmall: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 14,
    fontWeight: '500' as const,
  },
};

/* -------------------------------------------------------------------------- */
/*  Shadows                                                                    */
/*  NOT: default olarak SADECE primary card kullanır                           */
/* -------------------------------------------------------------------------- */

export const SHADOWS = {
  subtle: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    android: { elevation: 1 },
    default: {},
  }),

  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),

  /* 2026: kart / glass / FAB için derin yumuşak gölgeler */
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.10,
      shadowRadius: 16,
    },
    android: { elevation: 4 },
    default: {},
  }),

  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.14,
      shadowRadius: 28,
    },
    android: { elevation: 8 },
    default: {},
  }),

  /* Renkli "glow" — gradient butonlarda altta */
  glow: (color: string) =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
      default: {},
    }),
};

/* -------------------------------------------------------------------------- */
/*  Spring presets (reanimated withSpring config)                              */
/* -------------------------------------------------------------------------- */

export const SPRING = {
  /* Sayfa geçişleri / sheet */
  smooth: { damping: 18, stiffness: 180, mass: 1 },
  /* Buton press / küçük etkileşim */
  snappy: { damping: 14, stiffness: 260, mass: 0.8 },
  /* Bounce ihtiyaçları (FAB ilk açılış vb.) */
  bouncy: { damping: 10, stiffness: 200, mass: 1 },
  /* Çok yumuşak (toast slide) */
  gentle: { damping: 22, stiffness: 140, mass: 1 },
};

/* -------------------------------------------------------------------------- */
/*  Hit slop helper (44pt minimum dokunma alanı)                              */
/* -------------------------------------------------------------------------- */

export const HIT_SLOP = {
  small: { top: 8, bottom: 8, left: 8, right: 8 },
  medium: { top: 12, bottom: 12, left: 12, right: 12 },
  large: { top: 16, bottom: 16, left: 16, right: 16 },
};

/* -------------------------------------------------------------------------- */
/*  Animation                                                                  */
/* -------------------------------------------------------------------------- */

export const ANIMATION = {
  fast: 120,
  normal: 220,
  slow: 360,
};

/* -------------------------------------------------------------------------- */
/*  Z-Index                                                                    */
/* -------------------------------------------------------------------------- */

export const Z_INDEX = {
  base: 0,
  sticky: 100,
  dropdown: 200,
  modalBackdrop: 900,
  modal: 1000,
};

/* ========================================================================== */
/*  V2 — 2026 Redesign Tokens                                                 */
/*  Use these for new components and redesigned screens.                      */
/* ========================================================================== */

export const SPACING_V2 = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 40,
};

export const RADIUS_V2 = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 9999,
};

export const TYPE_V2 = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const, letterSpacing: -0.8 },
  title:   { fontSize: 22, lineHeight: 28, fontWeight: '600' as const, letterSpacing: -0.4 },
  body:    { fontSize: 15, lineHeight: 22, fontWeight: '400' as const, letterSpacing: 0 },
  label:   { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.2 },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const, letterSpacing: 0.4 },
};

export const MOTION_V2 = {
  duration: { instant: 80, fast: 160, normal: 240, slow: 360 },
  spring: {
    snappy: { damping: 18, stiffness: 280, mass: 0.9 },
    smooth: { damping: 22, stiffness: 180, mass: 1 },
    gentle: { damping: 26, stiffness: 140, mass: 1 },
  },
};

export const ELEVATION_V2 = {
  flat: Platform.select({
    ios: { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0 },
    android: { elevation: 0 },
    default: {},
  }),
  low: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
    android: { elevation: 1 },
    default: {},
  }),
  medium: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16 },
    android: { elevation: 3 },
    default: {},
  }),
  high: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 24 },
    android: { elevation: 6 },
    default: {},
  }),
};
