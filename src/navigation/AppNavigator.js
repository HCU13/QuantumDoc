import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MainNavigator from "./MainNavigator";
import ChatModuleNavigator from "./ChatModuleNavigator";
import MathModuleNavigator from "./MathModuleNavigator";
import CalculatorModuleNavigator from "./CalculatorModuleNavigator";
import NewsModuleNavigator from "./NewsModuleNavigator";
import TextEditorModuleNavigator from "./TextEditorModuleNavigator";
import ImageAnalyzerModuleNavigator from "./ImageAnalyzerModuleNavigator";
import NoteGeneratorModuleNavigator from "./NoteGeneratorModuleNavigator";
import Welcome from "../screens/auth/Welcome";
import AuthNavigator from "./AuthNavigator";
import userStorage from "../utils/userStorage";
import { useAuth } from "../contexts/AuthContext";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // İlk yükleme kontrolü
  useEffect(() => {
    const initialCheck = async () => {
      try {
        const userData = await userStorage.getUserData();
        const isTokenValid = await userStorage.isTokenValid();
        
        // Initial check completed
      } catch (error) {
        // Initial check error - silent
      } finally {
        setCheckingAuth(false);
      }
    };

    initialCheck();
  }, [isAuthenticated]);


  // Loading durumunda Auth ekranını göster
  if (checkingAuth || authLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
      <Stack.Screen name="Chat" component={ChatModuleNavigator} />
      <Stack.Screen name="Math" component={MathModuleNavigator} />
      <Stack.Screen name="Calculator" component={CalculatorModuleNavigator} />
      <Stack.Screen name="News" component={NewsModuleNavigator} />
      <Stack.Screen name="TextEditor" component={TextEditorModuleNavigator} />
      <Stack.Screen name="ImageAnalyzer" component={ImageAnalyzerModuleNavigator} />
      <Stack.Screen name="NoteGenerator" component={NoteGeneratorModuleNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
