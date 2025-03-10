// src/components/Button.js
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Animated,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useLocalization } from "../context/LocalizationContext";

/**
 * Modern Button component with various styles and states
 *
 * @param {string} title - Button text
 * @param {function} onPress - Press handler
 * @param {string} type - Button type (primary, secondary, outline, ghost, danger)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} loading - Loading state
 * @param {boolean} disabled - Disabled state
 * @param {Object} style - Custom style properties
 * @param {Object} textStyle - Text style properties
 * @param {Node} icon - Button icon (optional)
 * @param {Node} rightIcon - Right side icon (optional)
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {boolean} gradient - Whether to use gradient background
 * @param {string} gradientDirection - Gradient direction (horizontal, vertical)
 */
export const Button = ({
  title,
  onPress,
  type = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  rightIcon,
  fullWidth = false,
  gradient = false,
  gradientDirection = "horizontal",
  ...props
}) => {
  const { theme } = useTheme();
  const { t } = useLocalization();

  // Fade animation for press state
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const opacityInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });

  const scaleInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  // Translate title if it's a translation key
  const buttonTitle =
    title?.startsWith("common.") || title?.startsWith("button.")
      ? t(title)
      : title;

  // Get button styling based on type
  const getButtonColors = () => {
    switch (type) {
      case "primary":
        return {
          background: gradient ? null : theme.colors.primary,
          border: "transparent",
          text: theme.colors.textInverted,
          gradientColors: [
            theme.colors.gradientStart,
            theme.colors.gradientEnd,
          ],
        };
      case "secondary":
        return {
          background: theme.colors.primaryLight,
          border: "transparent",
          text: theme.colors.textInverted,
          gradientColors: [theme.colors.primaryLight, theme.colors.secondary],
        };
      case "outline":
        return {
          background: "transparent",
          border: theme.colors.primary,
          text: theme.colors.primary,
          gradientColors: null,
        };
      case "ghost":
        return {
          background: "transparent",
          border: "transparent",
          text: theme.colors.primary,
          gradientColors: null,
        };
      case "danger":
        return {
          background: theme.colors.error,
          border: "transparent",
          text: theme.colors.textInverted,
          gradientColors: [theme.colors.error, "#F43F5E"],
        };
      default:
        return {
          background: theme.colors.primary,
          border: "transparent",
          text: theme.colors.textInverted,
          gradientColors: [
            theme.colors.gradientStart,
            theme.colors.gradientEnd,
          ],
        };
    }
  };

  // Size-based styles
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          height: 36,
          paddingHorizontal: 16,
          fontSize: theme.typography.fontSize.sm,
          iconSize: 16,
        };
      case "lg":
        return {
          height: 52,
          paddingHorizontal: 24,
          fontSize: theme.typography.fontSize.lg,
          iconSize: 24,
        };
      case "md":
      default:
        return {
          height: 44,
          paddingHorizontal: 20,
          fontSize: theme.typography.fontSize.md,
          iconSize: 20,
        };
    }
  };

  const buttonColors = getButtonColors();
  const sizeStyles = getSizeStyles();

  // Button content component to handle both regular and gradient buttons
  const ButtonContent = ({ children }) => {
    if (gradient && buttonColors.gradientColors && !disabled) {
      return (
        <LinearGradient
          colors={buttonColors.gradientColors}
          start={
            gradientDirection === "horizontal" ? { x: 0, y: 0 } : { x: 0, y: 0 }
          }
          end={
            gradientDirection === "horizontal" ? { x: 1, y: 0 } : { x: 0, y: 1 }
          }
          style={[styles.gradientContainer]}
        >
          {children}
        </LinearGradient>
      );
    }

    return <>{children}</>;
  };

  // Loading indicator with correct color
  const LoadingIndicator = () => (
    <ActivityIndicator
      size="small"
      color={buttonColors.text}
      style={styles.loadingIndicator}
    />
  );

  // Icon with proper sizing based on button size
  const IconComponent = ({ ionIconName, position }) => {
    if (!ionIconName) return null;

    return (
      <Ionicons
        name={ionIconName}
        size={sizeStyles.iconSize}
        color={buttonColors.text}
        style={[position === "left" ? styles.leftIcon : styles.rightIcon]}
      />
    );
  };

  return (
    <Pressable
      onPress={!disabled && !loading ? onPress : null}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.buttonWrapper,
        fullWidth && styles.fullWidth,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      <Animated.View
        style={[
          styles.button,
          {
            height: sizeStyles.height,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            backgroundColor: disabled
              ? theme.colors.disabled
              : type === "ghost" || type === "outline"
              ? "transparent"
              : buttonColors.background,
            borderColor: disabled ? theme.colors.border : buttonColors.border,
            borderWidth: type === "outline" ? 1.5 : 0,
            borderRadius: theme.borderRadius.md,
            opacity: disabled ? 0.7 : opacityInterpolation,
            transform: [{ scale: scaleInterpolation }],
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        <ButtonContent>
          <View style={styles.contentContainer}>
            {loading ? (
              <LoadingIndicator />
            ) : (
              <>
                {icon && <IconComponent ionIconName={icon} position="left" />}

                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: sizeStyles.fontSize,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: disabled
                        ? theme.colors.disabledText
                        : buttonColors.text,
                    },
                    textStyle,
                  ]}
                  numberOfLines={1}
                >
                  {buttonTitle}
                </Text>

                {rightIcon && (
                  <IconComponent ionIconName={rightIcon} position="right" />
                )}
              </>
            )}
          </View>
        </ButtonContent>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    overflow: "hidden",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gradientContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  loadingIndicator: {
    padding: 4,
  },
  fullWidth: {
    width: "100%",
  },
});
