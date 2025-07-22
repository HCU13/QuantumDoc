import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import NewsDetailScreen from "../screens/home/NewsDetailScreen";

const Stack = createStackNavigator();

const NewsModuleNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
  </Stack.Navigator>
);

export default NewsModuleNavigator; 