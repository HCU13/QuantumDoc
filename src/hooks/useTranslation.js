import { useTranslation as useI18nTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setLanguage } from "../store/language/languageSlice";

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  const dispatch = useDispatch();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    dispatch(setLanguage(lang));
  };

  return { t, changeLanguage, currentLanguage: i18n.language };
};
