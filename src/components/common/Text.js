import React from "react";
import { Text as RNText, StyleSheet } from "react-native";

export const Text = ({
  children,
  style,
  variant = "body",
  color,
  theme,
  ...props
}) => {
  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        { color: color || theme?.colors?.text },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
  },
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  h2: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
});