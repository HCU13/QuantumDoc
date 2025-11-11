import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CalculatorScreen from "../Modules/calculator/CalculatorScreen";

const Stack = createStackNavigator();

const CalculatorModuleNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalculatorScreen" component={CalculatorScreen} />
    </Stack.Navigator>
  );
};

export default CalculatorModuleNavigator;
