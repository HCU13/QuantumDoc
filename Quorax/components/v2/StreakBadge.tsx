import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { ELEVATION_V2, RADIUS_V2, SPACING_V2 } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

import { HapticPressable } from "./HapticPressable";

export interface StreakBadgeProps {
  days: number;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StreakBadge({
  days,
  active = true,
  onPress,
  style,
}: StreakBadgeProps) {
  const { colors, isDark } = useTheme();
  const flame = active ? "#F59E0B" : colors.textTertiary;
  const bg = active
    ? isDark
      ? "#F59E0B22"
      : "#FEF3C7"
    : colors.card;

  return (
    <HapticPressable
      haptic="light"
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor: active ? `${flame}40` : colors.borderSubtle,
        },
        ELEVATION_V2.low,
        style,
      ]}
    >
      <View style={styles.row}>
        <Ionicons name="flame" size={20} color={flame} />
        <Text style={[styles.days, { color: colors.textPrimary }]}>{days}</Text>
      </View>
      <Text style={[styles.label, { color: colors.textTertiary }]}>
        {days === 1 ? "day streak" : "day streak"}
      </Text>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS_V2.md,
    padding: SPACING_V2.lg,
    borderWidth: 1,
    minHeight: 96,
    justifyContent: "space-between",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  days: { fontSize: 22, fontWeight: "700", letterSpacing: -0.4 },
  label: { fontSize: 11, fontWeight: "500", letterSpacing: 0.3 },
});

export default StreakBadge;
