import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import ar from './locales/ar.json';
import en from './locales/en.json';
import es from './locales/es.json';
import hi from './locales/hi.json';
import tr from './locales/tr.json';

const resources = {
  en: { translation: en },
  tr: { translation: tr },
  ar: { translation: ar },
  hi: { translation: hi },
  es: { translation: es },
};

// Sistem dilini algıla ve uygun dili döndür
const SUPPORTED_LANGUAGES = ['tr', 'en', 'ar', 'hi', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// RTL languages — add here when introducing new right-to-left locales (he, fa, ur, etc.)
const RTL_LANGUAGES = new Set<string>(['ar']);
export const isRTLLanguage = (lang: string | undefined): boolean =>
  !!lang && RTL_LANGUAGES.has(lang.toLowerCase().split(/[-_]/)[0]);

// Apply I18nManager RTL state at startup so the layout direction matches the resolved language.
// Note: forceRTL only takes effect after app reload — language changes at runtime require a restart
// (handled by setLanguage → caller shows a restart prompt).
const applyRTL = (lang: string): boolean => {
  const shouldBeRTL = isRTLLanguage(lang);
  I18nManager.allowRTL(true);
  const changed = I18nManager.isRTL !== shouldBeRTL;
  if (changed) I18nManager.forceRTL(shouldBeRTL);
  return changed;
};

const getSystemLanguage = (): string => {
  try {
    const systemLocale = Localization.getLocales()[0]?.languageCode || 'en';
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(systemLocale)
      ? systemLocale
      : 'en';
  } catch (error) {
    return 'en';
  }
};

// Async init - AsyncStorage'dan dil tercihini yükle veya sistem dilini algıla
const initI18n = async (): Promise<void> => {
  try {
    const savedLanguage = await AsyncStorage.getItem('user_language_v2');
    const systemLanguage = getSystemLanguage();
    let language: string;

    if (savedLanguage && (SUPPORTED_LANGUAGES as readonly string[]).includes(savedLanguage)) {
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
const initialLanguage = getSystemLanguage();
applyRTL(initialLanguage);
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
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
      if (savedLanguage && savedLanguage !== i18n.language && (SUPPORTED_LANGUAGES as readonly string[]).includes(savedLanguage)) {
        i18n.changeLanguage(savedLanguage);
      }
    })
    .catch((e) => console.error('[i18n] Failed to restore saved language:', e));
});

// Dili değiştirmek için yardımcı fonksiyon.
// Returns `rtlChanged: true` when the RTL direction flipped — the caller should prompt the user
// to restart the app so RN's layout engine picks up the new direction. Runtime flexDirection
// auto-flip only applies after a full reload.
export const setLanguage = async (lang: string): Promise<{ rtlChanged: boolean }> => {
  const rtlChanged = applyRTL(lang);
  try {
    await AsyncStorage.setItem('user_language_v2', lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    await i18n.changeLanguage(lang);
  }
  return { rtlChanged };
};

export default i18n;

