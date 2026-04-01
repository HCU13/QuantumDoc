import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { BORDER_RADIUS, SHADOWS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

export default function SignUpScreen() {
  const { colors } = useTheme();
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
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});


  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = t("auth.register.errors.nameRequired");
    } else if (name.trim().length < 2) {
      newErrors.name = t("auth.register.errors.nameMinLength");
    }
    if (!email.trim()) {
      newErrors.email = t("auth.register.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("auth.register.errors.emailInvalid");
    }
    if (!password.trim()) {
      newErrors.password = t("auth.register.errors.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("auth.register.errors.passwordMinLength");
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t("auth.register.errors.confirmPasswordRequired");
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t("auth.register.errors.passwordsNotMatch");
    }
    if (!acceptedTerms) {
      newErrors.terms = t("auth.register.errors.termsRequired");
    }
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
        const msg =
          error.message.includes("already registered") || error.message.includes("already exists")
            ? t("auth.register.errors.emailExists")
            : error.message;
        Alert.alert(t("auth.register.errors.title"), msg);
        return;
      }
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({ id: data.user.id, full_name: name.trim() });
        if (profileError) {
          console.error("Profile insert error:", profileError);
        }
        router.replace({
          pathname: "/(main)/login",
          params: { email: email.trim() },
        } as any);
      }
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("auth.register.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Hero Header */}
      <LinearGradient
        colors={["#8A4FFF", "#6932E0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBubble1} />
        <View style={styles.heroBubble2} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace("/(main)/login")}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>{t("auth.register.welcome")}</Text>
          <Text style={styles.heroSubtitle}>{t("auth.register.subtitle")}</Text>
        </View>
      </LinearGradient>

      {/* Form */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, { backgroundColor: colors.card }, SHADOWS.small]}>
            <Input
              label={t("auth.register.name")}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
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
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
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
                  if (errors.confirmPassword && text === confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
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
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
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
                if (!acceptedTerms) {
                  setShowTermsSheet(true);
                } else {
                  setAcceptedTerms(false);
                  if (errors.terms) setErrors({ ...errors, terms: undefined });
                }
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: acceptedTerms ? colors.primary : "transparent",
                    borderColor: errors.terms
                      ? colors.error
                      : acceptedTerms
                      ? colors.primary
                      : colors.borderSubtle,
                  },
                ]}
              >
                {acceptedTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                  {t("auth.register.termsPrefix")}
                </Text>
                <Text style={[styles.termsLink, { color: colors.primary }]}>
                  {t("auth.register.termsLink")}
                </Text>
                <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                  {t("auth.register.termsAnd")}
                </Text>
                <Text style={[styles.termsLink, { color: colors.primary }]}>
                  {t("auth.register.privacyLink")}
                </Text>
              </View>
            </TouchableOpacity>
            {errors.terms && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.terms}</Text>
            )}

            {/* Terms & Privacy Bottom Sheet */}
            <Modal
              visible={showTermsSheet}
              animationType="slide"
              transparent
              onRequestClose={() => setShowTermsSheet(false)}
            >
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

                  <ScrollView
                    style={styles.sheetScroll}
                    contentContainerStyle={styles.sheetBody}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={[styles.sheetSectionTitle, { color: colors.textPrimary }]}>
                      {t("onboarding.aiConsentTitle")}
                    </Text>
                    <Text style={[styles.sheetText, { color: colors.textSecondary }]}>
                      {t("onboarding.aiConsentBody")}
                    </Text>

                    <View style={[styles.sheetDivider, { backgroundColor: colors.borderSubtle }]} />

                    <Text style={[styles.sheetSectionTitle, { color: colors.textPrimary }]}>
                      {t("auth.register.termsLink")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => { setShowTermsSheet(false); router.push("/(main)/profile/terms"); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.sheetLink, { color: colors.primary }]}>
                        {t("auth.register.termsLink")} →
                      </Text>
                    </TouchableOpacity>

                    <View style={[styles.sheetDivider, { backgroundColor: colors.borderSubtle }]} />

                    <Text style={[styles.sheetSectionTitle, { color: colors.textPrimary }]}>
                      {t("auth.register.privacyLink")}
                    </Text>
                    <Text style={[styles.sheetText, { color: colors.textSecondary }]}>
                      {t("profile.privacy.policy")}
                    </Text>
                  </ScrollView>

                  <View style={styles.sheetFooter}>
                    <TouchableOpacity
                      style={[styles.sheetAcceptButton, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        setAcceptedTerms(true);
                        if (errors.terms) setErrors({ ...errors, terms: undefined });
                        setShowTermsSheet(false);
                      }}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                      <Text style={styles.sheetAcceptButtonText}>
                        {t("onboarding.aiConsentAcceptButton")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ alignItems: "center", paddingTop: SPACING.sm }}
                      onPress={() => setShowTermsSheet(false)}
                    >
                      <Text style={[{ color: colors.textTertiary, fontSize: 13 }]}>
                        {t("common.close")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <View style={{ marginTop: SPACING.lg }}>
              <Button
                title={t("auth.register.button")}
                onPress={handleSignUp}
                loading={loading}
              />
            </View>
          </View>

          {/* Sign In link */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              {t("auth.register.hasAccount")}{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(main)/login")} activeOpacity={0.7}>
              <Text style={[styles.switchLink, { color: colors.primary }]}>
                {t("auth.register.signIn")}
              </Text>
            </TouchableOpacity>
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
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -60,
    right: -40,
  },
  heroBubble2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -30,
    left: -20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  heroContent: { alignItems: "center" },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: { width: 56, height: 56 },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "400",
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: 48,
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
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
  termsText: { ...TEXT_STYLES.bodySmall, lineHeight: 20 },
  termsLink: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "600",
    lineHeight: 20,
    textDecorationLine: "underline",
  },
  errorText: { ...TEXT_STYLES.bodySmall, marginTop: SPACING.xs },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "88%",
    minHeight: 400,
    paddingBottom: 0,
  },
  sheetScroll: {
    flexGrow: 1,
    maxHeight: 420,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  sheetBody: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sheetSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  sheetText: {
    fontSize: 13,
    lineHeight: 20,
  },
  sheetDivider: {
    height: 1,
    marginVertical: SPACING.lg,
  },
  sheetFooter: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  sheetAcceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  sheetAcceptButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  sheetLink: {
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
    marginTop: SPACING.xs,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  switchText: { ...TEXT_STYLES.bodyMedium },
  switchLink: { ...TEXT_STYLES.bodyMedium, fontWeight: "700" },
});
