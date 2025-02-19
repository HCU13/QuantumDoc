import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import tr from "./tr";

i18n
  .use(initReactI18next) // reacts with react-i18next
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
    },
    lng: "en", // Default language
    fallbackLng: "en", // Fallback language if translation is missing
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
