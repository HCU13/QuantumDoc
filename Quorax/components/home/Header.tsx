import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { UserInitials } from "@/components/common/UserInitials";
import { SPACING } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  userName?: string;
  onProfilePress: () => void;
}

/** Notebook page header: date on the left, page number on the right, avatar far right. */
export const Header: React.FC<HeaderProps> = ({ userName, onProfilePress }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  const { isLoggedIn, user } = useAuth();

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.metaRow}>
        <Text style={[styles.pageMeta, { color: colors.textTertiary }]}>
          {formatToday()}
        </Text>
        <Text style={[styles.pageMeta, { color: colors.textTertiary }]}>
          — 01 —
        </Text>
      </View>

      <View style={styles.titleRow} pointerEvents="box-none">
        <View style={styles.titleBlock}>
          <Text style={[styles.section, { color: colors.primary }]}>
            §  {t("home.greeting")}
          </Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {userName || t("home.greetingGuest")}
          </Text>
          <View style={[styles.underline, { backgroundColor: colors.primary }]} />
        </View>

        <TouchableOpacity
          onPress={onProfilePress}
          activeOpacity={0.7}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <UserInitials
            name={userName}
            email={user?.email}
            size={40}
            isPremium={isLoggedIn && isPremium}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

function formatToday(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 56 : 24,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  pageMeta: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.5,
    fontVariant: ["tabular-nums"],
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  titleBlock: {
    flex: 1,
  },
  section: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginBottom: SPACING.sm,
  },
  underline: {
    width: 40,
    height: 3,
    borderRadius: 2,
    opacity: 0.85,
  },
});
