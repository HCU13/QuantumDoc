// src/components/common/GradientBackground.js
import React from "react";
import { StyleSheet, View, StatusBar, Platform } from "react-native";
import useTheme from "../../hooks/useTheme";

const GradientBackground = ({ children, style, mode = "default", module = null }) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }, style]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* İçerik */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default GradientBackground;
