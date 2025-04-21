// src/hooks/useTheme.js
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { SHADOWS } from "../constants/theme"; // Varsayılan shadows'u import ediyoruz

// Tema kullanımı için özel hook
const useTheme = () => {
  const themeContext = useContext(ThemeContext);

  if (themeContext === undefined) {
    // Eğer context bulunamazsa, varsayılan değerler döndür
    console.warn("useTheme must be used within a ThemeProvider");
    return {
      isDark: false,
      colors: {},
      shadows: SHADOWS, // Her zaman shadows döndür
      fonts: {},
      sizes: {},
    };
  }

  // Shadows'un doğru formatta olduğundan emin olalım
  let shadows = themeContext.shadows;

  if (!shadows) {
    shadows = SHADOWS;
  } else if (!shadows.standard) {
    shadows = SHADOWS;
  }

  return {
    ...themeContext,
    shadows, // Güncellenmiş shadows değerini döndür
  };
};

export default useTheme;
