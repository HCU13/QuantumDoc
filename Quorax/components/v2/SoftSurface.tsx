import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Defs, Line, Pattern, Rect } from "react-native-svg";

import { useTheme } from "@/contexts/ThemeContext";

type Tone = "neutral" | "warm" | "cool" | "module";

export interface SoftSurfaceProps {
  tone?: Tone;
  moduleColor?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const GRID_SIZE = 28;

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith("rgba") || color.startsWith("rgb")) return color;
  const m = color.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i);
  if (!m) return color;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
}

export function SoftSurface({
  tone = "neutral",
  moduleColor,
  style,
  children,
}: SoftSurfaceProps) {
  const { colors, isDark } = useTheme();

  const tint = tone === "module" && moduleColor ? moduleColor : colors.primary;
  const gridStroke = withAlpha(tint, isDark ? 0.07 : 0.06);

  // Light wash so each module feels distinct without screaming.
  const washTop =
    tone === "module" && moduleColor
      ? isDark
        ? `${moduleColor}1A`
        : `${moduleColor}12`
      : "transparent";
  const washBottom = "transparent";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      {/* Notebook grid — uses module tint so each page feels its own */}
      <Svg
        width={SCREEN_W}
        height={SCREEN_H}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <Pattern
            id="grid"
            width={GRID_SIZE}
            height={GRID_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <Line
              x1={0}
              y1={0}
              x2={GRID_SIZE}
              y2={0}
              stroke={gridStroke}
              strokeWidth={1}
            />
            <Line
              x1={0}
              y1={0}
              x2={0}
              y2={GRID_SIZE}
              stroke={gridStroke}
              strokeWidth={1}
            />
          </Pattern>
        </Defs>
        <Rect width={SCREEN_W} height={SCREEN_H} fill="url(#grid)" />
      </Svg>

      {/* Soft top wash to identify the module */}
      {tone === "module" && moduleColor ? (
        <LinearGradient
          colors={[washTop, washBottom] as any}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.45 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      ) : null}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});

export default SoftSurface;
