import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MathSolverScreen from "../Modules/math/MathSolverScreen";
import MathFormulasScreen from "../Modules/math/MathFormulasScreen";

const Stack = createStackNavigator();

const MathModuleNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MathSolver" component={MathSolverScreen} />
      <Stack.Screen name="MathFormulas" component={MathFormulasScreen} />
    </Stack.Navigator>
  );
};

export default MathModuleNavigator; 