import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import HomeScreen from "../screens/main/HomeScreen";
import ScanScreen from "../screens/main/ScanScreen";
import DocumentDetailScreen from "../screens/main/DocumentDetailScreen";
import UploadScreen from "../screens/main/UploadScreen";
import TokenStoreScreen from "../screens/main/TokenStoreScreen";
import ProfileScreen from "../screens/main/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Her bir sekme için stack navigator
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
      <Stack.Screen name="Upload" component={UploadScreen} />
      <Stack.Screen name="TokenStore" component={TokenStoreScreen} />
    </Stack.Navigator>
  );
}

function ScanStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ScanScreen" component={ScanScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="TokenStore" component={TokenStoreScreen} />
    </Stack.Navigator>
  );
}

/**
 * Ana uygulama navigasyonu
 * Tab bar ile ana sekmeleri içerir: Home, Scan, Profile
 */
function MainNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Scan") {
            iconName = focused ? "scan" : "scan-outline";
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
        name="Scan"
        component={ScanStack}
        options={{ tabBarLabel: "Scan" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}

export default MainNavigator;
