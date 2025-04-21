import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthNavigator from "./navigation/AuthNavigator";
import useTheme from "./hooks/useTheme";

// StatusBar bileşeni
const ThemedStatusBar = () => {
  const { colors, isDark } = useTheme();
  return (
    <StatusBar
      style={colors.statusBar}
      backgroundColor="transparent"
      translucent
    />
  );
};

// Ana uygulama bileşeni içindeki içerik
const AppContent = () => {
  const { colors, isDark } = useTheme();

  return (
    <>
      <ThemedStatusBar />
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.card,
            text: colors.textPrimary,
            border: colors.border,
            notification: colors.secondary,
          },
        }}
      >
        <AuthNavigator />
      </NavigationContainer>
    </>
  );
};

// Ana uygulama bileşeni
const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
