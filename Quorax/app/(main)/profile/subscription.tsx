import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { PurchasesPackage } from "react-native-purchases";

import { BORDER_RADIUS, SPACING } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  configureRevenueCat,
  getPremiumPackages,
  purchasePremiumSubscription,
  restorePurchases,
} from "@/services/revenuecat";
import { supabase } from "@/services/supabase";

const FEATURES = [
  {
    icon: "infinite-outline" as const,
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.15)",
    titleKey: "featureUnlimitedChat",
    descKey: "featureUnlimitedChatDesc",
  },
  {
    icon: "sparkles-outline" as const,
    color: "#67E8F9",
    bg: "rgba(103,232,249,0.12)",
    titleKey: "featureUnlimitedMath",
    descKey: "featureUnlimitedMathDesc",
  },
  {
    icon: "ban-outline" as const,
    color: "#6EE7B7",
    bg: "rgba(110,231,183,0.12)",
    titleKey: "featureNoAds",
    descKey: "featureNoAdsDesc",
  },
];

export default function SubscriptionScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { isPremium, expiresAt, refreshSubscription, premiumPriceString } = useSubscription();

  const [loading, setLoading]       = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring]   = useState(false);
  const [packages, setPackages]     = useState<PurchasesPackage[]>([]);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const ctaScale  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();

    // Subtle CTA pulse — draws attention without being aggressive
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ctaScale, { toValue: 1.025, duration: 1400, useNativeDriver: true }),
        Animated.timing(ctaScale, { toValue: 1,     duration: 1400, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    loadPackages();
  }, [user?.id]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      await configureRevenueCat(user?.id ?? null);
      setPackages(await getPremiumPackages());
    } catch {}
    finally { setLoading(false); }
  };

  const upsertPremium = async (expiresDate?: string) => {
    if (!user?.id) return;
    await supabase.from("user_subscriptions").upsert(
      { user_id: user.id, subscription_type: "premium", subscription_status: "active",
        started_at: new Date().toISOString(), expires_at: expiresDate ?? null,
        updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  };

  const handleUpgrade = async () => {
    if (!isLoggedIn) { router.push("/(main)/login"); return; }
    if (!packages.length) { Alert.alert(t("common.error"), t("profile.premium.loadError")); return; }
    try {
      setPurchasing(true);
      const info = await purchasePremiumSubscription(packages[0]);
      await upsertPremium(info.expiresDate);
      await refreshSubscription();
      Alert.alert(t("profile.premium.purchaseSuccess"), t("profile.premium.purchaseSuccessMessage"),
        [{ text: t("profile.premium.great") }]);
    } catch (e: any) {
      if (e.message !== "CANCELLED")
        Alert.alert(t("common.error"), e.message || t("profile.premium.purchaseError"));
    } finally { setPurchasing(false); }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const info = await restorePurchases();
      const ent  = info?.entitlements?.active?.premium;
      if (ent) {
        await upsertPremium(ent.expirationDate ?? undefined);
        await refreshSubscription();
        Alert.alert(t("profile.premium.restored"), t("profile.premium.restoredMessage"));
      } else {
        Alert.alert(t("common.info"), t("profile.premium.noActiveSubscription"));
      }
    } catch { Alert.alert(t("common.error"), t("profile.premium.restoreError")); }
    finally { setRestoring(false); }
  };

  const handleCancel = () => {
    Alert.alert(t("profile.premium.cancelTitle"), t("profile.premium.cancelMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("profile.premium.cancelConfirm"), style: "destructive",
        onPress: () => Linking.openURL(Platform.OS === "ios"
          ? "https://apps.apple.com/account/subscriptions"
          : "https://play.google.com/store/account/subscriptions") },
    ]);
  };

  const priceString = premiumPriceString || packages[0]?.product?.priceString || "";
  const renewalDateStr = expiresAt
    ? new Date(expiresAt).toLocaleDateString(
        i18n.language === "tr" ? "tr-TR" : "en-US",
        { day: "numeric", month: "long", year: "numeric" })
    : null;

  /* ── Premium aktif ── */
  if (isPremium) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#1E1040", "#2D1080", "#1E1040"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>

        <Animated.View style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeBadgeText}>{t("profile.premium.activeBadge")}</Text>
          </View>

          <Text style={styles.title}>{t("profile.premium.heroActiveTitle")}</Text>
          <Text style={styles.subtitle}>{t("profile.premium.heroActiveSubtitle")}</Text>

          {renewalDateStr && (
            <View style={styles.renewalPill}>
              <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.55)" />
              <Text style={styles.renewalText}>
                {t("profile.premium.nextRenewal")}: {renewalDateStr}
              </Text>
            </View>
          )}

          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <View key={f.titleKey} style={styles.featureCard}>
                <View style={[styles.featureIconBox, { backgroundColor: f.bg }]}>
                  <Ionicons name={f.icon} size={17} color={f.color} />
                </View>
                <Text style={styles.featureCardTitle}>{t(`profile.premium.${f.titleKey}`)}</Text>
                <Ionicons name="checkmark-circle" size={17} color="#34D399" />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelSubBtn} onPress={handleCancel} activeOpacity={0.6}>
            <Text style={styles.cancelSubText}>{t("profile.premium.cancelSubscription")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  /* ── Satın alma ── */
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#1E1040", "#2D1080", "#1E1040"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.75)" />
      </TouchableOpacity>

      <Animated.View style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Social proof — üstte, güven oluşturur */}
        <View style={styles.socialProofRow}>
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map(i => (
              <Ionicons key={i} name="star" size={11} color="#FBBF24" />
            ))}
          </View>
          <Text style={styles.socialProofText}>{t("profile.premium.socialProof")}</Text>
        </View>

        {/* Başlık — loss framing */}
        <Text style={styles.title}>{t("profile.premium.heroInactiveTitle")}</Text>
        <Text style={styles.subtitle}>{t("profile.premium.heroInactiveSubtitle2")}</Text>

        {/* Feature kartları — value stack */}
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.titleKey} style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: f.bg }]}>
                <Ionicons name={f.icon} size={17} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureCardTitle}>{t(`profile.premium.${f.titleKey}`)}</Text>
                <Text style={styles.featureCardDesc}>{t(`profile.premium.${f.descKey}`)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Fiyat — büyük anchor, şeffaf */}
        <View style={styles.priceBlock}>
          {loading && !priceString
            ? <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
            : <>
                <Text style={styles.priceAmount}>{priceString}</Text>
                <Text style={styles.pricePer}>/{t("profile.premium.perMonth")}</Text>
              </>
          }
        </View>

        {/* CTA — risk reversal ile "Dene" framing */}
        <Animated.View style={[styles.ctaWrap, { transform: [{ scale: ctaScale }] }]}>
          <TouchableOpacity
            onPress={handleUpgrade}
            disabled={purchasing || loading}
            activeOpacity={0.9}
            style={[styles.ctaBtn, (purchasing || loading) && { opacity: 0.6 }]}
          >
            {purchasing
              ? <ActivityIndicator color="#3B0764" size="small" />
              : <Text style={styles.ctaText}>{t("profile.premium.ctaButton")}</Text>
            }
          </TouchableOpacity>
        </Animated.View>

        {/* Şeffaflık — cancel anytime 2 kez vurgulanır, güven artar */}
        <View style={styles.guaranteeRow}>
          <Ionicons name="shield-checkmark-outline" size={13} color="rgba(255,255,255,0.5)" />
          <Text style={styles.guaranteeText}>
            {t("profile.premium.cancelAnytime")} · {t("profile.premium.noCommitment")}
          </Text>
        </View>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} disabled={restoring} activeOpacity={0.6} style={styles.restoreBtn}>
          {restoring
            ? <ActivityIndicator size="small" color="rgba(255,255,255,0.35)" />
            : <Text style={styles.restoreText}>{t("profile.premium.purchase.restore")}</Text>
          }
        </TouchableOpacity>

        <Text style={styles.legal}>{t("profile.premium.legalText")}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 36,
    left: SPACING.lg,
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === "ios" ? 96 : 76,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    gap: SPACING.sm,
  },

  /* Social proof */
  socialProofRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(251,191,36,0.1)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.xs,
  },
  starsRow: { flexDirection: "row", gap: 1 },
  socialProofText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
  },

  /* Başlık */
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.7,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 20,
    marginTop: -2,
  },

  /* Feature kartları */
  featureList: {
    width: "100%",
    gap: 8,
    marginTop: SPACING.xs,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 13,
    paddingHorizontal: SPACING.md,
  },
  featureIconBox: {
    width: 38, height: 38,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  featureCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  featureCardDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 16,
  },

  /* Fiyat */
  priceBlock: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: SPACING.xs,
    minHeight: 42,
    justifyContent: "center",
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1.2,
  },
  pricePer: {
    fontSize: 16,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },

  /* CTA */
  ctaWrap: { width: "100%", marginTop: 2 },
  ctaBtn: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#3B0764",
    letterSpacing: -0.3,
  },

  /* Garanti */
  guaranteeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 2,
  },
  guaranteeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "500",
  },

  /* Restore / Legal */
  restoreBtn: { paddingVertical: 4, marginTop: SPACING.xs },
  restoreText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    textDecorationLine: "underline",
    textAlign: "center",
  },
  legal: {
    fontSize: 10,
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: SPACING.md,
  },

  /* Premium aktif */
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(52,211,153,0.12)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.round,
  },
  activeDot: {
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6EE7B7",
  },
  renewalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  renewalText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },
  cancelSubBtn: {
    marginTop: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  cancelSubText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
