import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import QuizScreen from "../Modules/quiz/QuizScreen";
import QuizSolvingScreen from "../Modules/quiz/QuizSolvingScreen";

const Stack = createStackNavigator();

const QuizModuleNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuizMain" component={QuizScreen} />
      <Stack.Screen name="QuizSolving" component={QuizSolvingScreen} />
    </Stack.Navigator>
  );
};

export default QuizModuleNavigator; 