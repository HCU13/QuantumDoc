import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";

const Loader = ({
  loading = true,
  size = "large",
  text = "Yükleniyor...",
  containerStyle,
}) => {
  const { colors } = useTheme();

  const loaderStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    text: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      marginTop: 10,
    },
  });

  if (!loading) return null;

  return (
    <View style={[loaderStyles.container, containerStyle]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {text && <Text style={loaderStyles.text}>{text}</Text>}
    </View>
  );
};

export default Loader;