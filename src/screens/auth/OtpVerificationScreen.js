// 🔐 OTP VERIFICATION SCREEN
// 6 haneli kod girişi için ekran

import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  Text, 
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { TEXT_STYLES, SPACING, BORDER_RADIUS } from "../../constants/theme";

const OtpVerificationScreen = ({ navigation, route }) => {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const { colors } = useTheme();
  const { t } = useTranslation();
  const { verifyOtp, resendOtp, loading } = useAuth();
  const { email } = route.params || {};

  // OTP input refs
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      setCanResend(false);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (newOtp.every(digit => digit !== '') && !verifying) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleBackspace = (index) => {
    if (otpCode[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code = null) => {
    const finalCode = code || otpCode.join('');
    
    if (finalCode.length !== 6) {
      Alert.alert("Hata", "Lütfen 6 haneli kodu tam olarak girin");
      return;
    }

    setVerifying(true);
    
    try {
      await verifyOtp(email, finalCode);
      
      Alert.alert(
        "Başarılı! 🎉",
        "Email adresiniz doğrulandı. Şimdi giriş yapabilirsiniz.",
        [
          {
            text: "Tamam",
            onPress: () => {
              // Navigate to login or home
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert("Doğrulama Hatası", error.message);
      // Clear OTP inputs
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(email);
      setCountdown(60);
      Alert.alert("Kod Gönderildi", "Yeni doğrulama kodu email adresinize gönderildi");
    } catch (error) {
      Alert.alert("Hata", error.message);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.xl,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
    },
    icon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.lg,
    },
    title: {
      ...TEXT_STYLES.h2,
      color: colors.text,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    subtitle: {
      ...TEXT_STYLES.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    email: {
      ...TEXT_STYLES.bodyBold,
      color: colors.primary,
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: SPACING.xl,
      paddingHorizontal: SPACING.md,
    },
    otpInput: {
      width: 45,
      height: 55,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: BORDER_RADIUS.md,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      backgroundColor: colors.card,
    },
    otpInputActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    otpInputFilled: {
      borderColor: colors.success,
      backgroundColor: colors.success + '10',
    },
    verifyButton: {
      marginTop: SPACING.lg,
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: SPACING.xl,
    },
    resendText: {
      ...TEXT_STYLES.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    resendButton: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
    },
    resendButtonText: {
      ...TEXT_STYLES.bodyBold,
      color: colors.primary,
    },
    resendButtonDisabled: {
      opacity: 0.5,
    },
    countdown: {
      ...TEXT_STYLES.caption,
      color: colors.textSecondary,
      marginTop: SPACING.xs,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: SPACING.xl,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
    },
    backButtonText: {
      ...TEXT_STYLES.body,
      color: colors.textSecondary,
      marginLeft: SPACING.xs,
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header 
          title="Email Doğrulama"
          showBack
          onBack={() => navigation.goBack()}
        />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.titleContainer}>
            <View style={styles.icon}>
              <Ionicons 
                name="mail-outline" 
                size={40} 
                color={colors.primary} 
              />
            </View>
            
            <Text style={styles.title}>
              Doğrulama Kodu
            </Text>
            
            <Text style={styles.subtitle}>
              <Text style={styles.email}>{email}</Text> adresine gönderilen{'\n'}
              6 haneli kodu girin
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otpCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  // Add active style if focused
                ]}
                value={digit}
                onChangeText={(value) => {
                  if (value.length <= 1 && /^\d*$/.test(value)) {
                    handleOtpChange(value, index);
                  }
                }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') {
                    handleBackspace(index);
                  }
                }}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Manual Verify Button */}
          <Button
            title="Doğrula"
            onPress={() => handleVerifyOtp()}
            loading={verifying || loading}
            disabled={otpCode.join('').length !== 6}
            style={styles.verifyButton}
          />

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Kod gelmedi mi?
            </Text>
            
            <TouchableOpacity
              style={[
                styles.resendButton,
                !canResend && styles.resendButtonDisabled
              ]}
              onPress={handleResendOtp}
              disabled={!canResend || loading}
            >
              <Text style={styles.resendButtonText}>
                Yeniden Gönder
              </Text>
            </TouchableOpacity>
            
            {!canResend && (
              <Text style={styles.countdown}>
                {countdown} saniye sonra tekrar deneyin
              </Text>
            )}
          </View>

          {/* Back to Registration */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons 
              name="arrow-back" 
              size={16} 
              color={colors.textSecondary} 
            />
            <Text style={styles.backButtonText}>
              Kayıt sayfasına dön
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default OtpVerificationScreen;
