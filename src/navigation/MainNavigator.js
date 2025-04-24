// src/navigation/MainNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import MainScreens from "./MainScreens";
import ExploreScreen from "../screens/explore/ExploreScreen";
import ActivityScreen from "../screens/activity/ActivityScreen";
import ProfileNavigation from "./ProfileNavigation";
import useTheme from "../hooks/useTheme";

const Tab = createBottomTabNavigator();

// Tab bar'ın görünürlüğünü kontrol eden fonksiyon
const getTabBarVisibility = (route) => {
  // Alt navigasyon için aktif ekran adını al
  const routeName = getFocusedRouteNameFromRoute(route);

  // Tab başına ana ekranları listele
  const mainScreens = {
    Home: "HomeScreen", // MainScreens içindeki ana sayfa
    Explore: undefined, // Sadece single ekran, bu yüzden undefined
    Activity: undefined, // Sadece single ekran, bu yüzden undefined
    Profile: "ProfileMain", // ProfileNavigation içindeki ana sayfa
  };

  // Eğer alt navigasyon yoksa veya ana ekrandaysa tab bar'ı göster
  if (!routeName || routeName === mainScreens[route.name]) {
    return true;
  }

  // Diğer tüm ekranlarda tab bar'ı gizle
  return false;
};

const MainNavigator = () => {
  const { colors, isDark } = useTheme();

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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark
          ? "rgba(255,255,255,0.5)"
          : "rgba(0,0,0,0.4)",
        headerShown: false,
        // Her rota için tabBar görünürlüğünü dinamik olarak ayarla
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
      <Tab.Screen name="Home" component={MainScreens} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigation} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
