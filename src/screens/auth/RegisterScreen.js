import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Input, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

export const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      // Show error
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      // Show password match error
      return;
    }

    setLoading(true);
    try {
      // Firebase registration will be here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigation.replace("MainNavigator");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[
                styles.backButton,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <Text
              variant="h1"
              style={[styles.title, { color: theme.colors.text }]}
            >
              {t("auth.registerTitle")}
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              {t("auth.registerSubtitle")}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder={t("auth.fullName")}
              value={formData.fullName}
              onChangeText={(value) => updateFormData("fullName", value)}
              theme={theme}
              icon="person-outline"
            />

            <Input
              placeholder={t("auth.email")}
              value={formData.email}
              onChangeText={(value) => updateFormData("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              theme={theme}
              icon="mail-outline"
            />

            <Input
              placeholder={t("auth.password")}
              value={formData.password}
              onChangeText={(value) => updateFormData("password", value)}
              secureTextEntry={!showPassword}
              theme={theme}
              icon="lock-closed-outline"
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Input
              placeholder={t("auth.confirmPassword")}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData("confirmPassword", value)}
              secureTextEntry={!showConfirmPassword}
              theme={theme}
              icon="lock-closed-outline"
              rightIcon={
                showConfirmPassword ? "eye-off-outline" : "eye-outline"
              }
              onRightIconPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            />

            <Text
              style={[styles.termsText, { color: theme.colors.textSecondary }]}
            >
              {t("auth.termsText")}{" "}
              <Text style={{ color: theme.colors.primary }}>
                {t("auth.termsLink")}
              </Text>{" "}
              {t("common.and")}{" "}
              <Text style={{ color: theme.colors.primary }}>
                {t("auth.privacyLink")}
              </Text>
            </Text>

            <Button
              title={t("common.register")}
              onPress={handleRegister}
              loading={loading}
              theme={theme}
              style={styles.registerButton}
            />

            <View style={styles.divider}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.colors.border },
                ]}
              />
              <Text
                style={[
                  styles.dividerText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t("common.or")}
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => {
                  /* Google registration */
                }}
              >
                <Ionicons
                  name="logo-google"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => {
                  /* Apple registration */
                }}
              >
                <Ionicons
                  name="logo-apple"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={{ color: theme.colors.textSecondary }}>
                {t("auth.alreadyHaveAccount")}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text
                  style={[styles.loginText, { color: theme.colors.primary }]}
                >
                  {t("common.login")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  registerButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 4,
  },
  loginText: {
    fontWeight: "600",
  },
});
