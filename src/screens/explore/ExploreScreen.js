// src/screens/explore/ExploreScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import TokenDisplay from "../../components/common/TokenDisplay";
import ModuleCard from "../../components/explore/ModuleCard";
import SearchBar from "../../components/home/SearchBar";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";
import { useTranslation } from "react-i18next";

const ExploreScreen = ({ navigation }) => {
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SIZES.padding,
      paddingTop: 10,
      paddingBottom: 15,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      ...FONTS.h2,
      color: colors.textPrimary,
      fontWeight: "bold",
    },
    subtitle: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginTop: 5,
    },
    section: {
      marginBottom: 14,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
      marginBottom: 16,
      paddingHorizontal: SIZES.padding,
      fontWeight: "bold",
    },
    categoryContainer: {
      flexDirection: "row",
      paddingHorizontal: SIZES.padding - 2,
    },
    categoryItem: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.7)",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: SIZES.radius,
      marginRight: 8,
      borderWidth: 1,
      borderColor: isDark ? colors.border : "rgba(0, 0, 0, 0.05)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    categoryItemActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryText: {
      ...FONTS.body4,
      color: colors.textPrimary,
    },
    categoryTextActive: {
      color: colors.white,
      fontWeight: "bold",
    },
    modulesContainer: {
      paddingHorizontal: SIZES.padding,
      marginTop: 16,
    },
    moduleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    featuredContainer: {
      paddingHorizontal: 0,
      alignItems: "center",
      width: "100%",
    },
    noResults: {
      ...FONTS.body3,
      color: colors.textSecondary,
      textAlign: "center",
      paddingVertical: 30,
      fontStyle: "italic",
    },
    tokensInfoContainer: {
      alignItems: "center",
      paddingHorizontal: SIZES.padding,
      marginVertical: 20,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.7)",
      borderRadius: SIZES.radius,
      padding: 15,
      borderWidth: 1,
      borderColor: isDark ? colors.border : "rgba(0, 0, 0, 0.05)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    tokensInfoText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 15,
    },
    getTokensButton: {
      marginTop: 10,
      width: "80%",
    },
  });

  // Modül kategorileri
  const categories = [
    { id: "all", name: "Tümü" },
    { id: "productivity", name: "Verimlilik" },
    { id: "education", name: "Eğitim" },
    { id: "creative", name: "Yaratıcılık" },
    { id: "tools", name: "Araçlar" },
    { id: "free", name: "Ücretsiz" },
  ];

  // Seçili kategori
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Tüm modüller
  const allModules = [
    {
      id: "chat",
      title: "AI Sohbet",
      description: "Yapay zeka ile sohbet edin",
      icon: <Ionicons name="chatbubble-outline" size={28} color="#FFF" />,
      gradientColors: [colors.primary, colors.primaryDark],
      category: "productivity",
      featured: true,
    },
    {
      id: "math",
      title: "Matematik",
      description: "Matematik sorularını çözün",
      icon: <Ionicons name="calculator-outline" size={28} color="#FFF" />,
      gradientColors: ["#FF7B54", "#F24C4C"],
      category: "education",
      featured: true,
    },
    {
      id: "write",
      title: "Yazı Üretici",
      description: "Yaratıcı metinler oluşturun",
      icon: <Ionicons name="create-outline" size={28} color="#FFF" />,
      gradientColors: ["#4CACBC", "#1C7293"],
      category: "creative",
      featured: true,
    },
    {
      id: "translate",
      title: "Çeviri",
      description: "Metinleri farklı dillere çevirin",
      icon: <Ionicons name="language-outline" size={28} color="#FFF" />,
      gradientColors: ["#7F7FD5", "#5C5CBD"],
      category: "tools",
    },
    {
      id: "notes",
      title: "Notlar",
      description: "Notlarınızı organize edin",
      icon: <Ionicons name="document-text-outline" size={28} color="#FFF" />,
      gradientColors: ["#3C9D9B", "#52DE97"],
      category: "productivity",
    },
    // {
    //   id: "tasks",
    //   title: "Görevler",
    //   description: "Görevlerinizi yönetin",
    //   icon: <Ionicons name="checkbox-outline" size={28} color="#FFF" />,
    //   gradientColors: ["#FF78C4", "#E252DC"],
    //   category: "productivity",
    // },
    // {
    //   id: "voice",
    //   title: "Sesli Okuma",
    //   description: "Metinleri seslendirir",
    //   icon: <Ionicons name="volume-high-outline" size={28} color="#FFF" />,
    //   gradientColors: ["#FF9A8B", "#FF6A88"],
    //   category: "tools",
    // },
    // {
    //   id: "calendar",
    //   title: "Takvim",
    //   description: "Etkinliklerinizi planlayın",
    //   icon: <Ionicons name="calendar-outline" size={28} color="#FFF" />,
    //   gradientColors: ["#A18CD1", "#FBC2EB"],
    //   category: "productivity",
    // },
  ];

  // Arama filtrelemesi
  const searchFilteredModules = allModules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kategori filtrelemesi
  const categoryFilteredModules = searchFilteredModules.filter(
    (module) =>
      selectedCategory === "all" ||
      (selectedCategory === "free"
        ? module.id === "tasks"
        : module.category === selectedCategory)
  );

  // Filtrelenmiş modüller 2'li satırlar halinde düzenleniyor
  const moduleRows = [];
  for (let i = 0; i < categoryFilteredModules.length; i += 2) {
    moduleRows.push(categoryFilteredModules.slice(i, i + 2));
  }

  // Modül tıklandığında
  const handleModulePress = (module) => {
    console.log(`Modül tıklandı: ${module.id}`);

    // Modüle özgü ekranlara yönlendir
    switch (module.id) {
      case "chat":
        navigation.navigate("Chat", { screen: "ChatRooms" });
        break;
      case "math":
        navigation.navigate("MathHome");
        break;
      case "write":
        navigation.navigate("WriteHome");
        break;
      case "translate":
        navigation.navigate("TranslateHome");
        break;
      case "notes":
        navigation.navigate("NotesHome");
        break;
      // case "tasks":
      //   navigation.navigate("TasksHome");
      //   break;
      // case "voice":
      //   navigation.navigate("VoiceHome");
      //   break;
      // case "calendar":
      //   navigation.navigate("CalendarHome");
      //   break;
      default:
        console.log(`${module.id} için henüz ekran oluşturulmadı`);
    }
  };

  return (
    <GradientBackground mode="default">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{t("screens.explore.title")}</Text>
            <Text style={styles.subtitle}>{t("screens.explore.subtitle")}</Text>
          </View>

          <TokenDisplay onPress={() => navigation.navigate("Tokens")} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("screens.explore.searchPlaceholder")}
            onSubmit={() => console.log(`Arama: ${searchQuery}`)}
          />

          {!searchQuery && (
            <View style={styles.section}>
              <View style={styles.featuredContainer}>
                {/* AI Sohbet (chat) kartı kaldırıldı */}
              </View>
            </View>
          )}

          <View style={styles.section}>
            {/* <Text style={styles.sectionTitle}>Kategoriler</Text> */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.id &&
                      styles.categoryItemActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            {searchQuery && (
              <Text style={styles.sectionTitle}>
                {searchQuery ? "Arama Sonuçları" : ""}
              </Text>
            )}

            {categoryFilteredModules.length > 0 ? (
              <View style={styles.modulesContainer}>
                {moduleRows.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.moduleRow}>
                    {row.map((module) => (
                      <ModuleCard
                        key={module.id}
                        title={module.title}
                        description={module.description}
                        moduleId={module.id}
                        icon={module.icon}
                        gradientColors={module.gradientColors}
                        onPress={handleModulePress}
                        containerStyle={{ marginHorizontal: 0, width: "48%" }}
                        glowing={true}
                      />
                    ))}
                    {row.length === 1 && <View style={{ width: "48%" }} />}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noResults}>
                Aradığınız kriterlere uygun modül bulunamadı
              </Text>
            )}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ExploreScreen;
