import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { BORDER_RADIUS, SHADOWS, SPACING, SPRING, TEXT_STYLES } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useHaptics } from "@/hooks/useHaptics";

type Variant = "primary" | "module" | "success" | "error" | "premium";
type Size = "sm" | "md" | "lg";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  /** module variant için: ["#start", "#end"] */
  gradient?: [string, string];
  glow?: boolean;
  style?: ViewStyle;
};

/**
 * 2026: Gradient + glow + spring press animasyonu.
 * Modül ekranlarında modül rengiyle gradient kullanılabilir.
 */
export const GradientButton: React.FC<Props> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  gradient,
  glow = true,
  style,
}) => {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const isDisabled = disabled || loading;

  const grad: [string, string] = gradient ?? resolveGradient(variant, colors);

  const sizeStyle =
    size === "sm"
      ? { paddingVertical: 10, paddingHorizontal: 16, minHeight: 40 }
      : size === "lg"
        ? { paddingVertical: 16, paddingHorizontal: 24, minHeight: 56 }
        : { paddingVertical: 14, paddingHorizontal: 20, minHeight: 50 };

  const fontSize =
    size === "sm" ? TEXT_STYLES.labelMedium.fontSize : size === "lg" ? 17 : 15;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withSpring(0.96, SPRING.snappy);
  }, [isDisabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.snappy);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    haptics.selection();
    onPress();
  }, [isDisabled, haptics, onPress]);

  const glowStyle =
    glow && !isDisabled ? (SHADOWS.glow!(grad[1]) as any) : undefined;

  return (
    <Animated.View
      style={[
        animatedStyle,
        fullWidth ? { width: "100%" } : null,
        glowStyle,
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={({ pressed }) => [
          styles.pressable,
          {
            borderRadius: BORDER_RADIUS.lg,
            opacity: isDisabled ? 0.55 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            sizeStyle,
            { borderRadius: BORDER_RADIUS.lg },
          ]}
        >
          {loading ? (
            <View style={styles.row}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.text, { fontSize, marginLeft: SPACING.sm }]}>
                {title}
              </Text>
            </View>
          ) : (
            <View style={styles.row}>
              {icon && iconPosition === "left" && (
                <Ionicons
                  name={icon}
                  size={size === "lg" ? 22 : 18}
                  color="#fff"
                  style={{ marginRight: SPACING.sm }}
                />
              )}
              <Text style={[styles.text, { fontSize }]}>{title}</Text>
              {icon && iconPosition === "right" && (
                <Ionicons
                  name={icon}
                  size={size === "lg" ? 22 : 18}
                  color="#fff"
                  style={{ marginLeft: SPACING.sm }}
                />
              )}
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

function resolveGradient(variant: Variant, colors: any): [string, string] {
  switch (variant) {
    case "success":
      return [colors.gradientSuccessStart, colors.gradientSuccessEnd];
    case "error":
      return [colors.gradientErrorStart, colors.gradientErrorEnd];
    case "premium":
      return [colors.gradientPremiumStart, colors.gradientPremiumEnd];
    case "module":
    case "primary":
    default:
      return [colors.gradientPrimaryStart, colors.gradientPrimaryEnd];
  }
}

const styles = StyleSheet.create({
  pressable: {
    overflow: "hidden",
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
