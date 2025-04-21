import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import useTheme from "../../hooks/useTheme";

const GradientBackground = ({ children, style }) => {
  const { colors, isDark } = useTheme();

  const vibrantPastelGradient = !isDark
    ? ["#FFC6FF", "#B5E8FF", "#FFD6A5"] // Canlı pastel
    : [colors.gradientStart, colors.gradientMiddle, colors.gradientEnd];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={vibrantPastelGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, style]}
      >
        <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={styles.blur} />
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default GradientBackground;
