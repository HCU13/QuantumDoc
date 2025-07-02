import React from "react";
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";
import Button from "../../components/common/Button";

const NewsDetailScreen = ({ route, navigation }) => {
  const news = route.params?.news;
  const { colors, isDark } = useTheme();

  if (!news) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.textPrimary }}>Haber bulunamadı</Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background : colors.white,
    },
    image: {
      width: "100%",
      height: 260,
      justifyContent: "flex-start",
    },
    backButtonContainer: {
      position: "absolute",
      top: 0,
      left: 24,
      zIndex: 10,
      paddingTop: 10,
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(255,255,255,0.85)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.10,
      shadowRadius: 4,
      elevation: 2,
    },
    contentContainer: {
      flex: 1,
      marginTop: -32,
      backgroundColor: isDark ? colors.background : colors.white,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 22,
      paddingTop: 32,
      paddingBottom: 32,
      minHeight: 300,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    title: {
      ...FONTS.h2,
      color: colors.textPrimary,
      fontWeight: "bold",
      marginBottom: 8,
      textAlign: "left",
      letterSpacing: 0.1,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary || "#6B7280",
      marginBottom: 18,
      textAlign: "left",
      fontWeight: "400",
      lineHeight: 22,
    },
    date: {
      ...FONTS.body5,
      color: colors.textSecondary,
      opacity: 0.8,
      marginBottom: 8,
      textAlign: "left",
    },
    categoryBadge: {
      alignSelf: "flex-start",
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 10,
      marginTop: 0,
    },
    categoryText: {
      ...FONTS.body5,
      color: colors.white,
      fontWeight: "bold",
      fontSize: 11,
    },
    content: {
      ...FONTS.body4,
      color: colors.textPrimary,
      lineHeight: 24,
      marginBottom: 24,
      textAlign: "left",
      fontWeight: "400",
    },
    actionButton: {
      marginBottom: 18,
    },
  });

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ position: "relative" }}>
          <ImageBackground source={{ uri: news.imageUrl }} style={styles.image}>
            <SafeAreaView style={styles.backButtonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={22} color={colors.primary} />
              </TouchableOpacity>
            </SafeAreaView>
          </ImageBackground>
        </View>
        <View style={styles.contentContainer}>
          {news.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{news.category.toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.title}>{news.title}</Text>
          {news.createdAt && (
            <Text style={styles.date}>{new Date(news.createdAt).toLocaleDateString()}</Text>
          )}
          <Text style={styles.description}>{news.description}</Text>
          <Text style={styles.content}>{news.content || ""}</Text>
          {news.actionUrl && news.actionText && (
            <Button
              title={news.actionText}
              onPress={() => navigation.navigate("WebViewScreen", { url: news.actionUrl })}
              gradient
              containerStyle={styles.actionButton}
            />
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

export default NewsDetailScreen; 