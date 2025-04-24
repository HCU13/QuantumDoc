import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";

const LanguageSettingsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState("tr"); // Default to Turkish
  const [aiLanguage, setAiLanguage] = useState("tr"); // AI response language
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if there are any changes that need to be saved
    const checkChanges = () => {
      if (selectedLanguage !== "tr" || aiLanguage !== "tr") {
        setHasChanges(true);
      } else {
        setHasChanges(false);
      }
    };

    checkChanges();
  }, [selectedLanguage, aiLanguage]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginTop: 20,
      marginBottom: 15,
      fontWeight: "bold",
    },
    card: {
      backgroundColor: isDark ? colors.card + "75" : colors.card + "75",
      borderRadius: SIZES.radius,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      marginBottom: 15,
    },
    languageOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255, 255, 255, 0.1)" : colors.lightGray,
    },
    lastLanguageOption: {
      borderBottomWidth: 0,
    },
    languageText: {
      ...FONTS.body3,
      color: colors.textPrimary,
    },
    languageDetails: {
      ...FONTS.body5,
      color: colors.textSecondary,
      marginTop: 3,
    },
    checkIcon: {
      marginRight: 10,
    },
    infoText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginBottom: 20,
      lineHeight: 22,
    },
    note: {
      backgroundColor: isDark
        ? "rgba(255, 204, 0, 0.15)"
        : "rgba(255, 204, 0, 0.05)",
      borderRadius: SIZES.radius,
      padding: 15,
      marginTop: 20,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: "rgba(255, 204, 0, 0.3)",
    },
    noteText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      lineHeight: 20,
    },
  });

  const languages = [
    {
      code: "tr",
      name: "Türkçe",
      native: "Türkçe",
      details: "Ana Dil",
    },
    {
      code: "en",
      name: "İngilizce",
      native: "English",
      details: "English",
    },
    {
      code: "de",
      name: "Almanca",
      native: "Deutsch",
      details: "German",
    },
    {
      code: "fr",
      name: "Fransızca",
      native: "Français",
      details: "French",
    },
    {
      code: "es",
      name: "İspanyolca",
      native: "Español",
      details: "Spanish",
    },
  ];

  const handleSaveChanges = () => {
    setLoading(true);
    // Simulate API call to save language preferences
    setTimeout(() => {
      setLoading(false);
      setHasChanges(false);
      Alert.alert("Başarılı", "Dil ayarlarınız güncellendi.");
    }, 1000);
  };

  const renderLanguageOption = (language, index, isForAI = false) => {
    const isSelected = isForAI
      ? aiLanguage === language.code
      : selectedLanguage === language.code;
    const isLast = index === languages.length - 1;

    return (
      <TouchableOpacity
        key={language.code}
        style={[styles.languageOption, isLast && styles.lastLanguageOption]}
        onPress={() => {
          if (isForAI) {
            setAiLanguage(language.code);
          } else {
            setSelectedLanguage(language.code);
          }
        }}
      >
        <View>
          <Text style={styles.languageText}>{language.name}</Text>
          <Text style={styles.languageDetails}>
            {language.native} - {language.details}
          </Text>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={colors.primary}
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        /> */}

        <Header title="Dil Ayarları" showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Uygulama Dili</Text>
          <View style={styles.card}>
            <Text style={styles.infoText}>
              Uygulamanın arayüzünde kullanılacak dili seçin. Bu değişiklik
              uygulamanın tüm menü ve bildirimleri için geçerli olacaktır.
            </Text>
            {languages.map((lang, index) =>
              renderLanguageOption(lang, index, false)
            )}
          </View>

          <Text style={styles.sectionTitle}>AI Yanıt Dili</Text>
          <View style={styles.card}>
            <Text style={styles.infoText}>
              AI asistanın size cevap vereceği dili seçin. Sorularınızı
              istediğiniz dilde sorabilirsiniz, AI seçtiğiniz dilde cevap
              verecektir.
            </Text>
            {languages.map((lang, index) =>
              renderLanguageOption(lang, index, true)
            )}
          </View>

          <View style={styles.note}>
            <Text style={styles.noteText}>
              Not: Dil değişikliği, uygulamayı yeniden başlattıktan sonra tüm
              bölümlere uygulanacaktır. Bazı içerikler seçilen dilde
              olmayabilir.
            </Text>
          </View>

          {hasChanges && (
            <Button
              title="Değişiklikleri Kaydet"
              gradient
              onPress={handleSaveChanges}
              loading={loading}
              containerStyle={{ marginBottom: 30 }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default LanguageSettingsScreen;
