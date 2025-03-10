import React from "react";
import { View, StyleSheet } from "react-native";
import Text from "./Text";

/**
 * Badge Component
 *
 * @param {string} label - Badge text
 * @param {string} variant - Badge style variant ('primary', 'secondary', 'success', 'error', 'warning', 'info')
 * @param {string} size - Badge size ('small', 'medium')
 * @param {JSX.Element} leftIcon - Icon to display on the left
 * @param {Object} style - Additional style overrides
 */
const Badge = ({
  label,
  variant = "primary",
  size = "medium",
  leftIcon,
  style,
  ...props
}) => {
  // Theme colors
  const colors = {
    primary: {
      background: "#5D5FEF20",
      text: "#5D5FEF",
    },
    secondary: {
      background: "#61DAFB20",
      text: "#0891B2",
    },
    success: {
      background: "#10B98120",
      text: "#10B981",
    },
    error: {
      background: "#EF444420",
      text: "#EF4444",
    },
    warning: {
      background: "#F59E0B20",
      text: "#F59E0B",
    },
    info: {
      background: "#3B82F620",
      text: "#3B82F6",
    },
  };

  // Size styles
  const sizes = {
    small: {
      paddingVertical: 2,
      paddingHorizontal: 8,
      fontSize: 12,
    },
    medium: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      fontSize: 14,
    },
  };

  const currentColor = colors[variant] || colors.primary;
  const currentSize = sizes[size] || sizes.medium;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentColor.background,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
        },
        style,
      ]}
      {...props}
    >
      {leftIcon && <View style={styles.icon}>{leftIcon}</View>}

      <Text
        style={[
          styles.label,
          {
            color: currentColor.text,
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  label: {
    fontWeight: "600",
  },
  icon: {
    marginRight: 4,
  },
});

export default Badge;
