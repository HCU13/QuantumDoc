import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import AccountInfoScreen from "../screens/profile/AccountInfoScreen";
import SubscriptionScreen from "../screens/profile/SubscriptionScreen";
import TokensScreen from "../screens/profile/TokensScreen";
import LanguageSettingsScreen from "../screens/profile/LanguageSettingsScreen";
import PrivacyScreen from "../screens/profile/PrivacyScreen";
import HelpSupportScreen from "../screens/profile/HelpSupportScreen";

const Stack = createStackNavigator();

const ProfileModuleNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    <Stack.Screen name="Tokens" component={TokensScreen} />
    <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
  </Stack.Navigator>
);

export default ProfileModuleNavigator; 