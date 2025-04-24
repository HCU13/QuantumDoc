import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";
import { tokenUtils } from "../../utils/tokenUtils";

const TokenDisplay = ({
  onPress,
  showPlus = true,
  size = "small", // 'small', 'medium', 'large'
  containerStyle,
}) => {
  const { colors } = useTheme();
  const { tokens } = useToken();

  // Boyut ayarları
  let iconSize, fontSize, padding, plusSize;

  switch (size) {
    case "small":
      iconSize = 16;
      fontSize = 12;
      padding = 5;
      plusSize = 14;
      break;
    case "medium":
      iconSize = 24;
      fontSize = 16;
      padding = 8;
      plusSize = 18;
      break;
    case "large":
      iconSize = 28;
      fontSize = 18;
      padding = 12;
      plusSize = 22;
      break;
    default:
      iconSize = 16;
      fontSize = 12;
      padding = 5;
      plusSize = 14;
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderRadius: 30,
      paddingVertical: padding,
      paddingHorizontal: padding + 5,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    tokenIcon: {
      width: iconSize,
      height: iconSize,
      marginRight: 5,
    },
    tokenText: {
      ...FONTS.h4,
      fontSize: fontSize,
      color: colors.textOnGradient,
      fontWeight: "bold",
    },
    plusButton: {
      marginLeft: 5,
      width: plusSize,
      height: plusSize,
      borderRadius: plusSize / 2,
      backgroundColor: colors.secondary,
      justifyContent: "center",
      alignItems: "center",
    },
    plusText: {
      color: colors.textOnPrimary,
      fontSize: plusSize * 0.7,
      fontWeight: "bold",
      lineHeight: plusSize,
      textAlign: "center",
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={require("../../assets/images/token.png")}
        style={styles.tokenIcon}
      />
      <Text style={styles.tokenText}>
        {tokenUtils.formatTokenCount(tokens)}
      </Text>

      {showPlus && (
        <View style={styles.plusButton}>
          <Text style={styles.plusText}>+</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default TokenDisplay;