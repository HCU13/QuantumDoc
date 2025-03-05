// ProfileScreen.js - Düzeltilmiş versiyon
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { LanguageSwitcher } from "../../hooks/LanguageSwitcher";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";
const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight;
const { width } = Dimensions.get("window");

export const ProfileScreen = ({ navigation }) => {
  const { theme, switchTheme } = useTheme();
  const { t, changeLanguage, currentLanguage } = LanguageSwitcher();
  const [tokenCount, setTokenCount] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { signOut } = useAuth();
  // Çıkış fonksiyonuconst
  const handleSignOut = () => {
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          // Doğrudan çıkış yap
          await signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: "Auth" }], // Auth navigator'a yönlendir
          });
        },
      },
    ]);
  };
  // Hesap silme fonksiyonu
  const deleteAccount = () => {
    Alert.alert(
      "Hesabı Sil",
      "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Hesabı Sil",
          style: "destructive",
          onPress: handleSignOut,
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
        translucent={true}
      />

      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.primary,
            paddingTop: STATUSBAR_HEIGHT + 10,
          },
        ]}
      >
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150" }}
            style={styles.avatar}
          />

          <View style={styles.userInfo}>
            <Text style={styles.userName} color="white">
              John Doe
            </Text>
            <Text style={styles.userEmail} color="white">
              john.doe@example.com
            </Text>

            <TouchableOpacity
              style={styles.tokenContainer}
              onPress={() => navigation.navigate("Premium")}
            >
              <Ionicons name="flash" size={16} color="#FFD700" />
              <Text style={styles.tokenText} color="white">
                {tokenCount} token
              </Text>
              <Ionicons name="chevron-forward" size={12} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const menuItems = [
    {
      id: "tokens",
      title: "Token Satın Al",
      description: "Daha fazla döküman için token ekle",
      icon: "flash",
      color: "#FFD700",
      action: () => navigation.navigate("Premium"),
    },
    {
      id: "account",
      title: "Hesap Ayarları",
      description: "Profil bilgilerini düzenle",
      icon: "person-circle",
      color: theme.colors.primary,
      action: () => navigation.navigate("AccountSettings"),
    },
    {
      id: "help",
      title: "Yardım ve Destek",
      description: "SSS, iletişim",
      icon: "help-circle",
      color: theme.colors.success,
      action: () => navigation.navigate("HelpSupport"),
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.isDark ? "transparent" : "#000",
        },
      ]}
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
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );

  const renderSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Menü
      </Text>

      <View style={styles.menuList}>{menuItems.map(renderMenuItem)}</View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Ayarlar
      </Text>

      <View style={styles.quickSettings}>
        {/* Tema değiştirme */}
        <TouchableOpacity
          style={[
            styles.settingItem,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.isDark ? "transparent" : "#000",
            },
          ]}
          onPress={switchTheme}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Ionicons
                name={theme.isDark ? "moon" : "sunny"}
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <Text style={{ color: theme.colors.text }}>Karanlık Mod</Text>
          </View>
          <Switch
            value={theme.isDark}
            onValueChange={switchTheme}
            trackColor={{
              false: "#e9e9ea",
              true: theme.colors.primary,
            }}
            thumbColor={
              Platform.OS === "ios"
                ? "#ffffff"
                : theme.isDark
                ? "#ffffff"
                : "#f4f3f4"
            }
            ios_backgroundColor="#e9e9ea"
          />
        </TouchableOpacity>

        {/* Dil seçimi */}
        <TouchableOpacity
          style={[
            styles.settingItem,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.isDark ? "transparent" : "#000",
            },
          ]}
          onPress={() => {
            changeLanguage(currentLanguage === "en" ? "tr" : "en");
          }}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: theme.colors.secondary + "15" },
              ]}
            >
              <Ionicons
                name="language"
                size={22}
                color={theme.colors.secondary}
              />
            </View>
            <Text style={{ color: theme.colors.text }}>Dil</Text>
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

        {/* Bildirimler */}
        <TouchableOpacity
          style={[
            styles.settingItem,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.isDark ? "transparent" : "#000",
            },
          ]}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: theme.colors.info + "15" },
              ]}
            >
              <Ionicons
                name="notifications"
                size={22}
                color={theme.colors.info}
              />
            </View>
            <Text style={{ color: theme.colors.text }}>Bildirimler</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{
              false: "#e9e9ea",
              true: theme.colors.info,
            }}
            thumbColor={
              Platform.OS === "ios"
                ? "#ffffff"
                : notificationsEnabled
                ? "#ffffff"
                : "#f4f3f4"
            }
            ios_backgroundColor="#e9e9ea"
          />
        </TouchableOpacity>
      </View>

      {/* Çıkış butonu */}
      <Button
        title="Çıkış Yap"
        onPress={handleSignOut}
        type="secondary"
        theme={theme}
        style={styles.signOutButton}
      />

      {/* Hesap silme butonu */}
      <TouchableOpacity
        style={[
          styles.deleteAccountButton,
          { borderColor: theme.colors.error },
        ]}
        onPress={deleteAccount}
      >
        <Text style={{ color: theme.colors.error }}>Hesabımı Sil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderSettings()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  header: {
    padding: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  tokenContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  tokenText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 40,
  },
  settingsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 24,
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
  },
  quickSettings: {
    gap: 12,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  signOutButton: {
    marginBottom: 16,
  },
  deleteAccountButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
});
