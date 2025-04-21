import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";

const AuthFooter = ({ questionText, actionText, onPress, containerStyle }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: SIZES.padding,
    },
    questionText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginRight: 5,
    },
    actionText: {
      ...FONTS.h4,
      color: colors.primary,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.questionText}>{questionText}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.actionText}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthFooter;
