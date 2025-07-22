import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MainNavigator from "./MainNavigator";
import ChatModuleNavigator from "./ChatModuleNavigator";
import MathModuleNavigator from "./MathModuleNavigator";
import NewsModuleNavigator from "./NewsModuleNavigator";
import QuizModuleNavigator from "./QuizModuleNavigator";
import CalculatorModuleNavigator from "./CalculatorModuleNavigator";
import Welcome from "../screens/auth/Welcome";
import AuthNavigator from "./AuthNavigator";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Auth">
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen name="Chat" component={ChatModuleNavigator} />
      <Stack.Screen name="Math" component={MathModuleNavigator} />
      <Stack.Screen name="Quiz" component={QuizModuleNavigator} />
      <Stack.Screen name="Calculator" component={CalculatorModuleNavigator} />
      <Stack.Screen name="News" component={NewsModuleNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 