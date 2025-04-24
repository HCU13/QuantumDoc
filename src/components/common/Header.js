import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import useTheme from "../../hooks/useTheme";

const Header = ({
  title,
  showBackButton = true,
  rightComponent = null,
  titleStyle,
  containerStyle,
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const headerStyles = StyleSheet.create({
    container: {
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SIZES.padding,
      backgroundColor: "transparent",
    },
    leftContainer: {
      width: 40,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      fontWeight: "bold",
    },
    rightContainer: {
      width: 40,
      alignItems: "flex-end",
    },
  });

  return (
    <View style={[headerStyles.container, containerStyle]}>
      <View style={headerStyles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={headerStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textOnGradient}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={headerStyles.titleContainer}>
        <Text style={[headerStyles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={headerStyles.rightContainer}>{rightComponent}</View>
    </View>
  );
};

export default Header;