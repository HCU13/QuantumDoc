// src/components/Loading.js
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { Text } from "./Text";
import { useTheme } from "../context/ThemeContext";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

/**
 * Modern Loading component with animations and various styles
 *
 * @param {string} text - Loading text
 * @param {boolean} fullScreen - Whether to display fullscreen
 * @param {Object} style - Custom style properties
 * @param {string} type - Loading animation type (spinner, dots, pulse, bounce, logo)
 * @param {boolean} blur - Whether to apply blur effect
 * @param {number} blurIntensity - Blur intensity (1-100)
 * @param {string} iconName - Icon to display (for logo type)
 */
export const Loading = ({
  text,
  fullScreen = false,
  style,
  type = "spinner",
  blur = false,
  blurIntensity = 40,
  iconName = "document-text",
}) => {
  const { theme, isDark } = useTheme();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const dotOneAnim = useRef(new Animated.Value(0)).current;
  const dotTwoAnim = useRef(new Animated.Value(0)).current;
  const dotThreeAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation
  useEffect(() => {
    if (type === "pulse" || type === "logo") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [type, pulseAnim]);

  // Spin animation
  useEffect(() => {
    if (type === "spinner" || type === "logo") {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [type, spinAnim]);

  // Bounce animation
  useEffect(() => {
    if (type === "bounce") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [type, bounceAnim]);

  // Dots animation
  useEffect(() => {
    if (type === "dots") {
      const createDotAnimation = (dotAnim, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(dotAnim, {
              toValue: 1,
              duration: 300,
              delay,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim, {
              toValue: 0,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.delay(600), // Wait for the other dots
          ])
        );
      };

      // Start dot animations with staggered delays
      Animated.parallel([
        createDotAnimation(dotOneAnim, 0),
        createDotAnimation(dotTwoAnim, 300),
        createDotAnimation(dotThreeAnim, 600),
      ]).start();
    }
  }, [type, dotOneAnim, dotTwoAnim, dotThreeAnim]);

  // Transform interpolations
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const dotScale = (dotAnim) => {
    return dotAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.5],
    });
  };

  const dotOpacity = (dotAnim) => {
    return dotAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    });
  };

  // Render loading indicator based on type
  const renderLoadingIndicator = () => {
    switch (type) {
      case "dots":
        return (
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: theme.colors.primary,
                  transform: [{ scale: dotScale(dotOneAnim) }],
                  opacity: dotOpacity(dotOneAnim),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: theme.colors.primary,
                  transform: [{ scale: dotScale(dotTwoAnim) }],
                  opacity: dotOpacity(dotTwoAnim),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: theme.colors.primary,
                  transform: [{ scale: dotScale(dotThreeAnim) }],
                  opacity: dotOpacity(dotThreeAnim),
                },
              ]}
            />
          </View>
        );

      case "pulse":
        return (
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                backgroundColor: theme.colors.primary,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.pulseInnerCircle} />
          </Animated.View>
        );

      case "bounce":
        return (
          <View style={styles.bounceContainer}>
            <Animated.View
              style={[
                styles.bounceDot,
                {
                  backgroundColor: theme.colors.primary,
                  transform: [{ translateY: bounce }],
                },
              ]}
            />
            <View
              style={[
                styles.bounceShadow,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            />
          </View>
        );

      case "logo":
        return (
          <Animated.View
            style={[
              styles.logoContainer,
              {
                backgroundColor: theme.colors.primary + "20",
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons
                name={iconName}
                size={30}
                color={theme.colors.primary}
              />
            </Animated.View>
          </Animated.View>
        );

      case "spinner":
      default:
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }
  };

  // Render component based on fullScreen and blur settings
  const renderContent = () => {
    const content = (
      <View
        style={[
          styles.container,
          fullScreen && styles.fullScreen,
          {
            backgroundColor: fullScreen
              ? blur
                ? "transparent"
                : theme.colors.background + "99"
              : "transparent",
          },
          style,
        ]}
      >
        {renderLoadingIndicator()}

        {text && (
          <Text
            variant="subtitle2"
            color={theme.colors.textSecondary}
            style={styles.text}
          >
            {text}
          </Text>
        )}
      </View>
    );

    if (fullScreen && blur && Platform.OS !== "web") {
      return (
        <BlurView
          intensity={blurIntensity}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        >
          {content}
        </BlurView>
      );
    }

    return content;
  };

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  text: {
    marginTop: 16,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  pulseCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseInnerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
  },
  bounceContainer: {
    height: 40,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bounceDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  bounceShadow: {
    position: "absolute",
    bottom: 0,
    width: 10,
    height: 3,
    borderRadius: 5,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
