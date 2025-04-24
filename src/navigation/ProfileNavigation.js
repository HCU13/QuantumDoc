import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import TokensScreen from "../screens/profile/TokensScreen";
import AccountInfoScreen from "../screens/profile/AccountInfoScreen";
import HelpSupportScreen from "../screens/profile/HelpSupportScreen";
import LanguageSettingsScreen from "../screens/profile/LanguageSettingsScreen";
import PrivacyScreen from "../screens/profile/PrivacyScreen";
import SubscriptionScreen from "../screens/profile/SubscriptionScreen";
const Stack = createStackNavigator();

const ProfileNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Tokens" component={TokensScreen} />
      <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
      />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigation;
