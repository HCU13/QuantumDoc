import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { ActivityItem, type Activity } from "@/components/home/ActivityItem";
import { BORDER_RADIUS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useActivity } from "@/contexts/ActivityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase, TABLES } from "@/services/supabase";

const PAGE_SIZE = 20;

export default function ActivityScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { clearAllActivities, refreshActivities } = useActivity();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Zaman formatla
  const formatTime = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("home.activity.justNow");
    if (diffMins < 60) return `${diffMins} ${t("home.activity.minutesAgo")}`;
    if (diffHours < 24) return `${diffHours} ${t("home.activity.hoursAgo")}`;
    if (diffDays === 1) return t("home.activity.yesterday");
    if (diffDays < 7) return `${diffDays} ${t("home.activity.daysAgo")}`;

    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  // Aktivite detay sayfasına git
  const handleActivityPress = (activity: Activity) => {
    router.push({
      pathname: "/(main)/activity/[id]",
      params: { id: activity.id, type: activity.type },
    } as any);
  };

  // Aktiviteleri yükle
  const fetchActivities = useCallback(
    async (pageNumber = 0, refresh = false) => {
      if (!user?.id) {
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        const { data: mathData } = await supabase
          .from("math_solutions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100);

        const { data: examData } = await supabase
          .from(TABLES.EXAM_RESULTS)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100);

        const { data: otherActivitiesRaw } = await supabase
          .from(TABLES.USER_ACTIVITIES)
          .select("*")
          .eq("user_id", user.id)
          .neq("activity_type", "chat")
          .neq("activity_type", "exam-lab")
          .order("created_at", { ascending: false })
          .limit(100);
        const otherActivities = otherActivitiesRaw || [];

        const allActivities: (Activity & { created_at: string })[] = [
          ...(mathData || []).map((math) => ({
            id: `math-${math.id}`,
            type: "math" as const,
            title:
              math.problem_text?.slice(0, 50) || t("home.activity.mathProblem"),
            timestamp: formatTime(math.created_at),
            tokenCost: 0,
            problemImageUrl: math.problem_image_url || undefined,
            created_at: math.created_at,
          })),
          ...(examData || []).map((exam) => ({
            id: `exam-${exam.id}`,
            type: "exam" as const,
            title: exam.topic || t("home.activity.exam") || "Sınav",
            subtitle: `${exam.correct_count}/${exam.total_questions} ${t("home.activity.correctShort") || "doğru"}`,
            timestamp: formatTime(exam.created_at),
            created_at: exam.created_at,
          })),
          ...(otherActivities || []).map((activity) => ({
            id: activity.id,
            type: (activity.activity_type === "calculator"
              ? "calculator"
              : "math") as Activity["type"],
            title: activity.title || t("home.activity.activity"),
            timestamp: formatTime(activity.created_at),
            tokenCost: 0,
            created_at: activity.created_at,
          })),
        ];

        // Tarihe göre sırala
        allActivities.sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

        // Pagination uygula
        const from = pageNumber * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        const paginatedData = allActivities.slice(from, to);

        if (refresh || pageNumber === 0) {
          setActivities(
            paginatedData.map(({ created_at, ...activity }) => activity),
          );
        } else {
          setActivities((prev) => [
            ...prev,
            ...paginatedData.map(({ created_at, ...activity }) => activity),
          ]);
        }

        setHasMore(allActivities.length > to);
        setPage(pageNumber);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, formatTime, t],
  );

  useEffect(() => {
    if (user) {
      fetchActivities(0, true);
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivities(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchActivities(page + 1, false);
    }
  };

  // Tüm aktiviteleri sil
  const handleClearAllActivities = () => {
    if (!user?.id) return;

    Alert.alert(
      t("activity.clear.title") === "activity.clear.title"
        ? "Tüm Aktivite Geçmişini Sil"
        : t("activity.clear.title"),
      t("activity.clear.message") === "activity.clear.message"
        ? "Tüm aktivite geçmişiniz silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?"
        : t("activity.clear.message"),
      [
        {
          text:
            t("common.cancel") === "common.cancel"
              ? "İptal"
              : t("common.cancel"),
          style: "cancel",
        },
        {
          text:
            t("activity.clear.confirm") === "activity.clear.confirm"
              ? "Sil"
              : t("activity.clear.confirm"),
          style: "destructive",
          onPress: async () => {
            const success = await clearAllActivities();
            if (success) {
              // Local state'i temizle
              setActivities([]);
              setHasMore(false);
              setPage(0);

              // Ana sayfadaki aktiviteleri de yenile
              await refreshActivities();

              Alert.alert(
                t("common.success") === "common.success"
                  ? "Başarılı"
                  : t("common.success"),
                t("activity.clear.success") === "activity.clear.success"
                  ? "Tüm aktivite geçmişi silindi"
                  : t("activity.clear.success"),
                [
                  {
                    text:
                      t("common.ok") === "common.ok" ? "Tamam" : t("common.ok"),
                    onPress: () => {
                      // Sayfayı yenile
                      fetchActivities(0, true);
                    },
                  },
                ],
              );
            } else {
              Alert.alert(
                t("common.error") === "common.error"
                  ? "Hata"
                  : t("common.error"),
                t("activity.clear.error") === "activity.clear.error"
                  ? "Aktivite geçmişi silinirken bir hata oluştu"
                  : t("activity.clear.error"),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={[styles.backButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {t("home.recentActivity") === "home.recentActivity"
              ? "Son İşlemler"
              : t("home.recentActivity")}
          </Text>
          {activities.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAllActivities}
              style={styles.clearButton}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={colors.error || "#EF4444"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && page === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activities.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          onScrollEndDrag={(e) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              e.nativeEvent;
            const paddingToBottom = 20;
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onPress={() => handleActivityPress(activity)}
            />
          ))}

          {hasMore && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            {t("home.noActivity")}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 52,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...TEXT_STYLES.titleMedium,
    fontWeight: "700",
    fontSize: 18,
    flex: 1,
    marginLeft: SPACING.md,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    ...TEXT_STYLES.bodyMedium,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  loadMoreContainer: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
});
