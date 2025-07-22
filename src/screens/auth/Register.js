import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import AuthFooter from "../../components/auth/AuthFooter";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";
import { useTranslation } from "react-i18next";

const Register = ({ navigation }) => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
    },
    title: {
      ...FONTS.h2,
      color: colors.textOnGradient,
      marginTop: 20,
      marginBottom: 10,
    },
    subtitle: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      marginBottom: 30,
      fontSize: 15,
      lineHeight: 21,
    },
    formContainer: {
      marginBottom: 20,
    },
  });

  const validateFullName = () => {
    if (!fullName) {
      setFullNameError(t("auth.errors.fullNameRequired"));
      return false;
    }
    setFullNameError("");
    return true;
  };

  const validateEmail = () => {
    if (!email) {
      setEmailError(t("auth.errors.emailRequired"));
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t("auth.errors.invalidEmail"));
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError(t("auth.errors.passwordRequired"));
      return false;
    } else if (password.length < 6) {
      setPasswordError(t("auth.errors.passwordLength"));
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError(t("auth.errors.confirmPasswordRequired"));
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError(t("auth.errors.passwordsDontMatch"));
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleRegister = () => {
    const isFullNameValid = validateFullName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (
      isFullNameValid &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    ) {
      setLoading(true);
      // API çağrısı burada yapılacak
      setTimeout(() => {
        setLoading(false);
        // Başarılı kayıt sonrası giriş sayfasına yönlendirme
        navigation.navigate("Login");
      }, 1500);
    }
  };

  return (
    <GradientBackground mode="default">
      <SafeAreaView style={styles.container}>
        {/* Geri Butonu */}
        <TouchableOpacity
          style={{ padding: 8, marginLeft: 4, marginTop: 4, alignSelf: 'flex-start' }}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Geri"
        >
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{t("screens.auth.register.title")}</Text>
            <Text style={styles.subtitle}>
              {t("screens.auth.register.subtitle")}
            </Text>

            <View style={styles.formContainer}>
              <Input
                label={t("auth.fullName")}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t("auth.fullNamePlaceholder")}
                error={fullNameError}
                autoCapitalize="words"
                icon={
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                }
              />

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

              <Input
                label={t("auth.password")}
                value={password}
                onChangeText={setPassword}
                placeholder={t("auth.passwordPlaceholder")}
                secureTextEntry
                error={passwordError}
                icon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                }
              />

              <Input
                label={t("auth.confirmPassword")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t("auth.confirmPasswordPlaceholder")}
                secureTextEntry
                error={confirmPasswordError}
                icon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                }
              />
              <View style={{ height: 20 }} />
              <Button
                title={t("screens.auth.register.title")}
                gradient
                onPress={handleRegister}
                loading={loading}
                size="auth"
              />
            </View>

            <AuthFooter
              questionText={t("screens.auth.register.haveAccount")}
              actionText={t("screens.auth.register.login")}
              onPress={() => navigation.navigate("Login")}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Register;
