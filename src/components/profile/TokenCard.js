import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";

const TokenCard = ({
  tokens = 0,
  watchedVideosToday = 0,
  canWatchVideoForTokens = () => false,
  onGetTokenPress,
  onHistoryPress,
  containerStyle,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      borderRadius: SIZES.radius * 1.5,
      overflow: "hidden",
      marginVertical: 15,
      borderWidth: 1,
    },
    gradient: {
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    tokenIcon: {
      width: 30,
      height: 30,
      marginRight: 10,
    },
    title: {
      ...FONTS.h3,
      color: colors.textOnPrimary,
      fontWeight: "bold",
    },
    historyButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
    },
    historyText: {
      ...FONTS.body4,
      color: colors.textOnPrimary,
      marginRight: 5,
    },
    content: {
      alignItems: "center",
      marginBottom: 20,
    },
    tokenCount: {
      ...FONTS.largeTitle,
      color: colors.textOnPrimary,
      fontWeight: "bold",
      marginVertical: 10,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 3,
    },
    tokenSubtext: {
      ...FONTS.body3,
      color: colors.textOnPrimary,
      opacity: 0.8,
      textAlign: "center",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.1)",
    },
    videoInfoContainer: {
      flex: 1,
    },
    videoTitle: {
      ...FONTS.body4,
      color: colors.textOnPrimary,
      fontWeight: "bold",
    },
    videoSubtext: {
      ...FONTS.body5,
      color: colors.textOnPrimary,
      opacity: 0.8,
    },
    getTokenButton: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      ...FONTS.body4,
      color: colors.textOnPrimary,
      fontWeight: "bold",
      marginRight: 5,
    },
  });

  return (
    <View
      style={[styles.container, containerStyle, { borderColor: colors.border }]}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Image
              source={require("../../assets/images/token.png")}
              style={styles.tokenIcon}
            />
            <Text style={styles.title}>Token Bakiyeniz</Text>
          </View>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={onHistoryPress}
          >
            <Text style={styles.historyText}>Geçmiş</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textOnPrimary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.tokenCount}>{tokens}</Text>
          <Text style={styles.tokenSubtext}>
            Tokenları kullanarak yapay zeka özelliklerine erişebilirsiniz.
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.videoInfoContainer}>
            <Text style={styles.videoTitle}>Video İzleyerek Token Kazan</Text>
            <Text style={styles.videoSubtext}>
              Bugün {watchedVideosToday}/3 video izlediniz
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.getTokenButton,
              !canWatchVideoForTokens() && styles.buttonDisabled,
            ]}
            onPress={onGetTokenPress}
            disabled={!canWatchVideoForTokens()}
          >
            <Text style={styles.buttonText}>Token Kazan</Text>
            <Ionicons
              name="play-circle-outline"
              size={20}
              color={colors.textOnPrimary}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

export default TokenCard;
