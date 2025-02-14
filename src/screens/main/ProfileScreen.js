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
import { useTranslation } from "../../hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
const getUserInitials = (name) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export const ProfileScreen = () => {
  const { theme, switchTheme } = useTheme();
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const isDarkMode = useSelector((state) => state.theme.isDark);
  const navigation = useNavigation();
  const userStats = {
    documentsAnalyzed: 142,
    totalReports: 28,
    storageUsed: "2.4",
  };

  const menuItems = [
    {
      id: "account",
      title: "Account Settings",
      icon: "person-circle",
      color: theme.colors.primary,
    },
    {
      id: "notification",
      title: "Notifications",
      icon: "notifications",
      color: theme.colors.secondary,
      badge: 3,
    },
    {
      id: "security",
      title: "Security",
      icon: "shield-checkmark",
      color: theme.colors.success,
    },
    {
      id: "storage",
      title: "Storage",
      icon: "cloud",
      color: theme.colors.info,
    },
    {
      id: "help",
      title: "Help & Support",
      icon: "help-circle",
      color: theme.colors.warning,
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatarView,
                  { backgroundColor: theme.colors.primary + "30" },
                ]}
              >
                <Text style={styles.avatarText}>
                  {getUserInitials("John Doe")}
                </Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} color="white">
                John Doe
              </Text>
              <Text style={styles.userEmail} color="white">
                john.doe@example.com
              </Text>
              <View style={styles.userPlan}>
                <Ionicons name="star" size={14} color={theme.colors.warning} />
                <Text style={styles.planText} color="white">
                  Premium Plan
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderStats = () => (
    <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {userStats.documentsAnalyzed}
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
            {userStats.totalReports}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Reports
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {userStats.storageUsed}GB
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Storage Used
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate("Premium")}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
          <Ionicons name={item.icon} size={20} color={item.color} />
        </View>
        <Text style={{ color: theme.colors.text }}>{item.title}</Text>
      </View>
      <View style={styles.menuItemRight}>
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
          <View style={styles.settingItemLeft}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Ionicons
                name={isDarkMode ? "moon" : "sunny"}
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <Text style={{ color: theme.colors.text }}>Dark Mode</Text>
          </View>
          <View
            style={[
              styles.toggleSwitch,
              {
                backgroundColor: isDarkMode ? theme.colors.primary : "#767577",
              },
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                { transform: [{ translateX: isDarkMode ? 20 : 0 }] },
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* Language Selector */}
        <TouchableOpacity
          style={[
            styles.settingItem,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => {
            // Show language picker
          }}
        >
          <View style={styles.settingItemLeft}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: theme.colors.secondary + "15" },
              ]}
            >
              <Ionicons
                name="language"
                size={20}
                color={theme.colors.secondary}
              />
            </View>
            <Text style={{ color: theme.colors.text }}>Language</Text>
          </View>
          <View style={styles.settingItemRight}>
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
        onPress={() => {}}
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
      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderStats()}
          {renderSettings()}
        </ScrollView>
      </SafeAreaView>
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
  header: {
    height: 200,
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarView: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
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
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  userPlan: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  planText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsCard: {
    margin: 20,
    marginTop: -10,
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
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingItemRight: {
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
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
  toggleSwitch: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 3,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
