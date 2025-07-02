import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/home/HomeScreen";
import ChatModuleNavigator from "./ChatModuleNavigator";
import MathSolverScreen from "../Modules/math/MathSolverScreen";
import TextGeneratorScreen from "../Modules/textGenerator/TextGeneratorScreen";
import TranslationScreen from "../Modules/translate/TranslationScreen";
import NotesNavigation from "./NotesNavigation";
import NewsDetailScreen from "../screens/home/NewsDetailScreen";
const Stack = createStackNavigator();

const MainScreens = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatModuleNavigator} />
      <Stack.Screen name="Math" component={MathSolverScreen} />
      <Stack.Screen name="Text" component={TextGeneratorScreen} />
      <Stack.Screen name="Translate" component={TranslationScreen} />
      <Stack.Screen name="NotesNavigation" component={NotesNavigation} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
    </Stack.Navigator>
  );
};

export default MainScreens;
