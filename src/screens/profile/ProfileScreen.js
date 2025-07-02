import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Button from "../../components/common/Button";
import TokenDisplay from "../../components/common/TokenDisplay";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";
import { useTranslation } from "react-i18next";

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { tokens } = useToken();
  const { t } = useTranslation();

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
    profileImage: {
      width: "100%",
      height: "100%",
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
    tokenContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 15,
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
      id: "tokens",
      title: "Token Yönetimi",
      icon: (
        <Ionicons name="cash-outline" size={22} style={styles.menuItemIcon} />
      ),
      onPress: () => navigation.navigate("Tokens"),
    },
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
    console.log("Çıkış yapıldı");
    // Burada çıkış işlemleri yapılacak
  navigation.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    });
  };

  return (
    <GradientBackground mode="default">
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: "https://i.pravatar.cc/300" }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.nameText}>Arafat Khan</Text>
            <Text style={styles.emailText}>arafat@example.com</Text>

            <View style={styles.tokenContainer}>
              <TokenDisplay
                size="small"
                onPress={() => navigation.navigate("Tokens")}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.themeSwitchContainer}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={22}
                  style={styles.themeSwitchIcon}
                />
              </View>
              <Text style={styles.themeSwitchText}>{t("screens.profile.darkTheme")}</Text>
              <TouchableOpacity
                onPress={toggleTheme}
                activeOpacity={0.7}
                style={{ padding: 5 }}
              >
                <Ionicons
                  name={isDark ? "toggle" : "toggle-outline"}
                  size={40}
                  style={styles.toggleIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{t("screens.profile.account")}</Text>

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

          <Button
            title="Çıkış Yap"
            onPress={handleLogout}
            containerStyle={styles.logoutButton}
            outlined
            icon={
              <Ionicons
                name="log-out-outline"
                size={18}
                color={colors.textPrimary}
              />
            }
          />

          <Text style={styles.versionText}>Sürüm 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ProfileScreen;
