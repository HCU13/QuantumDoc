import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleProp, StyleSheet, ViewStyle } from "react-native";

import { ELEVATION_V2, SPACING_V2 } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

import { HapticPressable } from "./HapticPressable";

export interface MiniFABProps {
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function MiniFAB({
  icon = "add",
  color,
  onPress,
  onLongPress,
  style,
}: MiniFABProps) {
  const { colors } = useTheme();
  const bg = color ?? colors.primary;

  return (
    <HapticPressable
      haptic="medium"
      longPressHaptic="heavy"
      onPress={onPress}
      onLongPress={onLongPress}
      pressScale={0.92}
      style={[
        styles.fab,
        { backgroundColor: bg, shadowColor: bg },
        ELEVATION_V2.high,
        style,
      ]}
    >
      <Ionicons name={icon} size={22} color="#fff" />
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: SPACING_V2.xl,
    bottom: Platform.OS === "ios" ? SPACING_V2.xxl : SPACING_V2.xl,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});

export default MiniFAB;
