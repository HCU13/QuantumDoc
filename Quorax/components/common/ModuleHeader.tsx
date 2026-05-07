import React from "react";
import {
  I18nManager,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "@/contexts/ThemeContext";
import { SPACING, BORDER_RADIUS, TEXT_STYLES } from "@/constants/theme";

interface ModuleHeaderProps {
  title: string;
  onBackPress?: () => void;
  rightAction?: React.ReactNode; // Sağ tarafta gösterilecek custom action
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  onBackPress,
  rightAction,
}) => {
  const { colors } = useTheme();
  const router = useRouter();

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
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.textPrimary}
              style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
            />
          </TouchableOpacity>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right: Custom Action */}
        <View style={styles.right}>
          {rightAction ? rightAction : null}
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
});
