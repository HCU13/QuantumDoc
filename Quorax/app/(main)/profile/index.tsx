import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MinimalHeader, SoftSurface } from "@/components/v2";
import { SimpleTimePicker } from "@/components/common/SimpleTimePicker";
import { UserInitials } from "@/components/common/UserInitials";
import {
  cancelDailyReminder,
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
  getReminderSettings,
  scheduleDailyReminder,
} from "@/services/dailyReminder";
import { triggerNotificationPermissionPrompt } from "@/hooks/usePushToken";
import {
  BORDER_RADIUS,
  HIT_SLOP,
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
  const { user, profile, isLoggedIn, isAnonymous, logout } = useAuth();
  const isRealUser = isLoggedIn && !isAnonymous;
  const { isPremium, expiresAt, refreshSubscription } = useSubscription();

  // User data from context — anonymous users have a DB-default "Guest" full_name; skip it.
  const userName = isAnonymous
    ? ""
    : profile?.full_name ||
      profile?.display_name ||
      user?.email?.split("@")[0] ||
      "";
  const userEmail = user?.email || profile?.email || "";

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Daily reminder
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(DEFAULT_REMINDER_HOUR);
  const [reminderMinute, setReminderMinute] = useState(DEFAULT_REMINDER_MINUTE);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    getReminderSettings().then((s) => {
      setReminderEnabled(s.enabled);
      setReminderHour(s.hour);
      setReminderMinute(s.minute);
    });
  }, []);

  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  const applyReminder = async (hour: number, minute: number) => {
    const granted = await triggerNotificationPermissionPrompt(user?.id);
    if (!granted) {
      Alert.alert(t("common.info"), t("notifications.reminder.permissionDenied"));
      return false;
    }
    const ok = await scheduleDailyReminder(
      hour,
      minute,
      t("notifications.daily.title"),
      t("notifications.daily.body"),
    );
    if (ok) {
      setReminderEnabled(true);
      setReminderHour(hour);
      setReminderMinute(minute);
    }
    return ok;
  };

  const handleReminderToggle = async (value: boolean) => {
    if (value) {
      await applyReminder(reminderHour, reminderMinute);
    } else {
      await cancelDailyReminder();
      setReminderEnabled(false);
    }
  };

  const handleReminderTimeChange = async (hour: number, minute: number) => {
    setShowTimePicker(false);
    if (reminderEnabled) {
      await applyReminder(hour, minute);
    } else {
      setReminderHour(hour);
      setReminderMinute(minute);
    }
  };

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Language state
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    i18n.language || "tr",
  );
  const [showLangPicker, setShowLangPicker] = useState(false);

  const LANGUAGES = [
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "es", label: "Español", flag: "🇪🇸" },
  ] as const;

  // Dil tercihini yükle
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("user_language_v2");
        const supported = LANGUAGES.map((l) => l.code);
        if (savedLanguage && supported.includes(savedLanguage as any)) {
          setCurrentLanguage(savedLanguage);
        } else {
          const systemLang = Localization.getLocales()[0]?.languageCode || "en";
          setCurrentLanguage(supported.includes(systemLang as any) ? systemLang : "en");
        }
      } catch {
        setCurrentLanguage(i18n.language || "en");
      }
    };
    loadLanguagePreference();
  }, []);

  const handleLanguageChange = async (lang: string) => {
    setCurrentLanguage(lang);
    const { rtlChanged } = await setLanguage(lang);
    // RTL flip only takes effect after app reload — RN's layout engine needs a full mount cycle.
    // Inform the user so the Arabic (or future RTL) experience isn't half-flipped.
    if (rtlChanged) {
      Alert.alert(
        t("profile.rtlRestartTitle"),
        t("profile.rtlRestartMessage"),
        [{ text: t("common.ok") }]
      );
    }
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

  const handleRedeemPromo = async () => {
    const trimmed = promoCode.trim();
    if (!trimmed) return;
    setPromoLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/redeem-promo-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ code: trimmed }),
        }
      );
      const result = await response.json();
      if (result.success) {
        setPromoCode("");
        setShowPromoInput(false);
        await refreshSubscription();
        Alert.alert(
          t("profile.promo.successTitle"),
          result.extended
            ? t("profile.promo.successExtended", { days: result.duration_days })
            : t("profile.promo.successMessage", { days: result.duration_days })
        );
      } else {
        const msgKey = `profile.promo.errors.${result.error}`;
        Alert.alert(t("common.error"), t(msgKey, { defaultValue: t("profile.promo.errors.server_error") }));
      }
    } catch {
      Alert.alert(t("common.error"), t("profile.promo.errors.server_error"));
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <SoftSurface tone="neutral">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Notebook page header */}
      <View style={styles.pageHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={HIT_SLOP.medium}
          activeOpacity={0.7}
          style={[
            styles.backBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.pageMeta, { color: colors.textTertiary }]}>
          §  {t("profile.title")}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        {isRealUser ? (
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
          <View
            style={[
              styles.guestCard,
              { backgroundColor: colors.card, borderColor: colors.borderSubtle },
              SHADOWS.small,
            ]}
          >
            <View style={styles.guestHeader}>
              <View style={[styles.guestAvatar, { backgroundColor: colors.surfaceMuted ?? colors.borderSubtle }]}>
                <Ionicons name="person-outline" size={28} color={colors.textSecondary} />
              </View>
              <View style={styles.guestHeaderText}>
                <Text style={[styles.guestTitle, { color: colors.textPrimary }]}>
                  {t("profile.guestTitle", { defaultValue: "Misafir olarak geziniyorsun" })}
                </Text>
                <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
                  {t("profile.guestSubtitle", { defaultValue: "Hesap oluşturarak ilerlemeni kaydet, cihazlar arasında senkronize et." })}
                </Text>
              </View>
            </View>

            <View style={styles.guestActions}>
              <TouchableOpacity
                style={[styles.guestPrimaryBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
                onPress={() => router.push("/(main)/signup")}
              >
                <Ionicons name="person-add" size={18} color="#FFFFFF" />
                <Text style={styles.guestPrimaryBtnText}>
                  {t("welcome.createAccount", { defaultValue: "Hesap Oluştur" })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.guestSecondaryBtn, { borderColor: colors.borderSubtle, backgroundColor: colors.background }]}
                activeOpacity={0.85}
                onPress={() => router.push("/(main)/login")}
              >
                <Ionicons name="log-in-outline" size={18} color={colors.textPrimary} />
                <Text style={[styles.guestSecondaryBtnText, { color: colors.textPrimary }]}>
                  {t("welcome.signIn", { defaultValue: "Giriş Yap" })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Subscription Status Card */}
        {isRealUser && (
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
          <Text style={[styles.categoryTitle, { color: colors.primary }]}>
            §  {t("profile.settings.categories.account")}
          </Text>
          <View style={[styles.categoryAccent, { backgroundColor: colors.primary }]} />
          {isRealUser && (
            <>
              <TouchableOpacity
                style={styles.settingsItem}
                activeOpacity={0.7}
                onPress={() => router.push("/(main)/profile/purchase-history" as any)}
              >
                <Ionicons name="receipt-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
                  {t("profile.settings.purchaseHistory")}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            </>
          )}

          {isRealUser && (
            <>
              <TouchableOpacity
                style={styles.settingsItem}
                activeOpacity={0.7}
                onPress={() => setShowPromoInput((v) => !v)}
              >
                <Ionicons name="gift-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
                  {t("profile.promo.menuLabel")}
                </Text>
                <Ionicons
                  name={showPromoInput ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
              {showPromoInput && (
                <View style={[styles.promoInputWrap, { borderTopColor: colors.borderSubtle }]}>
                  <TextInput
                    style={[styles.promoInput, { color: colors.textPrimary, borderColor: colors.borderSubtle, backgroundColor: colors.background }]}
                    value={promoCode}
                    onChangeText={setPromoCode}
                    placeholder={t("profile.promo.placeholder")}
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!promoLoading}
                  />
                  <TouchableOpacity
                    style={[styles.promoSubmitBtn, { backgroundColor: colors.primary, opacity: promoLoading ? 0.6 : 1 }]}
                    onPress={handleRedeemPromo}
                    disabled={promoLoading}
                    activeOpacity={0.7}
                  >
                    {promoLoading
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.promoSubmitText}>{t("profile.promo.apply")}</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            </>
          )}

          <TouchableOpacity
            style={[styles.settingsItem, !isRealUser && { opacity: 0.5 }]}
            activeOpacity={0.7}
            onPress={() => {
              if (!isRealUser) {
                router.push("/(main)/login");
                return;
              }
              router.push("/(main)/profile/edit");
            }}
            disabled={!isRealUser}
          >
            <Ionicons
              name={isRealUser ? "create-outline" : "lock-closed"}
              size={22}
              color={colors.textSecondary}
            />
            <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
              {t("profile.settings.editProfile")}
            </Text>
            <Ionicons
              name={isRealUser ? "chevron-forward" : "lock-closed"}
              size={isRealUser ? 18 : 16}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

        </View>

        {/* Preferences Category */}
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: colors.card },
            SHADOWS.small,
          ]}
        >
          <Text style={[styles.categoryTitle, { color: colors.primary }]}>
            §  {t("profile.settings.categories.preferences")}
          </Text>
          <View style={[styles.categoryAccent, { backgroundColor: colors.primary }]} />
          <TouchableOpacity
            style={styles.settingsItem}
            activeOpacity={0.7}
            onPress={() => setShowLangPicker((v) => !v)}
          >
            <Ionicons name="language" size={22} color={colors.textSecondary} />
            <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
              {t("profile.settings.language")}
            </Text>
            <Text style={[styles.langCurrentValue, { color: colors.textTertiary }]}>
              {LANGUAGES.find((l) => l.code === currentLanguage)?.flag}{" "}
              {LANGUAGES.find((l) => l.code === currentLanguage)?.label}
            </Text>
            <Ionicons
              name={showLangPicker ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          {showLangPicker && (
            <View style={[styles.langPickerWrap, { borderTopColor: colors.borderSubtle }]}>
              {LANGUAGES.map((lang, idx) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => { handleLanguageChange(lang.code); setShowLangPicker(false); }}
                    activeOpacity={0.7}
                    style={[
                      styles.langPickerItem,
                      idx < LANGUAGES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
                    ]}
                  >
                    <Text style={styles.langPickerFlag}>{lang.flag}</Text>
                    <Text style={[styles.langPickerLabel, { color: isSelected ? colors.primary : colors.textPrimary, fontWeight: isSelected ? "700" : "400" }]}>
                      {lang.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

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

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          {/* Daily reminder toggle */}
          <View style={styles.settingsItem}>
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsText, { color: colors.textPrimary, flex: 0 }]}>
                {t("notifications.reminder.settingsTitle")}
              </Text>
              <Text style={[styles.reminderHint, { color: colors.textTertiary }]}>
                {reminderEnabled
                  ? t("notifications.reminder.scheduled", { time: formatTime(reminderHour, reminderMinute) })
                  : t("notifications.reminder.settingsSubtitle")}
              </Text>
            </View>
            <View style={styles.switchContainer}>
              <Switch
                value={reminderEnabled}
                onValueChange={handleReminderToggle}
                trackColor={{ false: colors.borderSubtle, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>

          {reminderEnabled && (
            <TouchableOpacity
              style={[styles.settingsItem, { paddingTop: 0 }]}
              activeOpacity={0.7}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
              <Text style={[styles.settingsText, { color: colors.textPrimary }]}>
                {t("notifications.reminder.timeLabel")}
              </Text>
              <Text style={[styles.langCurrentValue, { color: colors.primary, fontWeight: "700" }]}>
                {formatTime(reminderHour, reminderMinute)}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Support Category */}
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: colors.card },
            SHADOWS.small,
          ]}
        >
          <Text style={[styles.categoryTitle, { color: colors.primary }]}>
            §  {t("profile.settings.categories.support")}
          </Text>
          <View style={[styles.categoryAccent, { backgroundColor: colors.primary }]} />
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

        {/* Logout Button — only for real users; guests use the login/signup CTAs above */}
        {isRealUser && (
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
        )}

        {/* Delete Account — en altta, gizli */}
        {isRealUser && (
          <TouchableOpacity
            style={styles.deleteAccountBtn}
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.deleteAccountText, { color: colors.textTertiary }]}>
              {t("profile.deleteAccount.button")}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <SimpleTimePicker
        visible={showTimePicker}
        initialHour={reminderHour}
        initialMinute={reminderMinute}
        onCancel={() => setShowTimePicker(false)}
        onConfirm={handleReminderTimeChange}
      />
    </SoftSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md + 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pageMeta: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
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
  guestCard: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  guestHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  guestAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  guestHeaderText: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  guestSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  guestActions: {
    gap: SPACING.sm,
  },
  guestPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  guestPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  guestSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md - 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  guestSecondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
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
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  categoryAccent: {
    width: 28,
    height: 3,
    borderRadius: 2,
    opacity: 0.85,
    marginLeft: SPACING.md,
    marginBottom: SPACING.sm,
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
  langCurrentValue: {
    fontSize: 13,
    marginRight: SPACING.xs,
  },
  reminderHint: {
    fontSize: 12,
    marginTop: 2,
  },
  langPickerWrap: {
    borderTopWidth: 1,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  langPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  langPickerFlag: {
    fontSize: 18,
    width: 26,
    textAlign: "center",
  },
  langPickerLabel: {
    flex: 1,
    fontSize: 14,
  },
  promoInputWrap: {
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  promoInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  promoSubmitBtn: {
    height: 40,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
  },
  promoSubmitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  deleteAccountBtn: {
    alignItems: "center",
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  deleteAccountText: {
    fontSize: 13,
    textDecorationLine: "underline",
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
