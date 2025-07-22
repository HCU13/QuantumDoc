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
import { useTranslation } from "react-i18next";
import { MODULES } from "../../constants/modules";
import HomeHeader from "../../components/home/HomeHeader";

const ExploreScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { colors, isDark } = useTheme();
  // useToken ile ilgili import ve kodlar kaldırıldı.
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
    { id: "all", name: t("screens.explore.categories.all") },
    ...Array.from(new Set(MODULES.filter(m => m.enabled && m.category).map(m => m.category)))
      .map(cat => ({ id: cat, name: t(`screens.explore.categories.${cat}`) }))
  ];

  // Seçili kategori
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Tüm modüller
  const allModules = MODULES.filter((m) => m.enabled);

  // Arama filtrelemesi
  const searchFilteredModules = allModules.filter(
    (module) =>
      t(module.titleKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(module.descriptionKey).toLowerCase().includes(searchQuery.toLowerCase())
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
  const handleExploreModulePress = (module) => {
    if (module.route) {
      navigation.navigate(module.route);
    }
  };

  return (
    <GradientBackground mode="default">
      <SafeAreaView style={styles.container}>
        <HomeHeader
          navigation={navigation}
          showProfileImage={false}
          title="Keşfet"
          subtitle="Tüm modülleri keşfet"
        />
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
                        title={t(module.titleKey)}
                        description={t(module.descriptionKey)}
                        moduleId={module.id}
                        icon={module.icon}
                        size="medium"
                        gradientColors={module.gradientColors}
                        tokenCost={module.tokenCost}
                        canAfford={true} // Tokens logic removed
                        onPress={() => handleExploreModulePress(module)}
                        containerStyle={{ marginHorizontal: 0, width: "48%" }}
                        // glowing={true}
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
