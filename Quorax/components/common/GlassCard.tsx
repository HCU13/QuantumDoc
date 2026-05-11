import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

import { BORDER_RADIUS } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

type GlassCardProps = {
  children: React.ReactNode;
  intensity?: number;
  radius?: number;
  border?: boolean;
  style?: ViewStyle;
  /** Strong = daha az saydam (önemli kartlar için) */
  strong?: boolean;
};

/**
 * 2026: blur arka plan + ince border. iOS'ta gerçek BlurView,
 * Android'de saturated semi-transparent fallback (blur perf düşük).
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 30,
  radius = BORDER_RADIUS.lg,
  border = true,
  style,
  strong = false,
}) => {
  const { colors, isDark } = useTheme();

  const fill = strong ? colors.glassFillStrong : colors.glassFill;
  const borderColor = colors.glassBorder;

  const useBlur = Platform.OS === "ios";

  if (useBlur) {
    return (
      <View
        style={[
          styles.container,
          {
            borderRadius: radius,
            borderWidth: border ? StyleSheet.hairlineWidth : 0,
            borderColor,
          },
          style,
        ]}
      >
        <BlurView
          intensity={strong ? intensity + 20 : intensity}
          tint={isDark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius, backgroundColor: fill },
          ]}
        />
        <View style={{ borderRadius: radius, overflow: "hidden" }}>
          {children}
        </View>
      </View>
    );
  }

  /* Android fallback */
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: fill,
          borderRadius: radius,
          borderWidth: border ? StyleSheet.hairlineWidth : 0,
          borderColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
