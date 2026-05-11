import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  Line,
  Pattern,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  children?: React.ReactNode;
  /** Decorative formula glyphs in the corners. Defaults to ["∫", "π"]. */
  cornerGlyphs?: [string, string];
  /** Vertical red rule on the left, like a school notebook. Default: false. */
  showMarginRule?: boolean;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const GRID_SIZE = 28;

/**
 * Notebook-paper themed backdrop:
 *  - faint primary-tinted grid (kareli defter)
 *  - oversized faded math glyphs in opposite corners
 *  - top-left red "margin" line — the classroom signature
 */
export const NotebookBackground: React.FC<Props> = ({
  children,
  cornerGlyphs = ["∫", "π"],
  showMarginRule = false,
}) => {
  const { colors, isDark } = useTheme();

  // Grid and decorations stay extremely subtle so text remains the hero.
  const gridStroke = withAlpha(colors.primary, isDark ? 0.08 : 0.07);
  const glyphFill = withAlpha(colors.primary, isDark ? 0.07 : 0.06);
  const marginRule = withAlpha("#E11D48", isDark ? 0.25 : 0.35);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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

        {/* The grid itself */}
        <Rect width={SCREEN_W} height={SCREEN_H} fill="url(#grid)" />

        {/* Vertical red margin rule — opt-in only */}
        {showMarginRule && (
          <Line
            x1={56}
            y1={0}
            x2={56}
            y2={SCREEN_H}
            stroke={marginRule}
            strokeWidth={1}
          />
        )}

        {/* Top-right glyph */}
        <SvgText
          x={SCREEN_W - 40}
          y={130}
          fontSize={180}
          fontWeight="300"
          fill={glyphFill}
          textAnchor="end"
          fontFamily="serif"
        >
          {cornerGlyphs[0]}
        </SvgText>

        {/* Bottom-left glyph */}
        <SvgText
          x={28}
          y={SCREEN_H - 60}
          fontSize={150}
          fontWeight="300"
          fill={glyphFill}
          fontFamily="serif"
        >
          {cornerGlyphs[1]}
        </SvgText>
      </Svg>

      {children}
    </View>
  );
};

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith("rgba") || color.startsWith("rgb")) return color;
  const m = color.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i);
  if (!m) return color;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
