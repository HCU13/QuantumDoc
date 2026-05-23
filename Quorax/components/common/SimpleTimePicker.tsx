import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { BORDER_RADIUS, SPACING } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  visible: boolean;
  initialHour: number;
  initialMinute: number;
  onCancel: () => void;
  onConfirm: (hour: number, minute: number) => void;
}

export const SimpleTimePicker: React.FC<Props> = ({
  visible,
  initialHour,
  initialMinute,
  onCancel,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  React.useEffect(() => {
    if (visible) {
      setHour(initialHour);
      setMinute(initialMinute);
    }
  }, [visible, initialHour, initialMinute]);

  const adjHour = (delta: number) => setHour((h) => (h + delta + 24) % 24);
  const adjMin = (delta: number) => setMinute((m) => (m + delta + 60) % 60);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t("notifications.reminder.timeLabel")}
          </Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Pressable onPress={() => adjHour(1)} style={[styles.arrowBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="chevron-up" size={22} color={colors.primary} />
              </Pressable>
              <View style={[styles.numberBox, { backgroundColor: colors.background, borderColor: colors.borderSubtle }]}>
                <Text style={[styles.number, { color: colors.textPrimary }]}>{String(hour).padStart(2, "0")}</Text>
              </View>
              <Pressable onPress={() => adjHour(-1)} style={[styles.arrowBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="chevron-down" size={22} color={colors.primary} />
              </Pressable>
            </View>

            <Text style={[styles.colon, { color: colors.textPrimary }]}>:</Text>

            <View style={styles.col}>
              <Pressable onPress={() => adjMin(5)} style={[styles.arrowBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="chevron-up" size={22} color={colors.primary} />
              </Pressable>
              <View style={[styles.numberBox, { backgroundColor: colors.background, borderColor: colors.borderSubtle }]}>
                <Text style={[styles.number, { color: colors.textPrimary }]}>{String(minute).padStart(2, "0")}</Text>
              </View>
              <Pressable onPress={() => adjMin(-5)} style={[styles.arrowBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="chevron-down" size={22} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.cancelBtn, { borderColor: colors.borderSubtle }]}>
              <Text style={[styles.cancelText, { color: colors.textPrimary }]}>{t("common.cancel")}</Text>
            </Pressable>
            <Pressable onPress={() => onConfirm(hour, minute)} style={[styles.confirmBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.confirmText}>{t("common.ok")}</Text>
            </Pressable>
          </View>
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
    maxWidth: 320,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  col: {
    alignItems: "center",
    gap: SPACING.xs,
  },
  arrowBtn: {
    width: 44,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  numberBox: {
    width: 70,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontSize: 26,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  colon: {
    fontSize: 28,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
