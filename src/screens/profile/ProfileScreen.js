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

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { tokens } = useToken();

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
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    headerTitle: {
      ...FONTS.h2,
      color: colors.textOnGradient,
      flex: 1,
      textAlign: "center",
      marginRight: 40,
      fontWeight: "bold",
      textShadowColor: "rgba(0,0,0,0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
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
      borderColor: "rgba(255,255,255,0.5)",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 10,
    },
    profileImage: {
      width: "100%",
      height: "100%",
    },
    editImageButton: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.5)",
    },
    nameText: {
      ...FONTS.h2,
      color: colors.textOnGradient,
      marginBottom: 5,
      fontWeight: "bold",
      textShadowColor: "rgba(0,0,0,0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    emailText: {
      ...FONTS.body3,
      color: colors.textOnGradient,
      marginBottom: 15,
      opacity: 0.8,
    },
    tokenContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 15,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginTop: 25,
      marginBottom: 15,
      fontWeight: "bold",
      textShadowColor: "rgba(0,0,0,0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderRadius: SIZES.radius * 1.5,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
      marginBottom: 15,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    lastMenuItem: {
      borderBottomWidth: 0,
    },
    menuItemText: {
      ...FONTS.body3,
      color: colors.textOnGradient,
      flex: 1,
      marginLeft: 15,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
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
      color: colors.textOnGradient,
      flex: 1,
      marginLeft: 15,
    },
    versionText: {
      ...FONTS.body5,
      color: colors.textOnGradient,
      opacity: 0.6,
      textAlign: "center",
      marginBottom: 20,
    },
    tokenContainer: {
      marginLeft: 10,
    },
  });

  const menuItems = [
    {
      id: "tokens",
      title: "Token Yönetimi",
      icon: (
        <Ionicons name="cash-outline" size={22} color={colors.textOnGradient} />
      ),
      onPress: () => navigation.navigate("Tokens"),
    },
    {
      id: "account",
      title: "Hesap Bilgileri",
      icon: (
        <Ionicons
          name="person-outline"
          size={22}
          color={colors.textOnGradient}
        />
      ),
      onPress: () => navigation.navigate("AccountInfo"),
    },
    {
      id: "subscription",
      title: "Abonelik",
      icon: (
        <Ionicons name="card-outline" size={22} color={colors.textOnGradient} />
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
          color={colors.textOnGradient}
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
          color={colors.textOnGradient}
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
          color={colors.textOnGradient}
        />
      ),
      onPress: () => navigation.navigate("HelpSupport"),
    },
  ];

  const handleLogout = () => {
    console.log("Çıkış yapıldı");
    // Burada çıkış işlemleri yapılacak
    navigation.navigate("Login");
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        /> */}

        {/* <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textOnGradient}
            />
          </TouchableOpacity>
          <View style={styles.tokenContainer}>
            <TokenDisplay
              size="small"
              onPress={() => navigation.navigate("Tokens")}
            />
          </View>
        </View> */}

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

            {/* <Button
              title="Profili Düzenle"
              onPress={() => console.log("Profil Düzenle")}
              neon
              icon={<Ionicons name="create-outline" size={18} color="#fff" />}
              containerStyle={{ width: 200 }}
            /> */}
          </View>

          <View style={styles.card}>
            <View style={styles.themeSwitchContainer}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={22}
                  color={colors.textOnGradient}
                />
              </View>
              <Text style={styles.themeSwitchText}>Koyu Tema</Text>
              <TouchableOpacity
                onPress={toggleTheme}
                activeOpacity={0.7}
                style={{ padding: 5 }} // Dokunulabilir alanı büyütmek için
              >
                <Ionicons
                  name={isDark ? "toggle" : "toggle-outline"}
                  size={40}
                  color={colors.textOnGradient}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Hesap</Text>

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
                  color={colors.textOnGradient}
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
                color={colors.textOnGradient}
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
