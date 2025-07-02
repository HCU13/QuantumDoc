import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FONTS, SIZES } from '../../constants/theme';
import useTheme from '../../hooks/useTheme';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  const languages = [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'English' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const styles = StyleSheet.create({
    container: {
      padding: SIZES.padding,
    },
    title: {
      ...FONTS.h4,
      color: colors.textPrimary,
      marginBottom: SIZES.padding,
    },
    languageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SIZES.padding,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    languageText: {
      ...FONTS.body3,
      color: colors.textPrimary,
    },
    selectedLanguage: {
      color: colors.primary,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.language.title')}</Text>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={styles.languageContainer}
          onPress={() => changeLanguage(lang.code)}
        >
          <Text
            style={[
              styles.languageText,
              i18n.language === lang.code && styles.selectedLanguage,
            ]}
          >
            {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default LanguageSelector; 