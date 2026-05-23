import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { SPACING_V2 } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

import { HapticPressable } from "./HapticPressable";
import { UserInitials } from "@/components/common/UserInitials";

export interface QuietHeaderProps {
  greeting: string;
  name?: string;
  subtitle?: string;
  isPremium?: boolean;
  onAvatarPress?: () => void;
}

export function QuietHeader({
  greeting,
  name,
  subtitle,
  isPremium,
  onAvatarPress,
}: QuietHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <View style={styles.textCol}>
        <Text
          numberOfLines={1}
          style={[styles.greeting, { color: colors.textPrimary }]}
        >
          {greeting}
          {name ? (
            <Text style={[styles.name, { color: colors.textPrimary }]}>
              {" "}
              {name}
            </Text>
          ) : null}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[styles.sub, { color: colors.textTertiary }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <HapticPressable haptic="light" onPress={onAvatarPress}>
        <UserInitials
          name={name ?? ""}
          size={40}
          isPremium={!!isPremium}
        />
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: Platform.OS === "ios" ? 56 : 24,
    paddingHorizontal: SPACING_V2.xl,
    paddingBottom: SPACING_V2.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING_V2.md,
  },
  textCol: { flex: 1 },
  greeting: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  name: { fontWeight: "700" },
  sub: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: 0.2,
  },
});

export default QuietHeader;
