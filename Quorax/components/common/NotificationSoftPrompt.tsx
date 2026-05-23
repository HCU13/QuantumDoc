import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { BORDER_RADIUS, SPACING } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface NotificationSoftPromptProps {
  visible: boolean;
  onAllow: () => void;
  onSkip: () => void;
}

/**
 * Bildirim izninden ÖNCE gösterilen yumuşak uyarı. Industry data: pre-prompt
 * accept rate'i %30 -> %60'a çıkarır. Çünkü iOS'un tek-shot prompt'unu sadece
 * gerçekten ilgilenen kullanıcılara harcarız.
 *
 * Tipik yerleşim: ilk paywall görüldükten sonra (1-2 saniye gecikmeli) veya
 * kullanıcı ilk solve'u başarıyla tamamladıktan sonra.
 */
export const NotificationSoftPrompt: React.FC<NotificationSoftPromptProps> = ({
  visible,
  onAllow,
  onSkip,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary + "1A" }]}>
            <Ionicons name="notifications" size={28} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t("notifications.softPrompt.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("notifications.softPrompt.body")}
          </Text>

          <Pressable onPress={onAllow} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.primaryText}>{t("notifications.softPrompt.enable")}</Text>
          </Pressable>

          <Pressable onPress={onSkip} style={styles.skipBtn} hitSlop={6}>
            <Text style={[styles.skipText, { color: colors.textTertiary }]}>{t("notifications.softPrompt.notNow")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  primaryBtn: {
    alignSelf: "stretch",
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  primaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  skipBtn: {
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
