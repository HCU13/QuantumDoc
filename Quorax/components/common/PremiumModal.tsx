import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SPACING } from "@/constants/theme";
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

// The modal has two moods:
// - "limit"  — user hit their daily quota. Orange accent, urgency-flavored copy.
// - "pro"    — user tapped a Premium-only feature. Purple accent, benefit-flavored copy.
// In both cases the CTA just routes to the full paywall (subscription.tsx) — we never try to
// reproduce the subscription surface here; that screen owns pricing + trial + toggle.

export const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  onClose,
  moduleType,
  usageInfo,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();

  const sheetTranslate = useRef(new Animated.Value(400)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1, duration: 220, useNativeDriver: true,
        }),
        Animated.timing(sheetTranslate, {
          toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]).start();
    } else {
      sheetTranslate.setValue(400);
      overlayOpacity.setValue(0);
    }
  }, [visible]);

  const isLimitMode = !!usageInfo;
  const used = usageInfo?.used ?? 0;
  const limit = usageInfo?.limit ?? 0;

  const moduleNames = {
    chat: t("modules.chat.title"),
    math: t("modules.math.title"),
    exam_lab: t("modules.examLab.title"),
  };

  // Benefits shown inside the sheet — short, outcome-focused, same regardless of mode.
  const benefits = [
    { icon: "infinite-outline" as const, titleKey: "premiumModal.benefitUnlimited" },
    { icon: "checkmark-done-outline" as const, titleKey: "premiumModal.benefitVerify" },
    { icon: "bulb-outline" as const, titleKey: "premiumModal.benefitExplanations" },
    { icon: "ban-outline" as const, titleKey: "premiumModal.benefitNoAds" },
  ];

  const handleGoPaywall = () => {
    onClose();
    router.push("/(main)/profile/subscription");
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.card, transform: [{ translateY: sheetTranslate }] },
        ]}
      >
        {/* Drag handle + close */}
        <View style={[styles.handle, { backgroundColor: colors.borderSubtle }]} />
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.backgroundSecondary }]}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={16} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Mode-colored pill at the top — immediate emotional tone */}
        <View style={styles.pillRow}>
          <LinearGradient
            colors={isLimitMode ? ["#F59E0B", "#EF4444"] : ["#8B5CF6", "#6D28D9"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.pill}
          >
            <Ionicons
              name={isLimitMode ? "flame" : "sparkles"}
              size={12}
              color="#fff"
            />
            <Text style={styles.pillText}>
              {isLimitMode ? t("premiumModal.limitPill") : t("premiumModal.proPill")}
            </Text>
          </LinearGradient>
        </View>

        {/* Title + subtitle */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {isLimitMode
            ? t("premiumModal.limitTitle")
            : t("premiumModal.proTitle")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isLimitMode
            ? t("premiumModal.limitSubtitle", { module: moduleNames[moduleType], used, limit })
            : t("premiumModal.proSubtitle")}
        </Text>

        {/* Benefit list — compact, breathable */}
        <View style={[styles.benefitBox, { backgroundColor: colors.backgroundSecondary }]}>
          {benefits.map((b) => (
            <View key={b.titleKey} style={styles.benefitRow}>
              <View style={[styles.benefitIconBox, { backgroundColor: "rgba(139,92,246,0.12)" }]}>
                <Ionicons name={b.icon} size={15} color="#8B5CF6" />
              </View>
              <Text style={[styles.benefitText, { color: colors.textPrimary }]}>
                {t(b.titleKey)}
              </Text>
            </View>
          ))}
        </View>

        {/* Trial hint — keeps the modal honest with whatever the paywall will offer.
            We don't know for sure whether trial is available here (that check lives in RC data),
            so we use soft copy: "Try Premium" not "Start Free Trial". Paywall confirms trial. */}
        <View style={styles.trialHint}>
          <Ionicons name="gift-outline" size={13} color="#8B5CF6" />
          <Text style={[styles.trialHintText, { color: colors.textSecondary }]}>
            {t("premiumModal.trialHint")}
          </Text>
        </View>

        {/* CTA — purely navigational. No price here; paywall owns pricing. */}
        <TouchableOpacity onPress={handleGoPaywall} activeOpacity={0.88} style={styles.ctaWrap}>
          <LinearGradient
            colors={["#7C3AED", "#6D28D9"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>{t("premiumModal.cta")}</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} activeOpacity={0.6} style={styles.laterBtn}>
          <Text style={[styles.laterText, { color: colors.textTertiary }]}>
            {t("premiumModal.later")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.lg + 2,
    paddingTop: 10,
    paddingBottom: 36,
    gap: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  closeBtn: {
    position: "absolute",
    top: 18,
    right: SPACING.lg,
    width: 30, height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  pillRow: { flexDirection: "row" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  pillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },

  benefitBox: {
    borderRadius: 16,
    paddingVertical: 6,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  benefitIconBox: {
    width: 30, height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },

  trialHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
  },
  trialHintText: {
    fontSize: 12.5,
    fontWeight: "600",
  },

  ctaWrap: {
    borderRadius: 16,
    overflow: "hidden",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  laterBtn: {
    alignItems: "center",
    paddingVertical: 4,
    marginTop: -4,
  },
  laterText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
