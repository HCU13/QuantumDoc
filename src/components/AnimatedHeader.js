// components/AnimatedHeader.js
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./index"; // Assuming Text is exported from components/index.js

const AnimatedHeader = ({
  title,
  scrollY,
  theme,
  onBackPress,
  maxHeaderHeight = 60,
  topPosition = 0,
  statusBarHeight = 0,
}) => {
  // Header animations based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 130],
    outputRange: [0, 0.7, 1],
    extrapolate: "clamp",
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, maxHeaderHeight],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.animatedHeader,
        {
          height: headerHeight,
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          opacity: headerOpacity,
          top: topPosition + statusBarHeight,
        },
      ]}
    >
      <View style={styles.headerContentCompact}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text variant="subtitle1" numberOfLines={1} style={styles.headerTitle}>
          {title}
        </Text>

        <View style={{ width: 40 }} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
  },
  headerContentCompact: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    top: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default AnimatedHeader;
