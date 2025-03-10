import React from "react";
import { Text as RNText, StyleSheet } from "react-native";

/**
 * Text Component - Typography system
 *
 * @param {ReactNode} children - Text content
 * @param {string} variant - Text style variant ('h1', 'h2', 'h3', 'subtitle1', 'body1', 'body2', 'caption')
 * @param {string} weight - Font weight ('regular', 'medium', 'semibold', 'bold')
 * @param {string} color - Text color (defaults to theme colors based on variant)
 * @param {Object} style - Additional style overrides
 * @param {string} align - Text alignment ('left', 'center', 'right')
 */
const Text = ({
  children,
  variant = "body1",
  weight,
  color,
  style,
  align = "left",
  ...props
}) => {
  // Theme colors
  const colors = {
    // Dark text colors
    heading: "#0F172A", // Slate 900
    body: "#334155", // Slate 700
    secondary: "#64748B", // Slate 500
    muted: "#94A3B8", // Slate 400

    // Brand/accent colors
    primary: "#5D5FEF", // Primary brand
    secondary: "#61DAFB", // Secondary brand
    success: "#10B981", // Green
    error: "#EF4444", // Red
    warning: "#F59E0B", // Amber
    info: "#3B82F6", // Blue
  };

  // Font weights
  const fontWeights = {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  };

  // Typography variants
  const getTypographyStyles = () => {
    switch (variant) {
      case "h1":
        return {
          fontSize: 32,
          lineHeight: 40,
          fontWeight: fontWeights.bold,
          color: colors.heading,
          letterSpacing: -0.5,
          marginVertical: 8,
        };
      case "h2":
        return {
          fontSize: 24,
          lineHeight: 32,
          fontWeight: fontWeights.bold,
          color: colors.heading,
          letterSpacing: -0.3,
          marginVertical: 6,
        };
      case "h3":
        return {
          fontSize: 20,
          lineHeight: 28,
          fontWeight: fontWeights.semibold,
          color: colors.heading,
          letterSpacing: -0.2,
          marginVertical: 4,
        };
      case "subtitle1":
        return {
          fontSize: 18,
          lineHeight: 26,
          fontWeight: fontWeights.semibold,
          color: colors.heading,
        };
      case "subtitle2":
        return {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: fontWeights.medium,
          color: colors.heading,
        };
      case "body1":
        return {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: fontWeights.regular,
          color: colors.body,
        };
      case "body2":
        return {
          fontSize: 14,
          lineHeight: 20,
          fontWeight: fontWeights.regular,
          color: colors.body,
        };
      case "caption":
        return {
          fontSize: 12,
          lineHeight: 16,
          fontWeight: fontWeights.regular,
          color: colors.secondary,
        };
      default:
        return {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: fontWeights.regular,
          color: colors.body,
        };
    }
  };

  // Get font weight if explicitly specified
  const getFontWeight = () => {
    if (!weight) return {};
    return { fontWeight: fontWeights[weight] || fontWeights.regular };
  };

  return (
    <RNText
      style={[
        getTypographyStyles(),
        getFontWeight(),
        { textAlign: align },
        color && { color },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;
