import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import {
  SIZES,
  FONTS,
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Button from "../../components/common/Button";
import ProfileImage from "../../components/common/ProfileImage";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useTokenContext } from "../../contexts/TokenContext";
import userStorage from "../../utils/userStorage";
import { useLoading } from "../../contexts/LoadingContext";
import { getUserAvatar } from "../../utils/avatarUtils";
const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { logout, user: authUser } = useAuth();
  const { tokens } = useTokenContext(); // Merkezi token state'ini kullan
  const { setLoading: setGlobalLoading } = useLoading();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userAvatar, setUserAvatar] = useState("😀");

  // AsyncStorage ve database'den kullanıcı verilerini al
  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await userStorage.getUserData();
        setUserData(data);

        // Avatar'ı yükle
        const avatar = await getUserAvatar(user.id || authUser?.id);
        setUserAvatar(avatar);

        // Profiles tablosundan da veri al
        if (authUser?.id) {
          const profileData = await userStorage.getProfileFromDatabase(
            authUser.id
          );
          if (profileData) {
            setUserData((prev) => ({ ...prev, ...profileData }));
          }
        }
      } catch (error) {
        if (__DEV__) console.error("❌ PROFILE: Load user data error:", error);
      }
    };

    loadUserData();
  }, [authUser?.id]);

  // Kullanıcı verilerini birleştir
  const user = {
    ...authUser,
    ...userData,
    fullName:
      userData?.user_full_name || authUser?.user_metadata?.full_name || "",
    email: userData?.user_email || authUser?.email || "",
    avatar_url: userData?.avatar_url || null, // Database'den gelen avatar
    avatar_config: userData?.avatar_config || null, // AsyncStorage'dan gelen avatar
    tokens: userData?.tokens || 0,
    subscriptionPlan: userData?.subscription_plan || "free",
    lastLoginAt: userData?.last_login_at,
    loginCount: userData?.login_count || 0,
    emailConfirmed: userData?.email_confirmed || false,
    phoneConfirmed: userData?.phone_confirmed || false,
    createdAt: userData?.user_created_at,
    updatedAt: userData?.user_updated_at,
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.md,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.md,
      height: 60,
      justifyContent: "space-between",
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: BORDER_RADIUS.round,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
    },
    headerTitle: {
      ...TEXT_STYLES.titleLarge,
      color: colors.textPrimary,
      flex: 1,
      textAlign: "center",
      marginRight: 40,
    },
    profileSection: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: SPACING.md,
      marginBottom: SPACING.lg,
      paddingHorizontal: SPACING.xs,
    },
    profileImageContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      overflow: "hidden",
      marginRight: SPACING.md,
      borderWidth: 2,
      borderColor: colors.primary,
      ...SHADOWS.medium,
    },
    profileInfo: {
      flex: 1,
    },
    nameText: {
      ...TEXT_STYLES.titleLarge,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    emailText: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textSecondary,
      opacity: 0.8,
    },
    sectionTitle: {
      ...TEXT_STYLES.titleMedium,
      color: colors.textPrimary,
      marginTop: SPACING.xl,
      marginBottom: SPACING.md,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.small,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.xs,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    },
    lastMenuItem: {
      borderBottomWidth: 0,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    menuItemIcon: {
      color: colors.primary,
    },
    menuItemText: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textPrimary,
      flex: 1,
      fontWeight: "500",
    },
    menuItemSubtitle: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      marginTop: 1,
      opacity: 0.8,
    },
    chevronIcon: {
      color: colors.textSecondary,
    },

    logoutButton: {
      marginTop: SPACING.lg,
      marginBottom: SPACING.lg,
    },
    versionText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: SPACING.lg,
    },
    // Stats Cards - Canlı ve İnteraktif
    statsContainer: {
      flexDirection: "row",
      gap: SPACING.sm,
      marginTop: SPACING.sm,
      marginBottom: SPACING.md,
      marginHorizontal: SPACING.xs,
    },
    // Token Card - Belirgin Tasarım
    tokenCardContainer: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginTop: SPACING.sm,
      marginBottom: SPACING.md,
      marginHorizontal: SPACING.xs,
      borderWidth: 2,
      borderColor: colors.primary + "30",
      ...SHADOWS.medium,
    },
    tokenCardRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    tokenIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.primary + "25",
    },
    tokenCardLabel: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textSecondary,
      fontSize: 11,
      opacity: 0.7,
      marginBottom: 4,
    },
    tokenCardValue: {
      ...TEXT_STYLES.titleMedium,
      color: colors.textPrimary,
      fontWeight: "800",
      fontSize: 22,
      letterSpacing: -0.5,
    },
    tokenPurchaseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.lg,
      ...SHADOWS.small,
    },
    tokenPurchaseButtonText: {
      ...TEXT_STYLES.labelMedium,
      color: '#fff',
      fontWeight: '700',
      fontSize: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.sm,
      borderWidth: 1.5,
      borderColor: colors.primary + "20",
      ...SHADOWS.small,
      position: "relative",
      overflow: "hidden",
    },
    statCardPremium: {
      borderColor: "#8B5CF6", // Vibrant purple
      borderWidth: 2.5,
      backgroundColor: isDark
        ? "rgba(139, 92, 246, 0.1)"
        : "rgba(139, 92, 246, 0.08)",
    },
    statCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: SPACING.xs,
    },
    statIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
    },
    statIconCirclePremium: {
      backgroundColor: "rgba(139, 92, 246, 0.2)",
    },
    premiumBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      backgroundColor: "#8B5CF6",
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    statCardLabel: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textSecondary,
      fontSize: 11,
      marginBottom: 4,
      opacity: 0.8,
    },
    statCardValue: {
      ...TEXT_STYLES.titleMedium,
      color: colors.textPrimary,
      fontWeight: "800",
      fontSize: 18,
    },
    statCardValuePremium: {
      color: "#8B5CF6",
    },
    tokenProgress: {
      height: 4,
      backgroundColor: colors.primary + "20",
      borderRadius: 2,
      marginTop: SPACING.xs,
      overflow: "hidden",
    },
    tokenProgressBar: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    userStatusContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: SPACING.xs,
      gap: SPACING.xs,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: BORDER_RADIUS.sm,
      gap: 4,
    },
    statusText: {
      ...TEXT_STYLES.labelSmall,
      fontWeight: "500",
    },
  });

  const menuItems = [
    {
      id: "account",
      title: t("profile.menu.accountInfo"),
      subtitle: t("profile.menu.accountInfoSubtitle"),
      icon: (
        <Ionicons name="person-outline" size={18} style={styles.menuItemIcon} />
      ),
      onPress: () => navigation.navigate("AccountInfo"),
    },
    {
      id: "theme",
      title: t("profile.menu.theme"),
      subtitle: isDark
        ? t("profile.menu.themeSubtitleDark")
        : t("profile.menu.themeSubtitleLight"),
      icon: (
        <Ionicons
          name={isDark ? "moon" : "sunny"}
          size={18}
          style={styles.menuItemIcon}
        />
      ),
      onPress: toggleTheme,
      isThemeSwitch: true,
    },
    {
      id: "language",
      title: t("profile.menu.language"),
      subtitle: t("profile.menu.languageSubtitle"),
      icon: (
        <Ionicons
          name="language-outline"
          size={18}
          style={styles.menuItemIcon}
        />
      ),
      onPress: () => navigation.navigate("LanguageSettings"),
    },
    {
      id: "tokens",
      title: t("profile.menu.tokens"),
      subtitle: t("profile.menu.tokensSubtitle"),
      icon: (
        <Ionicons
          name="diamond-outline"
          size={18}
          style={styles.menuItemIcon}
        />
      ),
      onPress: () => navigation.navigate("Tokens"),
    },
    // {
    //   id: "subscription",
    //   title: t("profile.menu.subscription"),
    //   subtitle:
    //     user?.subscriptionPlan === "premium"
    //       ? t("profile.menu.subscriptionSubtitlePremium")
    //       : t("profile.menu.subscriptionSubtitleFree"),
    //   icon: (
    //     <Ionicons name="card-outline" size={18} style={styles.menuItemIcon} />
    //   ),
    //   onPress: () => navigation.navigate("Subscription"),
    // },
    {
      id: "purchases",
      title: t("profile.menu.purchases"),
      subtitle: t("profile.menu.purchasesSubtitle"),
      icon: (
        <Ionicons
          name="receipt-outline"
          size={18}
          style={styles.menuItemIcon}
        />
      ),
      onPress: () => navigation.navigate("PurchaseHistory"),
    },
    // {
    //   id: "privacy",
    //   title: t('profile.menu.privacy'),
    //   subtitle: t('profile.menu.privacySubtitle'),
    //   icon: (
    //     <Ionicons
    //       name="shield-outline"
    //       size={18}
    //       style={styles.menuItemIcon}
    //     />
    //   ),
    //   onPress: () => navigation.navigate("Privacy"),
    // },
    {
      id: "help",
      title: t("profile.menu.help"),
      subtitle: t("profile.menu.helpSubtitle"),
      icon: (
        <Ionicons
          name="help-circle-outline"
          size={18}
          style={styles.menuItemIcon}
        />
      ),
      onPress: () => navigation.navigate("HelpSupport"),
    },
  ];

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    setGlobalLoading(true, t("profile.logout.title"), "auth");
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <ProfileImage user={user} size={70} showBorder={false} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.nameText}>
                {user?.fullName || t("profile.accountInfo.user")}
              </Text>
              <Text style={styles.emailText}>
                {user?.email || "kullanici@example.com"}
              </Text>
              <View style={styles.userStatusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: user?.emailConfirmed
                        ? colors.success + "20"
                        : colors.warning + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      user?.emailConfirmed ? "checkmark-circle" : "alert-circle"
                    }
                    size={12}
                    color={
                      user?.emailConfirmed ? colors.success : colors.warning
                    }
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: user?.emailConfirmed
                          ? colors.success
                          : colors.warning,
                      },
                    ]}
                  >
                    {user?.emailConfirmed
                      ? t("profile.accountInfo.emailVerified")
                      : t("profile.accountInfo.emailNotVerified")}
                  </Text>
                </View>
                {user?.phoneConfirmed && (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: colors.success + "20" },
                    ]}
                  >
                    <Ionicons name="call" size={12} color={colors.success} />
                    <Text
                      style={[styles.statusText, { color: colors.success }]}
                    >
                      Telefon Doğrulandı
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Token Card - Belirgin */}
          <View style={styles.tokenCardContainer}>
            <View style={styles.tokenCardRow}>
              <View style={styles.tokenIconContainer}>
                <Ionicons name="diamond" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={styles.tokenCardLabel}>
                  {t("profile.stats.currentTokens")}
                </Text>
                <Text style={styles.tokenCardValue}>{tokens.toLocaleString()}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("Subscription")}
                activeOpacity={0.7}
                style={styles.tokenPurchaseButton}
              >
                <Ionicons name="add-circle" size={16} color="#fff" />
                <Text style={styles.tokenPurchaseButtonText}>Satın Al</Text>
              </TouchableOpacity>
            </View>
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
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>{item.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                {item.isThemeSwitch ? (
                  <Ionicons
                    name={isDark ? "toggle" : "toggle-outline"}
                    size={24}
                    color={colors.primary}
                  />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    style={styles.chevronIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title={t("auth.logout")}
            gradient
            onPress={handleLogoutPress}
            containerStyle={styles.logoutButton}
          />

          <Text style={styles.versionText}>
            {t("profile.version", { version: "0.0.1" })}
          </Text>
        </ScrollView>

        {/* Çıkış Onay Modal'ı */}
        <ConfirmationModal
          visible={showLogoutModal}
          onClose={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
          title={t("profile.logout.title")}
          message={t("profile.logout.message")}
          confirmText={t("profile.logout.confirm")}
          cancelText={t("profile.logout.cancel")}
          type="warning"
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ProfileScreen;
