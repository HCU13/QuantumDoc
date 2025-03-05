// MainNavigator.js - Updated TabBar
import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

// Screens
import { HomeScreen } from "../screens/main/HomeScreen";
import { DocumentsScreen } from "../screens/main/DocumentsScreen";
import { HistoryScreen } from "../screens/main/HistoryScreen"; // Eski Analytics yerine
import { ProfileScreen } from "../screens/main/ProfileScreen";

// Detail Screens
import { DocumentDetailScreen } from "../screens/main/DocumentDetailScreen";
import { PremiumScreen } from "../screens/main/PremiumScreen";
import { AccountSettingsScreen } from "../screens/main/AccountSettingsScreen";
import { NotificationScreen } from "../screens/main/NotificationScreen";
import { HelpSupportScreen } from "../screens/main/HelpSupportScreen";
import { PaymentMethodScreen } from "../screens/main/PaymentMethodScreen";
import { TokenPurchaseSuccessScreen } from "../screens/main/TokenPurchaseSuccessScreen";

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
        } else if (route.name === "History") {
          iconName = isFocused ? "time" : "time-outline";
        } else if (route.name === "Profile") {
          iconName = isFocused ? "person" : "person-outline";
        }

        const onPress = () => {
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
            style={styles.tabItem}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={
                isFocused ? theme.colors.primary : theme.colors.textSecondary
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
      <Tab.Screen name="History" component={HistoryScreen} />
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
        <Stack.Screen name="Premium" component={PremiumScreen} />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsScreen}
        />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
        <Stack.Screen
          name="TokenPurchaseSuccess"
          component={TokenPurchaseSuccessScreen}
        />
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
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
