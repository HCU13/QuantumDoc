import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { NavigationContainer } from "@react-navigation/native";

// Ana ekranlar
import { HomeScreen } from "../screens/main/HomeScreen";
import { ScanScreen } from "../screens/main/ScanScreen";
import { DocumentsScreen } from "../screens/main/DocumentsScreen";
import { AnalyticsScreen } from "../screens/main/AnalyticsScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";

// Alt ekranlar ve detay sayfaları
import { DocumentDetailScreen } from "../screens/main/DocumentDetailScreen";
import { PremiumScreen } from "../screens/main/PremiumScreen";
import { AccountSettingsScreen } from "../screens/main/AccountSettingsScreen";
import { NotificationScreen } from "../screens/main/NotificationScreen";
import { StorageScreen } from "../screens/main/StorageScreen";
import { HelpSupportScreen } from "../screens/main/HelpSupportScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();

  return (
    <BlurView
      intensity={80}
      tint={theme.isDark ? "dark" : "light"}
      style={[
        styles.tabBar,
        {
          borderTopColor: theme.colors.border,
          backgroundColor: theme.isDark
            ? "rgba(0,0,0,0.7)"
            : "rgba(255,255,255,0.7)",
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        let iconName;
        if (route.name === "Home") {
          iconName = isFocused ? "home" : "home-outline";
        } else if (route.name === "Documents") {
          iconName = isFocused ? "document-text" : "document-text-outline";
        } else if (route.name === "Scan") {
          iconName = "scan-outline";
        } else if (route.name === "Analytics") {
          iconName = isFocused ? "stats-chart" : "stats-chart-outline";
        } else if (route.name === "Profile") {
          iconName = isFocused ? "person" : "person-outline";
        }

        const onPress = () => {
          if (route.name === "Scan") {
            navigation.navigate("Scan");
            return;
          }
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={[
              styles.tabItem,
              route.name === "Scan" && styles.scanButton,
              route.name === "Scan" && {
                backgroundColor: theme.colors.primary,
              },
            ]}
          >
            <Ionicons
              name={iconName}
              size={route.name === "Scan" ? 24 : 22}
              color={
                route.name === "Scan"
                  ? "white"
                  : isFocused
                  ? theme.colors.primary
                  : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>
        );
      })}
    </BlurView>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
        <Stack.Screen name="Storage" component={StorageScreen} />
        <Stack.Screen name="Premium" component={PremiumScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsScreen}
        />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      </Stack.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingBottom: Platform.OS === "ios" ? 48 : 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
