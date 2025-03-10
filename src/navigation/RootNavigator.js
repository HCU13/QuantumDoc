import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import OnboardingScreen from "../screens/auth/OnboardingScreen";

/**
 * Ana navigasyon kontrolü
 * Kullanıcı oturum durumuna göre AuthNavigator veya MainNavigator'ı gösterir
 * İlk kullanımda OnboardingScreen'i gösterir
 */
function RootNavigator() {
  const { theme } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Onboarding durumunu kontrol et
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const status = await AsyncStorage.getItem("hasCompletedOnboarding");
        setHasCompletedOnboarding(status === "true");
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Onboarding'i tamamla
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  // Yükleme durumu
  if (loading || checkingOnboarding) {
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
      </View>
    );
  }

  // Onboarding tamamlanmadıysa, onboarding ekranını göster
  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  // Oturum durumuna göre uygun navigator'ı göster
  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}

export default RootNavigator;
