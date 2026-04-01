import { useRouter } from "expo-router";
import React from "react";
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
  const router = useRouter();
  const primary = modulePrimary || colors.primary;
  const exhausted = used >= limit;

  const handlePress = () => {
    if (exhausted && allowTapWhenExhausted) {
      router.push("/(main)/profile/subscription");
    }
  };

  const content = (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: primary + "18",
          borderColor: exhausted ? (colors.error + "40") : primary + "30",
        },
      ]}
    >
      <Text
        style={[styles.text, { color: exhausted ? colors.error : colors.textSecondary }]}
        numberOfLines={1}
      >
        {used}/{limit}
      </Text>
    </View>
  );

  if (exhausted && allowTapWhenExhausted) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} accessibilityLabel="Kullanım hakkı doldu, aboneliğe git">
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
  },
});
