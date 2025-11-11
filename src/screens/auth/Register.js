import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
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
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { avatarToString } from "../../utils/avatarUtils";
import Avatar from "@zamplyy/react-native-nice-avatar";
import AvatarSelector from "../../components/common/AvatarSelector";
import { genConfig } from "@zamplyy/react-native-nice-avatar";

const { width } = Dimensions.get("window");

const Register = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(genConfig({ seed: 0 }));
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const { colors } = useTheme();
  const { register, loading: authLoading } = useAuth();

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
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      position: "relative",
    },
    editIconBadge: {
      position: "absolute",
      bottom: -5,
      right: -5,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.background,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    avatarText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: "center",
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

  const handleRegister = async () => {
    const isFullNameValid = validateFullName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (
      !(
        isFullNameValid &&
        isEmailValid &&
        isPasswordValid &&
        isConfirmPasswordValid
      )
    )
      return;

    try {
      if (__DEV__) console.log("🔄 REGISTER: Starting register process");

      // Avatar'ı JSON string'e çevir
      const avatarString = avatarToString(selectedAvatar);

      // AuthContext'e navigation verme - kendimiz handle edelim
      const result = await register({
        email,
        password,
        fullName,
        phone,
        avatar_url: avatarString,
      });

      if (__DEV__) console.log("✅ REGISTER: Result:", result);

      // Register başarılı ise EmailVerification'a git
      if (result?.success && result?.needsConfirmation) {
        navigation.navigate("EmailVerification", { email });
      }
    } catch (error) {
      if (__DEV__) console.log("❌ REGISTER: Register failed:", error.message);
      // Hata durumunda Register screen'de kal
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header showBackButton title={t("screens.auth.register.title")} />
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo ve Title */}
          <View style={styles.logoContainer}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => setShowAvatarSelector(true)}
              activeOpacity={0.8}
            >
              <Avatar style={{ width: 74, height: 74 }} {...selectedAvatar} />
              <View style={styles.editIconBadge}>
                <Ionicons name="happy" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            {/* <Text style={styles.avatarText}>
              {t("screens.auth.register.selectAvatar")}
            </Text> */}
          </View>

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
              loading={authLoading}
              size="auth"
            />
          </View>
          {/* <SocialButtons
            onGooglePress={() => console.log("Google ile kayıt")}
            onApplePress={() => console.log("Apple ile kayıt")}
            onFacebookPress={() => console.log("Facebook ile kayıt")}
          /> */}

          <AuthFooter
            questionText={t("screens.auth.register.haveAccount")}
            actionText={t("screens.auth.register.login")}
            onPress={() => navigation.navigate("Login")}
          />
        </ScrollView>
      </SafeAreaView>

      {/* Avatar Seçici Modal - Modern AvatarSelector Component */}
      <AvatarSelector
        visible={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        onSelect={(avatar) => {
          setSelectedAvatar(avatar);
        }}
        currentAvatar={selectedAvatar}
        title={t("screens.auth.register.selectAvatar")}
      />
    </GradientBackground>
  );
};

export default Register;
