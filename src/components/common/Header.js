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
  rightIcon = null, // Custom right icon
  onRightPress = null, // Custom right icon handler
  leftIcon = null, // Custom left icon
  onLeftPress = null, // Custom left icon handler
  titleStyle,
  containerStyle,
  onBack = null, // Custom back handler
  alignLeft = false, // Başlığı sola yasla
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const headerStyles = StyleSheet.create({
    container: {
      height: 40,
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
      alignItems: alignLeft ? "flex-start" : "center",
      justifyContent: "center",
      paddingLeft: alignLeft ? 0 : 0,
    },
    title: {
      ...FONTS.h4,
      color: colors.textOnGradient,
      fontWeight: "bold",
    },
    rightContainer: {
      minWidth: 40,
      alignItems: "flex-end",
      justifyContent: "center",
      flexShrink: 0,
    },
  });

  return (
    <View style={[headerStyles.container, containerStyle]}>
      <View style={headerStyles.leftContainer}>
        {leftIcon ? (
          <TouchableOpacity
            style={headerStyles.backButton}
            onPress={onLeftPress}
          >
            {leftIcon}
          </TouchableOpacity>
        ) : showBackButton ? (
          <TouchableOpacity
            style={headerStyles.backButton}
            onPress={handleBack}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textOnGradient}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={headerStyles.titleContainer}>
        <Text style={[headerStyles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={headerStyles.rightContainer}>
        {rightIcon ? (
          onRightPress ? (
            <TouchableOpacity onPress={onRightPress}>
              {rightIcon}
            </TouchableOpacity>
          ) : (
            rightIcon
          )
        ) : (
          rightComponent
        )}
      </View>
    </View>
  );
};

export default Header;
