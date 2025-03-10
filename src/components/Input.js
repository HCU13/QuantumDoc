// src/components/Input.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useLocalization } from "../context/LocalizationContext";

/**
 * Modern Input component with animated label and various states
 *
 * @param {string} label - Input label
 * @param {string} value - Input value
 * @param {function} onChangeText - Value change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} secureTextEntry - Is password input?
 * @param {string} error - Error message
 * @param {Object} style - Custom style properties
 * @param {string} icon - Left icon name (Ionicons)
 * @param {string} rightIcon - Right icon name (Ionicons)
 * @param {function} onRightIconPress - Right icon press handler
 * @param {string} variant - Input variant (outline, filled, underlined)
 * @param {boolean} animatedLabel - Whether to use animated floating label
 */
export const Input = ({
  label,
  value = "",
  onChangeText,
  placeholder = "",
  secureTextEntry = false,
  error,
  style,
  icon,
  rightIcon,
  onRightIconPress,
  variant = "outline",
  animatedLabel = true,
  ...props
}) => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  // Animation values
  const labelPositionAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const labelSizeAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  // Update animations when value or focus changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(labelPositionAnim, {
        toValue: (isFocused || value) ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(labelSizeAnim, {
        toValue: (isFocused || value) ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFocused, value, labelPositionAnim, labelSizeAnim, borderAnim]);

  // Focus input management
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const handleLabelPress = () => {
    inputRef.current?.focus();
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Translation support
  const translatedLabel =
    label?.startsWith("common.") || label?.startsWith("input.")
      ? t(label)
      : label;

  const translatedPlaceholder =
    placeholder?.startsWith("common.") || placeholder?.startsWith("input.")
      ? t(placeholder)
      : placeholder;

  const translatedError =
    error?.startsWith("error.") || error?.startsWith("validation.")
      ? t(error)
      : error;

  // Get styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "filled":
        return {
          container: {
            backgroundColor: theme.colors.surface,
            borderWidth: 0,
            borderRadius: theme.borderRadius.md,
            borderBottomWidth: 2,
            borderBottomColor: error 
              ? theme.colors.error 
              : isFocused 
                ? theme.colors.primary 
                : theme.colors.border,
          },
          input: {
            paddingTop: label ? 24 : 12,
            paddingBottom: 12,
          },
        };
      case "underlined":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 0,
            borderRadius: 0,
            borderBottomWidth: 2,
            borderBottomColor: error 
              ? theme.colors.error 
              : isFocused 
                ? theme.colors.primary 
                : theme.colors.border,
          },
          input: {
            paddingTop: label ? 24 : 8,
            paddingBottom: 8,
          },
        };
      case "outline":
      default:
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderRadius: theme.borderRadius.md,
            borderColor: error 
              ? theme.colors.error 
              : isFocused 
                ? theme.colors.primary 
                : theme.colors.border,
          },
          input: {
            paddingTop: label ? 24 : 12,
            paddingBottom: 12,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  
  // Animated label position and size
  const labelTopPosition = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [label ? 14 : 12, 8],
  });
  
  const labelFontSize = labelSizeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.typography.fontSize.md, theme.typography.fontSize.xs],
  });
  
  const labelColor = isFocused
    ? theme.colors.primary
    : error
      ? theme.colors.error
      : theme.colors.textSecondary;

  // Right icon (password visibility or custom)
  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.iconContainer}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.iconContainer}
        >
          <Ionicons
            name={rightIcon}
            size={22}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputWrapper,
          variantStyles.container,
        ]}
      >
        {/* Left icon */}
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={22}
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
        )}

        {/* Input and label container */}
        <View style={styles.inputContainer}>
          {label && animatedLabel && (
            <Pressable onPress={handleLabelPress}>
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    top: labelTopPosition,
                    fontSize: labelFontSize,
                    color: labelColor,
                    fontWeight: isFocused ? '600' : '400',
                  },
                ]}
                numberOfLines={1}
              >
                {translatedLabel}
              </Animated.Text>
            </Pressable>
          )}

          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              variantStyles.input,
              {
                color: theme.colors.text,
                paddingLeft: icon ? 0 : 12,
                paddingRight: (secureTextEntry || rightIcon) ? 0 : 12,
              },
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={(!label || !animatedLabel || isFocused) ? translatedPlaceholder : ""}
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry={secureTextEntry && !showPassword}
            onFocus={handleFocus}
            onBlur={handleBlur}
            selectionColor={theme.colors.primary}
            {...props}
          />
        </View>

        {/* Right icon */}
        {renderRightIcon()}
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={theme.colors.error}
            style={styles.errorIcon}
          />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {translatedError}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  inputContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    height: 56,
  },
  floatingLabel: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  iconContainer: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 12,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
  },
});