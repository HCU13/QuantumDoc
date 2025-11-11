import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  Alert,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import AuthFooter from "../../components/auth/AuthFooter";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";
import { useTranslation } from "react-i18next";
import { supabase } from "../../services/supabase";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
    },
    logoContainer: {
      alignItems: "center",
      marginTop: 40,
      marginBottom: 40,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      ...FONTS.h2,
      color: colors.textPrimary,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
    },
    subtitle: {
      ...FONTS.body3,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      paddingHorizontal: 20,
    },
    formContainer: {
      marginBottom: 20,
    },
  });

  const validateEmail = () => {
    if (!email) {
      setEmailError(t("screens.auth.forgotPassword.emailRequired"));
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t("screens.auth.forgotPassword.emailInvalid"));
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleResetPassword = async () => {
    const isEmailValid = validateEmail();

    if (!isEmailValid) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "quorax://reset-password",
      });

      if (error) {
        if (__DEV__) console.error("❌ FORGOT PASSWORD ERROR:", error.message);

        let errorMessage = t("screens.auth.forgotPassword.errors.generic");
        if (error.message.includes("User not found")) {
          errorMessage = t("screens.auth.forgotPassword.errors.userNotFound");
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = t("screens.auth.forgotPassword.errors.emailNotConfirmed");
        }

        Alert.alert(t("common.error"), errorMessage);
        return;
      }

      setIsEmailSent(true);

      Alert.alert(
        t("screens.auth.forgotPassword.success.title"),
        t("screens.auth.forgotPassword.success.message", { email }),
        [
          {
            text: t("screens.auth.forgotPassword.success.understood"),
            onPress: () => navigation.navigate("Login"),
          },
          {
            text: t("screens.auth.forgotPassword.success.resend"),
            onPress: () => {
              setIsEmailSent(false);
              handleResetPassword();
            },
          },
        ]
      );
    } catch (err) {
      if (__DEV__) console.error("💥 FORGOT PASSWORD FAILED:", err.message);
      Alert.alert(
        t("common.error"),
        t("screens.auth.forgotPassword.errors.networkError")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header showBackButton title={t("screens.auth.forgotPassword.title")} />
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Lock Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={50}
                color={colors.primary}
              />
            </View>
            <Text style={styles.title}>
              {t("screens.auth.forgotPassword.heading")}
            </Text>
            <Text style={styles.subtitle}>
              {t("screens.auth.forgotPassword.description")}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label={t("auth.email")}
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.emailPlaceholder")}
              keyboardType="email-address"
              error={emailError}
              icon={
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />

            <Button
              title={t("screens.auth.forgotPassword.sendInstructions")}
              onPress={handleResetPassword}
              loading={loading}
              size="auth"
            />
          </View>

          {/* Footer */}
          <AuthFooter
            questionText={t("screens.auth.forgotPassword.backToLogin")}
            actionText={t("screens.auth.forgotPassword.loginLink")}
            onPress={() => navigation.navigate("Login")}
          />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ForgotPassword;
