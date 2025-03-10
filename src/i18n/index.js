import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./translations/en";
import tr from "./translations/tr";

// Varsayılan olarak cihaz dilini algılamak için
import * as Localization from "expo-localization";

// i18next'i React Native ile kullanmak için başlat
i18n.use(initReactI18next).init({
  // Mevcut çeviriler
  resources: {
    en: { translation: en },
    tr: { translation: tr },
  },
  // Varsayılan dil (cihaz dilini kullan, yoksa İngilizce)
  lng: Localization.locale.split("-")[0],
  fallbackLng: "en", // Çeviri eksikse İngilizce kullan

  // Çevrilen string'lerin escape edilip edilmeyeceği
  // React zaten değerleri escape eder
  interpolation: {
    escapeValue: false,
  },

  // React bileşenlerini güncellemek için
  react: {
    useSuspense: false,
  },

  // LocalStorage ile dil tercihini kaydet
  detection: {
    // Depolama seçenekleri
    caches: ["asyncStorage"],

    // Async storage kullanımı için yapılandırma
    asyncStorage: {
      getItem: async (key) => {
        try {
          return await AsyncStorage.getItem(key);
        } catch (error) {
          console.error("Error reading language from AsyncStorage", error);
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (error) {
          console.error("Error saving language to AsyncStorage", error);
        }
      },
    },
  },
});

export default i18n;
