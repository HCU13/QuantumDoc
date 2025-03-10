// src/components/Badge.js
import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { useTheme } from "../context/ThemeContext";

/**
 * Modern Badge component with various styles and animations
 *
 * @param {string} label - Badge text
 * @param {string} type - Badge type (info, success, warning, error, primary, secondary)
 * @param {Object} style - Custom style properties
 * @param {string} size - Badge size (sm, md, lg)
 * @param {string} icon - Optional icon name (Ionicons)
 * @param {boolean} pulse - Whether to apply pulse animation
 * @param {boolean} outlined - Whether to use outlined style
 * @param {boolean} gradient - Whether to use gradient background
 */
export const Badge = ({
  label,
  type = "info",
  style,
  size = "md",
  icon,
  pulse = false,
  outlined = false,
  gradient = false,
}) => {
  const { theme } = useTheme();

  // Pulse animation setup
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulse, pulseAnim]);

  // Get badge type colors
  const getTypeColors = () => {
    switch (type) {
      case "success":
        return {
          bg: outlined ? "transparent" : theme.colors.success + "18",
          border: theme.colors.success,
          text: theme.colors.success,
        };
      case "warning":
        return {
          bg: outlined ? "transparent" : theme.colors.warning + "18",
          border: theme.colors.warning,
          text: theme.colors.warning,
        };
      case "error":
        return {
          bg: outlined ? "transparent" : theme.colors.error + "18",
          border: theme.colors.error,
          text: theme.colors.error,
        };
      case "primary":
        return {
          bg: outlined ? "transparent" : theme.colors.primary + "18",
          border: theme.colors.primary,
          text: theme.colors.primary,
        };
      case "secondary":
        return {
          bg: outlined ? "transparent" : theme.colors.secondary + "18",
          border: theme.colors.secondary,
          text: theme.colors.secondary,
        };
      case "info":
      default:
        return {
          bg: outlined ? "transparent" : theme.colors.info + "18",
          border: theme.colors.info,
          text: theme.colors.info,
        };
    }
  };

  // Get size-based styles
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: 8,
          paddingVertical: 2,
          fontSize: theme.typography.fontSize.xs,
          iconSize: 12,
          borderRadius: theme.borderRadius.sm,
        };
      case "lg":
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          fontSize: theme.typography.fontSize.sm,
          iconSize: 16,
          borderRadius: theme.borderRadius.md,
        };
      case "md":
      default:
        return {
          paddingHorizontal: 10,
          paddingVertical: 4,
          fontSize: theme.typography.fontSize.xs,
          iconSize: 14,
          borderRadius: theme.borderRadius.sm,
        };
    }
  };

  const colors = getTypeColors();
  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderWidth: outlined ? 1 : 0,
          borderColor: colors.border,
          borderRadius: sizeStyles.borderRadius,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          transform: pulse ? [{ scale: pulseAnim }] : undefined,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={colors.text}
          style={styles.icon}
        />
      )}

      <Text
        style={[
          styles.label,
          {
            fontSize: sizeStyles.fontSize,
            color: colors.text,
            fontWeight: "600",
          },
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  label: {
    textAlign: "center",
  },
  icon: {
    marginRight: 4,
  },
});
