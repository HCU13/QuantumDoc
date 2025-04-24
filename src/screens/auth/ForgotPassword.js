import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, Text, Alert } from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
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
          <Text style={styles.title}>Şifrenizi mi unuttunuz?</Text>
          <Text style={styles.subtitle}>
            Endişelenmeyin! E-posta adresinizi girin, size şifre sıfırlama
            bağlantısı gönderelim.
          </Text>

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

            <Button
              title="Şifremi Sıfırla"
              gradient
              onPress={handleResetPassword}
              loading={loading}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ForgotPassword;