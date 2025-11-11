import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Welcome from "../screens/auth/Welcome";
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import ForgotPassword from "../screens/auth/ForgotPassword";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import EmailVerificationScreen from "../screens/auth/EmailVerificationScreen";
import OtpVerificationScreen from "../screens/auth/OtpVerificationScreen";

const Stack = createStackNavigator();

const AuthNavigator = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('@app_has_launched');
        if (hasLaunched === null) {
          // İlk açılış
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('@app_has_launched', 'true');
        } else {
          // İlk açılış değil
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false);
      }
    };

    checkFirstLaunch();
  }, []);

  // Loading state - ilk kontrol tamamlanana kadar bekle
  if (isFirstLaunch === null) {
    return null;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }} 
      initialRouteName={isFirstLaunch ? "Welcome" : "Login"}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 