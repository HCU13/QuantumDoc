import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import GradientBackground from "../../components/common/GradientBackground";
import Button from "../../components/common/Button";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { showError } from "../../utils/toast";

const EmailVerificationScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { verifyOtp, resendOtp, loading } = useAuth();
  
  // Email parametresi route'dan gelir
  const email = route?.params?.email || "";
  const fromLogin = route?.params?.fromLogin || false;
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const otpRefs = useRef([]);



  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Otomatik sonraki input'a geç
    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      showError("Hata", "Lütfen 6 haneli kodu eksiksiz girin");
      return;
    }

    try {
      await verifyOtp(email, otpCode, navigation);
      // Navigation AuthContext'te handle edilecek
    } catch (error) {
      // Error handling AuthContext'te yapılıyor
      // OTP inputlarını temizle
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    try {
      await resendOtp(email);
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (error) {
      // Error handling AuthContext'te yapılıyor
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate("Login");
  };



  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleBackToLogin}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Email Doğrulama
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={64} color={colors.primary} />
            </View>

            <Text style={[styles.subtitle, { color: colors.text }]}>
              {fromLogin ? "Email Doğrulama Gerekli" : "Doğrulama Kodu Gönderildi"}
            </Text>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {fromLogin 
                ? `${email} adresine kayıtlı hesabınızın email doğrulaması gerekiyor. Doğrulama kodunu girin.`
                : `${email} adresine 6 haneli doğrulama kodu gönderdik. Lütfen kodunuzu aşağıya girin.`
              }
            </Text>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    {
                      borderColor: digit ? colors.primary : colors.primary,
                      backgroundColor: colors.surface,
                      color: colors.text,
                      
                    },
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(event) => handleKeyPress(event, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                  <Text style={[styles.resendText, { color: colors.primary }]}>
                    {resendLoading ? "Gönderiliyor..." : "Kodu Tekrar Gönder"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.countdownText, { color: colors.textSecondary }]}>
                  Tekrar gönderebilirsiniz: {countdown}s
                </Text>
              )}
            </View>

            {/* Verify Button */}
            <Button
              title="Doğrula"
              onPress={handleVerify}
              loading={loading}
              gradient
              fluid
              size="auth"
              containerStyle={styles.button}
            />

            {/* Back to Login */}
            <TouchableOpacity onPress={handleBackToLogin} style={styles.backToLogin}>
              <Text style={[styles.backToLoginText, { color: colors.textSecondary }]}>
                Giriş ekranına dön
              </Text>
            </TouchableOpacity>


          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    ...FONTS.h3,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  subtitle: {
    ...FONTS.h3,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    ...FONTS.body3,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    ...FONTS.h3,
    fontWeight: "600",
  },
  resendContainer: {
    marginBottom: 32,
    minHeight: 20,
  },
  resendText: {
    ...FONTS.body3,
    fontWeight: "600",
  },
  countdownText: {
    ...FONTS.body4,
  },
  button: {
    marginBottom: 16,
  },
  backToLogin: {
    padding: 8,
  },
  backToLoginText: {
    ...FONTS.body4,
  },

});

export default EmailVerificationScreen;