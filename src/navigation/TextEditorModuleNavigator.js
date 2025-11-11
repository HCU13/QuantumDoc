import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TextEditorScreen from "../Modules/textEditor/TextEditorScreen";

const Stack = createStackNavigator();

const TextEditorModuleNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TextEditorMain" component={TextEditorScreen} />
    </Stack.Navigator>
  );
};

export default TextEditorModuleNavigator;

