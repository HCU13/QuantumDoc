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
  gradientColors, 
  imageUrl,
  onPress,
  containerStyle 
}) => {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: 260,
      height: 140,
      marginRight: 12,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    imageBackground: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      padding: 16,
      justifyContent: "space-between",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      flex: 1,
      justifyContent: "flex-end",
    },
    title: {
      ...FONTS.h4,
      color: "#fff",
      fontWeight: "bold",
      marginBottom: 4,
      fontSize: 16,
    },
    description: {
      ...FONTS.body4,
      color: "rgba(255, 255, 255, 0.9)",
      lineHeight: 16,
      fontSize: 12,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={18} color="#FFD700" />
            </View>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
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