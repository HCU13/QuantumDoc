import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Card Component
 *
 * @param {ReactNode} children - Card content
 * @param {function} onPress - Press handler if card is clickable
 * @param {string} variant - Card style variant ('default', 'outlined', 'elevated', 'gradient')
 * @param {Object} style - Additional styles
 * @param {Array} gradientColors - Colors for gradient background
 * @param {boolean} shadow - Whether to add shadow (only applies to 'default' and 'elevated')
 * @param {number} radius - Border radius override
 */
const Card = ({
  children,
  onPress,
  variant = "default",
  style,
  gradientColors = ["#5D5FEF20", "#61DAFB10"],
  shadow = true,
  radius = 16,
  ...props
}) => {
  // Card styles based on variant
  const getCardStyles = () => {
    switch (variant) {
      case "outlined":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: "#E2E8F0",
          ...(!shadow && { elevation: 0, shadowOpacity: 0 }),
        };
      case "elevated":
        return {
          backgroundColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      case "gradient":
        return {
          backgroundColor: "transparent",
          overflow: "hidden",
          ...(!shadow && { elevation: 0, shadowOpacity: 0 }),
        };
      default:
        return {
          backgroundColor: "#FFFFFF",
          ...(shadow
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
                elevation: 2,
              }
            : { elevation: 0, shadowOpacity: 0 }),
        };
    }
  };

  // Render as TouchableOpacity if onPress is provided
  const CardContainer = onPress ? TouchableOpacity : View;

  // For gradient cards
  if (variant === "gradient") {
    return (
      <CardContainer
        style={[styles.card, getCardStyles(), { borderRadius: radius }, style]}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      </CardContainer>
    );
  }

  // Regular cards
  return (
    <CardContainer
      style={[styles.card, getCardStyles(), { borderRadius: radius }, style]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientBackground: {
    width: "100%",
    height: "100%",
  },
});

export default Card;
