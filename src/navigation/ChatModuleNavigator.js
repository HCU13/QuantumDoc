import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ChatRoomsScreen from "../Modules/chat/ChatRoomsScreen";
import ChatScreen from "../Modules/chat/ChatScreen";

const Stack = createStackNavigator();

const ChatModuleNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatRooms" component={ChatRoomsScreen} />
    <Stack.Screen name="ChatDetail" component={ChatScreen} />
  </Stack.Navigator>
);

export default ChatModuleNavigator; 