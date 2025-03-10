// src/screens/auth/LoginScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ImageBackground,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text } from "../../components/Text";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Loading } from "../../components/Loading";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { login, loading } = useAuth();
  const { t } = useLocalization();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
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
      // Login successful - RootNavigator will redirect to main screen
    } catch (error) {
      console.error("Login error", error);
      // Toast message shown in AuthContext
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <LinearGradient
          colors={
            isDark
              ? [theme.colors.background, theme.colors.background]
              : [theme.colors.background, theme.colors.card]
          }
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with Logo and Brand */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.logoContainer,
                  {
                    backgroundColor: theme.colors.primary + "15",
                  },
                ]}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.logoGradient}
                >
                  <Ionicons name="document-text" size={48} color="white" />
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
            </Animated.View>

            {/* Login Form */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Card style={styles.formCard} elevated={true} variant="default">
                <Text variant="h2" style={styles.formTitle} centered>
                  {t("auth.login")}
                </Text>

                <Input
                  label={t("auth.email")}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail"
                  error={errors.email ? t(errors.email) : null}
                  variant="outline"
                  animatedLabel={true}
                />

                <Input
                  label={t("auth.password")}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  icon="lock-closed"
                  error={errors.password ? t(errors.password) : null}
                  variant="outline"
                  animatedLabel={true}
                />

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

                <Button
                  title={t("auth.login")}
                  onPress={handleLogin}
                  style={styles.loginButton}
                  loading={loading}
                  gradient={true}
                  size="lg"
                  fullWidth
                />

                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border },
                  ]}
                >
                  <Text
                    variant="caption"
                    color={theme.colors.textSecondary}
                    style={styles.dividerText}
                  >
                    {t("common.or")}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text variant="body2" color={theme.colors.textSecondary}>
                    {t("auth.dontHaveAccount")}{" "}
                    <Text
                      variant="body2"
                      color={theme.colors.primary}
                      weight="semibold"
                    >
                      {t("auth.registerInstead")}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </Card>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Full screen loading indicator */}
      {loading && (
        <Loading
          fullScreen
          text={t("common.loading")}
          type="logo"
          blur={true}
          iconName="document-text"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: height * 0.08,
    paddingBottom: height * 0.04,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    overflow: "hidden",
  },
  logoGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    maxWidth: "80%",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 24,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  formCard: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 20,
  },
  formTitle: {
    marginBottom: 28,
    textAlign: "center",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 24,
    position: "relative",
  },
  dividerText: {
    position: "absolute",
    top: -10,
    left: "50%",
    backgroundColor: "white",
    paddingHorizontal: 10,
    transform: [{ translateX: -20 }],
  },
  registerLink: {
    alignItems: "center",
  },
});

export default LoginScreen;
