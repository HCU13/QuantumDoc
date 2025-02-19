import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { useAuth } from "../hooks/useAuth";
import { storage } from "../utils/storage";
import i18n from "../i18n";
import { I18nextProvider } from "react-i18next";
import "../i18n";
const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);

  React.useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await storage.get("hasLaunched");
      setIsFirstLaunch(!hasLaunched);
      if (!hasLaunched) {
        await storage.set("hasLaunched", true);
      }
    };
    checkFirstLaunch();
  }, []);

  // if (loading || isFirstLaunch === null) {

  //   return null; // veya LoadingScreen
  // }

  return (
    // <Stack.Navigator screenOptions={{ headerShown: false }}>
    //   {isFirstLaunch && (
    //     <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    //   )}
    //   {user ? (
    //     <Stack.Screen name="MainNavigator" component={MainNavigator} />
    //   ) : (
    //     <Stack.Screen name="Auth" component={AuthNavigator} />
    //   )}
    // </Stack.Navigator>
    <I18nextProvider i18n={i18n}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainNavigator" component={MainNavigator} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    </I18nextProvider>
  );
};
