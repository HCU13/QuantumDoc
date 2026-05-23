import React, { useCallback } from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { MOTION_V2 } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";

type HapticIntensity =
  | "none"
  | "light"
  | "medium"
  | "heavy"
  | "selection"
  | "success"
  | "warning"
  | "error";

export interface HapticPressableProps extends Omit<PressableProps, "style"> {
  haptic?: HapticIntensity;
  longPressHaptic?: HapticIntensity;
  pressScale?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HapticPressable({
  haptic = "light",
  longPressHaptic = "medium",
  pressScale = 0.97,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  style,
  children,
  disabled,
  ...rest
}: HapticPressableProps) {
  const scale = useSharedValue(1);
  const h = useHaptics();

  const trigger = useCallback(
    (intensity: HapticIntensity) => {
      switch (intensity) {
        case "light":
          h.impactLight();
          break;
        case "medium":
          h.impactMedium();
          break;
        case "heavy":
          h.impactHeavy();
          break;
        case "selection":
          h.selection();
          break;
        case "success":
          h.success();
          break;
        case "warning":
          h.warning();
          break;
        case "error":
          h.error();
          break;
      }
    },
    [h],
  );

  const handlePressIn = useCallback(
    (e: any) => {
      scale.value = withSpring(pressScale, MOTION_V2.spring.snappy);
      onPressIn?.(e);
    },
    [scale, pressScale, onPressIn],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      scale.value = withSpring(1, MOTION_V2.spring.snappy);
      onPressOut?.(e);
    },
    [scale, onPressOut],
  );

  const handlePress = useCallback(
    (e: any) => {
      if (disabled) return;
      if (haptic !== "none") trigger(haptic);
      onPress?.(e);
    },
    [disabled, haptic, trigger, onPress],
  );

  const handleLongPress = useCallback(
    (e: any) => {
      if (disabled) return;
      if (longPressHaptic !== "none") trigger(longPressHaptic);
      onLongPress?.(e);
    },
    [disabled, longPressHaptic, trigger, onLongPress],
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : withTiming(1, { duration: MOTION_V2.duration.fast }),
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      style={[animStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

export default HapticPressable;
