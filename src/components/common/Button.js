import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "../../hooks/useTheme";

const Button = ({
  title,
  onPress,
  containerStyle,
  textStyle,
  disabled = false,
  loading = false,
  gradient = false,
  outlined = false,
  glow = false,
  neon = false,
  size = "medium", // 'small', 'medium', 'large', 'auth'
  icon = null,
  iconPosition = "left", // 'left', 'right'
  fluid = false,
  rightContent = null,
}) => {
  const { colors } = useTheme();

  // Boyut ayarları
  let paddingV, paddingH, borderRadius, fontSize;

  switch (size) {
    case "small":
      paddingV = SIZES.padding * 0.5;
      paddingH = SIZES.padding * 0.8;
      borderRadius = SIZES.radius * 0.9;
      fontSize = SIZES.font - 1;
      break;
    case "large":
      paddingV = SIZES.padding * 1.0;
      paddingH = SIZES.padding * 1.4;
      borderRadius = SIZES.radius * 1.3;
      fontSize = SIZES.font + 3;
      break;
    case "auth":
      paddingV = SIZES.padding * 0.85;
      paddingH = SIZES.padding * 1.2;
      borderRadius = SIZES.radius * 1.2;
      fontSize = SIZES.font + 2;
      break;
    case "medium":
    default:
      paddingV = SIZES.padding * 0.75;
      paddingH = SIZES.padding * 1.0;
      borderRadius = SIZES.radius * 1.1;
      fontSize = SIZES.font + 1;
  }

  const buttonStyles = StyleSheet.create({
    container: {
      borderRadius: borderRadius,
      marginVertical: 8,
      alignSelf: fluid ? "stretch" : "auto",
      ...(glow
        ? {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 5,
            elevation: 5,
          }
        : {}),
    },
    animatedContainer: {
      borderRadius: borderRadius,
      overflow: "hidden",
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: paddingV,
      paddingHorizontal: paddingH,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: borderRadius,
      flexDirection: "row",
    },
    outlinedButton: {
      backgroundColor: "transparent",
      paddingVertical: paddingV,
      paddingHorizontal: paddingH,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: borderRadius,
      borderWidth: 2,
      borderColor: colors.primary,
      flexDirection: "row",
    },
    neonButton: {
      backgroundColor: colors.primaryLight + "20", // %20 opacity
      paddingVertical: paddingV,
      paddingHorizontal: paddingH,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: borderRadius,
      borderWidth: 1.5,
      borderColor: colors.primary,
      flexDirection: "row",
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      color: colors.textOnPrimary,
      ...FONTS.h4,
      fontSize: fontSize,
      fontWeight: "bold",
    },
    outlinedText: {
      color: colors.textOnGradient,
      ...FONTS.h4,
      fontSize: fontSize,
      fontWeight: "bold",
    },
    disabled: {
      backgroundColor: colors.gray,
      opacity: 0.5,
    },
    disabledOutline: {
      borderColor: colors.gray,
      opacity: 0.5,
    },
    iconContainer: {
      marginRight: iconPosition === "left" ? 10 : 0,
      marginLeft: iconPosition === "right" ? 10 : 0,
    },
    gradientContainer: {
      borderRadius: borderRadius,
      overflow: "hidden",
    },
    rightContentContainer: {
      marginLeft: 10,
    },
  });

  // Neon buton
  if (neon) {
    return (
      <View style={[buttonStyles.container, containerStyle]}>
        <TouchableOpacity
          style={[
            buttonStyles.neonButton,
            disabled && buttonStyles.disabledOutline,
          ]}
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={buttonStyles.buttonContent}>
              {icon && iconPosition === "left" && (
                <View style={buttonStyles.iconContainer}>{icon}</View>
              )}

              <Text style={[buttonStyles.text, textStyle]}>{title}</Text>

              {icon && iconPosition === "right" && (
                <View style={buttonStyles.iconContainer}>{icon}</View>
              )}

              {rightContent && (
                <View style={buttonStyles.rightContentContainer}>
                  {rightContent}
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Gradient buton
  if (gradient) {
    const gradientColors = [colors.primary, colors.primaryDark, colors.primaryLight];

    return (
      <View style={[buttonStyles.container, containerStyle]}>
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={0.8}
          style={buttonStyles.gradientContainer}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            locations={[0, 0.5, 1]}
            style={[buttonStyles.button, disabled && buttonStyles.disabled]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={buttonStyles.buttonContent}>
                {icon && iconPosition === "left" && (
                  <View style={buttonStyles.iconContainer}>{icon}</View>
                )}

                <Text style={[buttonStyles.text, textStyle]}>{title}</Text>

                {icon && iconPosition === "right" && (
                  <View style={buttonStyles.iconContainer}>{icon}</View>
                )}

                {rightContent && (
                  <View style={buttonStyles.rightContentContainer}>
                    {rightContent}
                  </View>
                )}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Outline buton
  if (outlined) {
    return (
      <View style={[buttonStyles.container, containerStyle]}>
        <TouchableOpacity
          style={[
            buttonStyles.outlinedButton,
            disabled && buttonStyles.disabledOutline,
          ]}
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={buttonStyles.buttonContent}>
              {icon && iconPosition === "left" && (
                <View style={buttonStyles.iconContainer}>{icon}</View>
              )}

              <Text style={[buttonStyles.outlinedText, textStyle]}>
                {title}
              </Text>

              {icon && iconPosition === "right" && (
                <View style={buttonStyles.iconContainer}>{icon}</View>
              )}

              {rightContent && (
                <View style={buttonStyles.rightContentContainer}>
                  {rightContent}
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Normal buton (solid)
  return (
    <View style={[buttonStyles.container, containerStyle]}>
      <TouchableOpacity
        style={[buttonStyles.button, disabled && buttonStyles.disabled]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <View style={buttonStyles.buttonContent}>
            {icon && iconPosition === "left" && (
              <View style={buttonStyles.iconContainer}>{icon}</View>
            )}

            <Text style={[buttonStyles.text, textStyle]}>{title}</Text>

            {icon && iconPosition === "right" && (
              <View style={buttonStyles.iconContainer}>{icon}</View>
            )}

            {rightContent && (
              <View style={buttonStyles.rightContentContainer}>
                {rightContent}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Button;
