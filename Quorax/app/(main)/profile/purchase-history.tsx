import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { ModuleHeader } from "@/components/common/ModuleHeader";
import { BORDER_RADIUS, SHADOWS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import type { Purchase } from "@/contexts/SubscriptionContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";

function PurchaseCard({ item, colors, lang }: { item: Purchase; colors: any; lang: string }) {
  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const date = new Date(item.purchased_at);
  const formattedDate = date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  const formattedTime = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const storeIcon = item.store === "app_store" ? "logo-apple" : "logo-google-playstore";
  const storeLabel = item.store === "app_store" ? "App Store" : "Google Play";
  const expiresDate = item.expires_at
    ? new Date(item.expires_at).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }, SHADOWS.subtle]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: "#FFD70018" }]}>
          <Ionicons name="star" size={20} color="#FFD700" />
        </View>
        <View style={styles.cardTitleBlock}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {"Premium "}
            <Text style={[styles.badge, { color: item.is_renewal ? colors.textTertiary : "#10B981" }]}>
              {item.is_renewal
                ? (lang === "tr" ? "· Yenileme" : "· Renewal")
                : (lang === "tr" ? "· İlk Alım" : "· New")}
            </Text>
          </Text>
          <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
            {formattedDate} · {formattedTime}
          </Text>
        </View>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>
          {item.amount > 0 ? `${item.amount} ${item.currency}` : "—"}
        </Text>
      </View>

      <View style={[styles.detailsRow, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.chip}>
          <Ionicons name={storeIcon as any} size={13} color={colors.textTertiary} />
          <Text style={[styles.chipText, { color: colors.textTertiary }]}>{storeLabel}</Text>
        </View>
        {expiresDate && (
          <View style={styles.chip}>
            <Ionicons name="calendar-outline" size={13} color={colors.textTertiary} />
            <Text style={[styles.chipText, { color: colors.textTertiary }]}>
              {lang === "tr" ? `Bitiş: ${expiresDate}` : `Until: ${expiresDate}`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// İskelet kart — veri yüklenirken pulse efekti
function SkeletonCard({ colors }: { colors: any }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card }, SHADOWS.subtle]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: colors.backgroundSecondary }]} />
        <View style={styles.cardTitleBlock}>
          <View style={[styles.skeletonLine, { width: 120, backgroundColor: colors.backgroundSecondary }]} />
          <View style={[styles.skeletonLine, { width: 80, marginTop: 6, backgroundColor: colors.backgroundSecondary }]} />
        </View>
        <View style={[styles.skeletonLine, { width: 50, backgroundColor: colors.backgroundSecondary }]} />
      </View>
    </View>
  );
}

export default function PurchaseHistoryScreen() {
  const { colors, isDark } = useTheme();
  const { i18n } = useTranslation();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { purchases, purchasesLoading } = useSubscription();
  const lang = i18n.language;
  const title = lang === "tr" ? "Satın Alım Geçmişi" : "Purchase History";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ModuleHeader
        title={title}
        onBackPress={() => router.canDismiss() ? router.dismiss() : router.back()}
      />

      {!isLoggedIn ? (
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {lang === "tr" ? "Giriş yapman gerekiyor." : "Please log in."}
          </Text>
        </View>
      ) : purchasesLoading ? (
        // Veri henüz yükleniyorsa iskelet göster — tam ekran spinner yok
        <View style={styles.list}>
          <SkeletonCard colors={colors} />
          <SkeletonCard colors={colors} />
          <SkeletonCard colors={colors} />
        </View>
      ) : purchases.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="receipt-outline" size={56} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {lang === "tr" ? "Henüz satın alım yok" : "No purchases yet"}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {lang === "tr"
              ? "Premium aldığında burada görünecek."
              : "Your purchases will appear here."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PurchaseCard item={item} colors={colors} lang={lang} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.count, { color: colors.textTertiary }]}>
              {lang === "tr"
                ? `${purchases.length} işlem`
                : `${purchases.length} transaction${purchases.length !== 1 ? "s" : ""}`}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: SPACING.md, padding: SPACING.xl },
  list: { padding: SPACING.lg, gap: SPACING.sm },
  count: { ...TEXT_STYLES.labelSmall, marginBottom: SPACING.xs },
  emptyTitle: { ...TEXT_STYLES.titleMedium, marginTop: SPACING.sm },
  emptyText: { ...TEXT_STYLES.bodySmall, textAlign: "center" },
  card: { borderRadius: BORDER_RADIUS.lg, overflow: "hidden", marginBottom: SPACING.sm },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, padding: SPACING.md },
  iconWrap: { width: 40, height: 40, borderRadius: BORDER_RADIUS.md, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  cardTitleBlock: { flex: 1 },
  cardTitle: { ...TEXT_STYLES.titleSmall },
  badge: { fontSize: 12, fontWeight: "400" },
  cardDate: { ...TEXT_STYLES.bodySmall, marginTop: 2 },
  amount: { ...TEXT_STYLES.titleSmall, fontWeight: "700", flexShrink: 0 },
  detailsRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, borderTopWidth: 1, paddingTop: SPACING.sm },
  chip: { flexDirection: "row", alignItems: "center", gap: 4 },
  chipText: { fontSize: 12 },
  skeletonLine: { height: 12, borderRadius: 6 },
});
