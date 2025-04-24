import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, ScrollView, Text } from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import SocialButtons from "../../components/auth/SocialButtons";
import AuthFooter from "../../components/auth/AuthFooter";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";

const Register = ({ navigation }) => {
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
      ...FONTS.body3,
      color: colors.textOnGradient,
      marginBottom: 30,
    },
    formContainer: {
      marginBottom: 20,
    },
  });

  const validateFullName = () => {
    if (!fullName) {
      setFullNameError("Ad Soyad gerekli");
      return false;
    }
    setFullNameError("");
    return true;
  };

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

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Şifre gerekli");
      return false;
    } else if (password.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalı");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("Şifre tekrarı gerekli");
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Şifreler eşleşmiyor");
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
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title="Kaydol" />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Hesap Oluşturun</Text>
          <Text style={styles.subtitle}>
            AI Asistanınıza erişmek için kaydolun
          </Text>

          <View style={styles.formContainer}>
            <Input
              label="Ad Soyad"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Adınız ve soyadınız"
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
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta adresiniz"
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
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              placeholder="Şifreniz"
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
              label="Şifre Tekrarı"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Şifrenizi tekrar girin"
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

            <Button
              title="Kaydol"
              gradient
              onPress={handleRegister}
              loading={loading}
            />
          </View>

          <SocialButtons />

          <AuthFooter
            questionText="Zaten hesabınız var mı?"
            actionText="Giriş Yapın"
            onPress={() => navigation.navigate("Login")}
          />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Register;