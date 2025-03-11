import React, { useEffect, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Animated } from "react-native";
import Text from "./Text";
import { useTheme } from "../context/ThemeContext";

/**
 * Loading Component
 *
 * @param {string} text - Loading text
 * @param {string} variant - Loading style variant ('spinner', 'dots', 'pulse')
 * @param {string} size - Loading indicator size ('small', 'medium', 'large')
 * @param {string} color - Loading indicator color
 * @param {boolean} fullScreen - Whether to display fullscreen
 * @param {Object} style - Additional style overrides
 */
const Loading = ({
  text,
  variant = "spinner",
  size = "medium",
  color,
  fullScreen = false,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const themeColor = color || theme.colors.primary;
  const backgroundColor = theme.colors.background;
  const textColor = theme.colors.text;

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotOneAnim = useRef(new Animated.Value(0)).current;
  const dotTwoAnim = useRef(new Animated.Value(0)).current;
  const dotThreeAnim = useRef(new Animated.Value(0)).current;

  // Size values
  const sizes = {
    small: 20,
    medium: 36,
    large: 48,
  };

  const currentSize = sizes[size] || sizes.medium;

  useEffect(() => {
    startAnimations();

    return () => {
      pulseAnim.stopAnimation();
      dotOneAnim.stopAnimation();
      dotTwoAnim.stopAnimation();
      dotThreeAnim.stopAnimation();
    };
  }, [variant]);

  const startAnimations = () => {
    if (variant === "pulse") {
      startPulseAnimation();
    } else if (variant === "dots") {
      startDotsAnimation();
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startDotsAnimation = () => {
    const createDotAnimation = (dotAnim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(400),
        ])
      );
    };

    Animated.parallel([
      createDotAnimation(dotOneAnim, 0),
      createDotAnimation(dotTwoAnim, 200),
      createDotAnimation(dotThreeAnim, 400),
    ]).start();
  };

  const renderLoader = () => {
    switch (variant) {
      case "pulse":
        return (
          <Animated.View
            style={[
              styles.pulseContainer,
              {
                width: currentSize,
                height: currentSize,
                backgroundColor: themeColor,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        );
      case "dots":
        return (
          <View style={styles.dotsContainer}>
            {[dotOneAnim, dotTwoAnim, dotThreeAnim].map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: currentSize / 3,
                    height: currentSize / 3,
                    backgroundColor: themeColor,
                    opacity: anim,
                    transform: [{ scale: anim }],
                  },
                ]}
              />
            ))}
          </View>
        );
      case "spinner":
      default:
        return (
          <ActivityIndicator
            size={size === "small" ? "small" : "large"}
            color={themeColor}
          />
        );
    }
  };

  return (
    <View
      style={[
        styles.container,
        fullScreen && { backgroundColor, ...styles.fullScreen },
        style,
      ]}
      {...props}
    >
      {renderLoader()}
      {text && (
        <Text variant="body2" color={textColor} style={styles.text}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  text: {
    marginTop: 12,
    textAlign: "center",
  },
  pulseContainer: {
    borderRadius: 50,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 4,
  },
});

export default Loading;
