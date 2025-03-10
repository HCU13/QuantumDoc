// src/screens/main/ProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView,
  Linking,
  StatusBar,
  Animated,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useTokens } from "../../context/TokenContext";
import {
  useLocalization,
  SUPPORTED_LANGUAGES,
} from "../../context/LocalizationContext";
import { Text } from "../../components/Text";
import { Card } from "../../components/Card";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import { Loading } from "../../components/Loading";
import { Badge } from "../../components/Badge";
import { logoutUser } from "../../utils/revenuecat";

const ProfileScreen = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, signOut, loading } = useAuth();
  const { tokens, subscription } = useTokens();
  const { t, currentLanguage, changeLanguage, getCurrentLanguageName } =
    useLocalization();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Sign out
  const handleSignOut = () => {
    Alert.alert(t("profile.signOut"), t("profile.signOutConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("profile.signOut"),
        onPress: async () => {
          try {
            // Log out from RevenueCat
            await logoutUser();
            // Log out from Firebase
            await signOut();
          } catch (error) {
            console.error("Sign out error:", error);
          }
        },
      },
    ]);
  };

  // Open help link
  const openHelpLink = () => {
    Linking.openURL("https://www.docai.app/help");
  };

  // Change language
  const handleLanguageChange = async (langCode) => {
    await changeLanguage(langCode);
    setLanguageModalVisible(false);
  };

  // Language selection modal
  const renderLanguageModal = () => (
    <Modal
      visible={languageModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setLanguageModalVisible(false)}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <Card style={styles.modalContainer} variant="default" elevated={true}>
          <Text variant="h3" style={styles.modalTitle}>
            {t("profile.language")}
          </Text>

          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                currentLanguage === lang.code && {
                  backgroundColor: theme.colors.primary + "15",
                },
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text variant="body1">{t(`languages.${lang.code}`)}</Text>
              {currentLanguage === lang.code && (
                <Ionicons
                  name="checkmark"
                  size={24}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}

          <Button
            title={t("common.cancel")}
            onPress={() => setLanguageModalVisible(false)}
            type="outline"
            style={styles.cancelButton}
          />
        </Card>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={
              isDark
                ? [theme.colors.primary + "30", theme.colors.background]
                : [theme.colors.primary + "15", theme.colors.background]
            }
            style={styles.headerGradient}
          >
            <Text variant="h2" style={styles.headerTitle}>
              {t("profile.myProfile")}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card style={styles.profileCard} elevated={true}>
            <View style={styles.profileHeader}>
              <Avatar source={user?.photoURL} size={80} style={styles.avatar} />
              <View style={styles.profileInfo}>
                <Text variant="h3" style={styles.profileName}>
                  {user?.displayName || "User"}
                </Text>
                <Text variant="body2" color={theme.colors.textSecondary}>
                  {user?.email}
                </Text>
              </View>
            </View>

            <View style={styles.tokenInfo}>
              <View style={styles.tokenDisplay}>
                <View
                  style={[
                    styles.tokenIconContainer,
                    { backgroundColor: theme.colors.primary + "20" },
                  ]}
                >
                  <Ionicons name="key" size={20} color={theme.colors.primary} />
                </View>
                <View>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    {t("tokens.yourBalance")}
                  </Text>
                  <Text variant="h3" style={styles.tokenCount}>
                    {tokens} tokens
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.tokenButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => navigation.navigate("TokenStore")}
              >
                <Text variant="body2" weight="medium" color="#FFFFFF">
                  {t("tokens.buyTokens")}
                </Text>
              </TouchableOpacity>
            </View>

            {subscription?.active && (
              <View
                style={[
                  styles.subscriptionBanner,
                  { backgroundColor: theme.colors.success + "15" },
                ]}
              >
                <Ionicons name="star" size={20} color={theme.colors.success} />
                <Text
                  style={[
                    styles.subscriptionText,
                    { color: theme.colors.success },
                  ]}
                >
                  Premium Subscription Active
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Settings Card */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card style={styles.settingsCard} elevated={false} variant="bordered">
            <Text
              variant="subtitle1"
              weight="semibold"
              style={styles.settingsTitle}
            >
              {t("profile.accountSettings")}
            </Text>

            {/* Language Setting */}
            <TouchableOpacity
              style={[
                styles.settingItem,
                { borderBottomColor: theme.colors.border },
              ]}
              onPress={() => setLanguageModalVisible(true)}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: theme.colors.primary + "15" },
                  ]}
                >
                  <Ionicons
                    name="language"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text variant="body1">{t("profile.language")}</Text>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    Change application language
                  </Text>
                </View>
              </View>
              <View style={styles.settingRight}>
                <Text
                  variant="body2"
                  color={theme.colors.textSecondary}
                  style={styles.settingValue}
                >
                  {getCurrentLanguageName()}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {/* Theme Setting */}
            <View
              style={[
                styles.settingItem,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    {
                      backgroundColor:
                        (isDark
                          ? theme.colors.secondary
                          : theme.colors.primary) + "15",
                    },
                  ]}
                >
                  <Ionicons
                    name={isDark ? "moon" : "sunny"}
                    size={22}
                    color={
                      isDark ? theme.colors.secondary : theme.colors.primary
                    }
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text variant="body1">
                    {isDark ? t("profile.darkMode") : t("profile.lightMode")}
                  </Text>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    Change application theme
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary + "70",
                }}
                thumbColor={isDark ? theme.colors.primary : "#FFFFFF"}
                ios_backgroundColor={theme.colors.border}
                style={styles.switch}
              />
            </View>

            {/* Token History */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                navigation.navigate("TokenStore", { tab: "history" })
              }
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: theme.colors.primary + "15" },
                  ]}
                >
                  <Ionicons
                    name="list"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text variant="body1">{t("profile.tokenHistory")}</Text>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    View your token usage history
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Support and About Card */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card style={styles.supportCard} elevated={false} variant="bordered">
            <TouchableOpacity
              style={[
                styles.settingItem,
                { borderBottomColor: theme.colors.border },
              ]}
              onPress={openHelpLink}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: theme.colors.info + "15" },
                  ]}
                >
                  <Ionicons
                    name="help-circle"
                    size={22}
                    color={theme.colors.info}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text variant="body1">{t("profile.help")}</Text>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    Get help and support
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: theme.colors.secondary + "15" },
                  ]}
                >
                  <Ionicons
                    name="information-circle"
                    size={22}
                    color={theme.colors.secondary}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text variant="body1">{t("profile.about")}</Text>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    About DocAI and its features
                  </Text>
                </View>
              </View>
              <Badge label="v1.0.0" type="secondary" size="sm" />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Sign Out Button */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Button
            title={t("profile.signOut")}
            onPress={handleSignOut}
            type="outline"
            style={styles.signOutButton}
            loading={loading}
            icon="log-out"
          />
        </Animated.View>
      </ScrollView>

      {renderLanguageModal()}

      {/* Loading Indicator */}
      {loading && <Loading fullScreen type="logo" />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTitle: {
    marginBottom: 0,
  },
  profileCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 24,
    padding: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: 4,
  },
  tokenInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  tokenDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tokenCount: {
    marginBottom: 0,
  },
  tokenButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  subscriptionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  subscriptionText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
    padding: 0,
    overflow: "hidden",
  },
  settingsTitle: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    marginRight: 8,
  },
  switch: {
    transform: [{ scale: 0.8 }],
  },
  supportCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 24,
    padding: 0,
    overflow: "hidden",
  },
  signOutButton: {
    margin: 16,
    marginTop: 0,
    marginBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    marginBottom: 24,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 16,
    minWidth: 150,
  },
});

export default ProfileScreen;
