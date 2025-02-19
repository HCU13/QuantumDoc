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

export const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) return;

    setLoading(true);
    try {
      // Firebase reset password will be here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResetSent(true);
    } catch (error) {
      console.error(error);
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
                />

                <Button
                  title={t("auth.resetPassword")}
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
                  title={t("common.backToLogin")}
                  onPress={() => navigation.navigate("Login")}
                  theme={theme}
                  style={styles.backToLoginButton}
                />
                <Button
                  title={t("auth.resendEmail")}
                  onPress={handleResetPassword}
                  type="secondary"
                  theme={theme}
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
