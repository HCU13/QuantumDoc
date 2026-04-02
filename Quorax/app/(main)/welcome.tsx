import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/contexts/ThemeContext";
import { BORDER_RADIUS, SPACING } from "@/constants/theme";

export default function WelcomeScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const handleGuest = async () => {
    try {
      await AsyncStorage.setItem("@guest_mode", "true");
    } catch {}
    router.replace("/(main)");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Logo + Brand */}
      <View style={styles.brandSection}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.appName, { color: colors.textPrimary }]}>QUORAX</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          {t("welcome.tagline")}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/(main)/login")}>
          <LinearGradient
            colors={["#8A4FFF", "#6932E0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>{t("welcome.signIn")}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.outlineButton, { borderColor: colors.primary }]}
          onPress={() => router.push("/(main)/signup")}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add-outline" size={20} color={colors.primary} />
          <Text style={[styles.outlineButtonText, { color: colors.primary }]}>
            {t("welcome.createAccount")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestButton} onPress={handleGuest} activeOpacity={0.7}>
          <Text style={[styles.guestButtonText, { color: colors.textTertiary }]}>
            {t("welcome.continueAsGuest")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    justifyContent: "space-between",
  },
  brandSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 22,
    marginBottom: 16,
  },
  appName: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  buttonSection: {
    gap: SPACING.sm,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  guestButton: {
    alignItems: "center",
    paddingVertical: SPACING.sm + 2,
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
