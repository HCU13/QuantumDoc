import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SPACING_V2 } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

import { HapticPressable } from "./HapticPressable";

export interface MinimalHeaderProps {
  title?: string;
  subtitle?: string;
  accent?: string;
  onBack?: () => void;
  hideBack?: boolean;
  rightSlot?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function MinimalHeader({
  title,
  subtitle,
  accent,
  onBack,
  hideBack,
  rightSlot,
  style,
}: MinimalHeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Safe-area top + a little breathing room so the header isn't cramped
  // against the status bar on devices with smaller insets.
  const paddingTop = insets.top + SPACING_V2.md;

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
  };

  const tint = accent ?? colors.textPrimary;

  return (
    <View style={[styles.root, { paddingTop }, style]}>
      {!hideBack ? (
        <HapticPressable
          haptic="light"
          onPress={handleBack}
          style={[
            styles.iconBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderSubtle,
            },
          ]}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </HapticPressable>
      ) : (
        <View style={styles.iconSpacer} />
      )}

      <View style={styles.titleWrap} pointerEvents="none">
        {title ? (
          <Text
            numberOfLines={1}
            style={[styles.title, { color: tint }]}
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[styles.sub, { color: colors.textTertiary }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>{rightSlot ?? <View style={styles.iconSpacer} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    // paddingTop is applied dynamically from safe-area insets.
    paddingHorizontal: SPACING_V2.lg,
    paddingBottom: SPACING_V2.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING_V2.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconSpacer: {
    width: 36,
    height: 36,
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  right: {
    minWidth: 36,
    alignItems: "flex-end",
  },
});

export default MinimalHeader;
