import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Text from "./Text";

/**
 * ColorfulHeader Component
 *
 * @param {string} title - Header title
 * @param {JSX.Element} leftComponent - Component to render on the left (e.g., back button)
 * @param {JSX.Element} rightComponent - Component to render on the right (e.g., menu)
 * @param {string} variant - Style variant ('primary', 'secondary', 'success')
 * @param {boolean} large - Whether to use large size with subtitle
 * @param {string} subtitle - Subtitle text (only used when large=true)
 * @param {Object} style - Additional style overrides
 */
const ColorfulHeader = ({
  title,
  leftComponent,
  rightComponent,
  variant = "primary",
  large = false,
  subtitle,
  style,
  ...props
}) => {
  // Get gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case "primary":
        return ["#5D5FEF", "#7879F1"];
      case "secondary":
        return ["#61DAFB", "#39C4E3"];
      case "success":
        return ["#10B981", "#34D399"];
      case "info":
        return ["#3B82F6", "#60A5FA"];
      case "warning":
        return ["#F59E0B", "#FBBF24"];
      case "error":
        return ["#EF4444", "#F87171"];
      default:
        return ["#5D5FEF", "#7879F1"];
    }
  };

  // Platform-specific status bar height
  const statusBarHeight =
    Platform.OS === "ios" ? 20 : StatusBar.currentHeight || 0;

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.container,
        large && styles.largeContainer,
        { paddingTop: statusBarHeight + 10 },
        style,
      ]}
      {...props}
    >
      {/* Content container */}
      <View style={styles.content}>
        {/* Left component (e.g., back button) */}
        <View style={styles.leftContainer}>{leftComponent}</View>

        {/* Center title */}
        <View style={styles.titleContainer}>
          <Text
            variant={large ? "h2" : "subtitle1"}
            color="#FFFFFF"
            align="center"
            weight={large ? "bold" : "semibold"}
            style={styles.title}
          >
            {title}
          </Text>

          {large && subtitle && (
            <Text
              variant="body2"
              color="#FFFFFF"
              align="center"
              style={styles.subtitle}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right component (e.g., menu button) */}
        <View style={styles.rightContainer}>{rightComponent}</View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  largeContainer: {
    paddingBottom: 24,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContainer: {
    width: 40,
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rightContainer: {
    width: 40,
    alignItems: "flex-end",
  },
  title: {
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.9,
  },
});

export default ColorfulHeader;
