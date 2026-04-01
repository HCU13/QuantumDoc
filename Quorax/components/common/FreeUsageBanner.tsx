import { BORDER_RADIUS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type FreeUsageBannerModule = "chat" | "math" | "exam_lab";

interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  allowed: boolean;
}

interface FreeUsageBannerProps {
  moduleType: FreeUsageBannerModule;
  usageInfo: UsageInfo | null;
}

export const FreeUsageBanner: React.FC<FreeUsageBannerProps> = ({
  moduleType,
  usageInfo,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  if (!usageInfo) return null;

  const { used, limit, remaining, allowed } = usageInfo;
  const isExhausted = !allowed || remaining <= 0;

  const handleUpgradePress = () => {
    router.push("/(main)/profile/subscription");
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={isExhausted ? handleUpgradePress : undefined}
      style={[
        styles.banner,
        {
          backgroundColor: isExhausted
            ? colors.error + "18"
            : colors.primary + "15",
          borderColor: isExhausted
            ? colors.error + "40"
            : colors.primary + "30",
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        isExhausted
          ? t("premium.freeUsageBanner.limitReachedCta")
          : t("premium.freeUsageBanner.infoCta")
      }
    >
      <View style={styles.content}>
        <Ionicons
          name={isExhausted ? "lock-closed" : "information-circle"}
          size={20}
          color={isExhausted ? colors.error : colors.primary}
        />
        <View style={styles.textWrap}>
          <Text
            style={[
              styles.message,
              {
                color: isExhausted ? colors.error : colors.textPrimary,
              },
            ]}
          >
            {isExhausted
              ? t("premium.freeUsageBanner.limitReached", {
                  used,
                  limit,
                })
              : t("premium.freeUsageBanner.remaining", {
                  remaining,
                  limit,
                })}
          </Text>
          <Text
            style={[styles.subtext, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {isExhausted
              ? t("premium.freeUsageBanner.upgradeCta")
              : t("premium.freeUsageBanner.premiumHint")}
          </Text>
        </View>
        {isExhausted && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textTertiary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: 3,
    marginBottom: SPACING.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  textWrap: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  message: {
    ...TEXT_STYLES.bodyMedium,
    fontWeight: "600",
    fontSize: 14,
  },
  subtext: {
    ...TEXT_STYLES.bodySmall,
    fontSize: 12,
    marginTop: 2,
  },
});
