// navigation/AppNavigator.js
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { useAuth } from "../hooks/useAuth";
import * as SecureStore from "expo-secure-store";
import i18n from "../i18n";
import { I18nextProvider } from "react-i18next";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { useTheme } from "../hooks/useTheme";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const { theme } = useTheme();

  // Debug için loglar
  useEffect(() => {
    console.log(
      "AppNavigator - Auth state:",
      user ? "Logged in" : "Logged out"
    );
  }, [user]);

  // İlk açılış kontrolü
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await SecureStore.getItemAsync("hasLaunched");
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
          await SecureStore.setItemAsync("hasLaunched", "true");
        } else {
          setIsFirstLaunch(false);
        }
        setIsReady(true);
      } catch (error) {
        console.error("Error checking first launch:", error);
        setIsFirstLaunch(false);
        setIsReady(true);
      }
    };

    checkFirstLaunch();
  }, []);

  // Loading ekranı
  if (loading || !isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 12, color: theme.colors.text }}>
          {loading ? "Checking login state..." : "Loading..."}
        </Text>
      </View>
    );
  }

  // TÜM EKRANLARI AYNI NAVIGATOR'DA TANIMLIYORUZ
  return (
    <I18nextProvider i18n={i18n}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={
          isFirstLaunch && !user
            ? "Onboarding"
            : user
            ? "MainNavigator"
            : "Auth"
        }
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="MainNavigator" component={MainNavigator} />
      </Stack.Navigator>
    </I18nextProvider>
  );
};
