import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ImageAnalyzerScreen from "../Modules/imageAnalyzer/ImageAnalyzerScreen";

const Stack = createStackNavigator();

const ImageAnalyzerModuleNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ImageAnalyzerMain" component={ImageAnalyzerScreen} />
    </Stack.Navigator>
  );
};

export default ImageAnalyzerModuleNavigator;

