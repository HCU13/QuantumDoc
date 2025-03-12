import React, { useState, useEffect, useRef } from "react";
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
  StatusBar,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text, Input, Button, Card } from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext"; // Import the theme hook

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  // Get theme and dark mode status
  const { theme, isDark } = useTheme();
  const { login } = useAuth();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // State for form fields and validation
  const [email, setEmail] = useState("trooper1803@gmail.com");
  const [password, setPassword] = useState("123123123");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Start entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  // Handle login
  const handleLogin = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);
        // Firebase login
        await login(email, password);
      } catch (error) {
        console.error("Login error:", error);
        setErrors({ general: error.message || "Login failed" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Gradient Background - Adjusted for dark mode */}
          <LinearGradient
            colors={
              isDark
                ? [theme.colors.primary + "80", theme.colors.background]
                : [theme.colors.primary, theme.colors.secondary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topGradient}
          >
            {/* App Logo */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.logoBackground}>
                <Text style={styles.logoText}>🤖</Text>
              </View>
              <Text variant="h2" color="#FFFFFF" style={styles.appName}>
                QuantumDoc
              </Text>
              <Text variant="body2" color="#FFFFFF" style={styles.appTagline}>
                AI-Powered Document Analysis
              </Text>
            </Animated.View>
          </LinearGradient>

          {/* Login Card - Updated with theme-aware styling */}
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Card
              style={styles.loginCard}
              variant={isDark ? "default" : "bordered"}
              elevated={true}
            >
              <Text variant="h3" style={styles.loginTitle}>
                Welcome Back
              </Text>
              <Text
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.loginSubtitle}
              >
                Sign in to continue to your account
              </Text>

              {/* Error message if login fails */}
              {errors.general && (
                <View
                  style={[
                    styles.errorContainer,
                    { backgroundColor: theme.colors.error + "20" },
                  ]}
                >
                  <Text variant="body2" color={theme.colors.error}>
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
                <Text variant="body2" color={theme.colors.primary}>
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
                <Text variant="body2" color={theme.colors.textSecondary}>
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text
                    variant="body2"
                    color={theme.colors.primary}
                    weight="semibold"
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topGradient: {
    height: height * 0.38,
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
