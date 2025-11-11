import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
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
  module = null, // 'math', 'quiz', 'chat', 'calculator'
}) => {
  const { colors } = useTheme();

  // Modül renklerini belirle
  const getModuleColors = () => {
    switch (module) {
      case 'math':
        return {
          primary: colors.mathPrimary,
          primaryDark: colors.mathPrimaryDark,
          primaryLight: colors.mathPrimaryLight,
        };
      case 'quiz':
        return {
          primary: colors.quizPrimary,
          primaryDark: colors.quizPrimaryDark,
          primaryLight: colors.quizPrimaryLight,
        };
      case 'chat':
        return {
          primary: colors.chatPrimary,
          primaryDark: colors.chatPrimaryDark,
          primaryLight: colors.chatPrimaryLight,
        };
      case 'calculator':
        return {
          primary: colors.calculatorPrimary,
          primaryDark: colors.calculatorPrimaryDark,
          primaryLight: colors.calculatorPrimaryLight,
        };
      case 'textEditor':
        return {
          primary: colors.textEditorPrimary,
          primaryDark: colors.textEditorPrimaryDark,
          primaryLight: colors.textEditorPrimaryLight,
        };
      case 'imageAnalyzer':
        return {
          primary: colors.imageAnalyzerPrimary,
          primaryDark: colors.imageAnalyzerPrimaryDark,
          primaryLight: colors.imageAnalyzerPrimaryLight,
        };
      case 'noteGenerator':
        return {
          primary: colors.noteGeneratorPrimary,
          primaryDark: colors.noteGeneratorPrimaryDark,
          primaryLight: colors.noteGeneratorPrimaryLight,
        };
      default:
        return {
          primary: colors.primary,
          primaryDark: colors.primaryDark,
          primaryLight: colors.primaryLight,
        };
    }
  };

  const moduleColors = getModuleColors();

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
            shadowColor: moduleColors.primary,
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
      backgroundColor: moduleColors.primary,
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
      borderColor: moduleColors.primary,
      flexDirection: "row",
    },
    neonButton: {
      backgroundColor: moduleColors.primaryLight + "20", // %20 opacity
      paddingVertical: paddingV,
      paddingHorizontal: paddingH,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: borderRadius,
      borderWidth: 1.5,
      borderColor: moduleColors.primary,
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
      backgroundColor: colors.border || colors.gray,
      opacity: 0.75,
    },
    disabledOutline: {
      borderColor: colors.border || colors.gray,
      opacity: 0.75,
    },
    iconContainer: {
      marginRight: iconPosition === "left" ? 10 : 0,
      marginLeft: iconPosition === "right" ? 10 : 0,
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
            <ActivityIndicator size="small" color={moduleColors.primary} />
          ) : (
            <View style={buttonStyles.buttonContent}>
              {icon && iconPosition === "left" && (
                <View style={buttonStyles.iconContainer}>{icon}</View>
              )}

              <Text style={[
                buttonStyles.text, 
                disabled && { opacity: 0.9, color: colors.textSecondary || colors.textOnPrimary },
                textStyle
              ]}>{title}</Text>

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

  // Gradient prop artık kullanılmıyor - normal solid button'a yönlendir
  // if (gradient) artık solid button kullanacağız

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
            <ActivityIndicator size="small" color={moduleColors.primary} />
          ) : (
            <View style={buttonStyles.buttonContent}>
              {icon && iconPosition === "left" && (
                <View style={buttonStyles.iconContainer}>{icon}</View>
              )}

              <Text style={[
                buttonStyles.outlinedText, 
                disabled && { opacity: 0.9, color: colors.textSecondary || colors.textOnGradient },
                textStyle
              ]}>
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

            <Text style={[
              buttonStyles.text, 
              disabled && { opacity: 0.9, color: colors.textSecondary || colors.textOnPrimary },
              textStyle
            ]}>{title}</Text>

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
