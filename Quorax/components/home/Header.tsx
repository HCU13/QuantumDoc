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

import { UserInitials } from "@/components/common/UserInitials";
import { SPACING, TEXT_STYLES } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  userName?: string;
  onProfilePress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userName, onProfilePress }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  const { isLoggedIn, user } = useAuth();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.content} pointerEvents="box-none">
        {/* Left: Logo + Greeting */}
        <View style={styles.left} pointerEvents="box-none">
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
          />
          <View>
            <Text style={[styles.greeting, { color: colors.textTertiary }]}>
              {t("home.greeting")}
            </Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {userName || t("home.greetingGuest")}
            </Text>
          </View>
        </View>

        {/* Right: Profile (premium halka + rozet UserInitials içinde) */}
        <View style={styles.right} pointerEvents="box-none">
          <TouchableOpacity
            onPress={onProfilePress}
            activeOpacity={0.7}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <UserInitials name={userName} email={user?.email} size={36} isPremium={isLoggedIn && isPremium} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 52 : 20,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    zIndex: 10,
    elevation: 10,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  logo: {
    width: 32,
    height: 32,
  },
  greeting: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 11,
    marginBottom: 1,
  },
  userName: {
    ...TEXT_STYLES.bodyMedium,
    fontWeight: "600",
    fontSize: 15,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
});
