import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Button Component
 *
 * @param {string} label - Button text
 * @param {function} onPress - Press handler
 * @param {string} variant - Button style variant ('primary', 'secondary', 'outline', 'text')
 * @param {string} size - Button size ('small', 'medium', 'large')
 * @param {boolean} loading - Show loading indicator
 * @param {boolean} disabled - Disable button
 * @param {boolean} gradient - Use gradient background
 * @param {Object} style - Additional style overrides
 * @param {Object} textStyle - Style for button text
 * @param {string} leftIcon - Icon component to show on left side
 * @param {string} rightIcon - Icon component to show on right side
 * @param {boolean} fullWidth - Whether button should take full width
 */
const Button = ({
  label,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  gradient = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}) => {
  // Define base colors
  const colors = {
    primary: {
      background: "#5D5FEF",
      text: "#FFFFFF",
      border: "transparent",
      gradient: ["#5D5FEF", "#7879F1"],
    },
    secondary: {
      background: "#61DAFB",
      text: "#0A1128",
      border: "transparent",
      gradient: ["#61DAFB", "#39C4E3"],
    },
    success: {
      background: "#10B981",
      text: "#FFFFFF",
      border: "transparent",
      gradient: ["#10B981", "#34D399"],
    },
    danger: {
      background: "#EF4444",
      text: "#FFFFFF",
      border: "transparent",
      gradient: ["#EF4444", "#F87171"],
    },
    outline: {
      background: "transparent",
      text: "#5D5FEF",
      border: "#5D5FEF",
    },
    text: {
      background: "transparent",
      text: "#5D5FEF",
      border: "transparent",
    },
  };

  // Define sizes
  const sizes = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      fontSize: 16,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      fontSize: 18,
    },
  };

  // Determine current styles based on variant and size
  const currentColor = colors[variant] || colors.primary;
  const currentSize = sizes[size] || sizes.medium;

  // Render the button with or without gradient
  const renderButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={currentColor.text}
          size={size === "large" ? "large" : "small"}
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <Text
            style={[
              styles.label,
              {
                color: currentColor.text,
                fontSize: currentSize.fontSize,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>

          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </>
  );

  // If gradient is true and we're using a variant that supports gradients
  if (
    gradient &&
    currentColor.gradient &&
    !disabled &&
    variant !== "outline" &&
    variant !== "text"
  ) {
    return (
      <TouchableOpacity
        onPress={!disabled && !loading ? onPress : null}
        disabled={disabled || loading}
        style={[styles.button, fullWidth && styles.fullWidth, style]}
        activeOpacity={0.7}
        {...props}
      >
        <LinearGradient
          colors={currentColor.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            {
              paddingVertical: currentSize.paddingVertical,
              paddingHorizontal: currentSize.paddingHorizontal,
              opacity: disabled ? 0.6 : 1,
            },
          ]}
        >
          {renderButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Regular button without gradient
  return (
    <TouchableOpacity
      onPress={!disabled && !loading ? onPress : null}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: currentColor.background,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor: currentColor.border,
          opacity: disabled ? 0.6 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {renderButtonContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gradient: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "600",
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;
