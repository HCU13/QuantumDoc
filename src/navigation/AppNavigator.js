import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import ChatModuleNavigator from "./ChatModuleNavigator";
import { useAuth } from "../contexts/AuthContext";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        // Kullanıcı login olduysa Main navigator'ı göster
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // Kullanıcı login olmadıysa Auth navigator'ı göster
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      <Stack.Screen name="Chat" component={ChatModuleNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 