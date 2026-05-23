import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import {
  ELEVATION_V2,
  RADIUS_V2,
  SPACING_V2,
  TYPE_V2,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

import { HapticPressable } from "./HapticPressable";

export interface SuggestionCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
  progress?: number; // 0..1
  actionLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SuggestionCard({
  eyebrow = "Continue",
  title,
  subtitle,
  icon = "sparkles",
  accent,
  progress,
  actionLabel,
  onPress,
  style,
}: SuggestionCardProps) {
  const { colors, isDark } = useTheme();
  const tint = accent ?? colors.primary;
  const bgStart = isDark ? `${tint}26` : `${tint}14`;
  const bgEnd = isDark ? `${tint}10` : `${tint}06`;

  return (
    <HapticPressable
      haptic="light"
      onPress={onPress}
      style={[styles.card, ELEVATION_V2.medium, style]}
    >
      <LinearGradient
        colors={[bgStart, bgEnd] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.border, { borderColor: `${tint}30` }]} />

      <View style={styles.row}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: isDark ? `${tint}30` : `${tint}1F` },
          ]}
        >
          <Ionicons name={icon} size={22} color={tint} />
        </View>

        <View style={styles.textCol}>
          <Text style={[styles.eyebrow, { color: tint }]}>
            {eyebrow.toUpperCase()}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.textPrimary }]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[TYPE_V2.body, { color: colors.textSecondary, marginTop: 2 }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={[styles.cta, { backgroundColor: tint }]}>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </View>
      </View>

      {progress != null ? (
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: isDark ? `${tint}22` : `${tint}1A` },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                backgroundColor: tint,
              },
            ]}
          />
        </View>
      ) : null}

      {actionLabel ? (
        <Text style={[styles.actionLabel, { color: tint }]}>{actionLabel}</Text>
      ) : null}
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS_V2.lg,
    padding: SPACING_V2.lg,
    overflow: "hidden",
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS_V2.lg,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING_V2.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS_V2.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  cta: {
    width: 40,
    height: 40,
    borderRadius: RADIUS_V2.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: SPACING_V2.md,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: SPACING_V2.sm,
  },
});

export default SuggestionCard;
