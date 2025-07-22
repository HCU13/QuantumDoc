import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { SIZES, FONTS } from "../../constants/theme";

const MathFormulasScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Formül kategorileri
  const categories = [
    { key: "all", label: "Tümü", icon: "apps" },
    { key: "algebra", label: "Cebir", icon: "calculator" },
    { key: "geometry", label: "Geometri", icon: "triangle" },
    { key: "calculus", label: "Kalkülüs", icon: "analytics" },
    { key: "trigonometry", label: "Trigonometri", icon: "compass" },
  ];

  // Formül veritabanı
  const formulas = {
    algebra: [
      {
        id: 1,
        name: "Kuadratik Formül",
        formula: "x = (-b ± √(b² - 4ac)) / 2a",
        description: "İkinci derece denklemler için kullanılır",
        example: "x² + 5x + 6 = 0",
        variables: "a, b, c: denklemin katsayıları"
      },
      {
        id: 2,
        name: "Faktöriyel",
        formula: "n! = n × (n-1) × (n-2) × ... × 1",
        description: "Bir sayının faktöriyeli",
        example: "5! = 5 × 4 × 3 × 2 × 1 = 120",
        variables: "n: pozitif tam sayı"
      },
      {
        id: 3,
        name: "Binom Açılımı",
        formula: "(a + b)ⁿ = Σ C(n,k) × a^(n-k) × b^k",
        description: "İki terimli ifadelerin açılımı",
        example: "(x + y)² = x² + 2xy + y²",
        variables: "a, b: terimler, n: üs"
      }
    ],
    geometry: [
      {
        id: 4,
        name: "Üçgen Alanı",
        formula: "A = (1/2) × b × h",
        description: "Üçgenin alanı",
        example: "b = 6, h = 4 → A = (1/2) × 6 × 4 = 12",
        variables: "b: taban, h: yükseklik"
      },
      {
        id: 5,
        name: "Daire Alanı",
        formula: "A = π × r²",
        description: "Dairenin alanı",
        example: "r = 5 → A = π × 5² = 25π",
        variables: "r: yarıçap"
      },
      {
        id: 6,
        name: "Pisagor Teoremi",
        formula: "a² + b² = c²",
        description: "Dik üçgende hipotenüs",
        example: "a = 3, b = 4 → c = √(3² + 4²) = 5",
        variables: "a, b: dik kenarlar, c: hipotenüs"
      }
    ],
    calculus: [
      {
        id: 7,
        name: "Türev Kuralı",
        formula: "d/dx(xⁿ) = n × x^(n-1)",
        description: "Güç kuralı türevi",
        example: "d/dx(x³) = 3x²",
        variables: "n: üs"
      },
      {
        id: 8,
        name: "İntegral Kuralı",
        formula: "∫ xⁿ dx = x^(n+1)/(n+1) + C",
        description: "Güç kuralı integrali",
        example: "∫ x² dx = x³/3 + C",
        variables: "n: üs, C: sabit"
      },
      {
        id: 9,
        name: "Zincir Kuralı",
        formula: "d/dx(f(g(x))) = f'(g(x)) × g'(x)",
        description: "Bileşik fonksiyon türevi",
        example: "d/dx(sin(x²)) = cos(x²) × 2x",
        variables: "f, g: fonksiyonlar"
      }
    ],
    trigonometry: [
      {
        id: 10,
        name: "Sinüs Teoremi",
        formula: "a/sin(A) = b/sin(B) = c/sin(C)",
        description: "Üçgende açı-kenar ilişkisi",
        example: "A = 30°, a = 6 → b = 6 × sin(B)/sin(30°)",
        variables: "a, b, c: kenarlar, A, B, C: açılar"
      },
      {
        id: 11,
        name: "Kosinüs Teoremi",
        formula: "c² = a² + b² - 2ab × cos(C)",
        description: "Üçgende kenar-kenar-açı ilişkisi",
        example: "a = 3, b = 4, C = 60° → c = √(9 + 16 - 24cos(60°))",
        variables: "a, b, c: kenarlar, C: açı"
      },
      {
        id: 12,
        name: "Temel Trigonometrik Özdeşlikler",
        formula: "sin²(x) + cos²(x) = 1",
        description: "Temel trigonometrik özdeşlik",
        example: "sin(30°)² + cos(30°)² = (1/2)² + (√3/2)² = 1",
        variables: "x: açı"
      }
    ]
  };

  const handleFormulaSelect = (formula) => {
    // Formülü kopyala veya matematik çözücüye gönder
    navigation.navigate('MathSolver', { 
      initialProblem: formula.example || formula.formula 
    });
  };

  const getFilteredFormulas = () => {
    let allFormulas = [];
    
    if (selectedCategory === "all") {
      Object.values(formulas).forEach(categoryFormulas => {
        allFormulas = [...allFormulas, ...categoryFormulas];
      });
    } else {
      allFormulas = formulas[selectedCategory] || [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return allFormulas.filter(formula => 
        formula.name.toLowerCase().includes(query) ||
        formula.description.toLowerCase().includes(query) ||
        formula.formula.toLowerCase().includes(query)
      );
    }

    return allFormulas;
  };

  const styles = {
    container: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    scroll: {
      flex: 1,
      paddingHorizontal: 18,
    },
    searchContainer: {
      marginBottom: 20,
    },
    searchInput: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: colors.textPrimary,
      ...FONTS.body4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryContainer: {
      marginBottom: 20,
    },
    categoryTitle: {
      ...FONTS.h5,
      color: colors.textPrimary,
      fontWeight: "bold",
      marginBottom: 12,
    },
    categoryButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    categoryBtn: (selected) => ({
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: selected ? colors.mathPrimary : colors.card,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: selected ? colors.mathPrimary : colors.border,
    }),
    categoryBtnText: (selected) => ({
      ...FONTS.body5,
      color: selected ? colors.white : colors.textPrimary,
      marginLeft: 6,
      fontWeight: "500",
    }),
    formulaCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    formulaHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    formulaName: {
      ...FONTS.h6,
      color: colors.textPrimary,
      fontWeight: "bold",
      flex: 1,
      marginRight: 8,
    },
    useButton: {
      backgroundColor: colors.mathPrimary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: SIZES.radius,
    },
    useButtonText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: "bold",
    },
    formulaText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      fontFamily: "monospace",
      marginBottom: 8,
      backgroundColor: colors.background,
      padding: 8,
      borderRadius: 4,
    },
    descriptionText: {
      ...FONTS.body5,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    exampleText: {
      ...FONTS.body5,
      color: colors.textSecondary,
      fontStyle: "italic",
      marginBottom: 4,
    },
    variablesText: {
      ...FONTS.body6,
      color: colors.textTertiary,
      fontStyle: "italic",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyStateIcon: {
      marginBottom: 16,
    },
    emptyStateText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      textAlign: "center",
    },
  };

  const filteredFormulas = getFilteredFormulas();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
        <Header title="Formül Kütüphanesi" />
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Arama */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Formül ara..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Kategoriler */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>Kategoriler</Text>
            <View style={styles.categoryButtons}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={styles.categoryBtn(selectedCategory === category.key)}
                  onPress={() => setSelectedCategory(category.key)}
                >
                  <Ionicons 
                    name={category.icon} 
                    size={16} 
                    color={selectedCategory === category.key ? colors.white : colors.textPrimary} 
                  />
                  <Text style={styles.categoryBtnText(selectedCategory === category.key)}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Formüller */}
          {filteredFormulas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={colors.textTertiary} style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateText}>
                {searchQuery.trim() ? "Aradığınız formül bulunamadı" : "Bu kategoride formül bulunamadı"}
              </Text>
            </View>
          ) : (
            filteredFormulas.map((formula) => (
              <Card key={formula.id} style={styles.formulaCard}>
                <View style={styles.formulaHeader}>
                  <Text style={styles.formulaName}>{formula.name}</Text>
                  <TouchableOpacity 
                    style={styles.useButton}
                    onPress={() => handleFormulaSelect(formula)}
                  >
                    <Text style={styles.useButtonText}>Kullan</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.formulaText}>{formula.formula}</Text>
                <Text style={styles.descriptionText}>{formula.description}</Text>
                
                {formula.example && (
                  <Text style={styles.exampleText}>Örnek: {formula.example}</Text>
                )}
                
                {formula.variables && (
                  <Text style={styles.variablesText}>Değişkenler: {formula.variables}</Text>
                )}
              </Card>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default MathFormulasScreen; 