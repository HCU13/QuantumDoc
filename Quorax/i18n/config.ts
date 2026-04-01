import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
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

// Sistem dilini algıla ve uygun dili döndür
const getSystemLanguage = (): string => {
  try {
    const systemLocale = Localization.getLocales()[0]?.languageCode || 'en';
    // Türkçe ise tr, diğer tüm diller için en
    return systemLocale === 'tr' ? 'tr' : 'en';
  } catch (error) {
    return 'en'; // Hata durumunda İngilizce
  }
};

// Async init - AsyncStorage'dan dil tercihini yükle veya sistem dilini algıla
const initI18n = async (): Promise<void> => {
  try {
    const savedLanguage = await AsyncStorage.getItem('user_language_v2');
    const systemLanguage = getSystemLanguage();
    let language: string;

    if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
      language = savedLanguage;
    } else {
      language = systemLanguage;
    }
    
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: language,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        compatibilityJSON: 'v3',
      });
  } catch (error) {
    // Hata durumunda sistem dilini algıla
    const fallbackLanguage = getSystemLanguage();
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: fallbackLanguage,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        compatibilityJSON: 'v3',
      });
  }
};

// Sync fallback init (hızlı başlangıç için - sistem dilini algıla)
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSystemLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  });

// Arka planda gerçek dil tercihini yükle
initI18n().then(() => {
  // Dil yüklendi, değişiklik varsa güncelle
  AsyncStorage.getItem('user_language_v2')
    .then((savedLanguage) => {
      if (savedLanguage && savedLanguage !== i18n.language && (savedLanguage === 'tr' || savedLanguage === 'en')) {
        i18n.changeLanguage(savedLanguage);
      }
    })
    .catch((e) => console.error('[i18n] Failed to restore saved language:', e));
});

// Dili değiştirmek için yardımcı fonksiyon
export const setLanguage = async (lang: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('user_language_v2', lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    await i18n.changeLanguage(lang);
  }
};

export default i18n;

