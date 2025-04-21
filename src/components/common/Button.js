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
import { LinearGradient } from "expo-linear-gradient";

const Button = ({
  title,
  onPress,
  containerStyle,
  textStyle,
  disabled = false,
  loading = false,
  gradient = false,
  outlined = false,
  icon = null,
}) => {
  const { colors, shadows } = useTheme();

  const buttonStyles = StyleSheet.create({
    container: {
      width: "100%",
      borderRadius: SIZES.radius,
      marginVertical: 10,
      ...shadows.medium,
    },
    button: {
      backgroundColor: colors.primary,
      padding: SIZES.padding * 0.7,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: SIZES.radius,
    },
    gradientButton: {
      padding: SIZES.padding * 0.7,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: SIZES.radius,
    },
    outlinedButton: {
      backgroundColor: "transparent",
      padding: SIZES.padding * 0.7,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      color: colors.white,
      ...FONTS.h4,
    },
    outlinedText: {
      color: colors.primary,
      ...FONTS.h4,
    },
    disabled: {
      backgroundColor: colors.textTertiary,
      opacity: 0.7,
    },
    disabledOutline: {
      borderColor: colors.textTertiary,
      opacity: 0.7,
    },
    iconContainer: {
      marginRight: 10,
    },
  });

  if (gradient) {
    return (
      <TouchableOpacity
        style={[buttonStyles.container, containerStyle]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            buttonStyles.gradientButton,
            disabled && buttonStyles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <View style={buttonStyles.buttonContent}>
              {icon && <View style={buttonStyles.iconContainer}>{icon}</View>}
              <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (outlined) {
    return (
      <TouchableOpacity
        style={[
          buttonStyles.container,
          buttonStyles.outlinedButton,
          containerStyle,
          disabled && buttonStyles.disabledOutline,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={buttonStyles.buttonContent}>
            {icon && <View style={buttonStyles.iconContainer}>{icon}</View>}
            <Text style={[buttonStyles.outlinedText, textStyle]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        buttonStyles.container,
        buttonStyles.button,
        containerStyle,
        disabled && buttonStyles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <View style={buttonStyles.buttonContent}>
          {icon && <View style={buttonStyles.iconContainer}>{icon}</View>}
          <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
