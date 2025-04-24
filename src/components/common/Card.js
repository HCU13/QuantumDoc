import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SIZES } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";

const Card = ({
  children,
  style,
  onPress,
  disabled = false,
}) => {
  const { colors, shadows } = useTheme();
  const CardComponent = onPress ? TouchableOpacity : View;

  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius * 1.5,
      padding: SIZES.padding,
      marginVertical: 10,
      overflow: "hidden",
      ...shadows.standard,
    },
  });

  return (
    <CardComponent
      style={[cardStyles.card, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {children}
    </CardComponent>
  );
};

export default Card;