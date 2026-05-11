import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  BORDER_RADIUS,
  SHADOWS,
  SPACING,
  SPRING,
  TEXT_STYLES,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useHaptics } from "@/hooks/useHaptics";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: any;
  /** Modül primary rengi — primary variant'ta gradient end olarak kullanılır */
  modulePrimary?: string;
}

/**
 * 2026: Primary varyant artık gradient + glow + spring press.
 * API geriye dönük uyumlu — tüm mevcut kullanımlar otomatik güzelleşir.
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  modulePrimary,
}) => {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const isDisabled = disabled || loading;

  const sizeStyle =
    size === "small"
      ? { paddingVertical: 10, paddingHorizontal: 16, minHeight: 40, fontSize: 14 }
      : size === "large"
        ? { paddingVertical: 16, paddingHorizontal: 24, minHeight: 56, fontSize: 17 }
        : { paddingVertical: 14, paddingHorizontal: 20, minHeight: 50, fontSize: 15 };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withSpring(0.96, SPRING.snappy);
  }, [isDisabled, scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.snappy);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    haptics.selection();
    onPress();
  }, [isDisabled, haptics, onPress]);

  /* Gradient renkleri */
  const gradientStart = modulePrimary
    ? lighten(modulePrimary, 0.2)
    : colors.gradientPrimaryStart;
  const gradientEnd = modulePrimary ?? colors.gradientPrimaryEnd;

  /* Renkli glow */
  const glow = !isDisabled && variant === "primary"
    ? (SHADOWS.glow!(gradientEnd) as any)
    : undefined;

  const renderInner = (textColor: string) => (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        icon && iconPosition === "left" && (
          <Ionicons
            name={icon}
            size={size === "large" ? 22 : 18}
            color={textColor}
            style={{ marginRight: SPACING.sm - 2 }}
          />
        )
      )}
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: sizeStyle.fontSize,
            opacity: loading ? 0.85 : 1,
          },
        ]}
      >
        {title}
      </Text>
      {!loading && icon && iconPosition === "right" && (
        <Ionicons
          name={icon}
          size={size === "large" ? 22 : 18}
          color={textColor}
          style={{ marginLeft: SPACING.sm - 2 }}
        />
      )}
    </View>
  );

  if (variant === "primary") {
    return (
      <Animated.View
        style={[
          animatedStyle,
          fullWidth ? { width: "100%" } : null,
          glow,
          style,
        ]}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityState={{ disabled: isDisabled, busy: loading }}
          style={{ borderRadius: BORDER_RADIUS.lg, opacity: isDisabled ? 0.55 : 1 }}
        >
          <LinearGradient
            colors={[gradientStart, gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.base,
              {
                borderRadius: BORDER_RADIUS.lg,
                paddingVertical: sizeStyle.paddingVertical,
                paddingHorizontal: sizeStyle.paddingHorizontal,
                minHeight: sizeStyle.minHeight,
              },
            ]}
          >
            {renderInner(colors.textOnPrimary)}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  /* Secondary / outline / ghost — flat */
  const variantBg =
    variant === "secondary"
      ? colors.surface
      : variant === "ghost"
        ? "transparent"
        : "transparent";
  const variantBorder =
    variant === "secondary"
      ? colors.borderSubtle
      : variant === "outline"
        ? modulePrimary ?? colors.primary
        : "transparent";
  const variantText =
    variant === "secondary"
      ? colors.textPrimary
      : variant === "outline"
        ? modulePrimary ?? colors.primary
        : colors.textPrimary;

  return (
    <Animated.View
      style={[animatedStyle, fullWidth ? { width: "100%" } : null, style]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[
          styles.base,
          {
            backgroundColor: isDisabled ? colors.surfaceMuted : variantBg,
            borderColor: isDisabled ? colors.borderSubtle : variantBorder,
            borderWidth: variant === "outline" ? 1.5 : variant === "secondary" ? 1 : 0,
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            minHeight: sizeStyle.minHeight,
            borderRadius: BORDER_RADIUS.lg,
            opacity: isDisabled ? 0.55 : 1,
          },
        ]}
      >
        {renderInner(isDisabled ? colors.textTertiary : variantText)}
      </Pressable>
    </Animated.View>
  );
};

/* Hex'i biraz aydınlat (gradient start için) */
function lighten(hex: string, amount: number): string {
  const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return hex;
  const lift = (v: number) => Math.min(255, Math.round(v + (255 - v) * amount));
  const r = lift(parseInt(m[1], 16));
  const g = lift(parseInt(m[2], 16));
  const b = lift(parseInt(m[3], 16));
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    ...TEXT_STYLES.labelLarge,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
