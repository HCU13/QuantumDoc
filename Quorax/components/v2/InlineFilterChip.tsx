import React from "react";
import { ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { RADIUS_V2, SPACING_V2 } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

import { HapticPressable } from "./HapticPressable";

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

export interface InlineFilterChipProps<T extends string = string> {
  options: FilterOption<T>[];
  selected: T;
  accent?: string;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function InlineFilterChip<T extends string = string>({
  options,
  selected,
  accent,
  onChange,
  style,
}: InlineFilterChipProps<T>) {
  const { colors, isDark } = useTheme();
  const tint = accent ?? colors.primary;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={[styles.row, style]}
    >
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <HapticPressable
            key={opt.value}
            haptic="selection"
            onPress={() => onChange(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: active
                  ? tint
                  : isDark
                  ? colors.surfaceMuted ?? colors.card
                  : colors.card,
                borderColor: active ? tint : colors.borderSubtle,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? "#fff" : colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
            {opt.count != null ? (
              <View
                style={[
                  styles.countBubble,
                  {
                    backgroundColor: active
                      ? "rgba(255,255,255,0.25)"
                      : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: active ? "#fff" : colors.textTertiary },
                  ]}
                >
                  {opt.count}
                </Text>
              </View>
            ) : null}
          </HapticPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING_V2.sm,
    paddingHorizontal: SPACING_V2.lg,
    paddingVertical: SPACING_V2.xs,
  },
  chip: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING_V2.md,
    paddingVertical: 8,
    borderRadius: RADIUS_V2.pill,
    borderWidth: 1,
  },
  label: { fontSize: 13, fontWeight: "600", letterSpacing: -0.1 },
  countBubble: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { fontSize: 10, fontWeight: "700" },
});

export default InlineFilterChip;
