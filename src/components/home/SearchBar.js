import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { FONTS, SIZES, TEXT_STYLES, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";

const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  onVoicePress,
  placeholder,
  containerStyle,
}) => {
  const { colors, shadows, isDark } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      paddingHorizontal: SPACING.md,
      marginVertical: SPACING.xs,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? colors.card + '80' : colors.white + 'F0',
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      height: 42,
      borderWidth: 1,
      borderColor: isDark ? colors.border + '40' : colors.border + '60',
      ...SHADOWS.small,
    },
    input: {
      flex: 1,
      ...TEXT_STYLES.bodyMedium,
      color: colors.textPrimary,
      paddingVertical: 0,
      height: '100%',
      textAlignVertical: 'center',
    },
    searchIcon: {
      marginRight: SPACING.xs,
      opacity: 0.7,
    },
    voiceButton: {
      padding: SPACING.xs,
      borderRadius: BORDER_RADIUS.xs,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || t("home.searchPlaceholder")}
          placeholderTextColor={colors.textTertiary}
          onSubmitEditing={onSubmit}
        />

        {onVoicePress && (
          <TouchableOpacity style={styles.voiceButton} onPress={onVoicePress}>
            <Ionicons name="mic-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchBar;