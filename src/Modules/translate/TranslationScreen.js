import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";
import { useTranslate } from "../../hooks/useTranslate";
import { useTranslation } from "react-i18next";

const TranslationScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const { t } = useTranslation();
  const { 
    translateText, 
    loading, 
    error,
    translatedText,
    supportedLanguages 
  } = useTranslate();

  const [sourceText, setSourceText] = useState("");
  const [translatedResult, setTranslatedResult] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("tr");
  const [isFavorited, setIsFavorited] = useState(false);

  const tokenCost = 1; // Çeviri maliyeti
  const remainingTokens = tokens - tokenCost;

  // Desteklenen diller
  const languages = [
    { code: "auto", name: "Otomatik Algıla", flag: "🌐" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "en", name: "İngilizce", flag: "🇺🇸" },
    { code: "de", name: "Almanca", flag: "🇩🇪" },
    { code: "fr", name: "Fransızca", flag: "🇫🇷" },
    { code: "es", name: "İspanyolca", flag: "🇪🇸" },
    { code: "it", name: "İtalyanca", flag: "🇮🇹" },
    { code: "ru", name: "Rusça", flag: "🇷🇺" },
    { code: "ar", name: "Arapça", flag: "🇸🇦" },
    { code: "zh", name: "Çince", flag: "🇨🇳" },
    { code: "ja", name: "Japonca", flag: "🇯🇵" },
    { code: "ko", name: "Korece", flag: "🇰🇷" },
  ];

  // Çeviri yapma
  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      Alert.alert("Hata", "Lütfen çevrilecek metni girin");
      return;
    }

    if (remainingTokens < 0) {
      Alert.alert(
        "Yetersiz Token",
        `Bu çeviri için ${tokenCost} token gerekiyor. Daha fazla token kazanmak için token sayfanıza gidin.`,
        [
          { text: "İptal", style: "cancel" },
          { text: "Token Al", onPress: () => navigation.navigate("Tokens") },
        ]
      );
      return;
    }

    try {
      const result = await translateText(sourceText, sourceLanguage, targetLanguage);
      setTranslatedResult(result);
      
      // Token kullan
      await useTokens(tokenCost);
    } catch (error) {
      Alert.alert("Hata", error.message || "Çeviri yapılırken bir hata oluştu");
    }
  };

  // Dilleri değiştirme
  const swapLanguages = () => {
    if (sourceLanguage !== "auto") {
      const temp = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(temp);
      
      // Metinleri de değiştir
      setSourceText(translatedResult);
      setTranslatedResult("");
    }
  };

  // Favorilere ekleme/çıkarma
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // Burada favori çevirileri kaydetme işlemi yapılabilir
  };

  // Metni temizleme
  const clearText = () => {
    setSourceText("");
    setTranslatedResult("");
  };

  // Metni kopyalama
  const copyText = (text) => {
    // Clipboard API kullanılabilir
    Alert.alert("Kopyalandı", "Metin panoya kopyalandı");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    content: {
      flex: 1,
      padding: SIZES.padding,
    },
    header: {
      marginBottom: 30,
    },
    title: {
      ...FONTS.h2,
      color: colors.textPrimary,
      marginBottom: 10,
    },
    subtitle: {
      ...FONTS.body4,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    languageSelector: {
      marginBottom: 20,
    },
    languageRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    languageButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: SIZES.radius,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: 5,
    },
    languageButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    languageFlag: {
      fontSize: 20,
      marginRight: 8,
    },
    languageText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      flex: 1,
    },
    languageTextActive: {
      color: colors.white,
    },
    swapButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textInputContainer: {
      marginBottom: 20,
    },
    textInput: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 16,
      minHeight: 120,
      textAlignVertical: "top",
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      ...FONTS.body4,
    },
    resultContainer: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    resultTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
    },
    resultActions: {
      flexDirection: "row",
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
    },
    resultText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    translateButton: {
      marginBottom: 20,
    },
    tokenInfo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    tokenText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    recentTranslations: {
      marginTop: 20,
    },
    recentTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      marginBottom: 15,
    },
    recentItem: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 12,
      marginBottom: 8,
    },
    recentText: {
      ...FONTS.body4,
      color: colors.textSecondary,
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />

        <Header title={t("modules.translate.title")} showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("modules.translate.title")}</Text>
            <Text style={styles.subtitle}>
              {t("modules.translate.subtitle")}
            </Text>
          </View>

          <View style={styles.tokenInfo}>
            <Ionicons name="diamond-outline" size={20} color={colors.primary} />
            <Text style={styles.tokenText}>
              {t("modules.translate.tokenCost", { cost: tokenCost })}
            </Text>
          </View>

          <View style={styles.languageSelector}>
            <View style={styles.languageRow}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  sourceLanguage === "auto" && styles.languageButtonActive,
                ]}
                onPress={() => {
                  // Dil seçici modal açılabilir
                }}
              >
                <Text style={styles.languageFlag}>
                  {languages.find(lang => lang.code === sourceLanguage)?.flag || "🌐"}
                </Text>
                <Text
                  style={[
                    styles.languageText,
                    sourceLanguage === "auto" && styles.languageTextActive,
                  ]}
                >
                  {languages.find(lang => lang.code === sourceLanguage)?.name || "Otomatik"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.swapButton} onPress={swapLanguages}>
                <Ionicons name="swap-horizontal" size={20} color={colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageButton,
                  targetLanguage === "tr" && styles.languageButtonActive,
                ]}
                onPress={() => {
                  // Dil seçici modal açılabilir
                }}
              >
                <Text style={styles.languageFlag}>
                  {languages.find(lang => lang.code === targetLanguage)?.flag || "🇹🇷"}
                </Text>
                <Text
                  style={[
                    styles.languageText,
                    targetLanguage === "tr" && styles.languageTextActive,
                  ]}
                >
                  {languages.find(lang => lang.code === targetLanguage)?.name || "Türkçe"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={sourceText}
              onChangeText={setSourceText}
              placeholder={t("modules.translate.sourcePlaceholder")}
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Button
            title={t("modules.translate.translate")}
            gradient
            onPress={handleTranslate}
            loading={loading}
            disabled={!sourceText.trim() || remainingTokens < 0}
            containerStyle={styles.translateButton}
          />

          {translatedResult && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>
                  {t("modules.translate.result")}
                </Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => copyText(translatedResult)}
                  >
                    <Ionicons name="copy-outline" size={20} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={toggleFavorite}
                  >
                    <Ionicons
                      name={isFavorited ? "heart" : "heart-outline"}
                      size={20}
                      color={isFavorited ? colors.error : colors.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.resultText}>{translatedResult}</Text>
            </View>
          )}

          <View style={styles.recentTranslations}>
            <Text style={styles.recentTitle}>
              {t("modules.translate.recentTranslations")}
            </Text>
            <View style={styles.recentItem}>
              <Text style={styles.recentText}>Hello → Merhaba</Text>
            </View>
            <View style={styles.recentItem}>
              <Text style={styles.recentText}>Good morning → Günaydın</Text>
            </View>
            <View style={styles.recentItem}>
              <Text style={styles.recentText}>Thank you → Teşekkür ederim</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default TranslationScreen;
