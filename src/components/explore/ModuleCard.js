import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import {
  FONTS,
  SIZES,
  TEXT_STYLES,
  BORDER_RADIUS,
  SPACING,
} from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useTokenContext } from "../../contexts/TokenContext";
import { useTranslation } from "react-i18next";
import { MODULES } from "../../constants/modules";

const ModuleCard = ({
  title,
  description,
  moduleId,
  icon,
  gradientColors,
  onPress,
  containerStyle,
  size = "medium",
  glowing = true,
  tokenCost = null,
  tokenCostRange = null,
  category = null,
  isSelectionMode = false,
  isSelected = false,
  onSelect = null,
}) => {
  const { colors } = useTheme();
  const { hasEnoughTokens } = useTokenContext();
  const { t } = useTranslation();

  // Token yoksa veya 0 ise her zaman erişilebilir
  const canAfford =
    !tokenCost || tokenCost === 0 || hasEnoughTokens("math_short");

  // modules.js'den modül bilgisini al
  const moduleInfo = MODULES.find((m) => m.id === moduleId);

  // Modül tipine göre özel içerik belirle
  const getModuleContent = () => {
    // modules.js'den görsel ve bilgileri al
    const baseContent = {
      mainText: moduleInfo
        ? t(moduleInfo.titleKey)
        : title || t("common.module"),
      description: moduleInfo
        ? t(moduleInfo.descriptionKey)
        : description || t("common.moduleDescription"),
      decorativeImage: moduleInfo?.decorativeImage || null,
    };

    switch (moduleId) {
      case "math":
        return {
          ...baseContent,
          actionText: t("modules.math.quickAction"),
          actionIcon: "flash",
          decorativeIcon: "checkmark-circle",
        };
      case "chat":
        return {
          ...baseContent,
          actionText: t("modules.chat.quickAction"),
          actionIcon: "chatbubble-ellipses",
          decorativeIcon: "chatbubbles",
        };
      case "news":
        return {
          ...baseContent,
          actionText: t("modules.news.quickAction"),
          actionIcon: "telescope",
          decorativeIcon: "notifications",
          decorativeImage: "https://img.icons8.com/3d-fluency/94/news.png", // News modülü modules.js'de yok
        };
      case "calculator":
        return {
          ...baseContent,
          actionText: t("modules.calculator.quickAction"),
          actionIcon: "calculator",
          decorativeIcon: "calculator",
        };
      case "textEditor":
        return {
          ...baseContent,
          actionText: t("modules.textEditor.quickAction"),
          actionIcon: "create",
          decorativeIcon: "document-text",
        };
      case "imageAnalyzer":
        return {
          ...baseContent,
          actionText: t("modules.imageAnalyzer.quickAction"),
          actionIcon: "image",
          decorativeIcon: "images",
        };
      case "noteGenerator":
        return {
          ...baseContent,
          actionText: t("modules.noteGenerator.quickAction"),
          actionIcon: "document-text",
          decorativeIcon: "clipboard",
        };
      default:
        return {
          ...baseContent,
          actionText: t("common.start"),
          actionIcon: "play",
          decorativeIcon: "star",
        };
    }
  };

  const moduleContent = getModuleContent();
  const cardGradient = gradientColors || [colors.primary, colors.primaryDark];

  // Kategori ismini al
  const getCategoryName = () => {
    if (!category) return null;
    return t(`explore.categories.${category}`);
  };

  const styles = StyleSheet.create({
    container: {
      width: SIZES.width * 0.9,
      height: 110,
      borderRadius: 20,
      borderTopLeftRadius: isSelectionMode ? 0 : 20,
      borderBottomLeftRadius: isSelectionMode ? 0 : 20,
      marginVertical: 6,
      shadowColor: cardGradient[0],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: canAfford ? 0.2 : 0.1,
      shadowRadius: 8,
      elevation: 5,
      opacity: canAfford ? 1 : 0.6,
    },
    cardContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    itemContainerSelected: {},
    gradientContainer: {
      flex: 1,
      borderRadius: 20,
      padding: 20,
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
    },
    tokenCost: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      zIndex: 2,
    },
    tokenImage: {
      width: 12,
      height: 12,
      marginRight: 4,
    },
    tokenText: {
      fontSize: 11,
      fontWeight: "700",
      color: cardGradient[1],
    },
    contentSection: {
      flex: 1,
      justifyContent: "center",
    },
    mainTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    descriptionText: {
      fontSize: 13,
      color: "rgba(255, 255, 255, 0.9)",
      lineHeight: 18,
      bottom: 2,
    },
    bottomSection: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      marginTop: 18,
      position: "relative",
      paddingBottom: 2,
    },
    actionButton: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      paddingHorizontal: 12,
      paddingVertical: 3,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
      transform: [{ rotate: "-4deg" }],
    },
    actionText: {
      ...TEXT_STYLES.labelSmall,
      color: cardGradient[1],
      fontWeight: "600",
    },
    decorativeIcon: {
      position: "absolute",
      right: 20,
      top: "50%",
      marginTop: -20,
      opacity: 0.15,
    },
    decorativeImage: {
      position: "absolute",
      right: 15,
      bottom: 15,
      width: 50,
      height: 50,
      opacity: 0.8,
    },
    decorativeShape: {
      position: "absolute",
      right: -20,
      top: -20,
      width: 80,
      height: 80,
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderRadius: 40,
      transform: [{ rotate: "45deg" }],
    },
    decorativeShape2: {
      position: "absolute",
      left: -10,
      top: -10,
      width: 40,
      height: 40,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 20,
      transform: [{ rotate: "30deg" }],
    },
    disabledOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 3,
    },
    disabledContent: {
      alignItems: "center",
    },
    disabledText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 12,
      marginTop: 4,
    },
    categoryBadge: {
      position: "absolute",
      top: 12,
      left: 12,
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.4)",
      zIndex: 2,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: "600",
      color: "#FFFFFF",
      textTransform: "uppercase",
    },
    checkboxContainer: {
      marginRight: SPACING.sm,
      justifyContent: "center",
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: BORDER_RADIUS.sm,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  });

  const handlePress = () => {
    if (isSelectionMode && onSelect) {
      onSelect(moduleId);
    } else {
      onPress({ id: moduleId, title, description });
    }
  };

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        isSelectionMode && isSelected && styles.itemContainerSelected,
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={handlePress}
        activeOpacity={isSelectionMode ? 1 : 0.8}
        disabled={isSelectionMode ? false : !canAfford}
      >
        {/* Seçim modu checkbox - sol tarafta */}
        {isSelectionMode && (
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => onSelect && onSelect(moduleId)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        )}

        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          {/* Token maliyet gösterimi */}
          {tokenCostRange ? (
            <View style={styles.tokenCost}>
              <Image
                source={require("../../assets/images/token.png")}
                style={styles.tokenImage}
              />
              <Text style={styles.tokenText}>{tokenCostRange}</Text>
            </View>
          ) : tokenCost > 0 ? (
            <View style={styles.tokenCost}>
              <Image
                source={require("../../assets/images/token.png")}
                style={styles.tokenImage}
              />
              <Text style={styles.tokenText}>{tokenCost}</Text>
            </View>
          ) : null}

          {/* Dekoratif şekiller */}
          <View style={styles.decorativeShape} />
          <View style={styles.decorativeShape2} />

          {/* 3D Dekoratif görsel */}
          {moduleContent.decorativeImage && (
            <Image
              source={
                typeof moduleContent.decorativeImage === "number"
                  ? moduleContent.decorativeImage
                  : typeof moduleContent.decorativeImage === "string" && moduleContent.decorativeImage
                  ? { uri: moduleContent.decorativeImage }
                  : null
              }
              style={styles.decorativeImage}
              resizeMode="contain"
            />
          )}

          {/* Ana içerik */}
          <View style={styles.contentSection}>
            <Text style={styles.mainTitle}>{moduleContent.mainText}</Text>
            <Text style={styles.descriptionText} numberOfLines={1}>
              {moduleContent.description?.slice(0, 45) ||
                moduleContent.description}
            </Text>
          </View>

          {/* Alt kısım - Action button */}
          <View style={styles.bottomSection}>
            <View style={styles.actionButton}>
              <Text style={styles.actionText}>{moduleContent.actionText}</Text>
            </View>
          </View>

          {/* Disabled overlay */}
          {!canAfford && tokenCost > 0 && (
            <View style={styles.disabledOverlay}>
              <View style={styles.disabledContent}>
                <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                <Text style={styles.disabledText}>
                  {tokenCostRange || `${tokenCost} Token`} Gerekli
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default ModuleCard;
