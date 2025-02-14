import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Text, Input, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    navigation.replace("MainNavigator", { screen: "home" });
    if (!email || !password) {
      // Show error
      return;
    }

    setLoading(true);
    try {
      // Add your login logic here
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulating API call
      navigation.replace("MainNavigator", { screen: "home" });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <LinearGradient
              colors={theme.colors.gradient.primary}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.logoContainer}>
                <Ionicons
                  name="document-text"
                  size={48}
                  color={theme.colors.white}
                />
              </View>
              <Text
                style={styles.appName}
                color={theme.colors.white}
                variant="h2"
              >
                DocAI
              </Text>
            </LinearGradient>
          </View>

          {/* Form Section */}
          <View
            style={[
              styles.formSection,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text
              variant="h2"
              style={[styles.welcomeText, { color: theme.colors.text }]}
            >
              {t("auth.loginTitle")}
            </Text>

            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              {t("auth.loginSubtitle")}
            </Text>

            <View style={styles.form}>
              <Input
                placeholder={t("auth.email")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                theme={theme}
                icon="mail-outline"
                style={styles.input}
              />

              <Input
                placeholder={t("auth.password")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                theme={theme}
                icon="lock-closed-outline"
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                style={styles.input}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotPassword}
              >
                <Text
                  style={[
                    styles.forgotPasswordText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {t("auth.forgotPassword")}
                </Text>
              </TouchableOpacity>

              <Button
                title={t("common.login")}
                onPress={handleLogin}
                loading={loading}
                theme={theme}
                style={styles.loginButton}
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
            </View>

            <View style={styles.footer}>
              <Text style={{ color: theme.colors.textSecondary }}>
                {t("auth.noAccount")}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                style={styles.registerButton}
              >
                <Text
                  style={[styles.registerText, { color: theme.colors.primary }]}
                >
                  {t("common.register")}
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
  },
  headerSection: {
    height: 200,
  },
  headerGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
  },
  formSection: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  welcomeText: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  registerText: {
    fontWeight: "600",
  },
});
