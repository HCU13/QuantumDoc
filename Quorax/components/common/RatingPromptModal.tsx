import { Ionicons } from "@expo/vector-icons";
import * as StoreReview from "expo-store-review";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { BORDER_RADIUS, SHADOWS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase, TABLES } from "@/services/supabase";

type Step = "ask" | "feedback" | "thanks";

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const RatingPromptModal: React.FC<Props> = ({ visible, onDismiss }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("ask");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleYes = async () => {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
    }
    setStep("thanks");
    setTimeout(onDismiss, 1800);
  };

  const handleNo = () => {
    setStep("feedback");
  };

  const handleSendFeedback = async () => {
    if (!message.trim() || message.trim().length < 5) return;
    setLoading(true);
    try {
      await supabase.from(TABLES.SUPPORT_TICKETS).insert({
        user_id: user?.id ?? null,
        subject: "In-App Rating Feedback",
        message: message.trim(),
        category: "feedback",
        priority: "medium",
        status: "open",
        metadata: { source: "rating_prompt" },
      });
    } catch {}
    setLoading(false);
    setStep("thanks");
    setTimeout(onDismiss, 1800);
  };

  const reset = () => {
    setStep("ask");
    setMessage("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }, SHADOWS.large]}>

          {/* ── Teşekkür adımı ── */}
          {step === "thanks" && (
            <View style={styles.thanksBox}>
              <View style={[styles.thanksIcon, { backgroundColor: colors.success + "20" }]}>
                <Ionicons name="heart" size={32} color={colors.success} />
              </View>
              <Text style={[styles.thanksTitle, { color: colors.textPrimary }]}>
                {t("rating.thanksTitle")}
              </Text>
              <Text style={[styles.thanksSubtitle, { color: colors.textSecondary }]}>
                {t("rating.thanksSubtitle")}
              </Text>
            </View>
          )}

          {/* ── Soru adımı ── */}
          {step === "ask" && (
            <>
              {/* Gradient üst şerit */}
              <LinearGradient
                colors={["#8A4FFF", "#6932E0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.topBar}
              />

              <View style={styles.body}>
                {/* Emoji + başlık */}
                <Text style={styles.emoji}>🌟</Text>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  {t("rating.title")}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {t("rating.subtitle")}
                </Text>

                {/* Butonlar */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnNo, { borderColor: colors.borderSubtle, backgroundColor: colors.backgroundSecondary }]}
                    onPress={handleNo}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="thumbs-down-outline" size={18} color={colors.textSecondary} />
                    <Text style={[styles.btnText, { color: colors.textSecondary }]}>
                      {t("rating.no")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.btnYes]}
                    onPress={handleYes}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#8A4FFF", "#6932E0"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.btnGradient}
                    >
                      <Ionicons name="thumbs-up" size={18} color="#fff" />
                      <Text style={[styles.btnText, { color: "#fff" }]}>
                        {t("rating.yes")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleClose} style={styles.skipBtn}>
                  <Text style={[styles.skipText, { color: colors.textTertiary }]}>
                    {t("rating.skip")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Feedback adımı ── */}
          {step === "feedback" && (
            <View style={styles.body}>
              {/* Üst: geri + kapat */}
              <View style={styles.feedbackHeader}>
                <TouchableOpacity onPress={() => setStep("ask")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.title, { color: colors.textPrimary, marginTop: SPACING.xs }]}>
                {t("rating.feedbackTitle")}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t("rating.feedbackSubtitle")}
              </Text>

              {/* Promise banner */}
              <View style={[styles.promiseBanner, { backgroundColor: colors.primarySoft ?? colors.backgroundSecondary }]}>
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary ?? "#8A4FFF"} />
                <Text style={[styles.promiseText, { color: colors.textSecondary }]}>
                  {t("rating.feedbackPromise")}
                </Text>
              </View>

              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.borderSubtle,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder={t("rating.feedbackPlaceholder")}
                placeholderTextColor={colors.textTertiary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { opacity: message.trim().length >= 5 ? 1 : 0.4 },
                ]}
                onPress={handleSendFeedback}
                disabled={message.trim().length < 5 || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#8A4FFF", "#6932E0"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sendBtnGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send-outline" size={16} color="#fff" />
                      <Text style={styles.sendBtnText}>{t("rating.feedbackSend")}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
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
    padding: SPACING.lg,
    alignItems: "center",
    gap: SPACING.sm,
  },
  emoji: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  title: {
    ...TEXT_STYLES.titleMedium,
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },
  subtitle: {
    ...TEXT_STYLES.bodySmall,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    width: "100%",
  },
  btn: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  btnNo: {
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: SPACING.sm + 2,
  },
  btnYes: {},
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  skipBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  skipText: {
    fontSize: 12,
    textDecorationLine: "underline",
  },
  // Teşekkür
  thanksBox: {
    padding: SPACING.xl,
    alignItems: "center",
    gap: SPACING.md,
  },
  thanksIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  thanksTitle: {
    ...TEXT_STYLES.titleMedium,
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },
  thanksSubtitle: {
    ...TEXT_STYLES.bodySmall,
    textAlign: "center",
    lineHeight: 20,
  },
  // Feedback
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  promiseBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    width: "100%",
  },
  promiseText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  textInput: {
    width: "100%",
    minHeight: 100,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    fontSize: 14,
    lineHeight: 20,
  },
  sendBtn: {
    width: "100%",
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  sendBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: SPACING.md,
  },
  sendBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
