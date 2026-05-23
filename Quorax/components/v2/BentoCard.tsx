import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import {
  ELEVATION_V2,
  RADIUS_V2,
  SPACING_V2,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

import { HapticPressable } from "./HapticPressable";

export type BentoSize = "sm" | "md" | "lg";

export interface BentoCardProps {
  size?: BentoSize;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
  value?: string | number;
  badge?: string;
  locked?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const HEIGHT_MAP: Record<BentoSize, number> = {
  sm: 148,
  md: 158,
  lg: 180,
};

export function BentoCard({
  size = "md",
  title,
  subtitle,
  icon,
  accent,
  value,
  badge,
  locked,
  onPress,
  onLongPress,
  style,
}: BentoCardProps) {
  const { colors, isDark } = useTheme();
  const tint = accent ?? colors.primary;

  const bgStart = isDark ? `${tint}33` : `${tint}1F`;
  const bgEnd = isDark ? `${tint}14` : `${tint}08`;

  return (
    <HapticPressable
      haptic="light"
      longPressHaptic="medium"
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        {
          minHeight: HEIGHT_MAP[size],
          backgroundColor: colors.card,
          borderColor: `${tint}33`,
        },
        ELEVATION_V2.low,
        style,
      ]}
    >
      <LinearGradient
        colors={[bgStart, bgEnd] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.top}>
        {icon ? (
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: tint,
                shadowColor: tint,
              },
            ]}
          >
            <Ionicons name={icon} size={22} color="#FFFFFF" />
          </View>
        ) : (
          <View />
        )}

        {locked ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.surfaceMuted ?? colors.borderSubtle },
            ]}
          >
            <Ionicons name="lock-closed" size={11} color={colors.textTertiary} />
          </View>
        ) : badge ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark ? `${tint}33` : "#FFFFFF",
                borderColor: `${tint}40`,
                borderWidth: 1,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: tint }]}>{badge}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.textPrimary }]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={2}
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        ) : null}
        {value != null ? (
          <Text style={[styles.value, { color: tint }]}>{value}</Text>
        ) : null}
      </View>

      <View style={styles.arrowWrap}>
        <Ionicons
          name="arrow-forward"
          size={14}
          color={tint}
        />
      </View>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS_V2.lg,
    padding: SPACING_V2.lg,
    borderWidth: 1,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: RADIUS_V2.sm,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS_V2.pill,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  bottom: {
    marginTop: SPACING_V2.md,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    marginTop: 4,
    opacity: 0.85,
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginTop: 6,
  },
  arrowWrap: {
    position: "absolute",
    bottom: SPACING_V2.md,
    right: SPACING_V2.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BentoCard;
