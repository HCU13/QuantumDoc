import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
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

type PlanId = "monthly" | "yearly";

// Fallback display values — used ONLY when the corresponding RC package hasn't loaded yet.
// Lets the paywall render a complete screenshot-ready layout during setup. Purchase action
// still requires a real package.
const FALLBACK_MONTHLY = { priceString: "$9.99", price: 9.99, currencyCode: "USD" };
const FALLBACK_YEARLY = { priceString: "$49.99", price: 49.99, currencyCode: "USD" };

// Secondary features shown as simple icon+text rows below the hero.
// Kept intentionally short — we let the hero card carry the emotional weight.
const SECONDARY_FEATURES = [
  { icon: "infinite-outline" as const, color: "#A78BFA", titleKey: "featureUnlimited" },
  { icon: "bulb-outline" as const, color: "#FBBF24", titleKey: "featureExplanations" },
  { icon: "analytics-outline" as const, color: "#67E8F9", titleKey: "featureTopics" },
  { icon: "ban-outline" as const, color: "#F472B6", titleKey: "featureNoAds" },
];

export default function SubscriptionScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { isPremium, expiresAt, refreshSubscription } = useSubscription();

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<PlanId>("yearly");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => { loadPackages(); }, [user?.id]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      await configureRevenueCat(user?.id ?? null);
      const pkgs = await getPremiumPackages();
      setPackages(pkgs);
      const hasYearly = pkgs.some((p) => p.packageType === "ANNUAL");
      setSelected(hasYearly ? "yearly" : "monthly");
    } catch {}
    finally { setLoading(false); }
  };

  const { monthly, yearly } = useMemo(() => ({
    monthly: packages.find((p) => p.packageType === "MONTHLY"),
    yearly: packages.find((p) => p.packageType === "ANNUAL"),
  }), [packages]);

  const monthlyDisplay = monthly?.product ?? FALLBACK_MONTHLY;
  const yearlyDisplay = yearly?.product ?? FALLBACK_YEARLY;
  const active = selected === "yearly" ? (yearly ?? monthly) : (monthly ?? yearly);

  // Detect an Apple Introductory Offer attached to the currently-selected package. When present,
  // we lead the CTA with "Start Free Trial" framing and show a reminder microcopy. Otherwise
  // the flow falls back to a straight purchase CTA.
  const introOffer = useMemo(() => {
    const pkg = selected === "yearly" ? yearly : monthly;
    const intro: any = (pkg?.product as any)?.introPrice ?? (pkg?.product as any)?.introductoryPrice;
    if (!intro) return null;
    const isFree = intro.price === 0 || intro.priceString?.includes("0.00");
    if (!isFree) return null;
    // Period can come as "P3D" ISO8601 or as { unit, numberOfUnits } — handle both.
    let days = 0;
    if (typeof intro.period === "string") {
      const m = intro.period.match(/P(\d+)([DWMY])/);
      if (m) {
        const n = parseInt(m[1], 10);
        days = m[2] === "D" ? n : m[2] === "W" ? n * 7 : m[2] === "M" ? n * 30 : n * 365;
      }
    } else if (intro.periodNumberOfUnits) {
      const n = intro.periodNumberOfUnits;
      const unit = intro.periodUnit ?? "DAY";
      days = unit === "DAY" ? n : unit === "WEEK" ? n * 7 : unit === "MONTH" ? n * 30 : n * 365;
    }
    return days > 0 ? { days } : null;
  }, [selected, monthly, yearly]);

  const savingsPercent = useMemo(() => {
    const monthlyPriceYearly = monthlyDisplay.price * 12;
    if (monthlyPriceYearly <= 0) return null;
    const saved = 1 - yearlyDisplay.price / monthlyPriceYearly;
    if (saved <= 0.05) return null;
    return Math.round(saved * 100);
  }, [monthlyDisplay, yearlyDisplay]);

  const yearlyPerMonthString = useMemo(() => {
    const perMonth = yearlyDisplay.price / 12;
    try {
      return new Intl.NumberFormat(i18n.language || "en", {
        style: "currency",
        currency: yearlyDisplay.currencyCode,
        maximumFractionDigits: 2,
      }).format(perMonth);
    } catch {
      return `${perMonth.toFixed(2)} ${yearlyDisplay.currencyCode}`;
    }
  }, [yearlyDisplay, i18n.language]);

  const upsertPremium = async (expiresDate?: string) => {
    if (!user?.id) return;
    await supabase.from("user_subscriptions").upsert(
      {
        user_id: user.id,
        subscription_type: "premium",
        subscription_status: "active",
        started_at: new Date().toISOString(),
        expires_at: expiresDate ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  };

  const handleUpgrade = async () => {
    if (!isLoggedIn) { router.push("/(main)/login"); return; }
    if (!active) { Alert.alert(t("common.error"), t("profile.premium.loadError")); return; }
    try {
      setPurchasing(true);
      const info = await purchasePremiumSubscription(active);
      await upsertPremium(info.expiresDate);
      await refreshSubscription();
      Alert.alert(
        t("profile.premium.purchaseSuccess"),
        t("profile.premium.purchaseSuccessMessage"),
        [{ text: t("profile.premium.great") }]
      );
    } catch (e: any) {
      if (e.message !== "CANCELLED") {
        Alert.alert(t("common.error"), e.message || t("profile.premium.purchaseError"));
      }
    } finally { setPurchasing(false); }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const info = await restorePurchases();
      const activeEntitlements = info?.entitlements?.active ?? {};
      const ent = activeEntitlements["premium"] ?? activeEntitlements["Premium"] ?? Object.values(activeEntitlements)[0] ?? null;
      if (ent) {
        await upsertPremium((ent as any).expirationDate ?? undefined);
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
      {
        text: t("profile.premium.cancelConfirm"),
        style: "destructive",
        onPress: () => Linking.openURL(
          Platform.OS === "ios"
            ? "https://apps.apple.com/account/subscriptions"
            : "https://play.google.com/store/account/subscriptions"
        ),
      },
    ]);
  };

  const renewalDateStr = expiresAt
    ? new Date(expiresAt).toLocaleDateString(
        i18n.language === "tr" ? "tr-TR" : "en-US",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : null;

  const openTerms = () => Linking.openURL("https://quorax.app/terms");
  const openPrivacy = () => Linking.openURL("https://quorax.app/privacy");

  /* ─────────── ACTIVE PREMIUM ─────────── */
  if (isPremium) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#1B1240", "#3B1F7A", "#1B1240"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>

        <Animated.View style={[styles.activeBody, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeBadgeText}>{t("profile.premium.activeBadge")}</Text>
          </View>

          <Text style={styles.heroTitle}>{t("profile.premium.heroActiveTitle")}</Text>
          <Text style={styles.heroSubtitle}>{t("profile.premium.heroActiveSubtitle")}</Text>

          {renewalDateStr && (
            <View style={styles.renewalPill}>
              <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.65)" />
              <Text style={styles.renewalText}>
                {t("profile.premium.nextRenewal")}: {renewalDateStr}
              </Text>
            </View>
          )}

          <View style={styles.activeFeatureList}>
            {SECONDARY_FEATURES.map((f) => (
              <View key={f.titleKey} style={styles.activeFeatureRow}>
                <Ionicons name={f.icon} size={18} color={f.color} />
                <Text style={styles.activeFeatureText}>{t(`profile.premium.${f.titleKey}`)}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#34D399" />
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

  /* ─────────── PURCHASE VIEW ─────────── */
  // CTA copy adapts to whether a free trial is attached to the selected package.
  const hasTrial = !!introOffer;
  const ctaPrimary = hasTrial
    ? t("profile.premium.ctaStartTrial", { days: introOffer!.days })
    : t("profile.premium.ctaContinue");
  const ctaSecondary = hasTrial
    ? (selected === "yearly"
        ? t("profile.premium.ctaTrialThen", { price: yearlyDisplay.priceString, period: t("profile.premium.perYear") })
        : t("profile.premium.ctaTrialThen", { price: monthlyDisplay.priceString, period: t("profile.premium.perMonth") }))
    : (selected === "yearly" ? yearlyDisplay.priceString : monthlyDisplay.priceString);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Softer gradient — royal blue → violet, less oppressive than pure deep purple. */}
      <LinearGradient
        colors={["#1A1450", "#3B1F7A", "#5B21B6"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Radial glow behind hero text — subtle warmth, less "goth" feeling. */}
      <View style={styles.glowTop} pointerEvents="none" />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.85)" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* HERO — minimal, focused. Trial framing wins. */}
          <View style={styles.hero}>
            <View style={styles.proChip}>
              <Ionicons name="sparkles" size={11} color="#FDE68A" />
              <Text style={styles.proChipText}>QUORAX PREMIUM</Text>
            </View>
            <Text style={styles.heroTitle}>
              {hasTrial
                ? t("profile.premium.heroTrialTitle", { days: introOffer!.days })
                : t("profile.premium.heroInactiveTitle")}
            </Text>
            <Text style={styles.heroSubtitle}>
              {hasTrial
                ? t("profile.premium.heroTrialSubtitle")
                : t("profile.premium.heroInactiveSubtitle2")}
            </Text>
          </View>

          {/* HERO FEATURE — Verify My Work, Quorax's unique differentiator.
              Given a dedicated card so it stands out among the commodity features. */}
          <View style={styles.verifyCard}>
            <View style={styles.verifyBadge}>
              <Ionicons name="star" size={10} color="#422006" />
              <Text style={styles.verifyBadgeText}>{t("profile.premium.uniqueBadge")}</Text>
            </View>
            <View style={styles.verifyIconBox}>
              <Ionicons name="checkmark-done" size={26} color="#34D399" />
            </View>
            <Text style={styles.verifyTitle}>{t("profile.premium.verifyHeroTitle")}</Text>
            <Text style={styles.verifyDesc}>{t("profile.premium.verifyHeroDesc")}</Text>
          </View>

          {/* SECONDARY FEATURES — icon + label, very minimal. */}
          <View style={styles.miniFeatures}>
            {SECONDARY_FEATURES.map((f) => (
              <View key={f.titleKey} style={styles.miniFeatureRow}>
                <Ionicons name={f.icon} size={16} color={f.color} />
                <Text style={styles.miniFeatureText}>{t(`profile.premium.${f.titleKey}`)}</Text>
              </View>
            ))}
          </View>

          {/* PLAN TOGGLE — two cards, yearly visibly dominant with trial badge. */}
          <View style={styles.planToggle}>
            <PlanCard
              selected={selected === "monthly"}
              title={t("profile.premium.planMonthly")}
              priceString={monthlyDisplay.priceString}
              periodLabel={`/${t("profile.premium.perMonth")}`}
              onPress={() => setSelected("monthly")}
            />
            <PlanCard
              selected={selected === "yearly"}
              title={t("profile.premium.planYearly")}
              priceString={yearlyDisplay.priceString}
              periodLabel={`/${t("profile.premium.perYear")}`}
              subtitle={yearlyPerMonthString
                ? t("profile.premium.equivMonthly", { price: yearlyPerMonthString })
                : undefined}
              badgeText={
                hasTrial
                  ? t("profile.premium.trialBadge", { days: introOffer!.days })
                  : savingsPercent
                    ? t("profile.premium.savePercent", { pct: savingsPercent })
                    : t("profile.premium.bestValue")
              }
              onPress={() => setSelected("yearly")}
            />
          </View>

          {/* CTA — adaptive copy: trial-first when available, purchase-first otherwise. */}
          <TouchableOpacity
            onPress={handleUpgrade}
            disabled={purchasing || loading || !active}
            activeOpacity={0.88}
            style={[styles.ctaBtn, (purchasing || loading || !active) && { opacity: 0.55 }]}
          >
            {purchasing ? (
              <ActivityIndicator color="#3B0764" size="small" />
            ) : (
              <View style={styles.ctaInner}>
                <Text style={styles.ctaPrimary}>{ctaPrimary}</Text>
                <Text style={styles.ctaSecondary}>{ctaSecondary}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* TRUST MICROCOPY — reminder + cancel anytime reduces anxiety right at decision point. */}
          {hasTrial && (
            <View style={styles.trustRow}>
              <Ionicons name="notifications-outline" size={13} color="rgba(255,255,255,0.6)" />
              <Text style={styles.trustText}>{t("profile.premium.trialReminder")}</Text>
            </View>
          )}
          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark-outline" size={13} color="rgba(255,255,255,0.6)" />
            <Text style={styles.trustText}>
              {t("profile.premium.cancelAnytime")} · {hasTrial ? t("profile.premium.noPaymentToday") : t("profile.premium.noCommitment")}
            </Text>
          </View>

          {/* LEGAL — minimal single row of links. Apple 3.1.2 compliant. */}
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={handleRestore} disabled={restoring} activeOpacity={0.6}>
              {restoring
                ? <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
                : <Text style={styles.legalLink}>{t("profile.premium.purchase.restore")}</Text>
              }
            </TouchableOpacity>
            <Text style={styles.legalDivider}>·</Text>
            <TouchableOpacity onPress={openTerms} activeOpacity={0.6}>
              <Text style={styles.legalLink}>{t("profile.premium.terms")}</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>·</Text>
            <TouchableOpacity onPress={openPrivacy} activeOpacity={0.6}>
              <Text style={styles.legalLink}>{t("profile.premium.privacy")}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ─────────── Plan card ─────────── */
interface PlanCardProps {
  selected: boolean;
  title: string;
  priceString: string;
  periodLabel: string;
  subtitle?: string;
  badgeText?: string;
  onPress: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  selected, title, priceString, periodLabel, subtitle, badgeText, onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[
      planCardStyles.card,
      selected ? planCardStyles.cardSelected : planCardStyles.cardUnselected,
    ]}
  >
    {badgeText && (
      <View style={planCardStyles.badge}>
        <Text style={planCardStyles.badgeText}>{badgeText}</Text>
      </View>
    )}
    <View style={[planCardStyles.radio, selected && planCardStyles.radioSelected]}>
      {selected && <View style={planCardStyles.radioDot} />}
    </View>
    <Text style={planCardStyles.title}>{title}</Text>
    <View style={planCardStyles.priceRow}>
      <Text style={planCardStyles.price}>{priceString}</Text>
      <Text style={planCardStyles.period}>{periodLabel}</Text>
    </View>
    {subtitle && <Text style={planCardStyles.subtitle}>{subtitle}</Text>}
  </TouchableOpacity>
);

const planCardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    padding: SPACING.md,
    paddingTop: SPACING.md + 4,
    gap: 4,
    position: "relative",
    overflow: "visible",
    minHeight: 130,
  },
  cardSelected: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  cardUnselected: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  badge: {
    position: "absolute",
    top: -10,
    left: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: "#FBBF24",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignItems: "center",
  },
  badgeText: {
    color: "#422006",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  radio: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  radioSelected: {
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  radioDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: "#6D28D9",
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 2, marginTop: 2 },
  price: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.6,
  },
  period: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(253,224,71,0.95)",
    fontWeight: "700",
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Decorative soft glow behind hero area */
  glowTop: {
    position: "absolute",
    top: -150,
    left: -50,
    right: -50,
    height: 400,
    backgroundColor: "rgba(167,139,250,0.2)",
    borderRadius: 500,
  },

  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 36,
    left: SPACING.lg,
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  scroll: {
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    paddingHorizontal: SPACING.lg,
  },

  body: { gap: SPACING.lg + 2 },
  activeBody: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === "ios" ? 96 : 76,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    gap: SPACING.md,
    justifyContent: "center",
  },

  /* Hero */
  hero: { alignItems: "center", gap: 10, marginTop: SPACING.md },
  proChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(253,224,71,0.14)",
    borderWidth: 1,
    borderColor: "rgba(253,224,71,0.3)",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  proChipText: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#FDE68A",
    letterSpacing: 1.4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.8,
    textAlign: "center",
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: SPACING.sm,
  },

  /* Verify hero card — dominant, differentiator-focused */
  verifyCard: {
    backgroundColor: "rgba(52,211,153,0.12)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.35)",
    borderRadius: 22,
    padding: SPACING.lg,
    gap: 8,
    position: "relative",
    overflow: "visible",
  },
  verifyBadge: {
    position: "absolute",
    top: -10,
    left: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FBBF24",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifyBadgeText: {
    color: "#422006",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  verifyIconBox: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(52,211,153,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 2,
  },
  verifyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  verifyDesc: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 20,
  },

  /* Mini features — breathing room, one per row, clean */
  miniFeatures: { gap: 12, paddingHorizontal: 2 },
  miniFeatureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  miniFeatureText: {
    fontSize: 14.5,
    color: "rgba(255,255,255,0.92)",
    fontWeight: "500",
    flex: 1,
  },

  /* Plan toggle */
  planToggle: { flexDirection: "row", gap: 10, marginTop: 4 },

  /* CTA */
  ctaBtn: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  ctaInner: { alignItems: "center", gap: 2 },
  ctaPrimary: {
    fontSize: 17,
    fontWeight: "800",
    color: "#3B0764",
    letterSpacing: -0.3,
  },
  ctaSecondary: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "rgba(59,7,100,0.55)",
  },

  /* Trust microcopy */
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: SPACING.sm,
  },
  trustText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
    textAlign: "center",
  },

  /* Legal links — minimal row */
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  legalLink: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
  },
  legalDivider: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
  },

  /* Active premium view */
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(52,211,153,0.15)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.3)",
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "center",
  },
  activeDot: {
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6EE7B7",
    letterSpacing: 0.3,
  },
  renewalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 6,
    alignSelf: "center",
  },
  renewalText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  activeFeatureList: {
    gap: 10,
    marginTop: SPACING.sm,
  },
  activeFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  activeFeatureText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  cancelSubBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    alignSelf: "center",
  },
  cancelSubText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
