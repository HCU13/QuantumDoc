import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { TEXT_STYLES, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabase";
import Skeleton from "../../components/common/Skeleton";

const PurchaseHistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
    },
    emptyIcon: {
      marginBottom: SPACING.md,
    },
    emptyText: {
      ...TEXT_STYLES.titleMedium,
      color: colors.textOnGradient,
      textAlign: "center",
      marginBottom: SPACING.xs,
    },
    emptySubtext: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textSecondary,
      textAlign: "center",
      opacity: 0.8,
    },
    purchaseCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.small,
    },
    purchaseHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.md,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    purchaseInfo: {
      flex: 1,
    },
    productName: {
      ...TEXT_STYLES.titleSmall,
      color: colors.textPrimary,
      fontWeight: "600",
      marginBottom: 2,
    },
    purchaseDate: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textTertiary,
    },
    amountContainer: {
      alignItems: "flex-end",
    },
    amount: {
      ...TEXT_STYLES.titleMedium,
      fontWeight: "700",
      marginBottom: 2,
    },
    statusBadge: {
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
      ...TEXT_STYLES.labelSmall,
      fontWeight: "600",
    },
    purchaseDetails: {
      borderTopWidth: 1,
      borderTopColor: colors.border + "30",
      paddingTop: SPACING.sm,
      marginTop: SPACING.xs,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: SPACING.xs,
    },
    detailLabel: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
    },
    detailValue: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textPrimary,
      fontWeight: "500",
    },
  });

  useEffect(() => {
    loadPurchases();
  }, [user?.id]);

  const loadPurchases = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      if (__DEV__) console.error("❌ Load purchases error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPurchases();
    setRefreshing(false);
  };

  const getProductIcon = (productType) => {
    switch (productType) {
      case "tokens":
        return "diamond";
      case "subscription":
        return "star";
      case "premium_feature":
        return "rocket";
      default:
        return "cart";
    }
  };

  const getProductColor = (productType) => {
    switch (productType) {
      case "tokens":
        return colors.primary;
      case "subscription":
        return "#FFD700";
      case "premium_feature":
        return "#10B981";
      default:
        return colors.secondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "pending":
        return colors.warning;
      case "failed":
      case "cancelled":
        return colors.error;
      case "refunded":
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return t("purchases.status.completed");
      case "pending":
        return t("purchases.status.pending");
      case "failed":
        return t("purchases.status.failed");
      case "refunded":
        return t("purchases.status.refunded");
      case "cancelled":
        return t("purchases.status.cancelled");
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency || "TRY",
    }).format(amount);
  };

  const renderPurchaseItem = ({ item }) => {
    const productColor = getProductColor(item.product_type);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.purchaseCard}
        activeOpacity={0.7}
        onPress={() => {
          // Detay sayfasına gidebilir
        }}
      >
        <View style={styles.purchaseHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: productColor + "20" },
            ]}
          >
            <Ionicons
              name={getProductIcon(item.product_type)}
              size={24}
              color={productColor}
            />
          </View>

          <View style={styles.purchaseInfo}>
            <Text style={styles.productName}>{item.product_name}</Text>
            <Text style={styles.purchaseDate}>
              {formatDate(item.purchased_at)}
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: productColor }]}>
              {formatAmount(item.amount, item.currency)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "20" },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>

        {item.payment_method && (
          <View style={styles.purchaseDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t("purchases.paymentMethod")}
              </Text>
              <Text style={styles.detailValue}>
                {item.payment_method.toUpperCase()}
              </Text>
            </View>
            {item.transaction_id && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("purchases.transactionId")}
                </Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {item.transaction_id.slice(0, 16)}...
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <Header title={t("purchases.title")} showBackButton={true} />
          <View style={styles.content}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: BORDER_RADIUS.lg,
                  padding: SPACING.md,
                  marginBottom: SPACING.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Skeleton
                    circle
                    width={48}
                    height={48}
                    style={{ marginRight: SPACING.sm }}
                  />
                  <View style={{ flex: 1 }}>
                    <Skeleton
                      width="70%"
                      height={18}
                      style={{ marginBottom: 6 }}
                    />
                    <Skeleton width="50%" height={14} />
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Skeleton
                      width={80}
                      height={20}
                      style={{ marginBottom: 6 }}
                    />
                    <Skeleton width={60} height={20} borderRadius={12} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title={t("purchases.title")} showBackButton={true} />

        {purchases.length > 0 ? (
          <FlatList
            data={purchases}
            renderItem={renderPurchaseItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={80}
              color={colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>{t("purchases.empty")}</Text>
            <Text style={styles.emptySubtext}>
              {t("purchases.emptySubtext")}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
};

export default PurchaseHistoryScreen;

