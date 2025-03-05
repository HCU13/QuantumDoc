import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, Input } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { FIREBASE_AUTH } from "../../../FirebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { showToast } from "../../utils/toast";

export const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");
  const auth = FIREBASE_AUTH;
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleResetPassword = async () => {
    // Reset previous error
    setError("");
    
    // Validate email
    if (!email) {
      setError(t("auth.errors.missing-email") || "Please enter your email address");
      return;
    }
    
    if (!validateEmail(email)) {
      setError(t("auth.errors.invalid-email") || "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // ActionCodeSettings - Profesyonel yönlendirme için
      const actionCodeSettings = {
        // URL, Firebase Console'da izin verilen alan listesinde olmalıdır
        url: 'https://quantumdoc-aa05d.firebaseapp.com/passwordReset?email=' + email,
        // Derin bağlantı için
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.yourcompany.docai'
        },
        android: {
          packageName: 'com.yourcompany.docai',
          installApp: true,
          minimumVersion: '12'
        }
      };
      
      // Firebase şifre sıfırlama e-postası gönder
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setResetSent(true);
      showToast.success(
        t("auth.resetEmailSentTitle") || "Email Sent", 
        t("auth.resetEmailSentMessage") || "Check your inbox for password reset instructions"
      );
    } catch (error) {
      console.error("Password reset error:", error);
      const errorCode = error.code || "auth/unknown-error";
      setError(t(`auth.errors.${errorCode}`) || error.message || "Failed to send reset email");
      showToast.error(
        t("auth.resetFailedTitle") || "Reset Failed", 
        t(`auth.errors.${errorCode}`) || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconBackground,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons name="lock-open" size={32} color="white" />
              </View>
            </View>

            <Text
              variant="h1"
              style={[styles.title, { color: theme.colors.text }]}
            >
              {resetSent
                ? t("auth.checkYourEmail")
                : t("auth.forgotPasswordTitle")}
            </Text>

            <Text
              style={[
                styles.description,
                { color: theme.colors.textSecondary },
              ]}
            >
              {resetSent
                ? t("auth.resetEmailSent")
                : t("auth.forgotPasswordDescription")}
            </Text>

            {!resetSent && (
              <View style={styles.form}>
                <Input
                  placeholder={t("auth.email")}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  theme={theme}
                  icon="mail-outline"
                  error={error}
                />

                <Button
                  title={t("auth.resetPassword") || "Reset Password"}
                  onPress={handleResetPassword}
                  loading={loading}
                  theme={theme}
                  style={styles.resetButton}
                />
              </View>
            )}

            {resetSent && (
              <View style={styles.actions}>
                <Button
                  title={t("common.backToLogin") || "Back to Login"}
                  onPress={() => navigation.navigate("Login")}
                  theme={theme}
                  style={styles.backToLoginButton}
                />
                <Button
                  title={t("auth.resendEmail") || "Resend Email"}
                  onPress={handleResetPassword}
                  type="secondary"
                  theme={theme}
                  loading={loading}
                  style={styles.resendButton}
                />
              </View>
            )}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  form: {
    width: "100%",
    gap: 16,
  },
  resetButton: {
    marginTop: 8,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  backToLoginButton: {
    marginTop: 8,
  },
  resendButton: {
    marginTop: 8,
  },
});