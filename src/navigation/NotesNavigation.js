import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import NotesScreen from "../Modules/notes/NotesScreen";
import NoteDetailScreen from "../Modules/notes/NoteDetailScreen";
import CreateNoteScreen from "../Modules/notes/CreateNoteScreen";
import NoteCategoriesScreen from "../Modules/notes/NoteCategoriesScreen";

const Stack = createStackNavigator();

const NotesNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen name="CreateNote" component={CreateNoteScreen} />
      <Stack.Screen name="NoteCategories" component={NoteCategoriesScreen} />
    </Stack.Navigator>
  );
};

export default NotesNavigation;
