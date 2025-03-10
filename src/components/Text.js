// src/components/Text.js
import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useLocalization } from "../context/LocalizationContext";

/**
 * Modern Text component with typography system and theme integration
 *
 * @param {Node} children - Text content
 * @param {string} variant - Text variant (h1, h2, h3, h4, subtitle1, subtitle2, body1, body2, caption, overline)
 * @param {string} weight - Font weight (regular, medium, semibold, bold)
 * @param {string} color - Custom color value
 * @param {Object} style - Custom style properties
 * @param {boolean} translate - Whether to translate content
 * @param {string} i18nKey - Translation key (required if translate=true)
 * @param {boolean} centered - Whether text should be centered
 * @param {string} alignment - Text alignment (left, center, right, justified)
 */
export const Text = ({
  children,
  variant = "body1",
  weight,
  color,
  style,
  translate = false,
  i18nKey,
  centered = false,
  alignment,
  ...props
}) => {
  const { theme } = useTheme();
  const { t } = useLocalization();

  // Translate content if requested
  const content = translate && i18nKey ? t(i18nKey) : children;

  // If children is a string and starts with common., translate it
  const finalContent =
    typeof content === "string" && content.startsWith("common.")
      ? t(content)
      : content;

  // Define variant styles with the typography system
  const getVariantStyle = () => {
    switch (variant) {
      case "h1":
        return {
          fontSize: theme.typography.fontSize.xxxl,
          fontWeight: theme.typography.fontWeight.bold,
          lineHeight:
            theme.typography.fontSize.xxxl * theme.typography.lineHeight.tight,
          letterSpacing: -0.5,
          marginVertical: 8,
        };
      case "h2":
        return {
          fontSize: theme.typography.fontSize.xxl,
          fontWeight: theme.typography.fontWeight.bold,
          lineHeight:
            theme.typography.fontSize.xxl * theme.typography.lineHeight.tight,
          letterSpacing: -0.3,
          marginVertical: 6,
        };
      case "h3":
        return {
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.semibold,
          lineHeight:
            theme.typography.fontSize.xl * theme.typography.lineHeight.tight,
          letterSpacing: -0.2,
          marginVertical: 4,
        };
      case "h4":
        return {
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          lineHeight:
            theme.typography.fontSize.lg * theme.typography.lineHeight.tight,
          letterSpacing: 0,
          marginVertical: 4,
        };
      case "subtitle1":
        return {
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.medium,
          lineHeight:
            theme.typography.fontSize.md * theme.typography.lineHeight.normal,
          letterSpacing: 0.1,
        };
      case "subtitle2":
        return {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          lineHeight:
            theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
          letterSpacing: 0.1,
        };
      case "body1":
        return {
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.regular,
          lineHeight:
            theme.typography.fontSize.md * theme.typography.lineHeight.relaxed,
        };
      case "body2":
        return {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.regular,
          lineHeight:
            theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
        };
      case "caption":
        return {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.regular,
          lineHeight:
            theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
          letterSpacing: 0.4,
        };
      case "overline":
        return {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
          lineHeight:
            theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        };
      default:
        return {
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.regular,
          lineHeight:
            theme.typography.fontSize.md * theme.typography.lineHeight.normal,
        };
    }
  };

  // Get font weight if explicitly specified
  const getFontWeight = () => {
    if (!weight) return {};

    switch (weight) {
      case "regular":
        return { fontWeight: theme.typography.fontWeight.regular };
      case "medium":
        return { fontWeight: theme.typography.fontWeight.medium };
      case "semibold":
        return { fontWeight: theme.typography.fontWeight.semibold };
      case "bold":
        return { fontWeight: theme.typography.fontWeight.bold };
      default:
        return {};
    }
  };

  // Get text alignment
  const getTextAlignment = () => {
    if (centered) return { textAlign: "center" };
    if (!alignment) return {};

    return { textAlign: alignment };
  };

  // Get text color
  const getTextColor = () => {
    if (color) return { color };

    // Default colors based on variant
    switch (variant) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
        return { color: theme.colors.text };
      case "subtitle1":
      case "subtitle2":
        return { color: theme.colors.text };
      case "body1":
      case "body2":
        return { color: theme.colors.text };
      case "caption":
      case "overline":
        return { color: theme.colors.textSecondary };
      default:
        return { color: theme.colors.text };
    }
  };

  return (
    <RNText
      style={[
        styles.base,
        getVariantStyle(),
        getFontWeight(),
        getTextColor(),
        getTextAlignment(),
        style,
      ]}
      {...props}
    >
      {finalContent}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
  },
  h1: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
});
