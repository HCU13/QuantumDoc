// src/App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TokenProvider } from "./contexts/TokenContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { ActivityProvider } from "./contexts/ActivityContext";
import { SearchProvider } from "./contexts/SearchContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";
import Toast from 'react-native-toast-message';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  
  // Loading durumunda loading ekranı göster
  if (loading) {
    return null; // veya bir loading component
  }

  return (
    <TokenProvider>
      <SubscriptionProvider>
        <ActivityProvider>
          <SearchProvider>
            <SettingsProvider>
              <ThemeProvider>
                <NavigationContainer>
                  <AppNavigator />
                  <Toast />
                </NavigationContainer>
              </ThemeProvider>
            </SettingsProvider>
          </SearchProvider>
        </ActivityProvider>
      </SubscriptionProvider>
    </TokenProvider>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nextProvider>
  );
}
