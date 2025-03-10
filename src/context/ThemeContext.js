// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Modern light theme with refined color palette
const lightTheme = {
  colors: {
    // Primary & Secondary colors
    primary: "#4361EE", // Modern blue for primary actions
    primaryLight: "#4895EF", // Lighter blue for secondary elements
    primaryDark: "#3A0CA3", // Darker blue for emphasis
    secondary: "#4CC9F0", // Vibrant cyan for accents

    // UI Background colors
    background: "#FFFFFF",
    surface: "#FFFFFF",
    card: "#F9FAFB",
    modalBg: "#FFFFFF",

    // Functional colors
    success: "#10B981", // Green
    warning: "#FBBF24", // Yellow
    error: "#EF4444", // Red
    info: "#60A5FA", // Light blue

    // Text colors
    text: "#111827", // Near black for primary text
    textSecondary: "#6B7280", // Medium gray for secondary text
    textTertiary: "#9CA3AF", // Light gray for tertiary text
    textInverted: "#FFFFFF", // White text for dark backgrounds

    // Border and divider colors
    border: "#E5E7EB", // Light gray for borders
    divider: "#F3F4F6", // Very light gray for dividers

    // Interactive states
    focus: "#4361EE30", // Primary with 30% opacity
    pressed: "#4361EE15", // Primary with 15% opacity
    disabled: "#E5E7EB", // Light gray
    disabledText: "#9CA3AF", // Medium gray

    // Gradients
    gradientStart: "#4361EE",
    gradientEnd: "#4CC9F0",
  },

  // Typography
  typography: {
    fontFamily: {
      base: "System", // Default system font
      heading: "System", // Could be replaced with a custom font
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  // Spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
  },

  // Animation durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  isDark: false,
};

// Modern dark theme with thoughtful color choices
const darkTheme = {
  colors: {
    // Primary & Secondary colors
    primary: "#4CC9F0", // Brighter cyan for dark mode primary
    primaryLight: "#4895EF", // Light blue
    primaryDark: "#3A0CA3", // Deep purple
    secondary: "#4361EE", // Vibrant blue

    // UI Background colors
    background: "#111827", // Deep navy
    surface: "#1F2937", // Slightly lighter navy
    card: "#374151", // Medium dark gray with slight blue
    modalBg: "#1F2937", // Slightly lighter navy

    // Functional colors
    success: "#34D399", // Bright green
    warning: "#FBBF24", // Amber
    error: "#F87171", // Soft red
    info: "#60A5FA", // Blue

    // Text colors
    text: "#F9FAFB", // Almost white
    textSecondary: "#D1D5DB", // Light gray
    textTertiary: "#9CA3AF", // Medium gray
    textInverted: "#111827", // Near black for text on light backgrounds

    // Border and divider colors
    border: "#374151", // Medium dark gray
    divider: "#1F2937", // Dark navy

    // Interactive states
    focus: "#4CC9F030", // Primary with 30% opacity
    pressed: "#4CC9F015", // Primary with 15% opacity
    disabled: "#374151", // Medium dark gray
    disabledText: "#6B7280", // Gray

    // Gradients
    gradientStart: "#4CC9F0",
    gradientEnd: "#3A0CA3",
  },

  // Typography
  typography: {
    fontFamily: {
      base: "System",
      heading: "System",
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  // Spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 5,
    },
  },

  // Animation durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  isDark: true,
};

// Theme context creation
const ThemeContext = createContext(null);

/**
 * Theme management Provider component
 * Handles light/dark theme switching and storage
 */
export function ThemeProvider({ children }) {
  // Get device theme
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");
  const [theme, setTheme] = useState(isDark ? darkTheme : lightTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load stored theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemePreference = await AsyncStorage.getItem(
          "themePreference"
        );
        if (savedThemePreference !== null) {
          const isDarkMode = savedThemePreference === "dark";
          setIsDark(isDarkMode);
          setTheme(isDarkMode ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  // Theme toggle function
  const toggleTheme = async () => {
    try {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      setTheme(newIsDark ? darkTheme : lightTheme);
      await AsyncStorage.setItem(
        "themePreference",
        newIsDark ? "dark" : "light"
      );
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  // Set a specific theme
  const setMode = async (mode) => {
    try {
      const newIsDark = mode === "dark";
      setIsDark(newIsDark);
      setTheme(newIsDark ? darkTheme : lightTheme);
      await AsyncStorage.setItem("themePreference", mode);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        setMode,
        isLoaded: isThemeLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Theme context hook export
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
