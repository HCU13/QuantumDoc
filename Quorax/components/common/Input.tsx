import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { SPACING, BORDER_RADIUS, TEXT_STYLES } from "@/constants/theme";

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
}

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
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPasswordToggle = secureTextEntry && value.length > 0;

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
            backgroundColor: colors.card,
            borderColor: error
              ? colors.error || "#FF6B6B"
              : isFocused
              ? colors.primary
              : colors.borderSubtle,
            minHeight: multiline ? 100 : 50,
            alignItems: multiline ? "flex-start" : "center",
            paddingVertical: multiline ? SPACING.sm : 0,
          },
          isFocused && styles.focusedInput,
          error && styles.errorInput,
        ]}
      >
        {icon && !onIconPress && (
          <Ionicons
            name={icon}
            size={20}
            color={colors.textSecondary}
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
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.passwordToggle}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        {onIconPress && icon && (
          <TouchableOpacity onPress={onIconPress} style={styles.iconButton}>
            <Ionicons name={icon} size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: colors.error || "#FF6B6B" }]}>
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
    marginBottom: SPACING.xs,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
  },
  focusedInput: {
    borderWidth: 2,
  },
  errorInput: {
    borderWidth: 2,
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
  },
});

