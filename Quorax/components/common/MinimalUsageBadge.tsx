import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { SPACING } from "@/constants/theme";

interface MinimalUsageBadgeProps {
  used: number;
  limit: number;
  modulePrimary?: string;
  /** Limit dolduğunda tıklanınca abonelik sayfasına gider */
  allowTapWhenExhausted?: boolean;
}

export const MinimalUsageBadge: React.FC<MinimalUsageBadgeProps> = ({
  used,
  limit,
  modulePrimary,
  allowTapWhenExhausted = true,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const primary = modulePrimary || colors.primary;
  const remaining = Math.max(0, limit - used);
  const exhausted = remaining === 0;
  const urgent = remaining === 1; // son solve — kırmızı uyarı

  const handlePress = () => {
    if (exhausted && allowTapWhenExhausted) {
      router.push("/(main)/profile/subscription");
    }
  };

  const accent = exhausted ? colors.error : urgent ? colors.error : primary;
  const labelColor = exhausted ? colors.error : urgent ? colors.error : colors.textSecondary;
  const bg = exhausted ? colors.error + "14" : urgent ? colors.error + "12" : primary + "18";
  const border = exhausted ? colors.error + "55" : urgent ? colors.error + "45" : primary + "30";

  // Anchor text: "2 free" (full), "1 left" (urgent), "0" (exhausted)
  const label =
    exhausted ? "0"
    : urgent ? `${remaining} left`
    : `${remaining} free`;

  const content = (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
      ]}
    >
      <Text
        style={[styles.text, { color: labelColor }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );

  if (exhausted && allowTapWhenExhausted) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} accessibilityLabel={t("modules.dailyLimitReached")}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
