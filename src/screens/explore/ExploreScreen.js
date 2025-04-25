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

const ExploreScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { colors } = useTheme();
  const { tokens } = useToken();

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
      color: colors.textOnGradient,
      fontWeight: "bold",
      textShadowColor: "rgba(0,0,0,0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    subtitle: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      marginTop: 5,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginBottom: 16,
      paddingHorizontal: SIZES.padding,
      fontWeight: "bold",
      textShadowColor: "rgba(0,0,0,0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    categoryContainer: {
      flexDirection: "row",
      paddingHorizontal: SIZES.padding - 8,
    },
    categoryItem: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: SIZES.radius,
      marginRight: 8,
      borderWidth: 1,
    },
    categoryItemActive: {
      backgroundColor: colors.primary,
    },
    categoryText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
    },
    categoryTextActive: {
      color: colors.textOnPrimary,
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
      paddingHorizontal: SIZES.padding,
      right: 10,
    },
    noResults: {
      ...FONTS.body3,
      color: colors.textOnGradient,
      textAlign: "center",
      paddingVertical: 30,
      fontStyle: "italic",
    },
    tokensInfoContainer: {
      alignItems: "center",
      paddingHorizontal: SIZES.padding,
      marginVertical: 20,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: SIZES.radius,
      padding: 15,
      borderWidth: 1,

    },
    tokensInfoText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
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
      id: "tasks",
      title: "Görevler",
      description: "Görevlerinizi yönetin",
      icon: <Ionicons name="checkbox-outline" size={28} color="#FFF" />,
      gradientColors: ["#FF78C4", "#E252DC"],
      category: "productivity",
    },
    {
      id: "voice",
      title: "Sesli Okuma",
      description: "Metinleri seslendirir",
      icon: <Ionicons name="volume-high-outline" size={28} color="#FFF" />,
      gradientColors: ["#FF9A8B", "#FF6A88"],
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
    {
      id: "calendar",
      title: "Takvim",
      description: "Etkinliklerinizi planlayın",
      icon: <Ionicons name="calendar-outline" size={28} color="#FFF" />,
      gradientColors: ["#A18CD1", "#FBC2EB"],
      category: "productivity",
    },
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

  // Öne çıkan modüller
  // const featuredModules = allModules.filter((module) => module.featured);

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
        navigation.navigate("Chat");
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
      case "tasks":
        navigation.navigate("TasksHome");
        break;
      case "voice":
        navigation.navigate("VoiceHome");
        break;
      case "notes":
        navigation.navigate("NotesHome");
        break;
      case "calendar":
        navigation.navigate("CalendarHome");
        break;
      default:
        console.log(`${module.id} için henüz ekran oluşturulmadı`);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        /> */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Keşfet</Text>
            <Text style={styles.subtitle}>Tüm AI özellikleri</Text>
          </View>

          <TokenDisplay onPress={() => navigation.navigate("Tokens")} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Modül veya özellik arayın..."
            onSubmit={() => console.log(`Arama: ${searchQuery}`)}
          />

          {/* {tokens < 5 && (
            <View style={styles.tokensInfoContainer}>
              <Text style={styles.tokensInfoText}>
                Daha fazla özelliğe erişmek için token kazanın!
              </Text>
              <Button
                title="Token Kazan"
                neon
                icon={
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.textOnGradient}
                  />
                }
                onPress={() => navigation.navigate("Tokens")}
                containerStyle={styles.getTokensButton}
                size="small"
              />
            </View>
          )} */}

          {!searchQuery && (
            <View style={styles.section}>
              {/* <Text style={styles.sectionTitle}>Öne Çıkan</Text> */}
              <View style={styles.featuredContainer}>
                <ModuleCard
                  title="AI Sohbet"
                  description="Yapay zeka asistanı ile konuşun, sorularınızı sorun"
                  moduleId="chat"
                  icon={
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={36}
                      color="#FFF"
                    />
                  }
                  gradientColors={[colors.primary, colors.primaryDark]}
                  onPress={handleModulePress}
                  size="large"
                  glowing={true}
                />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kategoriler</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    [styles.categoryItem, { borderColor: colors.border }],
                    selectedCategory === category.id && [
                      styles.categoryItemActive,
                      { borderColor: colors.border },
                    ],
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
