import React from "react";
import { View, StyleSheet } from "react-native";
import Text from "./Text";

/**
 * Divider Component
 *
 * @param {string} text - Optional text to display in the middle of divider
 * @param {string} orientation - Divider orientation ('horizontal', 'vertical')
 * @param {number} thickness - Divider line thickness
 * @param {string} color - Divider color
 * @param {Object} style - Additional style overrides
 */
const Divider = ({
  text,
  orientation = "horizontal",
  thickness = 1,
  color = "#E2E8F0",
  style,
  ...props
}) => {
  // Simple line divider (no text)
  if (!text) {
    return (
      <View
        style={[
          orientation === "horizontal"
            ? [styles.horizontal, { height: thickness }]
            : [styles.vertical, { width: thickness }],
          { backgroundColor: color },
          style,
        ]}
        {...props}
      />
    );
  }

  // Divider with text (only for horizontal orientation)
  return (
    <View style={[styles.textContainer, style]} {...props}>
      <View
        style={[
          styles.line,
          {
            height: thickness,
            backgroundColor: color,
          },
        ]}
      />

      <View style={styles.textWrapper}>
        <Text variant="caption" color="#64748B" style={styles.text}>
          {text}
        </Text>
      </View>

      <View
        style={[
          styles.line,
          {
            height: thickness,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: "100%",
    marginVertical: 12,
  },
  vertical: {
    height: "100%",
    marginHorizontal: 12,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 12,
  },
  line: {
    flex: 1,
  },
  textWrapper: {
    paddingHorizontal: 12,
  },
  text: {
    textAlign: "center",
  },
});

export default Divider;
