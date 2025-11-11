import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import SocialButtons from "../../components/auth/SocialButtons";
import AuthFooter from "../../components/auth/AuthFooter";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { showSuccess } from "../../utils/toast";

const Login = ({ navigation, route }) => {
  const verifiedEmail = route?.params?.verifiedEmail || "";
  const welcomeMessage = route?.params?.message || "";

  const [email, setEmail] = useState(
    verifiedEmail || "trooperzone13@gmail.com"
  );
  const [password, setPassword] = useState("123123Aa");
  // const [email, setEmail] = useState(verifiedEmail || "");
  // const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { colors } = useTheme();
  const { t } = useTranslation();
  const { login, loading: authLoading } = useAuth();

  // Welcome mesajını göster
  useEffect(() => {
    if (welcomeMessage) {
      setTimeout(() => {
        showSuccess("Başarılı", welcomeMessage);
      }, 500);
    }
  }, [welcomeMessage]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
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
    logo: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      overflow: 'hidden',
    },
    logoImage: {
      width: 100,
      height: 100,
    },
    title: {
      ...FONTS.h2,
      color: colors.textOnGradient,
      fontWeight: "bold",
      textAlign: "center",
    },
    formContainer: {
      marginBottom: 20,
    },
    forgotPasswordCentered: {
      alignItems: "center",
      marginBottom: 30,
    },
    forgotPasswordText: {
      ...FONTS.body4,
      color: colors.primary,
      textAlign: "center",
    },
  });

  const validateEmail = () => {
    if (!email) {
      setEmailError(t("screens.auth.login.errors.emailRequired"));
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t("screens.auth.login.errors.invalidEmail"));
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError(t("screens.auth.login.errors.passwordRequired"));
      return false;
    } else if (password.length < 6) {
      setPasswordError(t("screens.auth.login.errors.passwordLength"));
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) return;

    try {
      const result = await login(email, password, navigation);

      // Email doğrulama gerekiyorsa, login fonksiyonu zaten yönlendirdi
      if (result?.needsVerification) {
        if (__DEV__)
          console.log(
            "📧 Email verification needed, redirected to verification screen"
          );
        return;
      }

      if (result?.success) {
        // Login başarılı - AuthContext state'i güncellendi, AppNavigator otomatik yönlendirecek
        if (__DEV__)
          console.log(
            "✅ Login successful, AuthContext updated, AppNavigator will redirect to Main"
          );
      }
    } catch (error) {
      // Hata durumunda Login screen'de kal - navigation yapmıyoruz
      if (__DEV__) console.log("❌ Login failed, staying on login screen");
      // Error toast AuthContext'de zaten gösterildi
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo ve Title */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>{t("screens.auth.login.title")}</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label={t("auth.email")}
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
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

            {/* Şifremi Unuttum - Ortalanmış */}
            <TouchableOpacity
              style={styles.forgotPasswordCentered}
              onPress={() => navigation.navigate("ResetPassword")}
            >
              <Text style={styles.forgotPasswordText}>
                {t("screens.auth.login.forgotPassword")}
              </Text>
            </TouchableOpacity>

            <Button
              title={t("screens.auth.login.continue")}
              gradient
              onPress={handleLogin}
              loading={authLoading}
              disabled={authLoading}
            />
          </View>

          {/* Social Login - Gelecekte eklenecek
          <SocialButtons
            onGooglePress={handleGoogleLogin}
            onApplePress={handleAppleLogin}
            onFacebookPress={handleFacebookLogin}
          />
          */}

          <AuthFooter
            questionText={t("screens.auth.login.noAccount")}
            actionText={t("screens.auth.login.register")}
            onPress={() => navigation.navigate("Register")}
          />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Login;
