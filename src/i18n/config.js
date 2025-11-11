import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import tr from './locales/tr.json';

const resources = {
  en: {
    translation: en,
  },
  tr: {
    translation: tr,
  },
};

// Async init - AsyncStorage'dan dil tercihini yükle
const initI18n = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('user_language');
    const language = (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) 
      ? savedLanguage 
      : 'tr'; // Default: Türkçe
    
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: language,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      });
  } catch (error) {
    // Hata durumunda default Türkçe ile başlat
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: 'tr',
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      });
  }
};

// Sync fallback init (hızlı başlangıç için)
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Arka planda gerçek dil tercihini yükle
initI18n().then(() => {
  // Dil yüklendi, değişiklik varsa güncelle
  AsyncStorage.getItem('user_language')
    .then((savedLanguage) => {
      if (savedLanguage && savedLanguage !== i18n.language && (savedLanguage === 'tr' || savedLanguage === 'en')) {
        i18n.changeLanguage(savedLanguage);
      }
    })
    .catch(() => {});
});

// Dili değiştirmek için yardımcı fonksiyon
export const setLanguage = async (lang) => {
  try {
    await AsyncStorage.setItem('user_language', lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    if (__DEV__) console.error('Language change error:', error);
    await i18n.changeLanguage(lang);
  }
};

export default i18n; 