// src/App.js
import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import AppNavigator from "./navigation/AppNavigator";
import { ThemeProvider } from "./contexts/ThemeContext";

import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";
import { ToastContainer } from "./components/common/CustomToast";
import GlobalLoader from "./components/common/GlobalLoader";
import { AuthProvider } from "./contexts/AuthContext";
import { TokenProvider } from "./contexts/TokenContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ActivityRefreshProvider } from "./contexts/ActivityRefreshContext";
import { FavoriteRefreshProvider } from "./contexts/FavoriteRefreshContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { setupErrorTracking } from "./services/errorTracking";
import AnimatedSplashScreen from "./components/common/AnimatedSplashScreen";

// Splash screen'i başlangıçta göster
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Font'ları ve diğer asset'leri yükle
        await Font.loadAsync({
          'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });

        // Minimum splash süresi (animasyon için)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('App initialization error:', e);
      } finally {
        setIsAppReady(true);
      }
    };

    prepare();
  }, []);

  // Error tracking'i app tamamen yüklendikten sonra kur
  useEffect(() => {
    if (isAppReady) {
      setTimeout(() => {
        try {
          setupErrorTracking();
        } catch (e) {
          console.warn('Error tracking setup failed:', e);
        }
      }, 1000);
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AnimatedSplashScreen isAppReady={isAppReady}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider>
              <LoadingProvider>
                <ActivityRefreshProvider>
                  <FavoriteRefreshProvider>
                    <AuthProvider>
                      <TokenProvider>
                        <NavigationContainer>
                          <AppNavigator />
                          <GlobalLoader />
                          <ToastContainer />
                        </NavigationContainer>
                      </TokenProvider>
                    </AuthProvider>
                  </FavoriteRefreshProvider>
                </ActivityRefreshProvider>
              </LoadingProvider>
            </ThemeProvider>
          </I18nextProvider>
        </AnimatedSplashScreen>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
