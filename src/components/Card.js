import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

const Card = ({
  children,
  onPress,
  variant = "default",
  style,
  gradientColors,
  shadow = true,
  radius = 16,
  ...props
}) => {
  const { theme } = useTheme();

  const getCardStyles = () => {
    switch (variant) {
      case "outlined":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: theme.colors.surface,
          ...(!shadow && { elevation: 0, shadowOpacity: 0 }),
        };
      case "elevated":
        return {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
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
          backgroundColor: theme.colors.surface,
          ...(shadow
            ? {
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
                elevation: 2,
              }
            : { elevation: 0, shadowOpacity: 0 }),
        };
    }
  };

  const CardContainer = onPress ? TouchableOpacity : View;

  if (variant === "gradient") {
    return (
      <CardContainer
        style={[styles.card, getCardStyles(), { borderRadius: radius }, style]}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        <LinearGradient
          colors={gradientColors || theme.colors.gradient}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      </CardContainer>
    );
  }

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
