import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import ChatModuleNavigator from "./ChatModuleNavigator";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen name="Chat" component={ChatModuleNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 