// src/App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigator />
          <Toast />
        </NavigationContainer>
      </ThemeProvider>
    </I18nextProvider>
  );
}
