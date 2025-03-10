import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Avatar Component
 *
 * @param {string} source - Image URI
 * @param {number} size - Avatar size in pixels
 * @param {function} onPress - Press handler if avatar is clickable
 * @param {string} name - User name (to generate initials if no image)
 * @param {Array} gradientColors - Colors for placeholder gradient background
 * @param {Object} style - Additional style overrides
 */
const Avatar = ({
  source,
  size = 40,
  onPress,
  name = "",
  gradientColors = ["#5D5FEF", "#61DAFB"],
  style,
  ...props
}) => {
  // Generate initials from name
  const getInitials = () => {
    if (!name) return "";

    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[1].charAt(0).toUpperCase()
    );
  };

  // Avatar content based on whether we have an image or need initials
  const renderAvatarContent = () => {
    if (source) {
      return (
        <Image
          source={typeof source === "string" ? { uri: source } : source}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }

    // No image, use gradient with initials
    return (
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
          {getInitials()}
        </Text>
      </LinearGradient>
    );
  };

  // Render as TouchableOpacity if onPress is provided
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      {renderAvatarContent()}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default Avatar;
