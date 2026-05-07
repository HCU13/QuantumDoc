import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BORDER_RADIUS, SHADOWS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

const FEATURES = [
  { icon: "camera-outline", colorKey: "math" },
  { icon: "document-text-outline", colorKey: "exam" },
  { icon: "chatbubble-ellipses-outline", colorKey: "chat" },
];

const FEATURE_COLORS: Record<string, { primary: string; light: string }> = {
  math: { primary: "#10B981", light: "#ECFDF5" },
  exam: { primary: "#F59E0B", light: "#FFF4E6" },
  chat: { primary: "#8B5CF6", light: "#F3E8FF" },
};

export const WelcomeModal: React.FC<Props> = ({ visible, onDismiss }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      // Rocket bounce loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconBounce, {
            toValue: -8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(iconBounce, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(40);
      scaleAnim.setValue(0.85);
      iconBounce.setValue(0);
    }
  }, [visible]);

  const handleSupportPress = () => {
    onDismiss();
    setTimeout(() => {
      router.push("/(main)/profile/help");
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            SHADOWS.large,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Gradient üst şerit */}
          <LinearGradient
            colors={["#8B5CF6", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topBar}
          />

          <View style={styles.body}>
            {/* Roket ikonu - zıplıyor */}
            <Animated.Text
              style={[styles.rocketEmoji, { transform: [{ translateY: iconBounce }] }]}
            >
              🚀
            </Animated.Text>

            {/* Başlık */}
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t("welcome.title")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t("welcome.subtitle")}
            </Text>

            {/* Feature ikonları */}
            <View style={styles.featuresRow}>
              {FEATURES.map((f, i) => {
                const fc = FEATURE_COLORS[f.colorKey];
                return (
                  <View
                    key={i}
                    style={[
                      styles.featureIcon,
                      { backgroundColor: isDark ? fc.primary + "30" : fc.light },
                    ]}
                  >
                    <Ionicons name={f.icon as any} size={22} color={fc.primary} />
                  </View>
                );
              })}
            </View>

            {/* Early access banner */}
            <View
              style={[
                styles.banner,
                { backgroundColor: isDark ? "#8B5CF620" : "#F3E8FF" },
              ]}
            >
              <Ionicons name="construct-outline" size={15} color="#8B5CF6" />
              <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
                {t("welcome.earlyAccess")}
              </Text>
            </View>

            {/* Destek satırı */}
            <View style={styles.supportRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color={colors.textTertiary}
              />
              <Text style={[styles.supportText, { color: colors.textTertiary }]}>
                {t("welcome.bugFoundPrefix")}
              </Text>
              <TouchableOpacity onPress={handleSupportPress} activeOpacity={0.7}>
                <Text style={[styles.supportLink, { color: "#8B5CF6" }]}>
                  {t("welcome.bugFoundLink")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CTA butonu */}
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={onDismiss}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#8B5CF6", "#6366F1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>{t("welcome.cta")}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  card: {
    width: "100%",
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
  },
  topBar: {
    height: 5,
  },
  body: {
    padding: SPACING.xl,
    alignItems: "center",
    gap: SPACING.md,
  },
  rocketEmoji: {
    fontSize: 52,
    marginBottom: SPACING.xs,
  },
  title: {
    ...TEXT_STYLES.titleMedium,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    ...TEXT_STYLES.bodySmall,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: SPACING.xs,
  },
  featuresRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginVertical: SPACING.xs,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    width: "100%",
  },
  bannerText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  supportText: {
    fontSize: 12,
  },
  supportLink: {
    fontSize: 12,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  ctaBtn: {
    width: "100%",
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    marginTop: SPACING.xs,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: SPACING.md + 2,
  },
  ctaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
