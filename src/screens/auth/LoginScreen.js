// LoginScreen.js
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Input, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { FIREBASE_AUTH } from "../../../FirebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = FIREBASE_AUTH;

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await signInWithEmailAndPassword(auth, email, password);
      // navigation.replace("MainNavigator");
      console.log("response::", response);
    } catch (error) {
      console.log("Error::", error);
      setError(t(`auth.errors.${error.code}`));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      // Show error
      return;
    }
    try {
      setLoading(true);
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
            <View style={styles.logoContainer}>
              <View
                style={[
                  styles.logoBackground,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons name="document-text" size={40} color="white" />
              </View>
              <Text
                style={[styles.appName, { color: theme.colors.text }]}
                variant="h1"
              >
                DocAI
              </Text>
              <Text
                style={[
                  styles.appSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Your AI Document Assistant
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <Input
              placeholder={t("auth.email")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              theme={theme}
              icon="mail-outline"
            />

            <Input
              placeholder={t("auth.password")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              theme={theme}
              icon="lock-closed-outline"
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              style={styles.passwordInput}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotPassword}
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  { color: theme.colors.primary },
                ]}
              >
                {t("auth.forgotPassword")}
              </Text>
            </TouchableOpacity>

            <Button
              title={t("common.login")}
              onPress={handleLogin}
              loading={loading}
              theme={theme}
              style={styles.loginButton}
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
                  //google
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
                  /* Apple login */
                }}
              >
                <Ionicons
                  name="logo-apple"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={{ color: theme.colors.textSecondary }}>
              {t("auth.noAccount")}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text
                style={[styles.registerText, { color: theme.colors.primary }]}
              >
                {t("common.register")}
              </Text>
            </TouchableOpacity>
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
    alignItems: "center",
    marginVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  passwordInput: {
    marginBottom: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 32,
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
    gap: 4,
  },
  registerText: {
    fontWeight: "600",
  },
});
