// src/navigation/MainNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/home/HomeScreen";
import ExploreScreen from "../screens/explore/ExploreScreen";
import ActivityScreen from "../screens/activity/ActivityScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import ProfileModuleNavigator from "./ProfileModuleNavigator";
import useTheme from "../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

const Tab = createBottomTabNavigator();

// Tab bar'ın görünürlüğünü kontrol eden fonksiyon
const getTabBarVisibility = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  const mainScreens = {
    Home: "HomeScreen",
    Explore: undefined,
    Activity: undefined,
    Profile: "ProfileMain",
  };
  if (!routeName || routeName === mainScreens[route.name]) {
    return true;
  }
  return false;
};

const MainNavigator = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Explore") {
            iconName = focused ? "compass" : "compass-outline";
          } else if (route.name === "Activity") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label = "";
          switch (route.name) {
            case "Home":
              label = t("screens.tabs.home");
              break;
            case "Explore":
              label = t("screens.tabs.explore");
              break;
            case "Activity":
              label = t("screens.tabs.activity");
              break;
            case "Profile":
              label = t("screens.tabs.profile");
              break;
            default:
              label = route.name;
          }
          return <Text style={{ color, fontSize: 10 }}>{label}</Text>;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark
          ? "rgba(255,255,255,0.5)"
          : "rgba(0,0,0,0.4)",
        headerShown: false,
        tabBarStyle: {
          display: getTabBarVisibility(route) ? "flex" : "none",
          backgroundColor: isDark ? colors.card : colors.white,
          borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        },
        tabBarLabelStyle: {
          fontSize: 10,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileModuleNavigator} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
