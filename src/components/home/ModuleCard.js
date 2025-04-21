import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "../../hooks/useTheme";

const ModuleCard = ({
  title,
  description,
  moduleId,
  icon,
  gradientColors,
  onPress,
  containerStyle,
  size = "medium", // 'small', 'medium', 'large'
  glowing = true,
}) => {
  const { colors } = useTheme();

  // Kart boyutunu belirle
  let cardWidth, cardHeight, iconSize, descriptionLines;

  switch (size) {
    case "small":
      cardWidth = SIZES.width * 0.28;
      cardHeight = SIZES.width * 0.28;
      iconSize = 28;
      descriptionLines = 0;
      break;
    case "large":
      cardWidth = SIZES.width * 0.9;
      cardHeight = SIZES.width * 0.3;
      iconSize = 36;
      descriptionLines = 2;
      break;
    case "medium":
    default:
      cardWidth = SIZES.width * 0.43;
      cardHeight = SIZES.width * 0.43;
      iconSize = 32;
      descriptionLines = 1;
  }

  // Eğer özel gradient renk verilmezse tema renklerini kullan
  const defaultGradient = [
    colors.primaryLight,
    colors.primary,
    colors.primaryDark,
  ];
  const cardGradient = gradientColors || defaultGradient;

  const styles = StyleSheet.create({
    container: {
      width: cardWidth,
      height: cardHeight,
      borderRadius: SIZES.radius * 1.5,
      marginHorizontal: 8,
      marginVertical: 8,
      overflow: "visible",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
      // Sabit gölge değerleri
      shadowColor: cardGradient[0],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowing ? 0.8 : 0,
      shadowRadius: glowing ? 8 : 0,
      elevation: glowing ? 10 : 0,
    },
    gradientContainer: {
      flex: 1,
      justifyContent: "space-between",
      padding: size === "small" ? 12 : 16,
      borderRadius: SIZES.radius * 1.5,
      overflow: "hidden",
    },
    contentContainer: {
      flex: 1,
      justifyContent: size === "large" ? "center" : "flex-end",
    },
    iconContainer: {
      width: iconSize * 1.5,
      height: iconSize * 1.5,
      borderRadius: iconSize,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: size === "small" ? 5 : 10,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.4)",
    },
    title: {
      ...FONTS.h4,
      color: colors.textOnPrimary, // Using a defined color for text on primary color backgrounds
      marginBottom: size === "small" ? 2 : 5,
      fontWeight: "bold",
    },
    description: {
      ...FONTS.body5,
      color: "rgba(255, 255, 255, 0.8)",
    },
    largeCardContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    largeCardTextContainer: {
      marginLeft: 16,
      flex: 1,
    },
  });

  // Büyük kart için farklı layout
  if (size === "large") {
    return (
      <TouchableOpacity
        style={[styles.container, containerStyle]}
        onPress={() => onPress({ id: moduleId, title, description })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <View style={styles.largeCardContent}>
            <View style={styles.iconContainer}>{icon}</View>

            <View style={styles.largeCardTextContainer}>
              <Text style={styles.title}>{title}</Text>
              {description && (
                <Text
                  style={styles.description}
                  numberOfLines={descriptionLines}
                >
                  {description}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Küçük ve orta boy kart layout
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={() => onPress({ id: moduleId, title, description })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.iconContainer}>{icon}</View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && size !== "small" && (
            <Text style={styles.description} numberOfLines={descriptionLines}>
              {description}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ModuleCard;
