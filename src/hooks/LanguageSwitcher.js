import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../store/language/languageSlice";

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);

    dispatch(setLanguage(lang));
  };

  return { t, changeLanguage, currentLanguage: i18n.language };
};
