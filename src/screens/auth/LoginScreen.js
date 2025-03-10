// src/screens/auth/LoginScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Keyboard,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text } from "../../components/Text";
import { Input } from "../../components/Input"; // Yeni Input bileşeni
import { Button } from "../../components/Button";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  // Context Hooks
  const { theme, isDark } = useTheme();
  const { login, loading } = useAuth();
  const { t } = useLocalization();

  // State
  const [email, setEmail] = useState("trooper1803@gmail.com");
  const [password, setPassword] = useState("123123123");
  const [errors, setErrors] = useState({});
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Klavye açık/kapalı durumunu takip et
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardOpen(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardOpen(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = "auth.invalidEmail";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "auth.invalidEmail";
    }

    // Password validation
    if (!password) {
      newErrors.password = "auth.passwordRequired";
    } else if (password.length < 6) {
      newErrors.password = "auth.passwordTooShort";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Login function
  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);
      // RootNavigator will redirect to main screen after successful login
    } catch (error) {
      console.error("Login error", error);
      // Toast message is handled in AuthContext
    }
  };

  // Logo bileşeni - klavye açık olduğunda gizlenir
  const renderLogo = () => {
    if (keyboardOpen) return null;
    
    return (
      <View style={styles.logoContainer}>
        <View style={[styles.logoBox, { backgroundColor: theme.colors.primary + "15" }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.logoGradient}
          >
            <Ionicons name="document-text" size={40} color="white" />
          </LinearGradient>
        </View>

        <Text variant="h1" style={styles.title} weight="bold">
          DocAI
        </Text>

        <Text
          variant="subtitle1"
          color={theme.colors.textSecondary}
          style={styles.subtitle}
          centered
        >
          {t("onboarding.welcome.description")}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <LinearGradient
          colors={
            isDark
              ? [theme.colors.background, theme.colors.background]
              : [theme.colors.background, theme.colors.surface]
          }
          style={styles.gradient}
        >
          <View style={styles.content}>
            {renderLogo()}

            <View style={styles.formContainer}>
              <Text variant="h2" style={styles.formTitle}>
                {t("auth.login")}
              </Text>

              {/* Email Input */}
              <Input
                label={t("auth.email")}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={errors.email ? t(errors.email) : null}
              />

              {/* Password Input */}
              <Input
                label={t("auth.password")}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                icon="lock-closed-outline"
                error={errors.password ? t(errors.password) : null}
              />

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text
                  variant="body2"
                  color={theme.colors.primary}
                  style={styles.forgotPasswordText}
                >
                  {t("auth.forgotPassword")}
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Button
                title={t("auth.login")}
                onPress={handleLogin}
                style={styles.loginButton}
                loading={loading}
                gradient={true}
                fullWidth
              />

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text variant="body2" color={theme.colors.textSecondary}>
                  {t("auth.dontHaveAccount")}{" "}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                  <Text
                    variant="body2"
                    color={theme.colors.primary}
                    weight="semibold"
                  >
                    {t("auth.registerInstead")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Full screen loading indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.loadingIndicator}
          >
            <Ionicons name="document-text" size={28} color="white" />
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoBox: {
    width: 70,
    height: 70,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 16,
  },
  logoGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    maxWidth: "80%",
    textAlign: "center",
    marginBottom: 6,
    lineHeight: 20,
  },
  formContainer: {
    width: "100%",
  },
  formTitle: {
    marginBottom: 20,
    fontSize: 22,
    textAlign: "center",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
  },
  loginButton: {
    marginBottom: 20,
    height: 44,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;