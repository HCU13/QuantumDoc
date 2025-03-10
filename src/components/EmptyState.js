import React from "react";
import { View, StyleSheet, Image } from "react-native";
import Text from "./Text";
import Button from "./Button";

/**
 * EmptyState Component
 *
 * @param {string} title - Title text
 * @param {string} message - Description message
 * @param {string|Object} image - Image source (require or URI)
 * @param {string} actionLabel - Action button text
 * @param {function} onAction - Action button press handler
 * @param {string} variant - Style variant ('default', 'compact', 'minimal')
 * @param {Object} style - Additional style overrides
 */
const EmptyState = ({
  title,
  message,
  image,
  actionLabel,
  onAction,
  variant = "default",
  style,
  ...props
}) => {
  // Default placeholder image if none provided
  // const defaultImage = require("../assets/images/empty-state.png"); // You should create this asset

  // Determine variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return {
          container: {
            padding: 16,
          },
          image: {
            width: 80,
            height: 80,
            marginBottom: 16,
          },
        };
      case "minimal":
        return {
          container: {
            padding: 12,
          },
          image: null, // No image for minimal variant
        };
      default:
        return {
          container: {
            padding: 24,
          },
          image: {
            width: 120,
            height: 120,
            marginBottom: 24,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, variantStyles.container, style]} {...props}>
      {/* Image (if variant includes image and image is provided) */}
      {/* {variantStyles.image && image && (
        <Image
          source={
            typeof image === "string" ? { uri: image } : image || defaultImage
          }
          style={[styles.image, variantStyles.image]}
          resizeMode="contain"
        />
      )} */}

      {/* Title */}
      <Text
        variant={variant === "minimal" ? "subtitle2" : "h3"}
        align="center"
        style={styles.title}
      >
        {title}
      </Text>

      {/* Message */}
      {message && (
        <Text
          variant="body2"
          color="#64748B"
          align="center"
          style={styles.message}
        >
          {message}
        </Text>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size={variant === "minimal" ? "small" : "medium"}
          style={styles.action}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
  },
  image: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  action: {
    minWidth: 140,
  },
});

export default EmptyState;
