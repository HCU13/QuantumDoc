import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export const Button = ({
  title,
  onPress,
  type = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  style,
  theme,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        styles[type],
        {
          backgroundColor:
            type === "primary" ? theme.colors.primary : "transparent",
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={type === "primary" ? theme.colors.white : theme.colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${size}Text`],
            {
              color:
                type === "primary" ? theme.colors.white : theme.colors.primary,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  secondary: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  text: {
    fontWeight: "600",
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
