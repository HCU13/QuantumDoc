import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import NoteGeneratorScreen from "../Modules/noteGenerator/NoteGeneratorScreen";

const Stack = createStackNavigator();

const NoteGeneratorModuleNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="NoteGeneratorMain" component={NoteGeneratorScreen} />
    </Stack.Navigator>
  );
};

export default NoteGeneratorModuleNavigator;

