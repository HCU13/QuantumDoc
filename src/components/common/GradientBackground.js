// src/components/common/GradientBackground.js
import React from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import useTheme from "../../hooks/useTheme";

const GradientBackground = ({ children, style, mode = "default" }) => {
  const { colors, isDark } = useTheme();

  // Gradient ayarları ve görsel öğeleri belirleme
  let gradientColors = [];
  let gradientAngle = { x: 0, y: 1 }; // Varsayılan yukarıdan aşağıya gradient
  let blurIntensity = 0;

  switch (mode) {
    case "welcome":
      // Welcome/onboarding ekranları için çok soft gradient
      gradientColors = isDark
        ? ["#2D2940", "#3A3552", "#5B5676"]
        : ["#F8F8FF", "#ECE9F6", "#D6D6E7"];
      gradientAngle = { x: 0, y: 1 };
      blurIntensity = 0;
      break;

    case "subtle":
      // Daha sade, minimal görünüm (içerikli ekranlar için)
      gradientColors = isDark
        ? [colors.background, colors.background]
        : [colors.background, colors.gray];
      gradientAngle = { x: 0, y: 1 };
      blurIntensity = 0;
      break;

    case "default":
    default:
      // Standart ekranlar için çok soft gradient
      gradientColors = isDark
        ? ["#2D2940", "#3A3552", "#5B5676"]
        : ["#F8F8FF", "#ECE9F6", "#D6D6E7"];
      gradientAngle = { x: 0, y: 1 };
      blurIntensity = 0;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }, style]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Ana gradient arka plan - ekran görüntülerindeki gibi */}
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={gradientAngle}
      >
        {/* BlurView sadece gerektiğinde kullanılıyor */}
        {blurIntensity > 0 && (
          <BlurView
            intensity={blurIntensity}
            tint={isDark ? "dark" : "light"}
            style={styles.blur}
          />
        )}
      </LinearGradient>

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
  },
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});

export default GradientBackground;
