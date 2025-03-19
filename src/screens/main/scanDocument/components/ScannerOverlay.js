import React from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";

const { width, height } = Dimensions.get("window");

// Calculate scan area based on A4 ratio and screen dimensions
const SCAN_AREA_PADDING = 40;
const SCAN_AREA_ASPECT_RATIO = 1.414; // A4 aspect ratio
const scanAreaWidth = width - SCAN_AREA_PADDING * 2;
const scanAreaHeight = scanAreaWidth * SCAN_AREA_ASPECT_RATIO;

const ScannerOverlay = ({ scanLineAnim, theme }) => {
  return (
    <View style={styles.overlay}>
      {/* Dark overlay with transparent cutout for scan area */}
      <View style={styles.background}>
        {/* Top dark area */}
        <View style={[styles.darkArea, styles.topArea]} />

        {/* Middle section with scan area cutout */}
        <View style={styles.middleSection}>
          <View style={styles.darkArea} />

          {/* Scan area */}
          <View style={styles.scanAreaContainer}>
            {/* Corner marks */}
            <View style={[styles.cornerTL, styles.corner]} />
            <View style={[styles.cornerTR, styles.corner]} />
            <View style={[styles.cornerBL, styles.corner]} />
            <View style={[styles.cornerBR, styles.corner]} />

            {/* Animated scan line */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  backgroundColor: theme.colors.secondary + "70",
                  transform: [
                    {
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, scanAreaHeight - 2],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>

          <View style={styles.darkArea} />
        </View>

        {/* Bottom dark area */}
        <View style={[styles.darkArea, styles.bottomArea]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  darkArea: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  topArea: {
    height: (height - scanAreaHeight) / 2,
  },
  middleSection: {
    flexDirection: "row",
    height: scanAreaHeight,
  },
  bottomArea: {
    height: (height - scanAreaHeight) / 2,
  },
  scanAreaContainer: {
    width: scanAreaWidth,
    height: scanAreaHeight,
    position: "relative",
  },
  scanLine: {
    position: "absolute",
    width: scanAreaWidth - 20,
    height: 2,
    left: 10,
    borderRadius: 1,
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "white",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
});

export default ScannerOverlay;
