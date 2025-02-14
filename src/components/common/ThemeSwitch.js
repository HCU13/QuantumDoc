import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

export const ThemeSwitch = () => {
  const { theme, switchTheme } = useTheme();
  const isDark = theme.colors.background === "#1A1A1A";

  return (
    <TouchableOpacity
      onPress={switchTheme}
      style={[styles.container, { backgroundColor: theme.colors.card }]}
    >
      <Ionicons
        name={isDark ? "moon" : "sunny"}
        size={24}
        color={theme.colors.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
