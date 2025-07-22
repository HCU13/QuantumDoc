import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Button from "../../components/common/Button";
import ProfileImage from "../../components/common/ProfileImage";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  // useAuth importu kaldırıldı

  // Mock user data
  const user = {
    fullName: "Test Kullanıcı",
    email: "test@example.com",
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SIZES.padding,
      height: 60,
      justifyContent: "space-between",
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
    },
    headerTitle: {
      ...FONTS.h2,
      color: colors.textPrimary,
      flex: 1,
      textAlign: "center",
      marginRight: 40,
      fontWeight: "bold",
    },
    profileSection: {
      alignItems: "center",
      marginVertical: 20,
    },
    profileImageContainer: {
      width: 120,
      height: 120,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 15,
      borderWidth: 3,
      borderColor: isDark ? colors.border : colors.lightGray,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
    nameText: {
      ...FONTS.h2,
      color: colors.textPrimary,
      marginBottom: 5,
      fontWeight: "bold",
    },
    emailText: {
      ...FONTS.body3,
      color: colors.textSecondary,
      marginBottom: 15,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
      marginTop: 25,
      marginBottom: 15,
      fontWeight: "bold",
    },
    card: {
      backgroundColor: isDark ? colors.card : "rgba(255, 255, 255, 0.8)",
      borderRadius: SIZES.radius * 1.5,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? colors.border : "rgba(0, 0, 0, 0.05)",
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 5,
      elevation: 3,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border : "rgba(0, 0, 0, 0.05)",
    },
    lastMenuItem: {
      borderBottomWidth: 0,
    },
    menuItemText: {
      ...FONTS.body3,
      color: colors.textPrimary,
      flex: 1,
      marginLeft: 15,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.03)",
      alignItems: "center",
      justifyContent: "center",
    },
    menuItemIcon: {
      color: isDark ? colors.white : colors.primary,
    },
    logoutButton: {
      marginTop: 20,
      marginBottom: 50,
    },
    themeSwitchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 15,
    },
    themeSwitchText: {
      ...FONTS.body3,
      color: colors.textPrimary,
      flex: 1,
      marginLeft: 15,
    },
    versionText: {
      ...FONTS.body5,
      color: colors.textTertiary,
      textAlign: "center",
      marginBottom: 20,
    },
    themeSwitchIcon: {
      color: isDark ? colors.white : colors.primary,
    },
    chevronIcon: {
      color: isDark ? colors.textSecondary : colors.primary,
    },
    toggleIcon: {
      color: isDark ? colors.white : colors.textSecondary,
    },
  });

  const menuItems = [
    {
      id: "account",
      title: "Hesap Bilgileri",
      icon: (
        <Ionicons name="person-outline" size={22} style={styles.menuItemIcon} />
      ),
      onPress: () => navigation.navigate("AccountInfo"),
    },
    {
      id: "subscription",
      title: "Abonelik",
      icon: (
        <Ionicons name="card-outline" size={22} style={styles.menuItemIcon} />
      ),
      onPress: () => navigation.navigate("Subscription"),
    },
    {
      id: "language",
      title: "Dil Ayarları",
      icon: (
        <Ionicons
          name="language-outline"
          size={22}
          style={styles.menuItemIcon}
        />
      ),
      onPress: () => navigation.navigate("LanguageSettings"),
    },
    {
      id: "privacy",
      title: "Gizlilik",
      icon: (
        <Ionicons
          name="lock-closed-outline"
          size={22}
          style={styles.menuItemIcon}
        />
      ),
      onPress: () => navigation.navigate("Privacy"),
    },
    {
      id: "help",
      title: "Yardım ve Destek",
      icon: (
        <Ionicons
          name="help-circle-outline"
          size={22}
          style={styles.menuItemIcon}
        />
      ),
      onPress: () => navigation.navigate("HelpSupport"),
    },
  ];

  const handleLogout = () => {
    // useAuth importu kaldırıldı
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        /> */}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <ProfileImage user={user} size={120} showBorder={false} />
            </View>
            <Text style={styles.nameText}>
              {user?.fullName || user?.firstName || "Kullanıcı"}
            </Text>
            <Text style={styles.emailText}>
              {user?.email || "kullanici@example.com"}
            </Text>
          </View>

          <View style={styles.card}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.lastMenuItem,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.iconContainer}>{item.icon}</View>
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Tema Değiştirici */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.themeSwitchContainer}
              onPress={toggleTheme}
              accessibilityRole="button"
              accessibilityLabel={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={22}
                  style={styles.themeSwitchIcon}
                />
              </View>
              <Text style={styles.themeSwitchText}>
                Tema: {isDark ? "Koyu" : "Açık"}
              </Text>
              <Ionicons
                name={isDark ? "toggle" : "toggle-outline"}
                size={32}
                style={styles.toggleIcon}
              />
            </TouchableOpacity>
          </View>

          <Button
            title="Çıkış Yap"
            gradient
            onPress={handleLogout}
            containerStyle={styles.logoutButton}
          />

          <Text style={styles.versionText}>Sürüm 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ProfileScreen;
