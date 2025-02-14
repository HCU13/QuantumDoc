// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@components/common/Text";
import { Button } from "@components/common/Button";
import { Input } from "@components/common/Input";
import { useTheme } from "@hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Image */}
          <View style={styles.imageContainer}>
            {/* <Image
              source={require("@/assets/images/forgot-password.png")}
              style={styles.image}
              resizeMode="contain"
            /> */}
          </View>

          {/* Title and Description */}
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: theme.colors.text }]}
              variant="h2"
            >
              Forgot Password?
            </Text>
            <Text
              style={[
                styles.description,
                { color: theme.colors.textSecondary },
              ]}
            >
              Don't worry! It happens. Please enter the email address associated
              with your account.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              theme={theme}
              leftIcon="mail-outline"
              containerStyle={styles.input}
            />

            <Button
              title="Send Reset Link"
              onPress={() => {}}
              theme={theme}
              style={styles.button}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.linkContainer}
            >
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Remember Password? Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  image: {
    width: 200,
    height: 200,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  linkContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
