import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import SocialButtons from "../../components/auth/SocialButtons";
import AuthFooter from "../../components/auth/AuthFooter";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Login = ({ navigation }) => {
  // Test kullanıcısı bilgileri
  const [email, setEmail] = useState("test@quantumdoc.com");
  const [password, setPassword] = useState("test123456");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();
  const { login } = useAuth();
  const { t } = useTranslation();

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
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 20,
    },
    forgotPasswordText: {
      ...FONTS.body4,
      color: colors.primary,
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
    
    if (isEmailValid && isPasswordValid) {
      setLoading(true);
      try {
        await login(email, password);
        // Başarılı giriş sonrası direkt ana sayfaya yönlendirme
        // Navigation otomatik olarak Main navigator'a yönlendirecek
      } catch (error) {
        Alert.alert(
          "Giriş Hatası",
          error.message || "Giriş yapılırken bir hata oluştu"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header showBackButton />
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{t("screens.auth.login.title")}</Text>
          <Text style={styles.subtitle}>{t("screens.auth.login.subtitle")}</Text>

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

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>
                {t("screens.auth.login.forgotPassword")}
              </Text>
            </TouchableOpacity>

            <Button
              title={t("screens.auth.login.continue")}
              gradient
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          <SocialButtons />

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
