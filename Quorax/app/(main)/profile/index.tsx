import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ModuleHeader } from "@/components/common/ModuleHeader";
import { UserInitials } from "@/components/common/UserInitials";
import {
  BORDER_RADIUS,
  SHADOWS,
  SPACING,
  TEXT_STYLES,
} from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { setLanguage } from "@/i18n/config";
import { supabase } from "@/services/supabase";

// Removed: Token packages - now using subscription system

export default function ProfileScreen() {
  const { colors, isDark, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, profile, isLoggedIn, logout } = useAuth();
  const { isPremium, expiresAt } = useSubscription();

  // User data from context
  const userName =
    profile?.full_name ||
    profile?.display_name ||
    user?.email?.split("@")[0] ||
    "";
  const userEmail = user?.email || profile?.email || "";

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Language state - sistem dilini veya kaydedilmiş dili kullan
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    i18n.language || "tr",
  );

  // Dil tercihini yükle
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("user_language_v2");
        if (
          savedLanguage &&
          (savedLanguage === "tr" || savedLanguage === "en")
        ) {
          setCurrentLanguage(savedLanguage);
        } else {
          // Sistem dilini kullan
          const systemLang = Localization.getLocales()[0]?.languageCode || "en";
          const lang = systemLang === "tr" ? "tr" : "en";
          setCurrentLanguage(lang);
        }
      } catch (error) {
        // Hata durumunda mevcut dili kullan
        setCurrentLanguage(i18n.language || "tr");
      }
    };
    loadLanguagePreference();
  }, []);

  const handleLanguageChange = async (lang: "tr" | "en") => {
    setCurrentLanguage(lang);
    // Kullanıcı değiştirdiğinde AsyncStorage'a kaydet
    await setLanguage(lang);
  };

  // Tema değiştirme - kullanıcı değiştirirse kaydedilecek
  const handleThemeChange = async (value: boolean) => {
    const newTheme = value ? "dark" : "light";
    setTheme(newTheme);
  };

  // E-posta doğrulama ileride eklenecek

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      await logout();
      router.replace("/(main)/login");
    } catch (error) {
      router.replace("/(main)/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("profile.deleteAccount.title"),
      t("profile.deleteAccount.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("profile.deleteAccount.confirm"),
          style: "destructive",
          onPress: async () => {
            if (deleteLoading) return;
            setDeleteLoading(true);
            try {
              if (!user?.id) return;
              const { error } = await supabase.rpc("delete_user_account");
              if (error) throw error;
              await logout();
              router.replace("/(main)/login");
            } catch (error: any) {
              Alert.alert(t("common.error"), t("profile.deleteAccount.error"));
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleRateApp = async () => {
    try {
      if (Platform.OS === "ios") {
        // Direkt App Store değerlendirme sayfasına aç (action=write-review ile doğrudan yorum ekranı)
        const appStoreUrl = "https://apps.apple.com/app/quorax-ai-matematik/id6755162337?action=write-review";
        await Linking.openURL(appStoreUrl);
      } else {
        const playStoreUrl = "market://details?id=com.quorax.app";
        const canOpen = await Linking.canOpenURL(playStoreUrl);
        if (canOpen) {
          await Linking.openURL(playStoreUrl);
        } else {
          await Linking.openURL("https://play.google.com/store/apps/details?id=com.quorax.app");
        }
      }
    } catch {
      Alert.alert(t("common.info"), t("profile.rate.notAvailable"));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ModuleHeader title={t("profile.title")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        {isLoggedIn ? (
          <View
            style={[
              styles.profileCard,
              { backgroundColor: colors.card },
              SHADOWS.small,
            ]}
          >
            <View style={styles.profileCardContent}>
              <UserInitials name={userName} email={userEmail} size={64} isPremium={isPremium} />
              <View style={styles.profileCardInfo}>
                <Text
                  style={[
                    styles.profileCardName,
                    { color: colors.textPrimary },
                  ]}
                >
                  {userName || t("profile.guest")}
                </Text>
                <Text
                  style={[
                    styles.profileCardEmail,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {userEmail}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.userHeader,
              { backgroundColor: colors.card },
              SHADOWS.small,
            ]}
            activeOpacity={0.7}
            onPress={() => router.push("/(main)/login")}
          >
            <UserInitials size={48} />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>
                {t("profile.notLoggedIn")}
              </Text>
              <Text
                style={[styles.userEmail, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {t("profile.loginToContinue")}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}

        {/* Subscription Status Card */}
        {isLoggedIn && (
          <TouchableOpacity
            style={[
              styles.premiumStatusCard,
              { backgroundColor: isPremium ? "#FFD70020" : colors.card },
              SHADOWS.small,
            ]}
            activeOpacity={0.7}
            onPress={() => router.push("/(main)/profile/subscription")}
          >
            <View style={styles.subscriptionLeft}>
              <Ionicons
                name={isPremium ? "star" : "diamond-outline"}
                size={24}
                color={isPremium ? "#FFD700" : colors.textSecondary}
              />
              <View>
                <Text
                  style={[
                    styles.premiumStatusText,
                    { color: colors.textPrimary },
                  ]}
                >
                  {isPremium
                    ? t("profile.premium.premiumPlan")
                    : t("profile.premium.freePlan")}
                </Text>
                {isPremium && expiresAt && (
                  <Text
                    style={[
                      styles.expiresText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t("profile.premium.expiresAt")}:{" "}
                    {new Date(expiresAt).toLocaleDateString(
                      i18n.language === "tr" ? "tr-TR" : "en-US",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </Text>
                )}
                {!isPremium && (
                  <Text
                    style={[
                      styles.expiresText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t("profile.premium.upgradeToPremium")}
                  </Text>
                )}
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}

        {/* Settings Menu - Categorized */}

        {/* Account Category */}
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: colors.card },
            SHADOWS.small,
          ]}
        >
          <Text style={[styles.categoryTitle, { color: colors.textTertiary }]}>
            {t("profile.settings.categories.account")}
          </Text>
          {isLoggedIn && (
            <>
              <TouchableOpacity
                style={styles.settingsItem}
                activeOpacity={0.7}
                onPress={() => router.push("/(main)/profile/purchase-history" as any)}
              >
                <Ionicons name="receipt-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
                  {i18n.language === "tr" ? "Satın Alım Geçmişi" : "Purchase History"}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            </>
          )}

          <TouchableOpacity
            style={[styles.settingsItem, !isLoggedIn && { opacity: 0.5 }]}
            activeOpacity={0.7}
            onPress={() => {
              if (!isLoggedIn) {
                router.push("/(main)/login");
                return;
              }
              router.push("/(main)/profile/edit");
            }}
            disabled={!isLoggedIn}
          >
            <Ionicons
              name={isLoggedIn ? "create-outline" : "lock-closed"}
              size={22}
              color={colors.textSecondary}
            />
            <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
              {t("profile.settings.editProfile")}
            </Text>
            {isLoggedIn ? (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textTertiary}
              />
            ) : (
              <Ionicons
                name="lock-closed"
                size={16}
                color={colors.textTertiary}
              />
            )}
          </TouchableOpacity>

          {isLoggedIn && (
            <>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.borderSubtle },
                ]}
              />
              <TouchableOpacity
                style={styles.settingsItem}
                activeOpacity={0.7}
                onPress={handleDeleteAccount}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={colors.error || "#FF3B30"}
                />
                <Text
                  style={[
                    styles.settingsText,
                    { color: colors.error || "#FF3B30" },
                  ]}
                >
                  {t("profile.deleteAccount.button")}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Preferences Category */}
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: colors.card },
            SHADOWS.small,
          ]}
        >
          <Text style={[styles.categoryTitle, { color: colors.textTertiary }]}>
            {t("profile.settings.categories.preferences")}
          </Text>
          <View style={styles.settingsItem}>
            <Ionicons name="language" size={22} color={colors.textSecondary} />
            <View style={styles.languageLabelWrap}>
              <Text
                style={[styles.settingsText, { color: colors.textPrimary }]}
              >
                {t("profile.settings.language")}
              </Text>
              <Text
                style={[styles.languageValue, { color: colors.textTertiary }]}
              >
                {currentLanguage === "tr"
                  ? t("profile.settings.languageTr")
                  : t("profile.settings.languageEn")}
              </Text>
            </View>
            <View style={styles.switchContainer}>
              <Switch
                value={currentLanguage === "en"}
                onValueChange={(value) => {
                  handleLanguageChange(value ? "en" : "tr");
                }}
                trackColor={{
                  false: colors.borderSubtle,
                  true: colors.primary,
                }}
                thumbColor={colors.background}
              />
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.borderSubtle }]}
          />

          <View style={styles.settingsItem}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={22}
              color={colors.textSecondary}
            />
            <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
              {t("profile.settings.theme")}
            </Text>
            <View style={styles.switchContainer}>
              <Switch
                value={isDark}
                onValueChange={handleThemeChange}
                trackColor={{
                  false: colors.borderSubtle,
                  true: colors.primary,
                }}
                thumbColor={colors.background}
              />
            </View>
          </View>
        </View>

        {/* Support Category */}
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: colors.card },
            SHADOWS.small,
          ]}
        >
          <Text style={[styles.categoryTitle, { color: colors.textTertiary }]}>
            {t("profile.settings.categories.support")}
          </Text>
          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.7}
            onPress={() => router.push("/(main)/profile/privacy")}
          >
            <Ionicons
              name="shield-checkmark"
              size={22}
              color={colors.textSecondary}
            />
            <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
              {t("profile.settings.privacy")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          <View
            style={[styles.divider, { backgroundColor: colors.borderSubtle }]}
          />

          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.7}
            onPress={() => router.push("/(main)/profile/terms")}
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color={colors.textSecondary}
            />
            <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
              {t("profile.terms.menuLabel")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          <View
            style={[styles.divider, { backgroundColor: colors.borderSubtle }]}
          />

          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.7}
            onPress={() => router.push("/(main)/profile/help")}
          >
            <Ionicons
              name="help-circle"
              size={22}
              color={colors.textSecondary}
            />
            <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
              {t("profile.settings.help")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          <View
            style={[styles.divider, { backgroundColor: colors.borderSubtle }]}
          />

          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.7}
            onPress={handleRateApp}
          >
            <Ionicons
              name="star-outline"
              size={22}
              color={colors.textSecondary}
            />
            <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
              {t("profile.settings.rateUs")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              { backgroundColor: colors.error || "#FF3B30" },
            ]}
            activeOpacity={0.7}
            onPress={handleLogout}
            disabled={logoutLoading}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>
              {logoutLoading ? t("common.loading", { defaultValue: "Yükleniyor..." }) : t("profile.logout")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  profileCard: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: "hidden",
  },
  profileCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  profileCardInfo: {
    flex: 1,
    left: 10,
  },
  profileCardName: {
    ...TEXT_STYLES.titleMedium,
    fontWeight: "700",
    marginBottom: SPACING.xs / 2,
  },
  profileCardEmail: {
    ...TEXT_STYLES.bodySmall,
    marginBottom: SPACING.sm,
  },
  profileCardStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flexWrap: "wrap",
  },
  profileCardStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  profileCardStatText: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "600",
  },
  premiumBadgeText: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "700",
    fontSize: 11,
  },
  userInfo: {
    flex: 1,
    left: 10,
  },
  userName: {
    ...TEXT_STYLES.titleSmall,
    marginBottom: SPACING.xs / 2,
  },
  userEmail: {
    ...TEXT_STYLES.bodySmall,
  },
  settingsCard: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: "hidden",
  },
  categoryTitle: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    opacity: 0.7,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.md,
  },
  settingsText: {
    flex: 1,
    ...TEXT_STYLES.bodyMedium,
  },
  verificationBadge: {
    ...TEXT_STYLES.bodySmall,
  },
  verificationLabelWrap: {
    flex: 1,
  },
  sendVerificationLink: {
    marginTop: SPACING.xs,
  },
  sendVerificationLinkText: {
    ...TEXT_STYLES.labelSmall,
  },
  divider: {
    height: 1,
    marginLeft: SPACING.md + 22 + SPACING.md,
  },
  switchContainer: {
    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
  },
  languageLabelWrap: {
    flex: 1,
  },
  languageValue: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
    marginTop: 2,
  },
  premiumStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  subscriptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flex: 1,
  },
  premiumStatusText: {
    ...TEXT_STYLES.bodyMedium,
    fontWeight: "600",
    fontSize: 16,
  },
  expiresText: {
    ...TEXT_STYLES.bodySmall,
    fontSize: 12,
    marginTop: 2,
  },
  premiumBanner: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  premiumBannerGradient: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  premiumBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  premiumBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: SPACING.md,
  },
  premiumBannerIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  premiumBannerText: {
    flex: 1,
  },
  premiumBannerTitle: {
    ...TEXT_STYLES.titleLarge,
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: SPACING.xs / 2,
  },
  premiumBannerSubtitle: {
    ...TEXT_STYLES.bodyMedium,
    color: "rgba(255, 255, 255, 0.9)",
  },
  premiumBannerRight: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.titleLarge,
    fontWeight: "600",
  },
  closeButton: {
    padding: SPACING.xs,
  },
  premiumFeatures: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  featureText: {
    ...TEXT_STYLES.bodyMedium,
    flex: 1,
  },
  premiumPriceContainer: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  premiumPriceLabel: {
    ...TEXT_STYLES.bodySmall,
    marginBottom: SPACING.xs,
  },
  premiumPrice: {
    ...TEXT_STYLES.titleLarge,
    fontWeight: "700",
  },
  modalFooter: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  restoreText: {
    ...TEXT_STYLES.bodySmall,
  },
  logoutContainer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  logoutButtonText: {
    ...TEXT_STYLES.bodyMedium,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
