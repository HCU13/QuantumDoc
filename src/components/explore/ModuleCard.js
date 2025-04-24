import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useToken } from "../../contexts/TokenContext";
import { tokenUtils } from "../../utils/tokenUtils";
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
  const { tokens } = useToken();

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

  // Token maliyeti
  const tokenCost = moduleId ? tokenUtils.getFeatureCost(moduleId) : 0;
  const canAfford = tokens >= tokenCost;

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
      color: "#fff",
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
    tokenCost: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      flexDirection: "row",
      alignItems: "center",
    },
    tokenIcon: {
      width: 12,
      height: 12,
      marginRight: 3,
    },
    tokenText: {
      ...FONTS.body5,
      color: "#fff",
      fontWeight: "bold",
      fontSize: 10,
    },
    unavailable: {
      opacity: 0.7,
    },
    bottomBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: canAfford ? colors.secondary : "rgba(255, 0, 0, 0.5)",
      paddingHorizontal: 10,
      paddingVertical: 1,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 20,
    },
    badgeText: {
      ...FONTS.body5,
      color: "#fff",
      fontWeight: "bold",
      fontSize: 10,
    },
    tokenImage: {
      width: 12,
      height: 12,
      marginRight: 3,
    },
  });

  // Büyük kart için farklı layout
  if (size === "large") {
    return (
      <View
        style={[
          styles.container,
          containerStyle,
          !canAfford && styles.unavailable,
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => onPress({ id: moduleId, title, description })}
          activeOpacity={0.8}
          disabled={!canAfford}
        >
          <LinearGradient
            colors={cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContainer}
          >
            {tokenCost > 0 && (
              <View style={styles.tokenCost}>
                <Image
                  source={require("../../assets/images/token.png")}
                  style={styles.tokenImage}
                />
                <Text style={styles.tokenText}>{tokenCost}</Text>
              </View>
            )}

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

          {/* {tokenCost > 0 && (
            <View style={styles.bottomBadge}>
              <Text style={styles.badgeText}>
                {canAfford ? "KULLAN" : "YETERSİZ TOKEN"}
              </Text>
            </View>
          )} */}
        </TouchableOpacity>
      </View>
    );
  }

  // Küçük ve orta boy kart layout
  return (
    <View
      style={[
        styles.container,
        containerStyle,
        !canAfford && styles.unavailable,
      ]}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => onPress({ id: moduleId, title, description })}
        activeOpacity={0.8}
        disabled={!canAfford}
      >
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {tokenCost > 0 && (
            <View style={styles.tokenCost}>
              <Image
                source={require("../../assets/images/token.png")}
                style={styles.tokenImage}
              />
              <Text style={styles.tokenText}>{tokenCost}</Text>
            </View>
          )}

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

        {/* {tokenCost > 0 && !canAfford && (
          <View style={styles.bottomBadge}>
            <Text style={styles.badgeText}>YETERSİZ TOKEN</Text>
          </View>
        )} */}
      </TouchableOpacity>
    </View>
  );
};

export default ModuleCard;
