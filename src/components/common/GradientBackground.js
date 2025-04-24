import React from "react";
import { StyleSheet, View, StatusBar, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import useTheme from "../../hooks/useTheme";

const GradientBackground = ({ children, style }) => {
  const { colors, isDark } = useTheme();

  // Artık renkleri colors.js dosyasından alıyoruz
  const gradientColors = [
    colors.gradientStart,
    colors.gradientMiddle,
    colors.gradientEnd,
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, style]}
      >
        <BlurView
          intensity={30}
          tint={isDark ? "dark" : "light"}
          style={styles.blur}
        />
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradient: {
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
