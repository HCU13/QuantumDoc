import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text, Input, Button, Card } from "../../components";
import { useAuth } from "../../context/AuthContext"; // AuthContext'i import et
import { useLocalization } from "../../context/LocalizationContext"; // Yerelleştirme için
import { useTheme } from "../../context/ThemeContext";
const { width, height } = Dimensions.get("window");

const ForgotPasswordScreen = ({ navigation }) => {
  const { resetPassword } = useAuth(); // useAuth hook'undan resetPassword fonksiyonunu al
  const { t } = useLocalization(); // Çeviri için
  const { theme } = useTheme();
  // State for form fields and validation
  const [email, setEmail] = useState("trooper1803@gmail.com");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Simple validation function
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = t("auth.emailRequired") || "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth.invalidEmail") || "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password reset request
  const handleResetPassword = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);

        // Gerçek şifre sıfırlama işlemi çağrısı
        await resetPassword(email);

        // Show success state
        setIsSubmitted(true);
      } catch (error) {
        console.error("Password reset error:", error);
        setErrors({
          general:
            error.message ||
            t("auth.resetPasswordFailed") ||
            "Password reset request failed",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.backButton,
                { backgroundColor: theme.colors.divider },
              ]}
              onPress={() => navigation.goBack()}
            >
              <Text>←</Text>
            </TouchableOpacity>
            <Text variant="h3">
              {t("auth.resetPassword") || "Reset Password"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Main Content */}
          {!isSubmitted ? (
            // Password Reset Request Form
            <Card style={styles.resetCard}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={["#61DAFB", "#5D5FEF"]}
                  style={styles.iconBackground}
                >
                  <Text style={styles.icon}>🔑</Text>
                </LinearGradient>
              </View>

              <Text variant="subtitle1" style={styles.resetTitle}>
                {t("auth.forgotPassword") || "Forgot Your Password?"}
              </Text>

              <Text
                variant="body2"
                color="#64748B"
                style={styles.resetSubtitle}
              >
                {t("auth.resetPasswordDesc") ||
                  "Enter your email address and we'll send you a link to reset your password"}
              </Text>

              {/* Error message if request fails */}
              {errors.general && (
                <View style={styles.errorContainer}>
                  <Text variant="body2" color="#EF4444">
                    {errors.general}
                  </Text>
                </View>
              )}

              {/* Email Input */}
              <Input
                label={t("auth.email") || "Email"}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                errorText={errors.email}
                leftIcon={<Text>📧</Text>}
                style={styles.input}
              />

              {/* Reset Button */}
              <Button
                label={t("auth.sendResetLink") || "Send Reset Link"}
                onPress={handleResetPassword}
                loading={isLoading}
                gradient={true}
                style={styles.resetButton}
              />

              {/* Back to Login Link */}
              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
              >
                <Text variant="body2" color="#64748B">
                  {t("auth.rememberPassword") || "Remember your password?"}{" "}
                  <Text color="#5D5FEF" weight="semibold">
                    {t("auth.loginInstead") || "Sign In"}
                  </Text>
                </Text>
              </TouchableOpacity>
            </Card>
          ) : (
            // Success State
            <Card style={styles.successCard}>
              <View style={styles.successIconContainer}>
                <LinearGradient
                  colors={["#10B981", "#34D399"]}
                  style={styles.successIconBackground}
                >
                  <Text style={styles.successIcon}>✉️</Text>
                </LinearGradient>
              </View>

              <Text variant="h3" style={styles.successTitle}>
                {t("auth.checkYourEmail") || "Check Your Email"}
              </Text>

              <Text variant="body2" color="#64748B" style={styles.successText}>
                {t("auth.resetEmailSent") ||
                  "We've sent a password reset link to"}{" "}
                <Text color="#5D5FEF" weight="semibold">
                  {email}
                </Text>
              </Text>

              <Text
                variant="body2"
                color="#64748B"
                style={styles.instructionsText}
              >
                {t("auth.resetInstructions") ||
                  "Follow the instructions in the email to reset your password. If you don't see it, check your spam folder."}
              </Text>

              {/* Back to Login Button */}
              <Button
                label={t("auth.backToLogin") || "Back to Login"}
                onPress={() => navigation.navigate("Login")}
                variant="primary"
                style={styles.backToLoginButton}
              />

              {/* Resend Link */}
              <TouchableOpacity
                style={styles.resendLink}
                onPress={handleResetPassword}
              >
                <Text variant="body2" color="#64748B">
                  {t("auth.didntReceiveEmail") || "Didn't receive the email?"}{" "}
                  <Text color="#5D5FEF" weight="semibold">
                    {t("auth.resend") || "Resend"}
                  </Text>
                </Text>
              </TouchableOpacity>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  resetCard: {
    margin: 24,
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 32,
  },
  resetTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  resetSubtitle: {
    marginBottom: 24,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  input: {
    marginBottom: 24,
    width: "100%",
  },
  resetButton: {
    marginBottom: 16,
    width: "100%",
  },
  loginLink: {
    marginTop: 8,
  },

  // Success State Styles
  successCard: {
    margin: 24,
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    fontSize: 32,
  },
  successTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    marginBottom: 16,
    textAlign: "center",
  },
  instructionsText: {
    marginBottom: 24,
    textAlign: "center",
  },
  backToLoginButton: {
    marginBottom: 16,
    width: "100%",
  },
  resendLink: {
    marginTop: 8,
  },
});

export default ForgotPasswordScreen;
