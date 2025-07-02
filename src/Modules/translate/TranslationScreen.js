import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  Share,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";

const { width } = Dimensions.get("window");

const TranslationScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("tr");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const scrollViewRef = useRef();

  const tokenCost = 1; // Her çeviri işlemi için token maliyeti

  // Desteklenen diller
  const languages = [
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "en", name: "İngilizce", flag: "🇬🇧" },
    { code: "es", name: "İspanyolca", flag: "🇪🇸" },
    { code: "fr", name: "Fransızca", flag: "🇫🇷" },
    { code: "de", name: "Almanca", flag: "🇩🇪" },
    { code: "it", name: "İtalyanca", flag: "🇮🇹" },
    { code: "ru", name: "Rusça", flag: "🇷🇺" },
    { code: "pt", name: "Portekizce", flag: "🇵🇹" },
    { code: "zh", name: "Çince", flag: "🇨🇳" },
    { code: "ja", name: "Japonca", flag: "🇯🇵" },
    { code: "ko", name: "Korece", flag: "🇰🇷" },
    { code: "ar", name: "Arapça", flag: "🇸🇦" },
  ];

  // Dilleri değiştir
  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);

    // Eğer çeviri yapılmışsa, çevrilmiş metni ve orijinal metni de değiştir
    if (showResult) {
      setText(translatedText);
      setTranslatedText(text);
    }
  };

  // Metin çevirme işlemi
  const translateText = async () => {
    if (!text.trim()) {
      Alert.alert("Hata", "Lütfen çevrilecek bir metin girin.");
      return;
    }

    // // Token kontrolü
    // if (tokens < tokenCost) {
    //   Alert.alert(
    //     'Yetersiz Token',
    //     `Bu işlem için ${tokenCost} token gerekiyor. Daha fazla token kazanın.`,
    //     [
    //       { text: 'İptal', style: 'cancel' },
    //       { text: 'Token Kazan', onPress: () => navigation.navigate('Tokens') },
    //     ]
    //   );
    //   return;
    // }

    Keyboard.dismiss();
    setLoading(true);
    setShowResult(false);

    try {
      // Token kullanımı
      // await useTokens(tokenCost);

      // Çeviri simulasyonu (gerçekte API çağrısı yapılırdı)
      setTimeout(() => {
        const result = simulateTranslation(
          text,
          sourceLanguage,
          targetLanguage
        );
        setTranslatedText(result);
        setLoading(false);
        setShowResult(true);

        // Sonuçlara scroll yap
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }, 1000);
    } catch (error) {
      console.log("Translation error:", error);
      setLoading(false);
      Alert.alert("Hata", "Çeviri sırasında bir hata oluştu.");
    }
  };

  // Çeviri simülasyonu (gerçekte API kullanılacak)
  const simulateTranslation = (text, from, to) => {
    // Basit simülasyon mantığı
    if (from === "tr" && to === "en") {
      // Türkçeden İngilizceye bazı temel kelimeler
      const dict = {
        merhaba: "hello",
        dünya: "world",
        nasılsın: "how are you",
        iyiyim: "I am good",
        teşekkürler: "thank you",
        lütfen: "please",
        evet: "yes",
        hayır: "no",
        bugün: "today",
        yarın: "tomorrow",
        dün: "yesterday",
        günaydın: "good morning",
        "iyi akşamlar": "good evening",
        "iyi geceler": "good night",
        hoşçakal: "goodbye",
      };

      // Basit değiştirme
      let translated = text;
      Object.entries(dict).forEach(([key, value]) => {
        const regex = new RegExp("\\b" + key + "\\b", "gi");
        translated = translated.replace(regex, value);
      });

      // Gerçek dünya sözlüğünde olmayan kelimeler için küçük değişim
      if (translated === text) {
        translated = text
          .split(" ")
          .map((word) => {
            // Basit harf değişimleri
            return word
              .replace(/ç/g, "ch")
              .replace(/ğ/g, "g")
              .replace(/ı/g, "i")
              .replace(/ö/g, "o")
              .replace(/ş/g, "sh")
              .replace(/ü/g, "u");
          })
          .join(" ");
      }

      return translated;
    } else if (from === "en" && to === "tr") {
      // İngilizceden Türkçeye bazı temel kelimeler
      const dict = {
        hello: "merhaba",
        world: "dünya",
        "how are you": "nasılsın",
        "I am good": "iyiyim",
        "thank you": "teşekkürler",
        please: "lütfen",
        yes: "evet",
        no: "hayır",
        today: "bugün",
        tomorrow: "yarın",
        yesterday: "dün",
        "good morning": "günaydın",
        "good evening": "iyi akşamlar",
        "good night": "iyi geceler",
        goodbye: "hoşçakal",
      };

      // Basit değiştirme
      let translated = text;
      Object.entries(dict).forEach(([key, value]) => {
        const regex = new RegExp("\\b" + key + "\\b", "gi");
        translated = translated.replace(regex, value);
      });

      return translated;
    } else {
      // Diğer dil kombinasyonları için basit bir değişiklik yap
      // Bu sadece bir demo amaçlıdır, gerçekte API kullanılır
      return `[${to.toUpperCase()} ÇEVİRİ]: ${text}`;
    }
  };

  // Çeviri sonucunu paylaşma
  const shareTranslation = async () => {
    try {
      await Share.share({
        message: `${text}\n\n${translatedText}`,
      });
    } catch (error) {
      Alert.alert("Hata", "Paylaşım sırasında bir hata oluştu.");
    }
  };

  // Çevrilmiş metni kopyalama (Gerçek uygulamada Clipboard.setString kullanılır)
  const copyToClipboard = () => {
    // Clipboard.setString(translatedText);
    Alert.alert("Başarılı", "Çeviri panoya kopyalandı.");
  };

  // Bir dil seçildiğinde
  const handleLanguageSelect = (langCode, isSource) => {
    if (isSource) {
      setSourceLanguage(langCode);
    } else {
      setTargetLanguage(langCode);
    }
  };

  // Dil kartını render etme
  const renderLanguageItem = (language, isSelected, onSelect) => {
    return (
      <TouchableOpacity
        key={language.code}
        style={[styles.languageItem, isSelected && styles.languageItemSelected]}
        onPress={() => onSelect(language.code)}
      >
        <Text style={styles.languageFlag}>{language.flag}</Text>
        <Text
          style={[
            styles.languageName,
            isSelected && styles.languageNameSelected,
          ]}
        >
          {language.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const getLanguageName = (code) => {
    const language = languages.find((lang) => lang.code === code);
    return language ? language.name : "Bilinmeyen Dil";
  };

  const getLanguageFlag = (code) => {
    const language = languages.find((lang) => lang.code === code);
    return language ? language.flag : "🏳️";
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding - 4,
      paddingBottom: 0,
    },
    card: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 16,
      padding: 15,
      marginBottom: 15,
    },
    button: {
      borderRadius: 12,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          backgroundColor: colors.primary,
        },
      }),
    },
    input: {
      backgroundColor: isDark
        ? "rgba(0, 0, 0, 0.2)"
        : "rgba(255, 255, 255, 0.7)",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.08)",
      color: colors.textPrimary,
      ...Platform.select({
        android: {
          overflow: "hidden",
        },
      }),
    },
    languageSelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.06)",
    },
    languageButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.04)",
    },
    languageFlag: {
      fontSize: 16,
      marginRight: 8,
    },
    languageName: {
      ...FONTS.body4,
      color: colors.textPrimary,
    },
    swapButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    inputContainer: {
      padding: 12,
    },
    characterCount: {
      ...FONTS.body5,
      color: colors.textSecondary,
      textAlign: "right",
      marginTop: 4,
    },
    translateButton: {
      marginHorizontal: 12,
      marginBottom: 12,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 16,
      marginVertical: 10,
    },
    loadingText: {
      ...FONTS.body3,
      color: colors.textPrimary,
      marginTop: 10,
    },
    resultContainer: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 16,
      marginVertical: 12,
    },
    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.06)",
    },
    resultLanguage: {
      flexDirection: "row",
      alignItems: "center",
    },
    resultLanguageText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      marginLeft: 8,
    },
    resultActions: {
      flexDirection: "row",
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },
    resultContent: {
      padding: 12,
    },
    resultText: {
      ...FONTS.body3,
      color: colors.textPrimary,
      lineHeight: 22,
    },
    // Dil seçim modal sitilleri
    languageSelectorModal: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? colors.card : colors.white,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: Platform.OS === "ios" ? 40 : 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.06)",
    },
    modalTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      justifyContent: "center",
      alignItems: "center",
    },
    languagesList: {
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    languageItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.02)",
    },
    languageItemSelected: {
      backgroundColor: colors.primary + "22",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    languageNameSelected: {
      ...FONTS.h4,
      color: colors.primary,
    },
    // Dil listesi
    languageListContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: 4,
      marginTop: 10,
      marginBottom: 10,
    },
    quickLanguageItem: {
      width: "31%",
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      paddingHorizontal: 10,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 12,
      marginBottom: 10,
    },
    quickLanguageItemSelected: {
      borderColor: colors.info,
      backgroundColor: colors.info + "52",
    },
    quickLanguageFlag: {
      fontSize: 16,
      marginRight: 6,
    },
    quickLanguageName: {
      ...FONTS.body5,
      color: colors.textPrimary,
      fontSize: 12,
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title="Çeviri" showBackButton />

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 0 }}
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Dil seçim alanı */}
            <View style={styles.languageSelector}>
              <TouchableOpacity
                style={styles.languageButton}
                onPress={() => {
                  // Modal'da kaynak dil seçimini açabilirsiniz
                  // Bu örnekte popüler dilleri doğrudan gösteriyoruz
                }}
              >
                <Text style={styles.languageFlag}>
                  {getLanguageFlag(sourceLanguage)}
                </Text>
                <Text style={styles.languageName}>
                  {getLanguageName(sourceLanguage)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.swapButton}
                onPress={swapLanguages}
              >
                <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.languageButton}
                onPress={() => {
                  // Modal'da hedef dil seçimini açabilirsiniz
                }}
              >
                <Text style={styles.languageFlag}>
                  {getLanguageFlag(targetLanguage)}
                </Text>
                <Text style={styles.languageName}>
                  {getLanguageName(targetLanguage)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Çeviri giriş alanı */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Çevrilecek metni girin..."
                placeholderTextColor={
                  isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)"
                }
                value={text}
                onChangeText={setText}
                multiline
                maxLength={1000}
              />
              <Text style={styles.characterCount}>{text.length}/1000</Text>
            </View>

            {/* Çeviri butonu */}
            <Button
              title="Çevir"
              gradient
              icon={<Ionicons name="language" size={20} color="#fff" style={{ marginRight: 8 }} />}
              onPress={translateText}
              loading={loading}
              disabled={loading || !text.trim()}
              fluid
              containerStyle={{ marginHorizontal: 12, marginBottom: 12, borderRadius: 12 }}
              textStyle={{ marginLeft: 8 }}
            />

            {/* Çeviri sonucu - giriş alanı ve butonun hemen altında */}
            {showResult && (
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultLanguage}>
                    <Text style={styles.languageFlag}>
                      {getLanguageFlag(targetLanguage)}
                    </Text>
                    <Text style={styles.resultLanguageText}>
                      {getLanguageName(targetLanguage)}
                    </Text>
                  </View>

                  <View style={styles.resultActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={copyToClipboard}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={shareTranslation}
                    >
                      <Ionicons
                        name="share-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.resultContent}>
                  <Text style={styles.resultText}>{translatedText}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Popüler dil seçimleri */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Kaynak Dil
          </Text>
          <View style={styles.languageListContainer}>
            {languages.slice(0, 6).map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.quickLanguageItem,
                  sourceLanguage === lang.code &&
                    styles.quickLanguageItemSelected,
                ]}
                onPress={() => handleLanguageSelect(lang.code, true)}
              >
                <Text style={styles.quickLanguageFlag}>{lang.flag}</Text>
                <Text style={styles.quickLanguageName}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Hedef Dil
          </Text>
          <View style={styles.languageListContainer}>
            {languages.slice(0, 6).map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.quickLanguageItem,
                  targetLanguage === lang.code &&
                    styles.quickLanguageItemSelected,
                ]}
                onPress={() => handleLanguageSelect(lang.code, false)}
              >
                <Text style={styles.quickLanguageFlag}>{lang.flag}</Text>
                <Text style={styles.quickLanguageName}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Yükleniyor göstergesi */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                Çevriliyor, lütfen bekleyin...
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    ...FONTS.h4,
    marginVertical: 8,
    paddingLeft: 4,
  },
});

export default TranslationScreen;
