import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "./AuthNavigator";

// App ekranları burada import edilecek
// import HomeScreen from '../screens/home/HomeScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  // Kullanıcı giriş durumu burada yönetilecek
  const isAuthenticated = false;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        // Kullanıcı giriş yapmışsa
        // <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // Kullanıcı giriş yapmamışsa
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
