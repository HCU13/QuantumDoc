import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, Text, Alert, TouchableOpacity } from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";
import { useTranslation } from "react-i18next";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();
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
      ...FONTS.body3,
      color: colors.textOnGradient,
      marginBottom: 30,
    },
    formContainer: {
      marginBottom: 20,
    },
    backToLogin: {
      alignItems: "center",
      marginTop: 20,
    },
    backToLoginText: {
      ...FONTS.body3,
      color: colors.textSecondary,
    },
  });

  const validateEmail = () => {
    if (!email) {
      setEmailError("E-posta adresi gerekli");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Geçerli bir e-posta adresi girin");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleResetPassword = () => {
    const isEmailValid = validateEmail();

    if (isEmailValid) {
      setLoading(true);
      // API çağrısı burada yapılacak
      setTimeout(() => {
        setLoading(false);
        // Başarılı şifre sıfırlama talebi sonrası bilgilendirme
        Alert.alert(
          "Şifre Sıfırlama",
          "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
          [{ text: "Tamam", onPress: () => navigation.navigate("Login") }]
        );
      }, 1500);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title="Şifremi Unuttum" />

        <View style={styles.content}>
          <Text style={styles.title}>{t("screens.auth.forgotPassword.title")}</Text>
          <Text style={styles.subtitle}>
            {t("screens.auth.forgotPassword.subtitle")}
          </Text>

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
              gradient
              onPress={handleResetPassword}
              loading={loading}
            />
          </View>

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.backToLoginText}>
              {t("screens.auth.forgotPassword.backToLogin")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ForgotPassword;