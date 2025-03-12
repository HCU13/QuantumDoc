import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  SafeAreaView,
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
import {
  Text,
  Card,
  Button,
  Avatar,
  Loading,
  Badge,
  Divider,
} from "../../components";
import AnimatedHeader from "../../components/AnimatedHeader";

const { width, height } = Dimensions.get("window");

const ProfileScreen = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, signOut, loading } = useAuth();
  const { tokens, subscription } = useTokens();
  const { t, currentLanguage, changeLanguage, getCurrentLanguageName } =
    useLocalization();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Status bar height
  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  // Sample token history for UI display
  const tokenHistory = [
    {
      id: "1",
      type: "purchase",
      amount: 50,
      date: new Date(Date.now() - 172800000),
    },
    {
      id: "2",
      type: "usage",
      amount: -1,
      date: new Date(Date.now() - 86400000),
    },
    { id: "3", type: "purchase", amount: 20, date: new Date() },
  ];

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
            await signOut();
          } catch (error) {
            console.error("Sign out error:", error);
          }
        },
      },
    ]);
  };

  // Open about page
  const openAboutPage = () => {
    navigation.navigate("About");
  };

  // Open help and support page
  const openHelpAndSupport = () => {
    navigation.navigate("Help");
  };

  // Change language
  const handleLanguageChange = async (langCode) => {
    await changeLanguage(langCode);
    setLanguageModalVisible(false);
  };

  // Format date for token history
  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString();
  };

  // Render profile header
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.userSection}>
        <Avatar
          source={user?.photoURL}
          size={80}
          name={user?.displayName || "User"}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text variant="h2" style={styles.userName}>
            {user?.displayName || "User"}
          </Text>
          <Text variant="body2" color={theme.colors.textSecondary}>
            {user?.email || "user@example.com"}
          </Text>
        </View>
      </View>
    </View>
  );

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
                  size={22}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}

          <Button
            label={t("common.cancel")}
            onPress={() => setLanguageModalVisible(false)}
            variant="outline"
            style={styles.cancelButton}
          />
        </Card>
      </View>
    </Modal>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* SafeAreaView for iOS status bar compatibility */}

      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderHeader()}

        {/* Token Balance Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginTop: 16,
            },
          ]}
        >
          <Card style={styles.tokenCard} elevated={true}>
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
                    {tokens || 25} tokens
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

        {/* Recent Token Activity */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(slideAnim, 1.1) }],
            },
          ]}
        >
          <Card style={styles.activityCard} elevated={false} variant="bordered">
            <Text
              variant="subtitle1"
              weight="semibold"
              style={styles.activityTitle}
            >
              Recent Token Activity
            </Text>

            <Divider />

            {tokenHistory.map((item, index) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View
                    style={[
                      styles.activityIconContainer,
                      {
                        backgroundColor:
                          item.amount > 0
                            ? theme.colors.success + "15"
                            : theme.colors.primary + "15",
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.amount > 0 ? "add-circle" : "document-text"}
                      size={20}
                      color={
                        item.amount > 0
                          ? theme.colors.success
                          : theme.colors.primary
                      }
                    />
                  </View>
                  <View style={styles.activityTextContainer}>
                    <Text variant="body1">
                      {item.amount > 0 ? "Token Purchase" : "Document Analysis"}
                    </Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      {formatDate(item.date)}
                    </Text>
                  </View>
                </View>
                <Text
                  variant="body2"
                  weight="semibold"
                  color={
                    item.amount > 0 ? theme.colors.success : theme.colors.error
                  }
                >
                  {item.amount > 0 ? `+${item.amount}` : item.amount}
                </Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() =>
                navigation.navigate("TokenStore", { tab: "history" })
              }
            >
              <Text variant="body2" color={theme.colors.primary}>
                View All Activity
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Settings Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(slideAnim, 1.2) }],
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

            <Divider />
            {/* Account Setting */}
            <TouchableOpacity
              style={[
                styles.settingItem,
                { borderBottomColor: theme.colors.border },
              ]}
              onPress={() => navigation.navigate("ProfileEditScreen")}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIconContainer,
                    { backgroundColor: theme.colors.primary + "15" },
                  ]}
                >
                  <Ionicons
                    name="person-outline" // Profil düzenleme simgesi
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text variant="body1">
                    {t("profile.editProfile") || "Edit Profile"}
                  </Text>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    Update your name and email
                  </Text>
                </View>
              </View>
              <View style={styles.settingRight}>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
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
                  {getCurrentLanguageName() || "English"}
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
            {/* <TouchableOpacity
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
            </TouchableOpacity> */}
          </Card>
        </Animated.View>

        {/* Support and About Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(slideAnim, 1.3) }],
            },
          ]}
        >
          <Card style={styles.supportCard} elevated={false} variant="bordered">
            <Text
              variant="subtitle1"
              weight="semibold"
              style={styles.settingsTitle}
            >
              {t("profile.system")}
            </Text>

            <Divider />
            <TouchableOpacity
              style={[
                styles.settingItem,
                { borderBottomColor: theme.colors.border },
              ]}
              onPress={openHelpAndSupport}
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

            <TouchableOpacity
              style={styles.settingItem}
              onPress={openAboutPage}
            >
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
              <Badge label="v1.0.0" variant="secondary" size="small" />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Sign Out Button */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(slideAnim, 1.4) }],
            },
          ]}
        >
          <Button
            label={t("profile.signOut")}
            onPress={handleSignOut}
            variant="outline"
            style={styles.signOutButton}
            loading={loading}
            leftIcon={
              <Ionicons name="log-out" size={20} color={theme.colors.text} />
            }
          />
        </Animated.View>
      </ScrollView>

      {renderLanguageModal()}

      {/* Loading Indicator */}
      {loading && <Loading fullScreen type="logo" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: Platform.OS === "ios" ? 20 : StatusBar.currentHeight + 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  cardContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  tokenCard: {
    padding: 20,
  },
  tokenInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  activityCard: {
    padding: 0,
    overflow: "hidden",
    borderRadius: 16,
  },
  activityTitle: {
    padding: 10,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  activityTextContainer: {},
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  settingsCard: {
    padding: 0,
    overflow: "hidden",
    borderRadius: 16,
  },
  settingsTitle: {
    padding: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    padding: 0,
    overflow: "hidden",
    borderRadius: 16,
  },
  signOutButton: {
    margin: 16,
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
