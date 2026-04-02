import i18n from "@/i18n/config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { BORDER_RADIUS, SHADOWS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { SUPABASE_URL } from "@/services/supabase";

type Step = "email" | "otp" | "newPassword";

export default function ResetPasswordScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

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

  // Adım 1 — Mail gönder
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
      if (!res.ok) throw new Error(data.error || t("auth.login.resetPassword.errors.sendFailed"));
      setStep("otp");
    } catch (err: any) {
      const msg = err.name === "AbortError"
        ? t("common.timeout")
        : err.message || t("auth.login.resetPassword.errors.sendFailed");
      Alert.alert(t("common.error"), msg);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  // Adım 2 — OTP doğrula
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
          setErrors({ otp: `${t("auth.login.resetPassword.errors.otpInvalid")} (${t("auth.login.resetPassword.errors.attemptsRemaining", { count: remaining })})` });
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
      const msg = err.name === "AbortError"
        ? t("common.timeout")
        : err.message || t("auth.login.resetPassword.errors.updateFailed");
      Alert.alert(t("common.error"), msg);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  // Adım 3 — Şifreyi güncelle
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
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.join(""), new_password: newPassword }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("auth.login.resetPassword.errors.updateFailed"));
      Alert.alert(
        t("auth.login.resetPassword.successTitle"),
        t("auth.login.resetPassword.successMessage"),
        [{ text: t("common.ok"), onPress: () => router.replace("/(main)/login") }],
      );
    } catch (err: any) {
      const msg = err.name === "AbortError"
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <LinearGradient
        colors={["#8A4FFF", "#6932E0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBubble1} />
        <View style={styles.heroBubble2} />

        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.heroTitle}>{stepTitles[step]}</Text>
          <Text style={styles.heroSubtitle}>{stepSubtitles[step]}</Text>
        </View>

        {/* Adım göstergesi */}
        <View style={styles.stepIndicator}>
          {(["email", "otp", "newPassword"] as Step[]).map((s, i) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                { backgroundColor: step === s ? "#fff" : "rgba(255,255,255,0.35)" },
                i < 2 && styles.stepDotGap,
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.card }, SHADOWS.small]}>

            {/* ADIM 1 — Email */}
            {step === "email" && (
              <>
                <Input
                  label={t("auth.login.resetPassword.emailLabel")}
                  value={email}
                  onChangeText={(text) => { setEmail(text); if (errors.email) setErrors({}); }}
                  placeholder={t("auth.login.emailPlaceholder")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="mail-outline"
                  error={errors.email}
                />
                <View style={{ marginTop: SPACING.lg }}>
                  <Button
                    title={t("auth.login.resetPassword.sendCode")}
                    onPress={handleSendCode}
                    loading={loading}
                  />
                </View>
              </>
            )}

            {/* ADIM 2 — OTP */}
            {step === "otp" && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                  {t("auth.login.resetPassword.otpLabel")}
                </Text>
                <View style={styles.otpRow}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { otpRefs.current[index] = ref; }}
                      style={[
                        styles.otpBox,
                        {
                          backgroundColor: colors.surface,
                          borderColor: errors.otp ? colors.error : digit ? colors.primary : colors.borderSubtle,
                          color: colors.textPrimary,
                        },
                      ]}
                      value={digit}
                      onChangeText={(v) => handleOtpChange(v.replace(/[^0-9]/g, "").slice(-1), index)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  ))}
                </View>
                {errors.otp && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.otp}</Text>
                )}
                <TouchableOpacity onPress={handleSendCode} activeOpacity={0.7} style={styles.resendRow}>
                  <Text style={[styles.resendText, { color: colors.primary }]}>
                    {t("auth.login.resetPassword.resendCode")}
                  </Text>
                </TouchableOpacity>
                <View style={{ marginTop: SPACING.lg }}>
                  <Button
                    title={t("common.confirm")}
                    onPress={handleVerifyOtp}
                    loading={loading}
                  />
                </View>
              </>
            )}

            {/* ADIM 3 — Yeni Şifre */}
            {step === "newPassword" && (
              <>
                <Input
                  label={t("auth.login.resetPassword.newPasswordLabel")}
                  value={newPassword}
                  onChangeText={(text) => { setNewPassword(text); if (errors.newPassword) setErrors({ ...errors, newPassword: "" }); }}
                  placeholder="••••••••"
                  secureTextEntry={true}
                  icon="lock-closed-outline"
                  error={errors.newPassword}
                />
                <View style={{ marginTop: SPACING.md }}>
                  <Input
                    label={t("auth.login.resetPassword.confirmPasswordLabel")}
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" }); }}
                    placeholder="••••••••"
                    secureTextEntry={true}
                    icon="lock-closed-outline"
                    error={errors.confirmPassword}
                  />
                </View>
                <View style={{ marginTop: SPACING.lg }}>
                  <Button
                    title={t("auth.login.resetPassword.updateButton")}
                    onPress={handleUpdatePassword}
                    loading={loading}
                  />
                </View>
              </>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 36,
    paddingHorizontal: SPACING.lg,
    overflow: "hidden",
  },
  heroBubble1: {
    position: "absolute", width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)", top: -60, right: -40,
  },
  heroBubble2: {
    position: "absolute", width: 130, height: 130, borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.05)", bottom: -30, left: -20,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.lg,
  },
  heroContent: { alignItems: "center" },
  logoContainer: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: "#ffffff", justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.md, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  logo: { width: 56, height: 56 },
  heroTitle: {
    fontSize: 22, fontWeight: "800", color: "#fff",
    letterSpacing: -0.5, marginBottom: 6, textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 13, color: "rgba(255,255,255,0.75)",
    fontWeight: "400", textAlign: "center",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  stepDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  stepDotGap: { marginRight: 6 },
  scrollContent: {
    padding: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: 48,
  },
  card: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg },
  fieldLabel: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  otpBox: {
    flex: 1, height: 52, borderRadius: 10,
    borderWidth: 1.5, fontSize: 22, fontWeight: "700",
  },
  errorText: { ...TEXT_STYLES.bodySmall, marginTop: 6 },
  resendRow: { marginTop: SPACING.md, alignSelf: "flex-end" },
  resendText: { ...TEXT_STYLES.bodySmall, fontWeight: "600" },
});
