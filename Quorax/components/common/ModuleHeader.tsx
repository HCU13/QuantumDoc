import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/contexts/ThemeContext";
import { useToken } from "@/contexts/TokenContext";
import { useAuth } from "@/contexts/AuthContext";
import { SPACING, BORDER_RADIUS, TEXT_STYLES } from "@/constants/theme";

interface ModuleHeaderProps {
  title: string;
  tokens?: number; // Optional: Override context tokens if provided
  showTokens?: boolean; // Show tokens from context if true
  onTokenPress?: () => void;
  onBackPress?: () => void;
  modulePrimary?: string; // Modül primary rengi
  moduleLight?: string; // Modül light rengi
  rightAction?: React.ReactNode; // Sağ tarafta gösterilecek custom action
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  tokens: tokensProp,
  showTokens = false,
  onTokenPress,
  onBackPress,
  modulePrimary,
  moduleLight,
  rightAction,
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  const { tokens: contextTokens } = useToken();
  const { isLoggedIn } = useAuth();

  // Use prop tokens if provided, otherwise use context tokens if showTokens is true
  const tokens = tokensProp !== undefined ? tokensProp : (showTokens && isLoggedIn ? contextTokens : undefined);

  const primaryColor = modulePrimary || colors.primary;
  const lightColor = moduleLight || colors.primarySoft;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left: Back Button + Title */}
        <View style={styles.left}>
          <TouchableOpacity
            onPress={handleBackPress}
            activeOpacity={0.7}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.card,
              },
            ]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right: Token veya Custom Action */}
        <View style={styles.right}>
          {rightAction ? (
            rightAction
          ) : tokens !== undefined ? (
            <TouchableOpacity
              onPress={onTokenPress}
              activeOpacity={0.7}
              style={[styles.token, { backgroundColor: lightColor }]}
            >
              <Ionicons name="diamond-outline" size={14} color={primaryColor} />
              <Text style={[styles.tokenText, { color: primaryColor }]}>
                {tokens.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ) : null}
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
    gap: SPACING.md,
    flex: 1,
    marginRight: SPACING.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...TEXT_STYLES.titleMedium,
    fontWeight: "700",
    fontSize: 18,
    flex: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  token: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    gap: 6,
  },
  tokenText: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
    fontWeight: "600",
  },
});
