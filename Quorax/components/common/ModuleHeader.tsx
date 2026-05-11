import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  I18nManager,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BORDER_RADIUS, HIT_SLOP, SPACING } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface ModuleHeaderProps {
  title: string;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  /**
   * Optional accent color for the section title + underline.
   * Defaults to theme primary; modules pass their own brand tint.
   */
  modulePrimary?: string;
  /** Legacy prop, kept silently for back-compat. Ignored visually. */
  moduleLight?: string;
}

/**
 * Notebook-dialect page header used across inner screens.
 * Layout: back button — § SECTION TITLE — right action.
 * Sits flat on top of NotebookBackground, no border, no card.
 */
export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  onBackPress,
  rightAction,
  modulePrimary,
}) => {
  const { colors } = useTheme();
  const router = useRouter();

  const accent = modulePrimary ?? colors.primary;

  const handleBackPress = () => {
    if (onBackPress) onBackPress();
    else router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleBackPress}
          hitSlop={HIT_SLOP.medium}
          activeOpacity={0.7}
          style={[
            styles.backBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="back"
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={colors.textPrimary}
            style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
          />
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text
            style={[styles.title, { color: accent }]}
            numberOfLines={1}
          >
            §  {title}
          </Text>
          <View style={[styles.accent, { backgroundColor: accent }]} />
        </View>

        <View style={styles.right}>{rightAction}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md + 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  accent: {
    width: 28,
    height: 3,
    borderRadius: 2,
    opacity: 0.85,
    marginTop: 6,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
});
