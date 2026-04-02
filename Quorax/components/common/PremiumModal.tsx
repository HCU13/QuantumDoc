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

import { BORDER_RADIUS, SPACING } from "@/constants/theme";
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

  const isLimitMode = !!usageInfo;
  const used = usageInfo?.used ?? 0;
  const limit = usageInfo?.limit ?? 0;
  const progress = limit > 0 ? Math.min(used / limit, 1) : 1;

  const features = isLimitMode ? [
    { emoji: "⚡", text: t("premium.features.unlimited") },
    { emoji: "🚀", text: t("premium.features.priority") },
    { emoji: "✨", text: t("premium.features.noAds") },
  ] : [
    { emoji: "📊", text: t("premium.features.topicAnalysis") },
    { emoji: "✅", text: t("premium.features.verify") },
    { emoji: "💡", text: t("premium.features.explanations") },
    { emoji: "⚡", text: t("premium.features.unlimited") },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.borderSubtle }]} />

        {/* Kapat */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={[styles.closeX, { color: colors.textTertiary }]}>✕</Text>
        </TouchableOpacity>

        {/* PRO badge + başlık */}
        <View style={styles.titleRow}>
          <View style={styles.proBadge}>
            <LinearGradient
              colors={isLimitMode ? ["#FF4E50", "#FC913A"] : ["#7C3AED", "#4C1D95"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.proBadgeGradient}
            >
              <Text style={styles.proBadgeText}>{isLimitMode ? "🔥" : "✦  PRO"}</Text>
            </LinearGradient>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {isLimitMode ? t("premium.limitReached") : t("premium.proFeature")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isLimitMode
              ? t("premium.usageToday", { module: moduleNames[moduleType], used, limit })
              : t("premium.proFeatureSubtitle")}
          </Text>
        </View>

        {/* Usage progress */}
        {isLimitMode && (
          <View style={[styles.progressBox, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                {moduleNames[moduleType]}
              </Text>
              <Text style={[styles.progressCount, { color: colors.textPrimary }]}>{used}/{limit}</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.borderSubtle }]}>
              <LinearGradient
                colors={["#FF4E50", "#FC913A"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
          </View>
        )}

        {/* Features */}
        <View style={[styles.featureBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderSubtle }]}>
          {features.map((f, i) => (
            <View
              key={i}
              style={[
                styles.featureRow,
                i < features.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle },
              ]}
            >
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={[styles.featureText, { color: colors.textPrimary }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.88} style={styles.ctaWrap}>
          <LinearGradient
            colors={["#6D28D9", "#8B5CF6"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>{t("premium.upgradeToPremium")}</Text>
            {premiumPriceString && (
              <View style={styles.ctaBadge}>
                <Text style={styles.ctaBadgeText}>{premiumPriceString}/ay</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} activeOpacity={0.6} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.textTertiary }]}>{t("common.cancel")}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingTop: 12,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: SPACING.lg,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: SPACING.lg,
  },
  closeX: {
    fontSize: 16,
  },
  titleRow: {
    marginBottom: SPACING.lg,
    gap: 6,
  },
  proBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  proBadgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  proBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressBox: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 13,
  },
  progressCount: {
    fontSize: 13,
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
  featureBox: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: SPACING.lg,
    overflow: "hidden",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: SPACING.md,
  },
  featureEmoji: {
    fontSize: 19,
    width: 26,
    textAlign: "center",
  },
  featureText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  ctaWrap: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: SPACING.sm,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  ctaBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ctaBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
