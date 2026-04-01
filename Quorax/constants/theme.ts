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
