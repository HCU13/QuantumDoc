import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BORDER_RADIUS, SHADOWS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  moduleType: "chat" | "math" | "exam_lab";
  usageInfo?: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  onClose,
  moduleType,
  usageInfo,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const { premiumPriceString } = useSubscription();

  const moduleNames = {
    chat: t("modules.chat.title"),
    math: t("modules.math.title"),
    exam_lab: t("modules.examLab.title"),
  };

  const handleUpgrade = () => {
    onClose();
    router.push("/(main)/profile/subscription");
  };

  const used = usageInfo?.used ?? 0;
  const limit = usageInfo?.limit ?? 0;
  const progress = limit > 0 ? Math.min(used / limit, 1) : 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={[styles.sheet, { backgroundColor: colors.card }, SHADOWS.small]}>
        {/* Handle bar */}
        <View style={[styles.handle, { backgroundColor: colors.borderSubtle }]} />

        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={["#F59E0B", "#EF4444"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBg}
          >
            <Ionicons name="flash" size={24} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t("premium.limitReached")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {moduleNames[moduleType]}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Usage bar */}
        {usageInfo && (
          <View style={[styles.usageBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderSubtle }]}>
            <View style={styles.usageRow}>
              <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>
                {t("premium.usageToday", {
                  module: moduleNames[moduleType],
                  used,
                  limit,
                })}
              </Text>
              <Text style={[styles.usageCount, { color: colors.textPrimary }]}>
                {used}/{limit}
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.borderSubtle }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%`, backgroundColor: "#EF4444" },
                ]}
              />
            </View>
          </View>
        )}

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: "infinite-outline", text: t("premium.features.unlimited") },
            { icon: "flash-outline", text: t("premium.features.priority") },
            { icon: "shield-checkmark-outline", text: t("premium.features.noAds") },
          ].map((f) => (
            <View key={f.icon} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name={f.icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.textPrimary }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Cancel anytime banner */}
        <View style={[styles.cancelAnytimeBanner, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
          <Text style={[styles.cancelAnytimeText, { color: colors.textSecondary }]}>
            {t("profile.premium.cancelAnytime")} · {t("profile.premium.noCommitment")}
          </Text>
        </View>

        {/* CTA Butonu */}
        <TouchableOpacity
          style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
          onPress={handleUpgrade}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#4F1DB8", "#7C3AED", "#A855F7"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.upgradeBtnGradient}
          >
            <Ionicons name="diamond" size={18} color="#FFD700" />
            <View>
              <Text style={styles.upgradeBtnText}>{t("premium.upgradeToPremium")}</Text>
              {premiumPriceString ? (
                <Text style={styles.upgradeBtnSub}>{premiumPriceString} / {t("profile.premium.perMonth")}</Text>
              ) : null}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.cancelBtn} activeOpacity={0.7}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            {t("common.cancel")}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 36,
    paddingTop: SPACING.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...TEXT_STYLES.titleSmall,
    fontWeight: "700",
  },
  subtitle: {
    ...TEXT_STYLES.bodySmall,
    marginTop: 2,
  },
  usageBox: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  usageLabel: {
    ...TEXT_STYLES.bodySmall,
    flex: 1,
  },
  usageCount: {
    ...TEXT_STYLES.labelMedium,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  features: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    ...TEXT_STYLES.bodyMedium,
  },
  upgradeBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  upgradeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: 15,
    paddingHorizontal: SPACING.lg,
  },
  upgradeBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  upgradeBtnSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },
  cancelAnytimeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    justifyContent: "center",
  },
  cancelAnytimeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  cancelText: {
    ...TEXT_STYLES.bodyMedium,
  },
});
