import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { SoftSurface } from "@/components/v2";
import { BORDER_RADIUS, HIT_SLOP, SPACING } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { isAnonymous, upgradeAnonymousToRegistered } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = t("auth.register.errors.emailRequired");
    else if (!EMAIL_RE.test(email.trim())) next.email = t("auth.register.errors.emailInvalid");
    if (!password) next.password = t("auth.register.errors.passwordRequired");
    else if (password.length < 6) next.password = t("auth.register.errors.passwordShort");
    if (!accepted) next.terms = t("auth.register.errors.termsRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Anonim session varsa onu kalıcıya çevir (data + RC entitlement korunur).
      if (isAnonymous) {
        const result = await upgradeAnonymousToRegistered(email.trim(), password);
        if (!result.success) {
          Alert.alert(t("auth.register.errors.title"), result.error || t("auth.register.errors.generic"));
          return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.replace("/(main)" as any);
        return;
      }

      // Yeni kayıt: anonim değilse (logout sonrası vs.) standart signUp.
      const { data, error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signErr) {
        const msg =
          signErr.message.includes("already registered") ||
          signErr.message.includes("already exists")
            ? t("auth.register.errors.emailExists")
            : signErr.message;
        Alert.alert(t("auth.register.errors.title"), msg);
        return;
      }
      if (data.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.replace({
          pathname: "/(main)/login",
          params: { email: email.trim() },
        } as any);
      }
    } catch (e: any) {
      Alert.alert(t("common.error"), e?.message || t("auth.register.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SoftSurface tone="warm">
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.pageHeader}>
        <Pressable
          onPress={() => router.back()}
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
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={[styles.headline, { color: colors.textPrimary }]}>
              {isAnonymous
                ? t("auth.register.upgradeTitle", "Save your progress")
                : t("auth.register.title", "Create your account")}
            </Text>
            <Text style={[styles.subheadline, { color: colors.textSecondary }]}>
              {isAnonymous
                ? t("auth.register.upgradeSubtitle", "Add an email + password to keep your solves across devices.")
                : t("auth.register.subtitle", "Just an email and password — that's it.")}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t("auth.register.email")}
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors({ ...errors, email: undefined }); }}
              placeholder={t("auth.register.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon="mail-outline"
              error={errors.email}
            />

            <Input
              label={t("auth.register.password")}
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors({ ...errors, password: undefined }); }}
              placeholder={t("auth.register.passwordPlaceholder", "Min. 6 characters")}
              secureTextEntry={!showPassword}
              icon="lock-closed-outline"
              error={errors.password}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword((v) => !v)}
            />

            <Pressable
              onPress={() => { setAccepted((v) => !v); setErrors({ ...errors, terms: undefined }); }}
              style={({ pressed }) => [
                styles.termsRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              hitSlop={6}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: errors.terms ? colors.error : colors.borderSubtle,
                    backgroundColor: accepted ? colors.primary : "transparent",
                  },
                ]}
              >
                {accepted && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                {t("auth.register.acceptPrefix", "I agree to the ")}
                <Text
                  style={{ color: colors.primary, fontWeight: "600" }}
                  onPress={() => Linking.openURL("https://quorax.vercel.app/terms")}
                >
                  {t("profile.premium.terms")}
                </Text>
                {" · "}
                <Text
                  style={{ color: colors.primary, fontWeight: "600" }}
                  onPress={() => Linking.openURL("https://quorax.vercel.app/privacy")}
                >
                  {t("profile.premium.privacy")}
                </Text>
              </Text>
            </Pressable>
            {errors.terms ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.terms}</Text>
            ) : null}

            <Button
              title={t("auth.register.cta", "Continue")}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              size="large"
              fullWidth
              style={{ marginTop: SPACING.sm }}
            />

            <Pressable
              onPress={() => router.replace("/(main)/login" as any)}
              style={({ pressed }) => [
                styles.signinRow,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              hitSlop={6}
            >
              <Text style={[styles.signinText, { color: colors.textTertiary }]}>
                {t("welcome.alreadyHaveAccount", "Already have an account?")}{" "}
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  {t("welcome.signIn")}
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SoftSurface>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    paddingTop: Platform.OS === "ios" ? 60 : 36,
    paddingHorizontal: SPACING.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  hero: {
    marginBottom: SPACING.xl,
  },
  headline: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginBottom: SPACING.sm,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  form: {
    gap: SPACING.md,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: -SPACING.xs,
  },
  signinRow: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  signinText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
