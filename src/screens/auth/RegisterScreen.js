import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Input, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { showToast } from "../../utils/toast";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../../hooks/useAuth";

export const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { saveUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const auth = FIREBASE_AUTH;
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Check required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = t("auth.errors.required-name") || "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = t("auth.errors.invalid-email") || "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("auth.errors.invalid-email") || "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password =
        t("auth.errors.required-password") || "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password =
        t("auth.errors.weak-password") ||
        "Password must be at least 6 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword =
        t("auth.errors.password-mismatch") || "Passwords don't match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create user with Firebase Authentication
      const response = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = response.user;

      // Update user profile with full name
      await updateProfile(user, {
        displayName: formData.fullName,
      });

      // Add user to Firestore database
      const userDocRef = await addDoc(collection(FIRESTORE_DB, "users"), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      console.log("User registered with ID: ", userDocRef.id);

      // Kullanıcı bilgilerini SecureStore'a kaydet
      await saveUser(user);

      console.log("User registered and data saved to SecureStore");

      // Başarı bildirimi
      showToast.success(
        "Registration Successful",
        "Your account has been created successfully"
      );

      // Ana ekrana yönlendir
      navigation.reset({
        index: 0,
        routes: [{ name: "MainNavigator" }],
      });
    } catch (error) {
      console.error("Registration error:", error);
      // Handle specific error codes
      const errorCode = error.code || "auth/unknown-error";

      if (errorCode === "auth/email-already-in-use") {
        setErrors({
          ...errors,
          email:
            t("auth.errors.email-already-in-use") || "Email already in use",
        });
      } else {
        // Show general error
        setErrors({
          ...errors,
          general: t(`auth.errors.${errorCode}`) || error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[
                styles.backButton,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <Text
              variant="h1"
              style={[styles.title, { color: theme.colors.text }]}
            >
              {t("auth.registerTitle")}
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              {t("auth.registerSubtitle")}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder={t("auth.fullName") || "Full Name"}
              value={formData.fullName}
              onChangeText={(value) => updateFormData("fullName", value)}
              theme={theme}
              icon="person-outline"
              error={errors.fullName}
            />

            <Input
              placeholder={t("auth.email") || "Email"}
              value={formData.email}
              onChangeText={(value) => updateFormData("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              theme={theme}
              icon="mail-outline"
              error={errors.email}
            />

            <Input
              placeholder={t("auth.password") || "Password"}
              value={formData.password}
              onChangeText={(value) => updateFormData("password", value)}
              secureTextEntry={!showPassword}
              theme={theme}
              icon="lock-closed-outline"
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password}
            />

            <Input
              placeholder={t("auth.confirmPassword") || "Confirm Password"}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData("confirmPassword", value)}
              secureTextEntry={!showConfirmPassword}
              theme={theme}
              icon="lock-closed-outline"
              rightIcon={
                showConfirmPassword ? "eye-off-outline" : "eye-outline"
              }
              onRightIconPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              error={errors.confirmPassword}
            />

            <Text
              style={[styles.termsText, { color: theme.colors.textSecondary }]}
            >
              {t("auth.termsText")}{" "}
              <Text style={{ color: theme.colors.primary }}>
                {t("auth.termsLink")}
              </Text>{" "}
              {t("common.and")}{" "}
              <Text style={{ color: theme.colors.primary }}>
                {t("auth.privacyLink")}
              </Text>
            </Text>

            <Button
              title={t("common.register")}
              onPress={handleRegister}
              loading={loading}
              theme={theme}
              style={styles.registerButton}
            />

            <View style={styles.divider}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.colors.border },
                ]}
              />
              <Text
                style={[
                  styles.dividerText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t("common.or")}
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => {
                  /* Google registration */
                }}
              >
                <Ionicons
                  name="logo-google"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => {
                  /* Apple registration */
                }}
              >
                <Ionicons
                  name="logo-apple"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={{ color: theme.colors.textSecondary }}>
                {t("auth.alreadyHaveAccount")}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text
                  style={[styles.loginText, { color: theme.colors.primary }]}
                >
                  {t("common.login")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  registerButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 4,
  },
  loginText: {
    fontWeight: "600",
  },
});
