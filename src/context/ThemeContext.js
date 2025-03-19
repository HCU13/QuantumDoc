import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Modern light theme with softer colors
const lightTheme = {
  colors: {
    // Primary & Secondary colors
    primary: "#5B5FEF", // Modern indigo/purple for primary actions
    primaryLight: "#7C7FF7", // Lighter version of primary
    primaryDark: "#4A4DCB", // Darker version of primary
    secondary: "#61DAFB", // Vibrant cyan for accents
    accent: "#FF7D54", // Coral/orange for special emphasis

    // Functional colors
    success: "#22C55E", // Green
    warning: "#F59E0B", // Amber
    error: "#EF4444", // Red
    info: "#3B82F6", // Blue

    // UI Background colors
    background: "#F9FAFB", // Very light gray with blue tint instead of pure white
    surface: "#FFFFFF",
    card: "#FFFFFF",
    modalBg: "#FFFFFF",

    // Text colors
    text: "#111827", // Almost black for primary text
    textSecondary: "#6B7280", // Medium gray for secondary text
    textTertiary: "#9CA3AF", // Light gray for tertiary text
    textInverted: "#FFFFFF", // White text for dark backgrounds

    // Border and divider colors
    border: "#E5E7EB", // Light gray for borders
    divider: "#F3F4F6", // Very light gray for dividers

    // Interactive states
    focus: "rgba(91, 95, 239, 0.3)", // Primary with 30% opacity
    pressed: "rgba(91, 95, 239, 0.15)", // Primary with 15% opacity
    disabled: "#E5E7EB", // Light gray
    disabledText: "#9CA3AF", // Medium gray

    // Gradients
    gradient: ["#5B5FEF", "#61DAFB"],

    // Shadow
    shadow: "#000000",
  },

  // Typography
  typography: {
    fontFamily: {
      base: "System", // Default system font
      heading: "System", // Could be replaced with a custom font
    },
    fontSize: {
      xs: 11,
      sm: 13,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 22,
      xxxl: 26,
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
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 5,
      elevation: 2,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.09,
      shadowRadius: 8,
      elevation: 4,
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

// Modern dark theme
const darkTheme = {
  colors: {
    // Primary & Secondary colors
    primary: "#6366F1", // Slightly adjusted for dark mode
    primaryLight: "#818CF8", // Lighter version of primary
    primaryDark: "#4F46E5", // Darker version of primary
    secondary: "#4FD1F7", // Slightly toned down cyan for dark mode
    accent: "#FF7D54", // Same accent color as light theme

    // Functional colors
    success: "#10B981", // Slightly darker green for dark mode
    warning: "#F59E0B", // Same amber
    error: "#EF4444", // Same red
    info: "#3B82F6", // Same blue

    // UI Background colors
    background: "#111827", // Dark navy with hint of blue instead of pure black
    surface: "#1E293B", // Slightly lighter navy
    card: "#1F2937", // Medium dark gray with slight blue
    modalBg: "#1E293B", // Slightly lighter navy

    // Text colors
    text: "#F1F5F9", // Off-white for better eye comfort (not pure white)
    textSecondary: "#CBD5E1", // Light gray
    textTertiary: "#94A3B8", // Medium gray
    textInverted: "#111827", // Dark background color for inverted text

    // Border and divider colors
    border: "#334155", // Medium dark gray
    divider: "#1E293B", // Dark navy

    // Interactive states
    focus: "rgba(99, 102, 241, 0.3)", // Primary with 30% opacity
    pressed: "rgba(99, 102, 241, 0.15)", // Primary with 15% opacity
    disabled: "#334155", // Medium dark gray
    disabledText: "#64748B", // Gray

    // Gradients
    gradient: ["#6366F1", "#4FD1F7"],

    // Shadow
    shadow: "#000000",
  },

  // Typography - Same as light theme
  typography: lightTheme.typography,

  // Spacing - Same as light theme
  spacing: lightTheme.spacing,

  // Border radius - Same as light theme
  borderRadius: lightTheme.borderRadius,

  // Shadows - Adjusted for dark mode
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 5,
    },
  },

  // Animation durations - Same as light theme
  animation: lightTheme.animation,

  isDark: true,
};

// Create context
const ThemeContext = createContext(null);

/**
 * Theme Provider Component
 * Manages light/dark theme and user preferences
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

// Theme context hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
