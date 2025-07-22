import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import TokenCostBadge from "./TokenCostBadge";

const TokenInfo = ({
  moduleName,
  tokenCost = 0,
  remainingTokens = 0,
  isPremium = false,
  showCost = true,
  containerStyle,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: SIZES.radius * 1.2,
      padding: 16,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.primary,
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    tokenIconContainer: {
      position: 'relative',
      marginRight: 12,
    },
    tokenIcon: {
      width: 24,
      height: 24,
    },
    premiumStar: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    infoContainer: {
      flex: 1,
    },
    moduleName: {
      ...FONTS.h4,
      color: colors.textPrimary,
      fontWeight: "bold",
      marginBottom: 4,
    },
    tokenStatus: {
      ...FONTS.body5,
      color: colors.textSecondary,
    },
    premiumBadge: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginLeft: 8,
    },
    premiumText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: "bold",
    },
    costContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

  const getTokenStatusText = () => {
    if (isPremium) {
      return "Premium kullanıcı";
    }
    if (remainingTokens >= tokenCost) {
      return `${remainingTokens} token kaldı`;
    }
    return `${remainingTokens} token kaldı (yetersiz)`;
  };

  const getTokenStatusColor = () => {
    if (isPremium) {
      return colors.textSecondary;
    }
    if (remainingTokens >= tokenCost) {
      return colors.textSecondary;
    }
    return colors.error || '#FF6B6B';
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.tokenIconContainer}>
        <Image source={require("../../assets/images/token.png")} style={styles.tokenIcon} />
        {isPremium && (
          <Ionicons 
            name="star" 
            size={16} 
            color={colors.yellow || '#FFD700'} 
            style={styles.premiumStar}
          />
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.moduleName}>{moduleName}</Text>
        <Text style={[styles.tokenStatus, { color: getTokenStatusColor() }]}>
          {getTokenStatusText()}
        </Text>
      </View>

      <View style={styles.costContainer}>
        {isPremium ? (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        ) : (
          showCost && <TokenCostBadge cost={tokenCost} premium={false} />
        )}
      </View>
    </View>
  );
};

export default TokenInfo; 