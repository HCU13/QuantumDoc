import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { useAuth } from "../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";
import { I18nextProvider } from "react-i18next";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem("hasLaunched", "true");
      } else {
        setIsFirstLaunch(false);
      }
    };

    checkFirstLaunch();
  }, []);

  if (loading || isFirstLaunch === null) {
    return null; // Loading ekranı gösterebilirsiniz.
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch && (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}

        <Stack.Screen name="MainNavigator" component={MainNavigator} />

        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    </I18nextProvider>
  );
};
