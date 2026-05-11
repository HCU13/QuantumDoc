import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/common/Button";
import { NotebookBackground } from "@/components/common/NotebookBackground";
import { BORDER_RADIUS, SPACING } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useHaptics } from "@/hooks/useHaptics";

export default function WelcomeScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const haptics = useHaptics();

  const handleGuest = async () => {
    haptics.selection();
    try {
      await AsyncStorage.setItem("@guest_mode", "true");
    } catch {}
    router.replace("/(main)");
  };

  return (
    <NotebookBackground cornerGlyphs={["∫", "π"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.container}>
        {/* Page header — date + page number, like a notebook page */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageMeta, { color: colors.textTertiary }]}>
            {formatToday()}
          </Text>
          <Text style={[styles.pageMeta, { color: colors.textTertiary }]}>
            — 01 —
          </Text>
        </View>

        {/* Hero — left-aligned beside the red margin rule */}
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <View
              style={[
                styles.logoMark,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.logoMarkText}>Q</Text>
            </View>
            <Text style={[styles.brand, { color: colors.textPrimary }]}>
              Quorax
            </Text>
          </View>

          <Text style={[styles.headline, { color: colors.textPrimary }]}>
            {t("welcome.tagline")}
          </Text>

          {/* Hand-written-style underline accent */}
          <View
            style={[
              styles.underlineAccent,
              { backgroundColor: colors.primary },
            ]}
          />
        </View>

        {/* CTA section */}
        <View style={styles.actions}>
          <Button
            title={t("welcome.createAccount")}
            onPress={() => {
              haptics.selection();
              router.push("/(main)/signup");
            }}
            size="large"
            fullWidth
          />

          <Pressable
            onPress={() => {
              haptics.selection();
              router.push("/(main)/login");
            }}
            style={({ pressed }) => [
              styles.signInBtn,
              {
                borderColor: colors.borderSubtle,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("welcome.signIn")}
          >
            <Text style={[styles.signInText, { color: colors.textPrimary }]}>
              {t("welcome.signIn")}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleGuest}
            style={({ pressed }) => [
              styles.guestRow,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("welcome.continueAsGuest")}
          >
            <Text style={[styles.guestText, { color: colors.textTertiary }]}>
              {t("welcome.continueAsGuest")}
            </Text>
          </Pressable>
        </View>
      </View>
    </NotebookBackground>
  );
}

function formatToday(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 36,
    paddingHorizontal: SPACING.xl,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageMeta: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.5,
    fontVariant: ["tabular-nums"],
  },

  hero: {
    flex: 1,
    justifyContent: "center",
    paddingTop: SPACING.xxl,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md + 2,
    alignItems: "center",
    justifyContent: "center",
    // soft brand-tinted lift, not a glow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  logoMarkText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  brand: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  headline: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginBottom: SPACING.md,
  },
  underlineAccent: {
    width: 56,
    height: 4,
    borderRadius: 2,
    opacity: 0.85,
  },

  actions: {
    gap: SPACING.md,
  },
  signInBtn: {
    minHeight: 54,
    borderRadius: BORDER_RADIUS.md + 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  guestRow: {
    alignItems: "center",
    paddingVertical: SPACING.sm + 2,
  },
  guestText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
