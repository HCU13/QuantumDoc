import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text, Input, Button, Card, Divider } from "../../components";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
const { width, height } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
  // State for form fields and validation
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const { theme } = useTheme();
  // Simple validation function
  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

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

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle registration
  const handleRegister = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);

        // Simulate registration request
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Call your registration logic here
        await register(email, password, fullName);

        // Navigate to login or main app
        // navigation.replace('Login');
      } catch (error) {
        setErrors({ general: error.message || "Registration failed" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.backButton,
                { backgroundColor: theme.colors.divider },
              ]}
              onPress={() => navigation.goBack()}
            >
              <Text>←</Text>
            </TouchableOpacity>
            <Text variant="h3">Create Account</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Registration Card */}
          <Card style={styles.registerCard}>
            <Text variant="subtitle1" style={styles.registerTitle}>
              Join QuantumDoc
            </Text>
            <Text
              variant="body2"
              color={theme.colors.text}
              style={styles.registerSubtitle}
            >
              Sign up to start analyzing documents with AI
            </Text>

            {/* Error message if registration fails */}
            {errors.general && (
              <View style={styles.errorContainer}>
                <Text variant="body2" color="#EF4444">
                  {errors.general}
                </Text>
              </View>
            )}

            {/* Full Name Input */}
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              autoCapitalize="words"
              error={!!errors.fullName}
              errorText={errors.fullName}
              leftIcon={<Text>👤</Text>}
              style={styles.input}
            />

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

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              error={!!errors.confirmPassword}
              errorText={errors.confirmPassword}
              leftIcon={<Text>🔒</Text>}
              style={styles.input}
            />

            {/* Password requirements hint */}
            <View style={styles.passwordHintContainer}>
              <Text variant="caption" color={theme.colors.text}>
                Password must be at least 6 characters long
              </Text>
            </View>

            {/* Register Button */}
            <Button
              label="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              gradient={true}
              style={styles.registerButton}
            />

            {/* <Divider text="or" />
            <View style={styles.loginContainer}>
              <Text variant="body2" color="#64748B">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text variant="body2" color="#5D5FEF" weight="semibold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View> */}
          </Card>

          {/* Bottom decorative gradient */}
          <LinearGradient
            colors={["#61DAFB40", "#5D5FEF20"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bottomGradient}
          >
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🔎</Text>
                <Text
                  variant="caption"
                  color={theme.colors.text}
                  style={{ textAlign: "center" }}
                >
                  Instant document analysis
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🤖</Text>
                <Text
                  variant="caption"
                  color={theme.colors.text}
                  style={{ textAlign: "center" }}
                >
                  AI-powered insights
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🔒</Text>
                <Text
                  variant="caption"
                  color={theme.colors.text}
                  style={{ textAlign: "center" }}
                >
                  Secure cloud storage
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  registerCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 24,
  },
  registerTitle: {
    marginBottom: 8,
  },
  registerSubtitle: {
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
  passwordHintContainer: {
    marginBottom: 24,
  },
  registerButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  bottomGradient: {
    padding: 24,
    marginHorizontal: 24,
    borderRadius: 24,
    marginBottom: 24,
  },
  benefitsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  benefitItem: {
    alignItems: "center",
    flex: 1,
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
});

export default RegisterScreen;
