import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Desteklenen diller
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "tr", name: "Türkçe" },
];

// Yerelleştirme context'i oluşturma
const LocalizationContext = createContext(null);

/**
 * Yerelleştirme Provider bileşeni
 * Uygulama dilini yönetir
 */
export function LocalizationProvider({ children }) {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "en");

  // Depolanan dil tercihini yükle
  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem("userLanguage");
        if (storedLanguage && storedLanguage !== i18n.language) {
          await changeLanguage(storedLanguage);
        }
      } catch (error) {
        console.error("Error loading stored language:", error);
      }
    };

    loadStoredLanguage();
  }, []);

  /**
   * Uygulamanın dilini değiştirir
   * @param {string} langCode - Dil kodu ('en', 'tr', vb.)
   * @returns {Promise<void>}
   */
  const changeLanguage = async (langCode) => {
    try {
      // Desteklenen dil kontrolü
      const isSupported = SUPPORTED_LANGUAGES.some(
        (lang) => lang.code === langCode
      );
      if (!isSupported) {
        console.warn(
          `Language ${langCode} is not supported, defaulting to English`
        );
        langCode = "en";
      }

      // Dili değiştir
      await i18n.changeLanguage(langCode);
      setCurrentLanguage(langCode);

      // Tercihi depola
      await AsyncStorage.setItem("userLanguage", langCode);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  /**
   * Mevcut dil için tercüme edilen bir dil adı döndürür
   * @returns {string} - Mevcut dilin adı
   */
  const getCurrentLanguageName = () => {
    const lang = SUPPORTED_LANGUAGES.find(
      (lang) => lang.code === currentLanguage
    );
    return lang ? t(`languages.${lang.code}`) : "English";
  };

  return (
    <LocalizationContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
        getCurrentLanguageName,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}

// Yerelleştirme context'i hook'unu dışa aktar
export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error(
      "useLocalization must be used within a LocalizationProvider"
    );
  }
  return context;
}
