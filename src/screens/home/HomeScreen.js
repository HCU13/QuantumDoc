// src/screens/home/HomeScreen.js
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import HomeHeader from "../../components/home/HomeHeader";
import SearchBar from "../../components/home/SearchBar";
import QuickActions from "../../components/home/QuickActions";
import RecentActivity from "../../components/home/RecentActivity";
import BubbleFeature from "../../components/home/BubbleFeature";
import NewsSection from "../../components/home/NewsSection";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";
import { useTranslation } from "react-i18next";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { colors, isDark } = useTheme();
  const { tokens } = useToken();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
    },
    personalAssistantContainer: {
      paddingHorizontal: SIZES.padding,
      marginVertical: 20,
    },
    robotCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: SIZES.radius * 2,
      padding: 20,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.8)",
      borderWidth: 1,
      borderColor: isDark ? colors.border : "rgba(0, 0, 0, 0.05)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    robotImage: {
      width: 80,
      height: 80,
      marginRight: 15,
    },
    robotTextContainer: {
      flex: 1,
    },
    robotTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
      marginBottom: 5,
      fontWeight: "bold",
    },
    robotDescription: {
      ...FONTS.body4,
      color: colors.textSecondary,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
      marginTop: 10,
      marginBottom: 20,
      textAlign: "center",
      fontWeight: "bold",
    },
    bubblesContainer: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    startChatButton: {
      marginHorizontal: SIZES.padding,
      marginBottom: 20,
    },
  });

  // Örnek son aktiviteler veri seti
  const recentActivities = [
    {
      id: "1",
      title: "Matematik Sorusu",
      description: "x²+5x+6=0 denklemini çöz",
      time: "1s önce",
      type: "math",
    },
    {
      id: "2",
      title: "İngilizce Çeviri",
      description: "Türkçe metni İngilizceye çevir",
      time: "3s önce",
      type: "translate",
    },
    {
      id: "3",
      title: "Toplantı Notu",
      description: "Proje planlaması hakkında not",
      time: "5s önce",
      type: "note",
    },
  ];

  // Örnek haberler ve kampanyalar veri seti
  const newsData = [
    {
      id: "1",
      title: "Yeni AI Modeli",
      description: "Daha hızlı ve akıllı yanıtlar için güncellenmiş AI modeli kullanıma sunuldu",
      icon: "sparkles",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
    },
    {
      id: "2",
      title: "Premium Kampanya",
      description: "Sınırlı süre için %50 indirim! Premium özellikleri keşfedin",
      icon: "star",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop",
    },
    {
      id: "3",
      title: "Çoklu Dil Desteği",
      description: "Artık 10 farklı dilde çeviri yapabilirsiniz",
      icon: "language",
      imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=200&fit=crop",
    },
    {
      id: "4",
      title: "Matematik Çözücü",
      description: "Karmaşık matematik problemlerini fotoğrafla çözün",
      icon: "calculator",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
    },
  ];

  // Modül veya hızlı erişim butonu tıklandığında
  const handleModulePress = (module) => {
    console.log(`Modül tıklandı: ${module.id}`);

    // Modüle özgü ekranlara yönlendir
    switch (module.id) {
      case "chat":
        navigation.navigate("Chat");
        break;
      case "math":
        navigation.navigate("Math");
        break;
      case "write":
        navigation.navigate("Text");
        break;
      case "translate":
        navigation.navigate("Translate");
        break;
      case "tasks":
        navigation.navigate("NotesNavigation", { screen: "Notes" });
        break;
      case "assistant":
        navigation.navigate("Chat");
        break;
      default:
        // Varsayılan olarak explore sayfasına yönlendir
        navigation.navigate("NotesNavigation", { screen: "Notes" });
    }
  };

  // Son aktivite öğesi tıklandığında
  const handleActivityPress = (activity) => {
    console.log(`Aktivite tıklandı: ${activity.id}`);
    navigation.navigate("Activity");
  };

  // Haber kartı tıklandığında
  const handleNewsPress = (news) => {
    navigation.navigate("NewsDetail", { news });
  };

  // Arama sorgusu gönderildiğinde
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log(`Arama yapıldı: ${searchQuery}`);
      navigation.navigate("Chat", { initialQuery: searchQuery });
    }
  };

  return (
    <GradientBackground mode="default">
      <SafeAreaView style={styles.container}>
        <HomeHeader
          username="Arafat"
          onProfilePress={() => navigation.navigate("Profile")}
          onSettingsPress={() => navigation.navigate("Settings")}
          navigation={navigation}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Son Yenilikler ve Kampanyalar */}
          <NewsSection 
            data={newsData}
            onCardPress={handleNewsPress}
          />

          {/* Kişisel AI Asistan Kartı */}
          <View style={styles.personalAssistantContainer}>
            <TouchableOpacity
              style={styles.robotCard}
              onPress={() => handleModulePress({ id: "assistant" })}
              activeOpacity={0.9}
            >
              <Image
                source={require("../../assets/images/robot.png")}
                style={styles.robotImage}
              />
              <View style={styles.robotTextContainer}>
                <Text style={styles.robotTitle}>{t("screens.home.assistant.title")}</Text>
                <Text style={styles.robotDescription}>
                  {t("screens.home.assistant.description")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <QuickActions onActionPress={handleModulePress} />

          {/* Son Aktiviteler Bölümü */}
          <RecentActivity
            data={recentActivities}
            onItemPress={handleActivityPress}
            onSeeAllPress={() => navigation.navigate("Activity")}
          />

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default HomeScreen;
