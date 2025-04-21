import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import SocialButtons from "../../components/auth/SocialButtons";
import AuthFooter from "../../components/auth/AuthFooter";
import useTheme from "../../hooks/useTheme";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
    },
    title: {
      ...FONTS.h2,
      color: colors.textPrimary,
      marginTop: 20,
      marginBottom: 10,
    },
    subtitle: {
      ...FONTS.body3,
      color: colors.textSecondary,
      marginBottom: 30,
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

  const handleLogin = () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (isEmailValid && isPasswordValid) {
      setLoading(true);
      // API çağrısı burada yapılacak
      setTimeout(() => {
        setLoading(false);
        // Başarılı giriş sonrası ana sayfaya yönlendirme
        // navigation.navigate('Home');
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Giriş Yap" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tekrar Hoşgeldiniz!</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>

        <View style={styles.formContainer}>
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

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          <Button
            title="Giriş Yap"
            gradient
            onPress={handleLogin}
            loading={loading}
          />
        </View>

        <SocialButtons />

        <AuthFooter
          questionText="Hesabınız yok mu?"
          actionText="Hemen Kaydolun"
          onPress={() => navigation.navigate("Register")}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;
