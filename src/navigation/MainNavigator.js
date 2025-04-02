import React, { useContext, createContext } from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

// Import screens
import HomeScreen from "../screens/main/home";
import DocumentActionsScreen from "../screens/main/documentActions";
import DocumentProcessingScreen from "../screens/main/documentProcessing";
import ScanDocumentScreen from "../screens/main/scanDocument";
import ProfileScreen from "../screens/main/ProfileScreen";
import TokenStoreScreen from "../screens/main/TokenStoreScreen";
import HelpScreen from "../screens/main/HelpScreen";
import AboutScreen from "../screens/main/AboutScreen";
import ProfileEditScreen from "../screens/main/ProfileEditScreen";
import DocumentDetailScreen from "../screens/main/DocumentDetailScreen";
import AllDocumentsScreen from "../screens/main/AllDocumentsScreen";

export const TabBarStyleContext = createContext(null);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
      <Stack.Screen name="TokenStore" component={TokenStoreScreen} />
      <Stack.Screen name="AllDocuments" component={AllDocumentsScreen} />
    </Stack.Navigator>
  );
}

function DocumentActionsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="DocumentActionsScreen"
        component={DocumentActionsScreen}
      />
      <Stack.Screen
        name="DocumentProcessing"
        component={DocumentProcessingScreen}
      />
      <Stack.Screen name="ScanDocument" component={ScanDocumentScreen} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="TokenStore" component={TokenStoreScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="ProfileEditScreen" component={ProfileEditScreen} />
    </Stack.Navigator>
  );
}

function MainNavigator() {
  const { theme, isDark } = useTheme();

  const tabBarStyle = {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    height: Platform.OS === "ios" ? 90 : 70,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  };

  function getTabBarVisibility(route) {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "";
    const hiddenScreens = [
      "TokenStore",
      "Help",
      "About",
      "DocumentDetail",
      "ProfileEditScreen",
      "DocumentProcessing",
      "ScanDocument",
      "AllDocuments",
    ];
    return hiddenScreens.includes(routeName)
      ? { display: "none" }
      : tabBarStyle;
  }

  return (
    <TabBarStyleContext.Provider value={{ tabBarStyle, theme, isDark }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: getTabBarVisibility(route),
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "DocumentActions") {
              iconName = focused ? "document-text" : "document-text-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ tabBarLabel: "Home" }}
        />
        <Tab.Screen
          name="DocumentActions"
          component={DocumentActionsStack}
          options={{ tabBarLabel: "Documents" }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{ tabBarLabel: "Profile" }}
        />
      </Tab.Navigator>
    </TabBarStyleContext.Provider>
  );
}

export default MainNavigator;
