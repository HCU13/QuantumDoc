import React from "react";
import { View, Text, StyleSheet } from "react-native";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import {
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";

const ModuleIntroCard = ({ moduleId, moduleColor }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  // Modül rengini al
  const finalModuleColor = moduleColor || colors.primary;

  const descriptionKey = `${moduleId}.intro.description`;

  const styles = StyleSheet.create({
    introCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.small,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 3,
      borderLeftColor: finalModuleColor,
    },
    introText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
    },
  });

  // Çeviri anahtarını kontrol et
  const description = t(descriptionKey, { defaultValue: "" });

  if (!description) {
    return null;
  }

  return (
    <View style={styles.introCard}>
      <Text style={styles.introText}>{description}</Text>
    </View>
  );
};

export default ModuleIntroCard;
