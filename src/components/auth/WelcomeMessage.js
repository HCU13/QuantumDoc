import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";

const WelcomeMessage = ({
  title,
  subtitle,
  showRobot = true,
  robotSize = 150,
  containerStyle,
  robotSource,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      padding: SIZES.padding,
    },
    robotContainer: {
      marginBottom: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    robotImage: {
      width: robotSize,
      height: robotSize,
      resizeMode: "contain",
    },
    title: {
      ...FONTS.h1,
      color: colors.textOnGradient,
      textAlign: "center",
      marginBottom: 10,
      fontWeight: "bold",
    },
    subtitle: {
      ...FONTS.body3,
      color: colors.textOnGradient,
      textAlign: "center",
      marginBottom: 20,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {showRobot && (
        <View style={styles.robotContainer}>
          <Image
            source={robotSource}
            style={styles.robotImage}
            resizeMode="contain"
          />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

export default WelcomeMessage;