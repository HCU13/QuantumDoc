import React, { useEffect } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { RADIUS_V2, SPACING_V2 } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

export interface InlineSkeletonProps {
  lines?: number;
  height?: number;
  width?: number | string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function InlineSkeleton({
  lines = 1,
  height = 14,
  width,
  radius = 6,
  style,
}: InlineSkeletonProps) {
  const { colors, isDark } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const bar = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return (
    <View style={[styles.wrap, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            {
              height,
              borderRadius: radius,
              backgroundColor: bar,
              width: (width as any) ?? (i === lines - 1 && lines > 1 ? "70%" : "100%"),
            },
            animStyle,
          ]}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.borderSubtle },
        style,
      ]}
    >
      <InlineSkeleton height={20} width="50%" />
      <InlineSkeleton lines={2} height={12} style={{ marginTop: SPACING_V2.md }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  card: {
    borderRadius: RADIUS_V2.md,
    borderWidth: 1,
    padding: SPACING_V2.lg,
  },
});

export default InlineSkeleton;
