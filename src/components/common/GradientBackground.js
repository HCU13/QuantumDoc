import React from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import { BlurView } from "expo-blur";
import useTheme from "../../hooks/useTheme";

const GradientBackground = ({ children, style }) => {
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
      <BlurView
        intensity={30}
        tint={isDark ? "dark" : "light"}
        style={styles.blur}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default GradientBackground;
