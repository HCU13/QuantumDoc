import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/contexts/ThemeContext";
import { BORDER_RADIUS } from "@/constants/theme";

type SkeletonProps = {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
  /** Disable shimmer (e.g. reduced motion) */
  shimmer?: boolean;
};

/**
 * 2026 standardında shimmer'lı iskelet bloğu.
 * Tüm "ActivityIndicator" loading state'leri bunun yerine kullanılacak.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 14,
  radius = BORDER_RADIUS.sm,
  style,
  shimmer = true,
}) => {
  const { colors, isDark } = useTheme();
  const shift = useSharedValue(-1);

  useEffect(() => {
    if (!shimmer) return;
    shift.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
    return () => cancelAnimation(shift);
  }, [shimmer, shift]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shift.value * 220 }],
  }));

  const baseColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const highlightColor = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)";

  return (
    <View
      style={[
        styles.base,
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    >
      {shimmer && (
        <Animated.View style={[styles.shimmer, animatedStyle]} pointerEvents="none">
          <LinearGradient
            colors={["transparent", highlightColor, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
};

/* Yardımcı: çoklu satır metin iskeleti */
export const SkeletonText: React.FC<{
  lines?: number;
  lastLineWidth?: string;
  spacing?: number;
}> = ({ lines = 3, lastLineWidth = "60%", spacing = 8 }) => (
  <View>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={12}
        width={i === lines - 1 ? lastLineWidth : "100%"}
        style={{ marginBottom: i === lines - 1 ? 0 : spacing }}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "60%",
  },
});
