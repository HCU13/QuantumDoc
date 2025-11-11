import React from "react";
import { View, Text, StyleSheet } from "react-native";
import TabSwitch from "./TabSwitch";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { TEXT_STYLES, SPACING, BORDER_RADIUS } from "../../constants/theme";
import { COLORS } from "../../constants/colors";

const ModuleModeSelector = ({
  moduleId,
  moduleColor,
  modes,
  selectedMode,
  onModeChange,
  descriptionKeyPrefix,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  // Modül rengini al
  const finalModuleColor = moduleColor || colors.primary;

  // Description key'i oluştur
  const descriptionKey = descriptionKeyPrefix
    ? `${descriptionKeyPrefix}.modeDescriptions.${selectedMode}`
    : `${moduleId}.modeDescriptions.${selectedMode}`;

  // Hex rengini rgba'ya çevir (basit yaklaşım)
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: SPACING.md,
    },
    descriptionContainer: {
      marginTop: SPACING.md,
      paddingVertical: SPACING.md + 4,
      paddingHorizontal: SPACING.md + 4,
      backgroundColor: isDark
        ? hexToRgba(finalModuleColor, 0.1)
        : hexToRgba(finalModuleColor, 0.06),
      borderRadius: BORDER_RADIUS.md + 2,
      borderLeftWidth: 3,
      borderLeftColor: finalModuleColor,
    },
    descriptionText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "400",
    },
  });

  // Çeviri anahtarını kontrol et
  const description = t(descriptionKey, { defaultValue: "" });

  return (
    <View style={styles.container}>
      <TabSwitch
        options={modes}
        selectedValue={selectedMode}
        onValueChange={onModeChange}
        module={moduleId}
      />
      {description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      )}
    </View>
  );
};

export default ModuleModeSelector;
