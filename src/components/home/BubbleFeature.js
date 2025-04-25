import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FONTS } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "../../hooks/useTheme";

const BubbleFeature = ({
  title,
  icon,
  onPress,
  containerStyle,
  size = 120, // Baloncuk boyutu
  glowing = true, // Bu artık sadece stil için kullanılacak
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      marginHorizontal: 10,
      marginVertical: 10,
    },
    bubbleOuter: {
      width: size,
      height: size,
      borderRadius: size / 2,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,

      overflow: "visible",
      // Sabit gölge değerleri
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowing ? 0.8 : 0,
      shadowRadius: glowing ? 10 : 0,
      elevation: glowing ? 10 : 0,
    },
    bubbleInner: {
      width: size * 0.85,
      height: size * 0.85,
      borderRadius: (size * 0.85) / 2,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    gradientBg: {
      width: "100%",
      height: "100%",
      borderRadius: (size * 0.85) / 2,
      justifyContent: "center",
      alignItems: "center",
    },
    iconContainer: {
      width: size * 0.5,
      height: size * 0.5,
      borderRadius: (size * 0.5) / 2,
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },
    title: {
      ...FONTS.h4,
      color: colors.textOnGradient,
      textAlign: "center",
      marginTop: 10,
      fontWeight: "bold",
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.bubbleOuter, { borderColor: colors.border }]}>
        <View style={styles.bubbleInner}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBg}
          >
            <View
              style={[styles.iconContainer, { borderColor: colors.border }]}
            >
              {icon}
            </View>
          </LinearGradient>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

export default BubbleFeature;
