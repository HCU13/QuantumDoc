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
  Animated,
} from "react-native";
import {
  SIZES,
  FONTS,
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import ModuleCard from "../../components/explore/ModuleCard";
import SearchBar from "../../components/home/SearchBar";
import CategoryFilter from "../../components/common/CategoryFilter";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { MODULES } from "../../constants/modules";
import HomeHeader from "../../components/home/HomeHeader";
import { useFavoriteModules } from "../../hooks/useFavoriteModules";
import { useFavoriteRefresh } from "../../contexts/FavoriteRefreshContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabase";
import { showSuccess } from "../../utils/toast";

const ExploreScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { favoriteModules } = useFavoriteModules();
  const { triggerRefresh } = useFavoriteRefresh();
  const { user } = useAuth();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
    },
    content: {
      flex: 1,
      paddingTop: 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      ...TEXT_STYLES.titleLarge,
      color: colors.textPrimary,
    },
    subtitle: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      marginTop: SPACING.xs,
    },
    section: {
      marginBottom: SPACING.xs,
    },
    sectionTitle: {
      ...TEXT_STYLES.titleMedium,
      color: colors.textPrimary,
      marginBottom: SPACING.md,
      paddingHorizontal: SPACING.md,
    },

    modulesContainer: {
      paddingHorizontal: SPACING.md,
      marginTop: 0,
    },
    featuredContainer: {
      paddingHorizontal: 0,
      alignItems: "center",
      width: "100%",
    },
    noResults: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textSecondary,
      textAlign: "center",
      paddingVertical: SPACING.xl,
      fontStyle: "italic",
    },
    tokensInfoContainer: {
      alignItems: "center",
      paddingHorizontal: SPACING.md,
      marginVertical: SPACING.lg,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.7)",
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: isDark ? colors.border : "rgba(0, 0, 0, 0.05)",
      ...SHADOWS.small,
    },
    tokensInfoText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: SPACING.md,
    },
    getTokensButton: {
      marginTop: SPACING.sm,
      width: "80%",
    },
  });

  // Modül kategorileri
  const categories = [
    {
      id: "all",
      name: t("explore.categories.all"),
      icon: "apps-outline",
    },
    {
      id: "tools",
      name: t("explore.categories.tools"),
      icon: "construct-outline",
    },
    {
      id: "education",
      name: t("explore.categories.education"),
      icon: "school-outline",
    },
    {
      id: "productivity",
      name: t("explore.categories.productivity"),
      icon: "checkmark-circle-outline",
    },
    {
      id: "information",
      name: t("explore.categories.information"),
      icon: "information-circle-outline",
    },
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

  // Filtrelenmiş modüller alt alta dizilecek

  // Modül tıklandığında
  const handleExploreModulePress = (moduleData) => {
    if (selectionMode) {
      // Seçim modunda checkbox toggle
      handleModuleSelect(moduleData.id);
    } else {
      const module = MODULES.find((m) => m.id === moduleData.id);
      if (module?.route) {
        navigation.navigate(module.route);
      }
    }
  };

  // Modül seçimi toggle
  const handleModuleSelect = (moduleId) => {
    setSelectedModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  // Seçim modunu aç
  const handleStartSelection = () => {
    setSelectionMode(true);
    setSelectedModules([...favoriteModules]); // Mevcut favorileri seçili yap
  };

  // Seçim modunu iptal et
  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedModules([]);
  };

  // Tümünü seç/seçimi kaldır
  const handleSelectAll = () => {
    if (selectedModules.length === categoryFilteredModules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(categoryFilteredModules.map((m) => m.id));
    }
  };

  // Seçilenleri kaydet
  const handleSaveSelection = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ favorite_modules: selectedModules })
        .eq("id", user.id);

      if (error) {
        if (__DEV__) console.error("❌ FAVORITES: Save error:", error);
        return;
      }

      triggerRefresh(); // Ana sayfadaki favorileri yenile
      setSelectionMode(false);
      showSuccess(t("common.success"), t("explore.favoritesSaved"));
    } catch (error) {
      if (__DEV__) console.error("❌ FAVORITES: Save error:", error);
    }
  };

  return (
    <GradientBackground mode="default">
      <SafeAreaView style={styles.container}>
        <HomeHeader
          navigation={navigation}
          showProfileImage={false}
          title={
            selectionMode
              ? `${selectedModules.length} ${t("explore.selected")}`
              : t("explore.title")
          }
          subtitle={
            selectionMode ? t("explore.selectionMode") : t("explore.subtitle")
          }
          rightButton={
            selectionMode ? (
              <View style={{ flexDirection: "row", gap: SPACING.xs }}>
                {selectedModules.length > 0 && (
                  <TouchableOpacity
                    onPress={handleSaveSelection}
                    style={{
                      backgroundColor: colors.success,
                      borderRadius: BORDER_RADIUS.md,
                      padding: SPACING.xs,
                      marginRight: SPACING.xs,
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleSelectAll}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.xs,
                    marginRight: SPACING.xs,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      selectedModules.length === categoryFilteredModules.length
                        ? "square"
                        : "checkbox"
                    }
                    size={20}
                    color={colors.textOnGradient}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancelSelection}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.xs,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={colors.textOnGradient}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleStartSelection}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: SPACING.sm,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="star-outline" size={22} color={colors.black} />
              </TouchableOpacity>
            )
          }
        />

        {/* Seçim modu bilgi banner'ı */}
        {selectionMode && (
          <View
            style={{
              backgroundColor: isDark
                ? colors.primary + "25"
                : colors.primary + "15",
              padding: SPACING.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                ...TEXT_STYLES.bodySmall,
                color: colors.textPrimary,
                textAlign: "center",
              }}
            >
              {t("explore.selectionInfo")}
            </Text>
          </View>
        )}

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("explore.searchPlaceholder")}
          onSubmit={() => console.log(`Arama: ${searchQuery}`)}
        />
        <View>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            {searchQuery && (
              <Text style={styles.sectionTitle}>
                {t("explore.searchResults")}
              </Text>
            )}

            {categoryFilteredModules.length > 0 ? (
              <View style={styles.modulesContainer}>
                {categoryFilteredModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    title={t(module.titleKey)}
                    description={t(module.descriptionKey)}
                    moduleId={module.id}
                    icon={module.icon}
                    size="medium"
                    gradientColors={module.gradientColors}
                    tokenCost={module.tokenCost}
                    tokenCostRange={module.tokenCostRange}
                    category={module.category}
                    onPress={() => handleExploreModulePress(module)}
                    containerStyle={{ marginBottom: SPACING.xs }}
                    isSelectionMode={selectionMode}
                    isSelected={selectedModules.includes(module.id)}
                    onSelect={handleModuleSelect}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.noResults}>{t("explore.noResults")}</Text>
            )}
          </View>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ExploreScreen;
