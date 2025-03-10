// src/screens/auth/ForgotPasswordScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
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
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { resetPassword, loading } = useAuth();
  const { t } = useLocalization();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formFade = useRef(new Animated.Value(1)).current;
  const successFade = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;

  // Refs
  const lottieRef = useRef(null);
  const successLottieRef = useRef(null);

  // Start entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Start lottie animation
    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current.play();
      }, 400);
    }
  }, []);

  // Success animation when email is submitted
  useEffect(() => {
    if (isSubmitted) {
      // Animate out the form
      Animated.timing(formFade, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Animate in the success state
      Animated.parallel([
        Animated.timing(successFade, {
          toValue: 1,
          duration: 800,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(successScale, {
          toValue: 1,
          duration: 800,
          delay: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Start success lottie animation
      if (successLottieRef.current) {
        setTimeout(() => {
          successLottieRef.current.play();
        }, 600);
      }
    }
  }, [isSubmitted]);

  // Form validation
  const validateForm = () => {
    if (!email) {
      setError("Please enter your email address");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    setError("");
    return true;
  };

  // Password reset request
  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      await resetPassword(email);
      setIsSubmitted(true);
      // Toast message shown in AuthContext
    } catch (error) {
      console.error("Password reset error", error);
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
              ? [theme.colors.background, theme.colors.card]
              : [theme.colors.background, theme.colors.background + "80"]
          }
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with Back Button */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <Text variant="h2" style={styles.title}>
                {t("auth.forgotPassword")}
              </Text>
              <View style={{ width: 40 }} />
            </Animated.View>

            {/* Animation Container */}
            <Animated.View
              style={[
                styles.animationContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LottieView
                ref={lottieRef}
                source={require("../../assets/animations/forgot-password.json")}
                style={styles.animation}
                loop
              />
            </Animated.View>

            {/* Reset Password Form */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: Animated.multiply(fadeAnim, formFade),
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Card style={styles.formCard} elevated={true}>
                <Text
                  style={[
                    styles.description,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t("auth.resetPasswordDesc")}
                </Text>

                <Input
                  label={t("auth.email")}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail"
                  error={error}
                  variant="outline"
                  animatedLabel={true}
                />

                <Button
                  title={t("auth.resetPassword")}
                  onPress={handleResetPassword}
                  style={styles.resetButton}
                  loading={loading}
                  gradient={true}
                  icon="send"
                />
              </Card>
            </Animated.View>

            {/* Success State */}
            {isSubmitted && (
              <Animated.View
                style={[
                  styles.successContainer,
                  {
                    opacity: successFade,
                    transform: [{ scale: successScale }],
                  },
                ]}
              >
                <Card style={styles.successCard} elevated={true}>
                  <LottieView
                    ref={successLottieRef}
                    source={require("../../assets/animations/email-sent.json")}
                    style={styles.successAnimation}
                    loop={false}
                  />

                  <Text variant="h3" style={styles.successTitle}>
                    {t("auth.checkYourEmail")}
                  </Text>

                  <Text
                    variant="body1"
                    color={theme.colors.textSecondary}
                    style={styles.successMessage}
                  >
                    We've sent instructions to reset your password to
                    <Text
                      variant="body1"
                      weight="semibold"
                      color={theme.colors.primary}
                    >
                      {" "}
                      {email}
                    </Text>
                  </Text>

                  <Button
                    title={t("auth.loginInstead")}
                    onPress={() => navigation.navigate("Login")}
                    style={styles.loginButton}
                    gradient={true}
                  />
                </Card>
              </Animated.View>
            )}

            {/* Bottom Links */}
            <Animated.View
              style={[
                styles.bottomLinks,
                isSubmitted ? { display: "none" } : {},
                {
                  opacity: Animated.multiply(fadeAnim, formFade),
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.bottomLink}
                onPress={() => navigation.navigate("Login")}
              >
                <Text variant="body2" color={theme.colors.textSecondary}>
                  Remember your password?{" "}
                  <Text
                    variant="body2"
                    weight="semibold"
                    color={theme.colors.primary}
                  >
                    Log in
                  </Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Full screen loading indicator */}
      {loading && (
        <Loading
          fullScreen
          text={t("common.loading")}
          type="dots"
          blur={true}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: "center",
    marginBottom: 0,
  },
  animationContainer: {
    alignItems: "center",
    paddingTop: 10,
    marginBottom: 10,
  },
  animation: {
    width: 180,
    height: 180,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  formCard: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 20,
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  resetButton: {
    marginTop: 24,
  },
  successContainer: {
    paddingHorizontal: 24,
    position: "absolute",
    top: 200,
    left: 0,
    right: 0,
  },
  successCard: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 20,
    alignItems: "center",
  },
  successAnimation: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  successTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  successMessage: {
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  loginButton: {
    minWidth: 200,
  },
  bottomLinks: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingHorizontal: 24,
  },
  bottomLink: {
    padding: 12,
  },
});

export default ForgotPasswordScreen;
