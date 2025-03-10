// src/components/ModernInput.js
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useLocalization } from "../context/LocalizationContext";

/**
 * Modern, kompakt ve minimal input bileşeni
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
  ...props
}) => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Focus yönetimi
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  // Şifre görünürlüğü
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Çeviri desteği
  const translatedPlaceholder =
    placeholder?.startsWith("common.") || placeholder?.startsWith("input.")
      ? t(placeholder)
      : placeholder;
  
  const translatedError =
    error?.startsWith("error.") || error?.startsWith("validation.")
      ? t(error)
      : error;
      
  // Sol icon render
  const renderLeftIcon = () => {
    if (!icon) return null;
    
    return (
      <View style={styles.leftIconContainer}>
        <Ionicons
          name={icon}
          size={16}
          color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
        />
      </View>
    );
  };
  
  // Sağ icon render (şifre görünürlük veya özel)
  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.rightIconContainer}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={styles.rightIconContainer}
        >
          <Ionicons
            name={rightIcon}
            size={16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  // Border ve background rengi
  const getInputContainerStyle = () => {
    return {
      backgroundColor: theme.colors.surface + "80",
      borderWidth: 1,
      borderColor: isFocused 
        ? theme.colors.primary 
        : error 
        ? theme.colors.error 
        : theme.colors.border,
      borderRadius: 8,
    };
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text 
          style={[
            styles.label, 
            { 
              color: isFocused 
                ? theme.colors.primary 
                : error 
                ? theme.colors.error 
                : theme.colors.textSecondary 
            }
          ]}
        >
          {label}
        </Text>
      )}
      
      {/* Input Container */}
      <View style={[styles.inputContainer, getInputContainerStyle()]}>
        {renderLeftIcon()}
        
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={translatedPlaceholder}
          placeholderTextColor={theme.colors.textSecondary + "99"}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={theme.colors.primary}
          {...props}
        />
        
        {renderRightIcon()}
      </View>
      
      {/* Error message */}
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {translatedError}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  leftIconContainer: {
    paddingHorizontal: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconContainer: {
    paddingHorizontal: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 11,
    marginTop: 2,
    marginLeft: 2,
  }
});