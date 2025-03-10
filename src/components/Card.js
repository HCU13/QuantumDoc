// src/components/Card.js
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../context/ThemeContext";

/**
 * Modern Card component with various styles and interactive states
 *
 * @param {Node} children - Card content
 * @param {function} onPress - Press handler (optional)
 * @param {Object} style - Custom style properties
 * @param {Object} contentStyle - Content style properties
 * @param {boolean} elevated - Whether to apply elevation shadow
 * @param {boolean} glassmorphism - Whether to use glassmorphism effect
 * @param {string} variant - Card variant (default, flat, bordered)
 * @param {number} intensity - Blur intensity for glassmorphism (0-100)
 */
export const Card = ({
  children,
  onPress,
  style,
  contentStyle,
  elevated = true,
  glassmorphism = false,
  variant = "default",
  intensity = 30,
  ...props
}) => {
  const { theme, isDark } = useTheme();

  // Animation for press feedback
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Interpolate animation values
  const scaleInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  // Determine card styling based on variant
  const getCardStyles = () => {
    switch (variant) {
      case "flat":
        return {
          backgroundColor: theme.colors.card,
          borderWidth: 0,
          ...(!elevated && { shadowOpacity: 0, elevation: 0 }),
        };
      case "bordered":
        return {
          backgroundColor: theme.colors.card,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
          ...(!elevated && { shadowOpacity: 0, elevation: 0 }),
        };
      default:
        return {
          backgroundColor: theme.colors.card,
          borderWidth: 0,
        };
    }
  };

  // Get shadow styles based on elevation and theme
  const shadowStyles = elevated
    ? isDark
      ? {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }
      : theme.shadows.md
    : {};

  const cardStyles = getCardStyles();

  // Wrapper component to apply blur effect for glassmorphism
  const CardWrapper = ({ children }) => {
    if (glassmorphism && Platform.OS !== "web") {
      return (
        <BlurView
          intensity={intensity}
          tint={isDark ? "dark" : "light"}
          style={[
            styles.blurContainer,
            {
              borderRadius: theme.borderRadius.lg,
              borderColor: theme.colors.border,
              borderWidth: 0.5,
              overflow: "hidden",
            },
          ]}
        >
          {children}
        </BlurView>
      );
    }

    return <>{children}</>;
  };

  // Main card render
  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={[styles.cardWrapper]}
      {...props}
    >
      <Animated.View
        style={[
          styles.card,
          {
            borderRadius: theme.borderRadius.lg,
            backgroundColor: glassmorphism
              ? "transparent"
              : cardStyles.backgroundColor,
            borderWidth: cardStyles.borderWidth,
            borderColor: cardStyles.borderColor,
            transform: onPress ? [{ scale: scaleInterpolation }] : undefined,
          },
          shadowStyles,
          style,
        ]}
      >
        <CardWrapper>
          <View style={[styles.content, contentStyle]}>{children}</View>
        </CardWrapper>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 6,
  },
  card: {
    overflow: "hidden",
  },
  content: {
    padding: 16,
  },
  blurContainer: {
    overflow: "hidden",
  },
});
