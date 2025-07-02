import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

const RewardCard = ({ reward, onPress, containerStyle }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 15,
      marginVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    contentContainer: {
      flex: 1,
    },
    title: {
      ...FONTS.h4,
      color: colors.textOnGradient,
      marginBottom: 4,
      fontWeight: "bold",
    },
    description: {
      ...FONTS.body5,
      color: colors.textOnGradient,
      opacity: 0.8,
    },
    rewardContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    tokenIcon: {
      width: 16,
      height: 16,
      marginRight: 5,
    },
    rewardText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      fontWeight: "bold",
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle, { borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={reward.icon} size={24} color={colors.textOnGradient} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{reward.title}</Text>
        <Text style={styles.description}>{reward.description}</Text>
      </View>

      <View style={styles.rewardContainer}>
        <Image
          source={require("../../assets/images/token.png")}
          style={styles.tokenIcon}
        />
        <Text style={styles.rewardText}>+{reward.tokens}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default RewardCard;
