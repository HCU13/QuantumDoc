import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";

/**
 * Input Component
 *
 * @param {string} label - Input label
 * @param {string} value - Input value
 * @param {function} onChangeText - Text change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} error - Whether input has error
 * @param {string} errorText - Error message to display
 * @param {boolean} secureTextEntry - For password input
 * @param {JSX.Element} leftIcon - Icon to display on the left
 * @param {JSX.Element} rightIcon - Icon to display on the right
 * @param {function} onRightIconPress - Handler for right icon press
 * @param {Object} style - Additional styles for container
 * @param {Object} inputStyle - Additional styles for input
 */
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error = false,
  errorText,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle focus and blur events
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Determine border color based on state
  const getBorderColor = () => {
    if (error) return "#EF4444"; // Error color
    if (isFocused) return "#5D5FEF"; // Primary color
    return "#E2E8F0"; // Default border
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, error && styles.errorLabel]}>{label}</Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: isFocused ? "#FFFFFF" : "#F8FAFC",
          },
          error && styles.errorInput,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOffIcon color="#94A3B8" />
            ) : (
              <EyeIcon color="#94A3B8" />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={onRightIconPress}
            >
              {rightIcon}
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Error Message */}
      {error && errorText && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );
};

// Simple icon components for password visibility
const EyeIcon = ({ color }) => (
  <View
    style={{
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ color }}>👁️</Text>
  </View>
);

const EyeOffIcon = ({ color }) => (
  <View
    style={{
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ color }}>👁️‍🗨️</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#334155",
  },
  errorLabel: {
    color: "#EF4444",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
  },
  errorInput: {
    borderColor: "#EF4444",
  },
  input: {
    flex: 1,
    height: 24,
    fontSize: 16,
    color: "#0F172A",
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;
