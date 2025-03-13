import React, { useContext, createContext } from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import HomeScreen from "../screens/main/HomeScreen";
import ScanScreen from "../screens/main/ScanScreen";
import DocumentDetailScreen from "../screens/main/DocumentDetailScreen";
import UploadScreen from "../screens/main/UploadScreen";
import TokenStoreScreen from "../screens/main/TokenStoreScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import HelpScreen from "../screens/main/HelpScreen";
import AboutScreen from "../screens/main/AboutScreen";
import ProfileEditScreen from "../screens/main/ProfileEditScreen";
export const TabBarStyleContext = createContext(null);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
      <Stack.Screen name="TokenStore" component={TokenStoreScreen} />
    </Stack.Navigator>
  );
}

function UploadStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UploadScreen" component={UploadScreen} />
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
            } else if (route.name === "Scan") {
              iconName = focused ? "scan" : "scan-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            } else if (route.name === "Upload") {
              iconName = focused ? "cloud-upload" : "cloud-upload-outline";
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
        {/* <Tab.Screen
          name="Scan"
          component={ScanStack}
          options={{ tabBarLabel: "Scan" }}
        /> */}
        <Tab.Screen
          name="Upload"
          component={UploadStack}
          options={{ tabBarLabel: "Upload" }}
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
