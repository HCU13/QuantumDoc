import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import {
  BORDER_RADIUS,
  SHADOWS,
  SPACING,
  TEXT_STYLES,
} from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { login, getRememberedEmail } = useAuth();
  const { email: prefillEmail } = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(prefillEmail ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  useEffect(() => {
    const loadRememberedEmail = async () => {
      if (prefillEmail) return;
      const rememberedEmail = await getRememberedEmail();
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    };
    loadRememberedEmail();
  }, []);


  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = t("auth.login.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("auth.login.errors.emailInvalid");
    }
    if (!password.trim()) {
      newErrors.password = t("auth.login.errors.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("auth.login.errors.passwordMinLength");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        // Navigasyon _layout.tsx'teki auth effect tarafından yapılır
        // Buradan ikinci kez replace yapmak çift navigasyona neden olur
      } else {
        const msg =
          result.error?.includes("Invalid login credentials") ||
          result.error?.includes("Invalid login")
            ? t("auth.login.errors.invalidCredentials")
            : result.error || t("auth.login.errors.generic");
        Alert.alert(t("auth.login.errors.title"), msg);
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("auth.login.errors.generic"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/(main)/reset-password");
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
        {/* Decorative circles */}
        <View style={styles.heroBubble1} />
        <View style={styles.heroBubble2} />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="rgba(255,255,255,0.9)"
          />
        </TouchableOpacity>

        {/* Logo + title */}
        <View style={styles.heroContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>{t("auth.login.welcome")}</Text>
          <Text style={styles.heroSubtitle}>{t("auth.login.subtitle")}</Text>
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
          {/* Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card },
              SHADOWS.small,
            ]}
          >
            <Input
              label={t("auth.login.email")}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder={t("auth.login.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon="mail-outline"
              error={errors.email}
            />

            <View style={{ marginTop: SPACING.md }}>
              <Input
                label={t("auth.login.password")}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors({ ...errors, password: undefined });
                }}
                placeholder={t("auth.login.passwordPlaceholder")}
                secureTextEntry={true}
                icon="lock-closed-outline"
                error={errors.password}
              />
            </View>

            {/* Remember Me + Forgot Password row */}
            <View style={styles.rememberRow}>
              <TouchableOpacity
                style={styles.rememberLeft}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: rememberMe
                        ? colors.primary
                        : "transparent",
                      borderColor: rememberMe
                        ? colors.primary
                        : colors.borderSubtle,
                    },
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={13} color="#fff" />
                  )}
                </View>
                <Text
                  style={[styles.rememberText, { color: colors.textSecondary }]}
                >
                  {t("auth.login.rememberMe")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={[styles.forgotText, { color: colors.primary }]}>
                  {t("auth.login.forgotPassword")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              <Button
                title={t("auth.login.button")}
                onPress={handleLogin}
                loading={loading}
              />
            </View>
          </View>

          {/* Sign Up link */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              {t("auth.login.noAccount")}{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(main)/signup")}
              activeOpacity={0.7}
            >
              <Text style={[styles.switchLink, { color: colors.primary }]}>
                {t("auth.login.signUp")}
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
  heroContent: {
    alignItems: "center",
  },
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
  rememberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  rememberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    ...TEXT_STYLES.bodySmall,
  },
  forgotText: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "600",
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
