import { Ionicons } from "@expo/vector-icons";
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
import { SPACING } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { login, getRememberedEmail } = useAuth();
  const { email: prefillEmail } = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(prefillEmail ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    const loadRememberedEmail = async () => {
      if (prefillEmail) return;
      const remembered = await getRememberedEmail();
      if (remembered) setEmail(remembered);
    };
    loadRememberedEmail();
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = t("auth.login.errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = t("auth.login.errors.emailInvalid");
    if (!password.trim()) newErrors.password = t("auth.login.errors.passwordRequired");
    else if (password.length < 6) newErrors.password = t("auth.login.errors.passwordMinLength");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const result = await login(email, password, true);
      if (!result.success) {
        const msg =
          result.error?.includes("Invalid login credentials") || result.error?.includes("Invalid login")
            ? t("auth.login.errors.invalidCredentials")
            : result.error || t("auth.login.errors.generic");
        Alert.alert(t("auth.login.errors.title"), msg);
      }
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("auth.login.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.replace("/(main)/welcome");
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
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t("auth.login.welcome")}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t("auth.login.subtitle")}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t("auth.login.email")}
              value={email}
              onChangeText={(text) => { setEmail(text); if (errors.email) setErrors({ ...errors, email: undefined }); }}
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
                onChangeText={(text) => { setPassword(text); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                placeholder={t("auth.login.passwordPlaceholder")}
                secureTextEntry={true}
                icon="lock-closed-outline"
                error={errors.password}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => router.push("/(main)/reset-password")}
              activeOpacity={0.7}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>
                {t("auth.login.forgotPassword")}
              </Text>
            </TouchableOpacity>

            <View style={{ marginTop: SPACING.xl }}>
              <Button title={t("auth.login.button")} onPress={handleLogin} loading={loading} />
            </View>
          </View>

          {/* Alt link */}
          <View style={styles.bottomRow}>
            <Text style={[styles.bottomText, { color: colors.textSecondary }]}>
              {t("auth.login.noAccount")}{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(main)/signup")} activeOpacity={0.7}>
              <Text style={[styles.bottomLink, { color: colors.primary }]}>
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
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  form: {
    marginBottom: 32,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: 12,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomText: { fontSize: 15 },
  bottomLink: { fontSize: 15, fontWeight: "700" },
});
