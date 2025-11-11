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
import { useLoading } from "../../contexts/LoadingContext";
import { showToast } from "../../utils/toast";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../i18n/config";

const LanguageSettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { setLoading: setGlobalLoading } = useLoading();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "tr");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if there are any changes that need to be saved
    const checkChanges = () => {
      if (selectedLanguage !== i18n.language) {
        setHasChanges(true);
      } else {
        setHasChanges(false);
      }
    };

    checkChanges();
  }, [selectedLanguage, i18n.language]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
      marginTop: 20,
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
      name: t('profile.language.languages.tr'),
      native: "Türkçe",
      details: t('profile.language.languageDetails.tr'),
    },
    {
      code: "en",
      name: t('profile.language.languages.en'),
      native: "English",
      details: t('profile.language.languageDetails.en'),
    },
    {
      code: "de",
      name: t('profile.language.languages.de'),
      native: "Deutsch",
      details: t('profile.language.languageDetails.de'),
    },
    {
      code: "fr",
      name: t('profile.language.languages.fr'),
      native: "Français",
      details: t('profile.language.languageDetails.fr'),
    },
    {
      code: "es",
      name: t('profile.language.languages.es'),
      native: "Español",
      details: t('profile.language.languageDetails.es'),
    },
  ];

  const handleSaveChanges = async () => {
    try {
      setGlobalLoading(true, t('profile.language.updating'), "settings");
      
      // Dili değiştir ve AsyncStorage'a kaydet
      await setLanguage(selectedLanguage);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHasChanges(false);
      showToast("success", t('common.success'), t('profile.language.success'));
    } catch (error) {
      if (__DEV__) console.error('Language settings error:', error);
      showToast("error", t('common.error'), t('profile.language.error'));
    } finally {
      setGlobalLoading(false);
    }
  };

  const renderLanguageOption = (language, index) => {
    const isSelected = selectedLanguage === language.code;
    const isLast = index === languages.length - 1;

    return (
      <TouchableOpacity
        key={language.code}
        style={[styles.languageOption, isLast && styles.lastLanguageOption]}
        onPress={() => setSelectedLanguage(language.code)}
      >
        <View>
          <Text style={styles.languageText}>{language.native}</Text>
          <Text style={styles.languageDetails}>{language.details}</Text>
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

        <Header title={t('profile.language.title')} showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* <Text style={styles.sectionTitle}>{t('profile.language.appLanguage')}</Text> */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={styles.infoText}>
              {t('profile.language.appLanguageInfo')}
            </Text>
            {languages.map((lang, index) =>
              renderLanguageOption(lang, index)
            )}
          </View>

          <View style={styles.note}>
            <Text style={styles.noteText}>
              {t('profile.language.note')}
            </Text>
          </View>

          {hasChanges && (
            <Button
              title={t('profile.language.saveChanges')}
              gradient
              onPress={handleSaveChanges}
              containerStyle={{ marginBottom: 30 }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default LanguageSettingsScreen;
