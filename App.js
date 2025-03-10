import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { TokenProvider } from "./src/context/TokenContext";
import { LocalizationProvider } from "./src/context/LocalizationContext";
import { AppProvider } from "./src/context/AppContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { toastConfig } from "./src/utils/toast";
import { initializeRevenueCat } from "./src/utils/revenuecat";
import "./src/i18n"; // i18n konfigürasyonunu yükle
import 'react-native-reanimated'
import 'react-native-gesture-handler'
export default function App() {
  // Uygulama başlatıldığında RevenueCat'i başlat
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocalizationProvider>
          <AuthProvider>
            <TokenProvider>
              <AppProvider>
                <NavigationContainer>
                  <StatusBar
                    barStyle="dark-content"
                    backgroundColor="#FFFFFF"
                  />
                  <RootNavigator />
                  <Toast config={toastConfig} />
                </NavigationContainer>
              </AppProvider>
            </TokenProvider>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
