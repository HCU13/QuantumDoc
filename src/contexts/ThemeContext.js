import React, { createContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { COLORS } from "../constants/colors";
import { SHADOWS } from "../constants/theme";

// Tema bağlamı oluşturma
export const ThemeContext = createContext({
  isDark: false,
  colors: COLORS.light,
  shadows: SHADOWS,
  setTheme: () => {},
  toggleTheme: () => {},
});

// Tema sağlayıcı bileşeni
export const ThemeProvider = ({ children }) => {
  // Sistem tema ayarını al
  const colorScheme = useColorScheme();

  // Başlangıçta sistem temasını kullan
  const [isDark, setIsDark] = useState(colorScheme === "dark");

  // Sistem tema değişikliğini izle
  useEffect(() => {
    setIsDark(colorScheme === "dark");
  }, [colorScheme]);

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setIsDark((prevIsDark) => !prevIsDark);
  };

  // Manuel olarak temayı ayarlayan fonksiyon
  const setTheme = (theme) => {
    setIsDark(theme === "dark");
  };

  // Mevcut tema renklerini ve gölgelerini al
  const colors = isDark ? COLORS.dark : COLORS.light;
  const shadows = SHADOWS;

  // Tema bağlamı değerleri
  const themeContext = {
    isDark,
    colors,
    shadows,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={themeContext}>
      {children}
    </ThemeContext.Provider>
  );
};
