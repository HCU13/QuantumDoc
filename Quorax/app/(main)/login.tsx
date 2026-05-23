import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { SoftSurface } from "@/components/v2";
import { BORDER_RADIUS, HIT_SLOP, SPACING } from "@/constants/theme";
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = t("auth.login.errors.emailInvalid");
    if (!password.trim())
      newErrors.password = t("auth.login.errors.passwordRequired");
    else if (password.length < 6)
      newErrors.password = t("auth.login.errors.passwordMinLength");
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
          result.error?.includes("Invalid login credentials") ||
          result.error?.includes("Invalid login")
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

  const handleBack = () => router.replace("/(main)/welcome");

  return (
    <SoftSurface tone="warm">
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Page header — back button outside the margin, page number on right */}
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
            — 02 —
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
              §  {t("auth.login.title")}
            </Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t("auth.login.welcome")}
            </Text>
            <View style={[styles.titleUnderline, { backgroundColor: colors.primary }]} />
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t("auth.login.subtitle")}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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

            <Input
              label={t("auth.login.password")}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder={t("auth.login.passwordPlaceholder")}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => router.push("/(main)/reset-password")}
              activeOpacity={0.7}
              hitSlop={HIT_SLOP.small}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>
                {t("auth.login.forgotPassword")} →
              </Text>
            </TouchableOpacity>

            <View style={{ marginTop: SPACING.md }}>
              <Button
                title={t("auth.login.button")}
                onPress={handleLogin}
                loading={loading}
                size="large"
                fullWidth
              />
            </View>
          </View>

          {/* Footer link */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t("auth.login.noAccount")}{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(main)/signup")}
              activeOpacity={0.7}
              hitSlop={HIT_SLOP.small}
            >
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {t("auth.login.signUp")}
              </Text>
            </TouchableOpacity>
          </View>
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
  titleBlock: {
    marginBottom: SPACING.xl,
  },
  section: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -1,
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
  form: {
    gap: SPACING.sm,
  },
  forgotRow: {
    alignSelf: "flex-end",
    paddingVertical: SPACING.xs,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: { fontSize: 15, fontWeight: "400" },
  footerLink: { fontSize: 15, fontWeight: "700" },
});
