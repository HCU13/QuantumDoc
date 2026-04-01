import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { supabase, TABLES } from "@/services/supabase";
import {
  SPACING,
  BORDER_RADIUS,
  TEXT_STYLES,
  SHADOWS,
} from "@/constants/theme";

export default function FeedbackScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    rating: null as number | null,
    type: null as string | null,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const ratings = [
    { id: 5, label: t("profile.feedback.ratings.excellent"), icon: "star", color: "#22C55E" },
    { id: 4, label: t("profile.feedback.ratings.good"), icon: "star", color: "#3B82F6" },
    { id: 3, label: t("profile.feedback.ratings.average"), icon: "star", color: "#F59E0B" },
    { id: 2, label: t("profile.feedback.ratings.poor"), icon: "star", color: "#EF4444" },
    { id: 1, label: t("profile.feedback.ratings.veryPoor"), icon: "star", color: "#DC2626" },
  ];

  const feedbackTypes = [
    { id: "bug", label: t("profile.feedback.types.bug"), icon: "bug-outline" },
    { id: "suggestion", label: t("profile.feedback.types.suggestion"), icon: "bulb-outline" },
    { id: "improvement", label: t("profile.feedback.types.improvement"), icon: "trending-up-outline" },
    { id: "other", label: t("profile.feedback.types.other"), icon: "chatbubble-outline" },
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.subject.trim()) {
      newErrors.subject = t("profile.feedback.errors.subjectRequired");
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = t("profile.feedback.errors.subjectMinLength");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("profile.feedback.errors.messageRequired");
    } else if (formData.message.trim().length < 20) {
      newErrors.message = t("profile.feedback.errors.messageMinLength");
    }

    if (!formData.type) {
      newErrors.type = t("profile.feedback.errors.typeRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Eğer kullanıcı giriş yapmamışsa uyarı göster
    if (!isLoggedIn || !user) {
      Alert.alert(
        t("common.warning"),
        t("profile.feedback.errors.loginRequired"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("auth.login.button"),
            onPress: () => router.push("/(main)/login"),
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      // Support ticket oluştur
      const { data, error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .insert({
          user_id: user.id,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          category: formData.type || "general",
          priority: "medium",
          status: "open",
          metadata: {
            rating: formData.rating,
            feedback_type: formData.type,
          },
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      Alert.alert(
        t("common.success"),
        t("profile.feedback.success.message"),
        [
          {
            text: t("common.ok"),
            onPress: () => {
              // Formu temizle
              setFormData({
                subject: "",
                message: "",
                rating: null,
                type: null,
              });
              setErrors({});
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      Alert.alert(
        t("common.error"),
        error.message || t("profile.feedback.errors.sendError")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ModuleHeader title={t("profile.feedback.title")} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Promise Card */}
          <View style={[styles.promiseCard, { backgroundColor: colors.primarySoft, borderColor: colors.primary + "30" }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.promiseTitle, { color: colors.textPrimary }]}>
                {t("profile.feedback.promiseTitle")}
              </Text>
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                {t("profile.feedback.promiseText")}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              {t("profile.feedback.rating")}
            </Text>
            <View style={styles.ratingContainer}>
              {ratings.map((rating) => (
                <TouchableOpacity
                  key={rating.id}
                  style={[
                    styles.ratingButton,
                    {
                      backgroundColor:
                        formData.rating === rating.id
                          ? rating.color
                          : colors.card,
                      borderColor:
                        formData.rating === rating.id
                          ? rating.color
                          : colors.borderSubtle,
                    },
                    SHADOWS.small,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, rating: rating.id })
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={rating.icon as any}
                    size={20}
                    color={
                      formData.rating === rating.id ? "#FFFFFF" : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.ratingLabel,
                      {
                        color:
                          formData.rating === rating.id
                            ? "#FFFFFF"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {rating.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.rating && (
              <Text style={[styles.errorText, { color: colors.error || "#FF6B6B" }]}>
                {errors.rating}
              </Text>
            )}
          </View>

          {/* Feedback Type */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              {t("profile.feedback.type")}
            </Text>
            <View style={styles.typeContainer}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        formData.type === type.id ? colors.primary : colors.card,
                      borderColor:
                        formData.type === type.id
                          ? colors.primary
                          : colors.borderSubtle,
                    },
                    SHADOWS.small,
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.id })}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={
                      formData.type === type.id
                        ? "#FFFFFF"
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      {
                        color:
                          formData.type === type.id
                            ? "#FFFFFF"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.type && (
              <Text style={[styles.errorText, { color: colors.error || "#FF6B6B" }]}>
                {errors.type}
              </Text>
            )}
          </View>

          {/* Subject */}
          <Input
            label={t("profile.feedback.subject")}
            value={formData.subject}
            onChangeText={(text) => {
              setFormData({ ...formData, subject: text });
              if (errors.subject) {
                setErrors({ ...errors, subject: "" });
              }
            }}
            placeholder={t("profile.feedback.subjectPlaceholder")}
            icon="document-text-outline"
            error={errors.subject}
          />

          {/* Message */}
          <Input
            label={t("profile.feedback.message")}
            value={formData.message}
            onChangeText={(text) => {
              setFormData({ ...formData, message: text });
              if (errors.message) {
                setErrors({ ...errors, message: "" });
              }
            }}
            placeholder={t("profile.feedback.messagePlaceholder")}
            icon="chatbubble-outline"
            multiline
            error={errors.message}
          />

          {/* Submit Button */}
          <Button
            title={t("profile.feedback.submit")}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            fullWidth
            icon="send-outline"
            style={styles.submitButton}
          />

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  promiseCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
  },
  promiseTitle: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "700",
    fontSize: 13,
  },
  helperText: {
    ...TEXT_STYLES.bodySmall,
    lineHeight: 18,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TEXT_STYLES.labelLarge,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  ratingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
    minWidth: 100,
  },
  ratingLabel: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  typeLabel: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
  },
  errorText: {
    ...TEXT_STYLES.labelSmall,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});
