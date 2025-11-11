import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MathSolverScreen from "../Modules/math/MathSolverScreen";

const Stack = createStackNavigator();

const MathModuleNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MathSolver" component={MathSolverScreen} />
    </Stack.Navigator>
  );
};

export default MathModuleNavigator; 