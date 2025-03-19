import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, Animated, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const CaptureButton = ({ onPress }) => {
  const [pressed, setPressed] = useState(false);

  // Handle press in
  const handlePressIn = () => {
    setPressed(true);
  };

  // Handle press out
  const handlePressOut = () => {
    setPressed(false);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
      style={styles.button}
    >
      <Animated.View
        style={[
          styles.outerRing,
          { transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.3)"]}
          style={styles.outerGradient}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.innerButton,
          { transform: [{ scale: pressed ? 0.9 : 1 }] },
        ]}
      >
        <LinearGradient
          colors={["#61DAFB", "#5B5FEF"]}
          style={styles.innerGradient}
        >
          <View style={styles.innerCircle} />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  outerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  outerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  innerButton: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
  },
  innerGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
  },
});

export default CaptureButton;
