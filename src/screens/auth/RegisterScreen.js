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
      // Add your registration logic here
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulating API call
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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[
                  styles.backButton,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Text
                  variant="h1"
                  style={[styles.title, { color: theme.colors.text }]}
                >
                  {t("auth.registerTitle")}
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t("auth.registerSubtitle")}
                </Text>
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                placeholder={t("auth.fullName")}
                value={formData.fullName}
                onChangeText={(value) => updateFormData("fullName", value)}
                theme={theme}
                icon="person-outline"
                style={styles.input}
              />

              <Input
                placeholder={t("auth.email")}
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                theme={theme}
                icon="mail-outline"
                style={styles.input}
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
                style={styles.input}
              />

              <Input
                placeholder={t("auth.confirmPassword")}
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  updateFormData("confirmPassword", value)
                }
                secureTextEntry={!showConfirmPassword}
                theme={theme}
                icon="lock-closed-outline"
                rightIcon={
                  showConfirmPassword ? "eye-off-outline" : "eye-outline"
                }
                onRightIconPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={styles.input}
              />

              <Text
                style={[
                  styles.termsText,
                  { color: theme.colors.textSecondary },
                ]}
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
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
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
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="logo-apple"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.loginContainer}>
                <Text style={{ color: theme.colors.textSecondary }}>
                  {t("auth.alreadyHaveAccount")}{" "}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text
                    style={{ color: theme.colors.primary, fontWeight: "600" }}
                  >
                    {t("common.login")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
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
    paddingTop: Platform.OS === "ios" ? 64 : 32,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  titleContainer: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 8,
  },
  registerButton: {
    marginVertical: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
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
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
});
