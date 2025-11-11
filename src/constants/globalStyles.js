// Global Styles Usage Examples
// Bu dosya global stil sisteminin nasıl kullanılacağını gösterir

import { StyleSheet } from 'react-native';
import { 
  TEXT_STYLES, 
  SPACING, 
  BORDER_RADIUS, 
  COMPONENT_STYLES,
  SHADOWS,
  FONT_WEIGHTS,
  FONT_FAMILIES,
  responsive,
  Z_INDEX
} from './theme';

// ============================================
// KULLANIM ÖRNEKLERİ
// ============================================

// 1. TEXT STYLES KULLANIMI
export const textExamples = StyleSheet.create({
  // Modern text styles
  pageTitle: {
    ...TEXT_STYLES.displayMedium,
    color: '#000',
  },
  
  sectionHeading: {
    ...TEXT_STYLES.headlineLarge,
    color: '#333',
    marginBottom: SPACING.md,
  },
  
  cardTitle: {
    ...TEXT_STYLES.titleLarge,
    color: '#000',
  },
  
  bodyText: {
    ...TEXT_STYLES.bodyMedium,
    color: '#666',
  },
  
  buttonText: {
    ...TEXT_STYLES.buttonMedium,
    color: '#fff',
  },
  
  caption: {
    ...TEXT_STYLES.caption,
    color: '#999',
  },
});

// 2. COMPONENT STYLES KULLANIMI
export const componentExamples = StyleSheet.create({
  // Temel card
  card: {
    ...COMPONENT_STYLES.card,
    ...SHADOWS.medium,
  },
  
  // Modern card
  modernCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.large,
    marginBottom: SPACING.md,
  },
  
  // Input field
  input: {
    ...COMPONENT_STYLES.input,
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  
  // Primary button
  primaryButton: {
    ...COMPONENT_STYLES.button,
    backgroundColor: '#007bff',
    ...SHADOWS.medium,
  },
  
  // Secondary button
  secondaryButton: {
    ...COMPONENT_STYLES.button,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
  },
});

// 3. SPACING SYSTEM KULLANIMI
export const spacingExamples = StyleSheet.create({
  container: {
    ...COMPONENT_STYLES.container,
    paddingTop: SPACING.lg,
  },
  
  section: {
    ...COMPONENT_STYLES.section,
    paddingHorizontal: SPACING.md,
  },
  
  listItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
});

// 4. RESPONSIVE DESIGN KULLANIMI
export const responsiveExamples = StyleSheet.create({
  responsiveText: {
    fontSize: responsive.fontSize(16),
    marginBottom: responsive.spacing(12),
  },
  
  responsiveContainer: {
    width: responsive.wp(90), // %90 genişlik
    height: responsive.hp(30), // %30 yükseklik
    padding: responsive.spacing(16),
  },
});

// 5. SHADOW SYSTEM KULLANIMI
export const shadowExamples = StyleSheet.create({
  lightShadow: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  
  mediumShadow: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  
  heavyShadow: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.xlarge,
  },
});

// 6. Z-INDEX KULLANIMI
export const layerExamples = StyleSheet.create({
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: Z_INDEX.modal,
  },
  
  dropdown: {
    position: 'absolute',
    zIndex: Z_INDEX.dropdown,
  },
  
  toast: {
    position: 'absolute',
    top: 50,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: Z_INDEX.toast,
  },
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Tema rengine göre text style
export const getThemedTextStyle = (baseStyle, isDark = false) => ({
  ...baseStyle,
  color: isDark ? '#ffffff' : '#000000',
});

// Tema rengine göre card style
export const getThemedCardStyle = (baseStyle, isDark = false) => ({
  ...baseStyle,
  backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
  ...SHADOWS.medium,
});

// Durum rengine göre button style
export const getButtonStyle = (variant = 'primary') => {
  const baseStyle = COMPONENT_STYLES.button;
  
  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: '#007bff',
        ...SHADOWS.medium,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007bff',
      };
    case 'success':
      return {
        ...baseStyle,
        backgroundColor: '#28a745',
        ...SHADOWS.medium,
      };
    case 'danger':
      return {
        ...baseStyle,
        backgroundColor: '#dc3545',
        ...SHADOWS.medium,
      };
    default:
      return baseStyle;
  }
};

// Font weight helper
export const getFontWeight = (weight) => ({
  fontWeight: FONT_WEIGHTS[weight] || FONT_WEIGHTS.regular,
});

// Font family helper
export const getFontFamily = (family) => ({
  fontFamily: FONT_FAMILIES[family] || FONT_FAMILIES.regular,
});

// ============================================
// EXPORT ALL
// ============================================
export default {
  textExamples,
  componentExamples,
  spacingExamples,
  responsiveExamples,
  shadowExamples,
  layerExamples,
  getThemedTextStyle,
  getThemedCardStyle,
  getButtonStyle,
  getFontWeight,
  getFontFamily,
};
