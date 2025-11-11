import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";

const NewsCard = ({ 
  title, 
  description, 
  icon, 
  imageUrl,
  onPress,
  containerStyle 
}) => {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      height: 180,
      borderRadius: 20,
      overflow: "hidden",
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    },
    imageBackground: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    overlay: {
      flex: 1,
      background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
      padding: 20,
      justifyContent: "space-between",
    },
    gradientOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      zIndex: 2,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      backdropFilter: "blur(10px)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    content: {
      flex: 1,
      justifyContent: "flex-end",
      zIndex: 2,
    },
    title: {
      ...FONTS.h3,
      color: "#fff",
      fontWeight: "bold",
      marginBottom: 6,
      fontSize: 18,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    description: {
      ...FONTS.body4,
      color: "rgba(255, 255, 255, 0.95)",
      lineHeight: 18,
      fontSize: 13,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={{ borderRadius: 20 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />
        
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon || "sparkles"} size={22} color="#FFD700" />
            </View>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default NewsCard; 