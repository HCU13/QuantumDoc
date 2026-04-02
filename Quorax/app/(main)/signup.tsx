import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { SPACING } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

export default function SignUpScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsSheet, setShowTermsSheet] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string; email?: string; password?: string; confirmPassword?: string; terms?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = t("auth.register.errors.nameRequired");
    else if (name.trim().length < 2) newErrors.name = t("auth.register.errors.nameMinLength");
    if (!email.trim()) newErrors.email = t("auth.register.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = t("auth.register.errors.emailInvalid");
    if (!password.trim()) newErrors.password = t("auth.register.errors.passwordRequired");
    else if (password.length < 6) newErrors.password = t("auth.register.errors.passwordMinLength");
    if (!confirmPassword.trim()) newErrors.confirmPassword = t("auth.register.errors.confirmPasswordRequired");
    else if (password !== confirmPassword) newErrors.confirmPassword = t("auth.register.errors.passwordsNotMatch");
    if (!acceptedTerms) newErrors.terms = t("auth.register.errors.termsRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) {
        const msg = error.message.includes("already registered") || error.message.includes("already exists")
          ? t("auth.register.errors.emailExists")
          : error.message;
        Alert.alert(t("auth.register.errors.title"), msg);
        return;
      }
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({ id: data.user.id, full_name: name.trim() });
        if (profileError) console.error("Profile insert error:", profileError);
        router.replace({ pathname: "/(main)/login", params: { email: email.trim() } } as any);
      }
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("auth.register.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.replace("/(main)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface }]} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo + Başlık */}
          <View style={styles.titleWrap}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t("auth.register.welcome")}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("auth.register.subtitle")}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t("auth.register.name")}
              value={name}
              onChangeText={(text) => { setName(text); if (errors.name) setErrors({ ...errors, name: undefined }); }}
              placeholder={t("auth.register.namePlaceholder")}
              autoCapitalize="words"
              autoCorrect={false}
              icon="person-outline"
              error={errors.name}
            />
            <View style={{ marginTop: SPACING.md }}>
              <Input
                label={t("auth.register.email")}
                value={email}
                onChangeText={(text) => { setEmail(text); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                placeholder={t("auth.register.emailPlaceholder")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                icon="mail-outline"
                error={errors.email}
              />
            </View>
            <View style={{ marginTop: SPACING.md }}>
              <Input
                label={t("auth.register.password")}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                  if (errors.confirmPassword && text === confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                placeholder={t("auth.register.passwordPlaceholder")}
                secureTextEntry={true}
                icon="lock-closed-outline"
                error={errors.password}
              />
            </View>
            <View style={{ marginTop: SPACING.md }}>
              <Input
                label={t("auth.register.confirmPassword")}
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined }); }}
                placeholder={t("auth.register.confirmPasswordPlaceholder")}
                secureTextEntry={true}
                icon="lock-closed-outline"
                error={errors.confirmPassword}
              />
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => {
                if (!acceptedTerms) setShowTermsSheet(true);
                else { setAcceptedTerms(false); if (errors.terms) setErrors({ ...errors, terms: undefined }); }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, {
                backgroundColor: acceptedTerms ? colors.primary : "transparent",
                borderColor: errors.terms ? colors.error : acceptedTerms ? colors.primary : colors.borderSubtle,
              }]}>
                {acceptedTerms && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>
              <View style={styles.termsTextWrap}>
                <Text style={[styles.termsText, { color: colors.textSecondary }]}>{t("auth.register.termsPrefix")}</Text>
                <Text style={[styles.termsLink, { color: colors.primary }]}>{t("auth.register.termsLink")}</Text>
                <Text style={[styles.termsText, { color: colors.textSecondary }]}>{t("auth.register.termsAnd")}</Text>
                <Text style={[styles.termsLink, { color: colors.primary }]}>{t("auth.register.privacyLink")}</Text>
              </View>
            </TouchableOpacity>
            {errors.terms && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.terms}</Text>
            )}

            <View style={{ marginTop: SPACING.xl }}>
              <Button title={t("auth.register.button")} onPress={handleSignUp} loading={loading} />
            </View>
          </View>

          {/* Alt link */}
          <View style={styles.bottomRow}>
            <Text style={[styles.bottomText, { color: colors.textSecondary }]}>
              {t("auth.register.hasAccount")}{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(main)/login")} activeOpacity={0.7}>
              <Text style={[styles.bottomLink, { color: colors.primary }]}>{t("auth.register.signIn")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms Modal */}
      <Modal visible={showTermsSheet} animationType="slide" transparent onRequestClose={() => setShowTermsSheet(false)}>
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheetContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.borderSubtle }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                {t("auth.register.termsLink")} & {t("auth.register.privacyLink")}
              </Text>
              <TouchableOpacity onPress={() => setShowTermsSheet(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              <Text style={[{ fontSize: 15, fontWeight: "600", marginBottom: 8 }, { color: colors.textPrimary }]}>
                {t("onboarding.aiConsentTitle")}
              </Text>
              <Text style={[{ fontSize: 14, lineHeight: 22, marginBottom: 20 }, { color: colors.textSecondary }]}>
                {t("onboarding.aiConsentBody")}
              </Text>
              <View style={[{ height: 1, marginBottom: 20 }, { backgroundColor: colors.borderSubtle }]} />
              <TouchableOpacity onPress={() => { setShowTermsSheet(false); router.push("/(main)/profile/terms"); }} activeOpacity={0.7}>
                <Text style={[{ fontSize: 14, fontWeight: "600", textDecorationLine: "underline" }, { color: colors.primary }]}>
                  {t("auth.register.termsLink")} →
                </Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={{ padding: 20, gap: 8 }}>
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setAcceptedTerms(true);
                  if (errors.terms) setErrors({ ...errors, terms: undefined });
                  setShowTermsSheet(false);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.acceptBtnText}>{t("onboarding.aiConsentAcceptButton")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ alignItems: "center", paddingTop: 4 }} onPress={() => setShowTermsSheet(false)}>
                <Text style={{ color: colors.textTertiary, fontSize: 13 }}>{t("common.close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 36,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Content
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 48,
  },
  titleWrap: {
    alignItems: "center",
    marginBottom: 36,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: "center" },
  form: { marginBottom: 32 },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.lg,
    gap: 10,
  },
  termsTextWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  termsText: { fontSize: 13, lineHeight: 20 },
  termsLink: { fontSize: 13, fontWeight: "600", lineHeight: 20, textDecorationLine: "underline" },
  errorText: { fontSize: 12, marginTop: 4 },

  bottomRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  bottomText: { fontSize: 15 },
  bottomLink: { fontSize: 15, fontWeight: "700" },

  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheetContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%", minHeight: 400 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 20,
    borderBottomWidth: 1,
  },
  sheetTitle: { flex: 1, fontSize: 15, fontWeight: "600" },
  acceptBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, padding: 14 },
  acceptBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
