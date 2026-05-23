import i18n from "@/i18n/config";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { SoftSurface } from "@/components/v2";
import { BORDER_RADIUS, HIT_SLOP, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useHaptics } from "@/hooks/useHaptics";
import { SUPABASE_URL } from "@/services/supabase";

type Step = "email" | "otp" | "newPassword";
const STEPS_ORDER: Step[] = ["email", "otp", "newPassword"];

export default function ResetPasswordScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const haptics = useHaptics();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpAttempts, setOtpAttempts] = useState(0);
  const MAX_OTP_ATTEMPTS = 5;

  const otpRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (step === "otp" && otp.every((d) => d.length === 1)) {
      haptics.impactLight();
    }
  }, [otp, step]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setErrors({ email: t("auth.login.resetPassword.errors.emailRequired") });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: t("auth.login.resetPassword.errors.emailInvalid") });
      return;
    }
    setErrors({});
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), language: i18n.language }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || t("auth.login.resetPassword.errors.sendFailed"));
      setStep("otp");
    } catch (err: any) {
      const msg =
        err.name === "AbortError"
          ? t("common.timeout")
          : err.message || t("auth.login.resetPassword.errors.sendFailed");
      Alert.alert(t("common.error"), msg);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setErrors({ otp: t("auth.login.resetPassword.errors.otpRequired") });
      return;
    }
    if (otpAttempts >= MAX_OTP_ATTEMPTS) {
      Alert.alert(t("common.error"), t("auth.login.resetPassword.errors.tooManyAttempts"));
      setStep("email");
      setOtp(["", "", "", "", "", ""]);
      setOtpAttempts(0);
      return;
    }
    setErrors({});
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otpValue, verify_only: true }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "invalid_otp") {
          const newAttempts = otpAttempts + 1;
          setOtpAttempts(newAttempts);
          const remaining = MAX_OTP_ATTEMPTS - newAttempts;
          setErrors({
            otp: `${t("auth.login.resetPassword.errors.otpInvalid")} (${t(
              "auth.login.resetPassword.errors.attemptsRemaining",
              { count: remaining },
            )})`,
          });
        } else if (data.error === "expired_otp") {
          setErrors({ otp: t("auth.login.resetPassword.errors.otpExpired") });
        } else {
          throw new Error(data.error);
        }
        return;
      }
      setOtpAttempts(0);
      setStep("newPassword");
    } catch (err: any) {
      const msg =
        err.name === "AbortError"
          ? t("common.timeout")
          : err.message || t("auth.login.resetPassword.errors.updateFailed");
      Alert.alert(t("common.error"), msg);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const newErrors: Record<string, string> = {};
    if (!newPassword.trim()) {
      newErrors.newPassword = t("auth.login.resetPassword.errors.passwordRequired");
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t("auth.login.resetPassword.errors.passwordMinLength");
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t("auth.login.resetPassword.errors.passwordRequired");
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("auth.login.resetPassword.errors.passwordsNotMatch");
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.join(""),
          new_password: newPassword,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || t("auth.login.resetPassword.errors.updateFailed"));
      haptics.success();
      Alert.alert(
        t("auth.login.resetPassword.successTitle"),
        t("auth.login.resetPassword.successMessage"),
        [{ text: t("common.ok"), onPress: () => router.replace("/(main)/login") }],
      );
    } catch (err: any) {
      const msg =
        err.name === "AbortError"
          ? t("common.timeout")
          : err.message || t("auth.login.resetPassword.errors.updateFailed");
      Alert.alert(t("common.error"), msg);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (errors.otp) setErrors({});
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    if (step === "otp") setStep("email");
    else if (step === "newPassword") setStep("otp");
    else router.back();
  };

  const stepTitles: Record<Step, string> = {
    email: t("auth.login.resetPassword.title"),
    otp: t("auth.login.resetPassword.otpLabel"),
    newPassword: t("auth.login.resetPassword.newPasswordLabel"),
  };

  const stepSubtitles: Record<Step, string> = {
    email: t("auth.login.resetPassword.subtitle"),
    otp: t("auth.login.resetPassword.codeSent"),
    newPassword: t("auth.login.resetPassword.subtitle"),
  };

  const stepIdx = STEPS_ORDER.indexOf(step);
  const pageNum = String(stepIdx + 1).padStart(2, "0");

  return (
    <SoftSurface tone="warm">
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.pageHeader}>
          <Pressable
            onPress={handleBack}
            hitSlop={HIT_SLOP.medium}
            style={({ pressed }) => [
              styles.backBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderSubtle,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.pageMeta, { color: colors.textTertiary }]}>
            — {pageNum} / {String(STEPS_ORDER.length).padStart(2, "0")} —
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={[styles.section, { color: colors.primary }]}>
              §  {t("auth.login.resetPassword.title")}
            </Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {stepTitles[step]}
            </Text>
            <View style={[styles.titleUnderline, { backgroundColor: colors.primary }]} />
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {stepSubtitles[step]}
            </Text>
          </View>

          {/* Step 1 */}
          {step === "email" && (
            <View style={styles.form}>
              <Input
                label={t("auth.login.resetPassword.emailLabel")}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({});
                }}
                placeholder={t("auth.login.emailPlaceholder")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                icon="mail-outline"
                error={errors.email}
              />
              <View style={{ marginTop: SPACING.md }}>
                <Button
                  title={t("auth.login.resetPassword.sendCode")}
                  onPress={handleSendCode}
                  loading={loading}
                  size="large"
                  fullWidth
                />
              </View>
            </View>
          )}

          {/* Step 2 */}
          {step === "otp" && (
            <View style={styles.form}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t("auth.login.resetPassword.otpLabel")}
              </Text>
              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      otpRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpBox,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.otp
                          ? colors.error
                          : digit
                          ? colors.primary
                          : colors.borderSubtle,
                        color: colors.textPrimary,
                      },
                    ]}
                    value={digit}
                    onChangeText={(v) =>
                      handleOtpChange(v.replace(/[^0-9]/g, "").slice(-1), index)
                    }
                    onKeyPress={({ nativeEvent }) =>
                      handleOtpKeyPress(nativeEvent.key, index)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>
              {errors.otp && (
                <Text
                  style={[styles.errorText, { color: colors.error }]}
                  accessibilityLiveRegion="polite"
                >
                  {errors.otp}
                </Text>
              )}
              <TouchableOpacity
                onPress={handleSendCode}
                activeOpacity={0.7}
                style={styles.resendRow}
                hitSlop={HIT_SLOP.small}
              >
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  {t("auth.login.resetPassword.resendCode")} →
                </Text>
              </TouchableOpacity>
              <View style={{ marginTop: SPACING.md }}>
                <Button
                  title={t("common.confirm")}
                  onPress={handleVerifyOtp}
                  loading={loading}
                  size="large"
                  fullWidth
                />
              </View>
            </View>
          )}

          {/* Step 3 */}
          {step === "newPassword" && (
            <View style={styles.form}>
              <Input
                label={t("auth.login.resetPassword.newPasswordLabel")}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword)
                    setErrors({ ...errors, newPassword: "" });
                }}
                placeholder="••••••••"
                secureTextEntry
                icon="lock-closed-outline"
                error={errors.newPassword}
              />
              <Input
                label={t("auth.login.resetPassword.confirmPasswordLabel")}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: "" });
                }}
                placeholder="••••••••"
                secureTextEntry
                icon="lock-closed-outline"
                error={errors.confirmPassword}
              />
              <View style={{ marginTop: SPACING.md }}>
                <Button
                  title={t("auth.login.resetPassword.updateButton")}
                  onPress={handleUpdatePassword}
                  loading={loading}
                  size="large"
                  fullWidth
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SoftSurface>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingHorizontal: SPACING.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md + 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pageMeta: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.5,
    fontVariant: ["tabular-nums"],
  },

  scroll: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  titleBlock: { marginBottom: SPACING.xl },
  section: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.9,
    marginBottom: SPACING.sm,
  },
  titleUnderline: {
    width: 48,
    height: 4,
    borderRadius: 2,
    opacity: 0.85,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  form: { gap: SPACING.sm },

  fieldLabel: {
    ...TEXT_STYLES.labelMedium,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: BORDER_RADIUS.md + 2,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: "700",
  },
  errorText: { ...TEXT_STYLES.labelSmall, marginTop: 6, fontWeight: "500" },
  resendRow: { marginTop: SPACING.sm, alignSelf: "flex-end" },
  resendText: { ...TEXT_STYLES.labelMedium, fontWeight: "600" },
});
