import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, Animated } from "react-native";
import useTheme from "../../hooks/useTheme";
import { FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLoading } from "../../contexts/LoadingContext";

const GlobalLoader = () => {
  const { colors } = useTheme();
  const { loading: visible, text, module } = useLoading();
  const animatedValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Quorax temalı modern iconlar - Tek set, her yerde aynı
  const icons = [
    "sparkles",
    "rocket-outline",
    "flash-outline",
    "bulb-outline",
    "star-outline",
  ];

  useEffect(() => {
    if (visible) {
      const animations = animatedValues.map((value, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(index * 150), // Daha hızlı başlangıç
            Animated.timing(value, {
              toValue: 1,
              duration: 600, // Daha smooth
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      });

      Animated.parallel(animations).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      style={[styles.overlay, { backgroundColor: colors.background + "AA" }]}
    >
      <View
        style={[
          styles.box,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.iconContainer}>
          {icons.map((icon, index) => (
            <Animated.View
              key={index}
              style={[
                styles.icon,
                {
                  opacity: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                  transform: [
                    {
                      scale: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                    {
                      translateY: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name={icon} size={20} color={colors.primary} />
            </Animated.View>
          ))}
        </View>
        <Text style={[styles.text, { color: colors.textPrimary }]}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  box: {
    minWidth: 160,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  icon: {
    marginHorizontal: 8,
    opacity: 0.3,
  },
  text: {
    marginTop: 4,
    ...FONTS.body5,
    fontWeight: "600",
  },
});

export default GlobalLoader;
