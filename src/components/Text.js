import React from "react";
import { Text as RNText } from "react-native";
import { useTheme } from "../context/ThemeContext";

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
  const { theme } = useTheme();

  // Font weights
  const fontWeights = {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  };

  // Typography variants
  const getTypographyStyles = () => {
    const defaultColor = theme.colors.text;
    switch (variant) {
      case "h1":
        return {
          fontSize: 32,
          lineHeight: 40,
          fontWeight: fontWeights.bold,
          color: theme.colors.heading || defaultColor,
          letterSpacing: -0.5,
          marginVertical: 8,
        };
      case "h2":
        return {
          fontSize: 24,
          lineHeight: 32,
          fontWeight: fontWeights.bold,
          color: theme.colors.heading || defaultColor,
          letterSpacing: -0.3,
          marginVertical: 6,
        };
      case "h3":
        return {
          fontSize: 20,
          lineHeight: 28,
          fontWeight: fontWeights.semibold,
          color: theme.colors.heading || defaultColor,
          letterSpacing: -0.2,
          marginVertical: 4,
        };
      case "subtitle1":
        return {
          fontSize: 18,
          lineHeight: 26,
          fontWeight: fontWeights.semibold,
          color: theme.colors.heading || defaultColor,
        };
      case "subtitle2":
        return {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: fontWeights.medium,
          color: theme.colors.heading || defaultColor,
        };
      case "body1":
        return {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: fontWeights.regular,
          color: theme.colors.body || defaultColor,
        };
      case "body2":
        return {
          fontSize: 14,
          lineHeight: 20,
          fontWeight: fontWeights.regular,
          color: theme.colors.body || defaultColor,
        };
      case "caption":
        return {
          fontSize: 12,
          lineHeight: 16,
          fontWeight: fontWeights.regular,
          color: theme.colors.secondary || defaultColor,
        };
      default:
        return {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: fontWeights.regular,
          color: defaultColor,
        };
    }
  };

  return (
    <RNText
      style={[
        getTypographyStyles(),
        weight && { fontWeight: fontWeights[weight] || fontWeights.regular },
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
