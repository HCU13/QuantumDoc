// ProfileScreen.js
import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { LanguageSwitcher } from "../../hooks/LanguageSwitcher";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const ProfileScreen = ({ navigation }) => {
  const { theme, switchTheme } = useTheme();
  const { t, changeLanguage, currentLanguage } = LanguageSwitcher();
  const [tokenCount, setTokenCount] = React.useState(0);
  console.log(currentLanguage);
  // Örnek kullanıcı bilgileri
  const userStats = {
    documentsProcessed: 24,
    tokensUsed: 126,
    savedTime: "4.5",
  };
  const signOut = async () => {
    try {
      // AsyncStorage'dan kullanıcı verilerini temizle
      await AsyncStorage.removeItem("user");
      // Uygulama yönlendirmesini yap, örneğin Login ekranına
      navigation.reset({
        index: 0,
        routes: [{ name: "Auth", screen: "Login" }],
      });
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };
  const menuItems = [
    {
      id: "tokens",
      title: "Token Management",
      description: `${tokenCount} tokens available`,
      icon: "flash",
      color: theme.colors.warning,
      // Burada navigation yaptık
      action: () => navigation.navigate("Premium"),
    },
    {
      id: "subscription",
      title: "Subscription",
      description: "Manage your plan",
      icon: "star",
      color: theme.colors.primary,
      action: () => navigation.navigate("Subscription"),
    },

    {
      id: "billing",
      title: "Billing History",
      description: "View past transactions",
      icon: "receipt",
      color: theme.colors.info,
      action: () => navigation.navigate("BillingHistory"),
    },
    {
      id: "account",
      title: "Account Settings",
      description: "Security, Password, Email",
      icon: "person-circle",
      color: theme.colors.primary,
      // AccountSettings sayfasına yönlendirme
      action: () => navigation.navigate("AccountSettings"),
    },
    // {
    //   id: "notification",
    //   title: "Notifications",
    //   description: "Customize your alerts",
    //   icon: "notifications",
    //   color: theme.colors.secondary,
    //   badge: 2,
    //   // Notifications sayfasına yönlendirme
    //   action: () => navigation.navigate("Notifications"),
    // },
    {
      id: "storage",
      title: "Storage & Data",
      description: "Manage your documents",
      icon: "cloud",
      color: theme.colors.info,
      // Storage sayfasına yönlendirme
      action: () => navigation.navigate("Storage"),
    },
    {
      id: "help",
      title: "Help & Support",
      description: "FAQs, Contact us",
      icon: "help-circle",
      color: theme.colors.success,
      // HelpSupport sayfasına yönlendirme
      action: () => navigation.navigate("HelpSupport"),
    },
  ];

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarSection}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            >
              <Image
                source={{ uri: "https://i.pravatar.cc/200" }}
                style={styles.avatar}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.editButton,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text variant="h2" style={styles.userName} color="white">
              John Doe
            </Text>
            <Text style={styles.userEmail} color="white">
              john.doe@example.com
            </Text>
            <TouchableOpacity
              style={[
                styles.tokenBadge,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
              onPress={() => navigation.navigate("Premium")}
            >
              <Ionicons name="flash" size={16} color={theme.colors.warning} />
              <Text color="white">{tokenCount} tokens</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderStats = () => (
    <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {userStats.documentsProcessed}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Documents
          </Text>
        </View>

        <View
          style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
        />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {userStats.tokensUsed}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Tokens Used
          </Text>
        </View>

        <View
          style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
        />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {userStats.savedTime}h
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Time Saved
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
      onPress={item.action}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        <View style={styles.menuTexts}>
          <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Text
            style={[
              styles.menuDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            {item.description}
          </Text>
        </View>
      </View>
      <View style={styles.menuRight}>
        {item.badge && (
          <View
            style={[styles.badge, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.badgeText} color="white">
              {item.badge}
            </Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderSettings = () => (
    <View style={styles.settingsSection}>
      <Text
        style={[styles.sectionTitle, { color: theme.colors.text }]}
        variant="h2"
      >
        Settings
      </Text>

      <View style={styles.settingsList}>
        {/* Theme Toggle */}
        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={switchTheme}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Ionicons
                name={theme.isDark ? "moon" : "sunny"}
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <Text style={{ color: theme.colors.text }}>Dark Mode</Text>
          </View>
          <Switch
            value={theme.isDark}
            onValueChange={switchTheme}
            trackColor={{
              false: Platform.select({ ios: "#e9e9ea", android: "#767577" }),
              true: theme.colors.primary,
            }}
            thumbColor={Platform.select({
              ios: "#ffffff",
              android: theme.isDark ? "#ffffff" : "#f4f3f4",
            })}
          />
        </TouchableOpacity>

        {/* Language Selector */}
        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => {
            changeLanguage(currentLanguage === "en" ? "tr" : "en");
          }}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: theme.colors.secondary + "15" },
              ]}
            >
              <Ionicons
                name="language"
                size={22}
                color={theme.colors.secondary}
              />
            </View>
            <Text style={{ color: theme.colors.text }}>Language</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={{ color: theme.colors.textSecondary }}>
              {currentLanguage === "en" ? "English" : "Türkçe"}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.menuList}>{menuItems.map(renderMenuItem)}</View>

      <Button
        title="Sign Out"
        onPress={() => signOut()}
        type="secondary"
        theme={theme}
        style={styles.signOutButton}
      />
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {renderHeader()}
        {renderStats()}
        {renderSettings()}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  headerGradient: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
  },
  headerContent: {
    flex: 1,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarSection: {
    position: "relative",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "white",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 12,
  },
  tokenBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statsCard: {
    margin: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  settingsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  settingsList: {
    gap: 12,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuList: {
    gap: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTexts: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  signOutButton: {
    marginHorizontal: 20,
  },
});
