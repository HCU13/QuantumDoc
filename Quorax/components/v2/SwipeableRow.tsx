import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";

import { RADIUS_V2, SPACING_V2 } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useHaptics } from "@/hooks/useHaptics";

import { HapticPressable } from "./HapticPressable";

export interface SwipeAction {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  color: string;
  onPress: () => void;
}

export interface SwipeableRowProps {
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function SwipeableRow({
  leftAction,
  rightAction,
  onPress,
  onLongPress,
  style,
  children,
}: SwipeableRowProps) {
  const { colors } = useTheme();
  const h = useHaptics();
  const ref = useRef<Swipeable>(null);

  const renderAction = (action: SwipeAction, side: "left" | "right") => () => (
    <RectButton
      style={[
        styles.action,
        {
          backgroundColor: action.color,
          marginLeft: side === "left" ? 0 : SPACING_V2.sm,
          marginRight: side === "right" ? 0 : SPACING_V2.sm,
        },
      ]}
      onPress={() => {
        h.success();
        action.onPress();
        ref.current?.close();
      }}
    >
      <Ionicons name={action.icon} size={20} color="#fff" />
      {action.label ? <Text style={styles.actionLabel}>{action.label}</Text> : null}
    </RectButton>
  );

  return (
    <Swipeable
      ref={ref}
      renderLeftActions={leftAction ? renderAction(leftAction, "left") : undefined}
      renderRightActions={rightAction ? renderAction(rightAction, "right") : undefined}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableWillOpen={() => h.impactLight()}
    >
      <HapticPressable
        haptic="light"
        onPress={onPress}
        onLongPress={onLongPress}
        longPressHaptic="medium"
        style={[
          styles.row,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderSubtle,
          },
          style,
        ]}
      >
        {children}
      </HapticPressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: RADIUS_V2.md,
    borderWidth: 1,
    padding: SPACING_V2.md,
  },
  action: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS_V2.md,
    gap: 4,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});

export default SwipeableRow;
