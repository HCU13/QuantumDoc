import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { BORDER_RADIUS, HIT_SLOP, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  multiline?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  icon?: keyof typeof Ionicons.glyphMap;
  onIconPress?: () => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  editable?: boolean;
  /** "filled" = arka plan card, "ghost" = transparan + alt çizgi */
  variant?: "filled" | "ghost";
}

/**
 * 2026: 2px focus ring + tema uyumlu, geriye dönük uyumlu API.
 */
export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  keyboardType = "default",
  multiline = false,
  containerStyle,
  inputStyle,
  icon,
  onIconPress,
  autoCapitalize = "none",
  autoCorrect = false,
  editable = true,
  variant = "filled",
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPasswordToggle = secureTextEntry && value.length > 0;

  const borderColor = error
    ? colors.error
    : isFocused
      ? colors.primary
      : colors.borderSubtle;

  const ringColor = error ? colors.error : colors.focusRing;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: variant === "ghost" ? "transparent" : colors.card,
            borderColor,
            borderWidth: isFocused || error ? 1.5 : 1,
            minHeight: multiline ? 100 : 52,
            alignItems: multiline ? "flex-start" : "center",
            paddingVertical: multiline ? SPACING.sm : 0,
          },
          (isFocused || error) && {
            shadowColor: ringColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
          },
        ]}
      >
        {icon && !onIconPress && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? colors.primary : colors.textTertiary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              textAlignVertical: multiline ? "top" : "center",
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label ?? placeholder}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.passwordToggle}
            hitSlop={HIT_SLOP.medium}
            accessibilityLabel={isPasswordVisible ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        {onIconPress && icon && (
          <TouchableOpacity
            onPress={onIconPress}
            style={styles.iconButton}
            hitSlop={HIT_SLOP.medium}
          >
            <Ionicons name={icon} size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={[styles.errorText, { color: colors.error }]}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: "100%",
  },
  label: {
    ...TEXT_STYLES.labelMedium,
    marginBottom: SPACING.xs + 2,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    borderRadius: BORDER_RADIUS.md + 2,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    ...TEXT_STYLES.bodyMedium,
    fontSize: 16,
    paddingVertical: 0,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  iconButton: {
    marginLeft: SPACING.sm,
  },
  passwordToggle: {
    marginLeft: SPACING.sm,
  },
  errorText: {
    ...TEXT_STYLES.labelSmall,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
    fontWeight: "500",
  },
});
