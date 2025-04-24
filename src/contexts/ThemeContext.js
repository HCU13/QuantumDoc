// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../constants/colors";
import { getShadows } from "../constants/theme";

// Tema bağlamı oluşturma
export const ThemeContext = createContext({
  isDark: false,
  colors: COLORS.light,
  shadows: {},
  setTheme: () => {},
  toggleTheme: () => {},
});

// Tema sağlayıcı bileşeni
export const ThemeProvider = ({ children }) => {
  // Sistem tema ayarını al
  const colorScheme = useColorScheme();

  // Başlangıçta sistem temasını kullan
  const [isDark, setIsDark] = useState(false);

  // Theme preference'ı AsyncStorage'dan yükle
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("themePreference");
        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark");
        } else {
          setIsDark(colorScheme === "dark");
        }
      } catch (error) {
        console.log("Error loading theme preference:", error);
        setIsDark(colorScheme === "dark");
      }
    };

    loadThemePreference();
  }, []);

  // Tema değiştirme fonksiyonu
  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem(
        "themePreference",
        newTheme ? "dark" : "light"
      );
    } catch (error) {
      console.log("Error saving theme preference:", error);
    }
  };

  // Manuel olarak temayı ayarlayan fonksiyon
  const setTheme = async (theme) => {
    try {
      const newIsDark = theme === "dark";
      setIsDark(newIsDark);
      await AsyncStorage.setItem("themePreference", theme);
    } catch (error) {
      console.log("Error saving theme preference:", error);
    }
  };

  // Mevcut tema renklerini ve gölgelerini al
  const colors = isDark ? COLORS.dark : COLORS.light;
  const shadows = getShadows(isDark);

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
