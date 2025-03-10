import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text, Input, Button, Card } from "../../components";
import { useAuth } from "../../context/AuthContext"; // AuthContext'i import et

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth(); // useAuth hook'undan login fonksiyonunu al

  // State for form fields and validation
  const [email, setEmail] = useState("trooper1803@gmail.com");
  const [password, setPassword] = useState("123123123");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Simple validation function
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login - Orijinal koddan alınan versiyonla güncellendi
  const handleLogin = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);

        // Firebase ile giriş yap
        await login(email, password);
        // NOT: AuthContext içinde zaten showToast ile başarılı mesajı gösteriliyor
        // ve kullanıcı bilgisi AuthProvider içinde ayarlanıyor

        // Navigasyon AppNavigator tarafından otomatik yapılacak,
        // ama manuel olarak da yönlendirebiliriz:
        // navigation.replace('MainNavigator');
      } catch (error) {
        console.error("Login error:", error);
        // Hata mesajı AuthContext içinde showToast ile gösteriliyor
        // ama ekranda da göstermek istiyorsak:
        setErrors({ general: error.message || "Login failed" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Gradient Background */}
          <LinearGradient
            colors={["#5D5FEF", "#61DAFB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topGradient}
          >
            {/* App Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Text style={styles.logoText}>🤖</Text>
              </View>
              <Text variant="h2" color="#FFFFFF" style={styles.appName}>
                QuantumDoc
              </Text>
              <Text variant="body2" color="#FFFFFF" style={styles.appTagline}>
                AI-Powered Document Analysis
              </Text>
            </View>
          </LinearGradient>

          {/* Login Card */}
          <Card style={styles.loginCard}>
            <Text variant="h3" style={styles.loginTitle}>
              Welcome Back
            </Text>
            <Text variant="body2" color="#64748B" style={styles.loginSubtitle}>
              Sign in to continue to your account
            </Text>

            {/* Error message if login fails */}
            {errors.general && (
              <View style={styles.errorContainer}>
                <Text variant="body2" color="#EF4444">
                  {errors.general}
                </Text>
              </View>
            )}

            {/* Email Input */}
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              errorText={errors.email}
              leftIcon={<Text>📧</Text>}
              style={styles.input}
            />

            {/* Password Input */}
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              error={!!errors.password}
              errorText={errors.password}
              leftIcon={<Text>🔒</Text>}
              style={styles.input}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text variant="body2" color="#5D5FEF">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              gradient={true}
              style={styles.loginButton}
            />

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text variant="body2" color="#64748B">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text variant="body2" color="#5D5FEF" weight="semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topGradient: {
    height: height * 0.35,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    marginBottom: 8,
  },
  appTagline: {
    opacity: 0.9,
  },
  loginCard: {
    marginTop: -height * 0.08,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 24,
  },
  loginTitle: {
    marginBottom: 8,
  },
  loginSubtitle: {
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 16,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
});

export default LoginScreen;
