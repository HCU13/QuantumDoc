import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, ColorScheme, ThemeColors } from '@/constants/colors';

interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ColorScheme | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@quorax_theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  // İlk açılışta sistem temasını kullan, kullanıcı değiştirirse AsyncStorage'a kaydedilecek
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Aktif renk şemasını belirle
  const colorScheme: ColorScheme = 
    themeMode === 'system' 
      ? (deviceColorScheme || 'light')
      : themeMode;

  const colors = COLORS[colorScheme];
  const isDark = colorScheme === 'dark';

  // AsyncStorage'dan tema tercihini yükle
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setThemeMode(savedTheme as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.error('Theme yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Tema değiştir (toggle)
  const toggleTheme = async () => {
    try {
      const newTheme = isDark ? 'light' : 'dark';
      setThemeMode(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Theme kaydedilemedi:', error);
    }
  };

  // Tema ayarla (light, dark, system)
  const setTheme = async (theme: ColorScheme | 'system') => {
    try {
      setThemeMode(theme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Theme kaydedilemedi:', error);
    }
  };

  const value: ThemeContextType = {
    colorScheme,
    colors,
    isDark,
    toggleTheme,
    setTheme,
    themeMode,
  };

  // Loading sırasında boş ekran gösterme
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

