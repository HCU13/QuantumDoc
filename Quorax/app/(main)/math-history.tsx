import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MinimalHeader, SoftSurface } from "@/components/v2";

import { ModuleHeader } from "@/components/common/ModuleHeader";
import MathText from "@/components/math/MathText";
import { BORDER_RADIUS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/services/supabase";
import { formatTopicDisplay, getCategoryLabel } from "@/utils/topicLabel";

// Canonical topic categories (match edge function's TOPIC_CATEGORIES keys)
const TOPIC_FILTERS = [
  "all",
  "algebra",
  "geometry",
  "trigonometry",
  "calculus",
  "statistics",
  "linear_algebra",
  "number_theory",
  "basic_math",
  "other",
] as const;

type TopicFilter = (typeof TOPIC_FILTERS)[number];

interface HistoryRow {
  id: string;
  problem_text: string;
  problem_image_url: string | null;
  solution_text: string;
  topic: string | null;
  topic_category: string | null;
  comprehension_feedback: "understood" | "not_understood" | null;
  created_at: string;
}

const PAGE_SIZE = 30;

export default function MathHistoryScreen() {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  const [items, setItems] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<TopicFilter>("all");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(
    async (reset = false) => {
      if (!user?.id) return;
      const page = reset ? 0 : Math.floor(items.length / PAGE_SIZE);
      try {
        let query = supabase
          .from("math_solutions")
          .select(
            "id, problem_text, problem_image_url, solution_text, topic, topic_category, comprehension_feedback, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

        if (filter !== "all") {
          query = query.eq("topic_category", filter);
        }

        const { data, error } = await query;
        if (error) throw error;

        const rows = (data as HistoryRow[]) || [];
        setItems((prev) => (reset ? rows : [...prev, ...rows]));
        setHasMore(rows.length === PAGE_SIZE);
      } catch (e) {
        console.warn("[math-history] load failed:", e);
      }
    },
    [user?.id, filter, items.length]
  );

  // Refetch from scratch whenever filter changes.
  useEffect(() => {
    setLoading(true);
    setItems([]);
    setHasMore(true);
    load(true).finally(() => setLoading(false));
  }, [filter, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    await load(false);
    setLoadingMore(false);
  }, [load, loadingMore, hasMore, loading]);

  // Relative-time formatter using the active locale (no need for third-party lib).
  const formatTime = useCallback(
    (iso: string): string => {
      try {
        const then = new Date(iso).getTime();
        const now = Date.now();
        const diffMs = Math.max(0, now - then);
        const rtf = new Intl.RelativeTimeFormat(i18n.language || "en", { numeric: "auto" });
        const min = Math.floor(diffMs / 60000);
        if (min < 1) return rtf.format(-0, "minute");
        if (min < 60) return rtf.format(-min, "minute");
        const hours = Math.floor(min / 60);
        if (hours < 24) return rtf.format(-hours, "hour");
        const days = Math.floor(hours / 24);
        if (days < 30) return rtf.format(-days, "day");
        const months = Math.floor(days / 30);
        if (months < 12) return rtf.format(-months, "month");
        return rtf.format(-Math.floor(months / 12), "year");
      } catch {
        return new Date(iso).toLocaleDateString();
      }
    },
    [i18n.language]
  );

  // Extract the answer from the solution_text — it's the first non-empty line that isn't a numbered step
  // (same heuristic the math screen uses). Kept simple for the list preview.
  const extractAnswer = useCallback((solutionText: string): string => {
    const lines = solutionText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) return "";
    const stepLike = (l: string) => /^\d+[.)]\s+.+/.test(l);
    for (const line of lines) {
      if (!stepLike(line) && line.length <= 80) return line;
    }
    return lines[0].slice(0, 80);
  }, []);

  const openItem = useCallback(
    (row: HistoryRow) => {
      router.push({
        pathname: "/(main)/activity/[id]",
        params: { id: `math-${row.id}`, type: "math" },
      } as any);
    },
    [router]
  );

  const reuseItem = useCallback(
    (row: HistoryRow) => {
      if (!row.problem_text || row.problem_text === "[image]") {
        // Image-based problems can't be prefilled as text — open detail instead.
        openItem(row);
        return;
      }
      router.push({
        pathname: "/(main)/math",
        params: { prefillProblem: row.problem_text, autoSolve: "false" },
      } as any);
    },
    [openItem, router]
  );

  const filteredCount = items.length;

  const renderFilterPill = (key: TopicFilter) => {
    const active = filter === key;
    // For canonical category keys we have translations; "all" is its own key.
    const label = key === "all" ? t("mathHistory.filter.all") : t(`math.topics.categories.${key}`);
    return (
      <TouchableOpacity
        key={key}
        onPress={() => setFilter(key)}
        style={[
          styles.filterPill,
          {
            backgroundColor: active ? colors.moduleMathPrimary : colors.backgroundSecondary,
            borderColor: active ? colors.moduleMathPrimary : colors.borderSubtle,
          },
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterPillText,
            { color: active ? "#fff" : colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: HistoryRow }) => {
    const answer = extractAnswer(item.solution_text);
    const topicLabel =
      // Prefer the translated category label; fall back to the (possibly messy) subtopic string.
      item.topic_category
        ? getCategoryLabel(item.topic_category, t)
        : formatTopicDisplay(item.topic, t);

    return (
      <TouchableOpacity
        onPress={() => openItem(item)}
        onLongPress={() => reuseItem(item)}
        activeOpacity={0.75}
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.borderSubtle },
        ]}
      >
        <View style={styles.cardHeader}>
          {topicLabel ? (
            <View style={[styles.topicPill, { backgroundColor: colors.moduleMathLight }]}>
              <Ionicons name="bookmark-outline" size={11} color={colors.moduleMathPrimary} />
              <Text style={[styles.topicText, { color: colors.moduleMathPrimary }]}>
                {topicLabel}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <Text style={[styles.timeText, { color: colors.textTertiary }]}>
            {formatTime(item.created_at)}
          </Text>
        </View>

        {/* Image-based problem → show the actual thumbnail so the user recognizes it at a glance. */}
        {item.problem_image_url ? (
          <View style={styles.problemRow}>
            <Image
              source={{ uri: item.problem_image_url }}
              style={styles.problemImage}
              resizeMode="cover"
            />
            {item.problem_text && item.problem_text !== "[image]" ? (
              <Text
                style={[styles.problemText, styles.problemTextInline, { color: colors.textPrimary }]}
                numberOfLines={3}
              >
                {item.problem_text}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text
            style={[styles.problemText, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {item.problem_text || t("mathHistory.imageProblem")}
          </Text>
        )}

        {answer ? (
          <View style={[styles.answerRow, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.moduleMathPrimary} />
            <MathText
              text={answer}
              style={[styles.answerText, { color: colors.moduleMathPrimary }]}
              numberOfLines={1}
            />
          </View>
        ) : null}

        {item.comprehension_feedback ? (
          <View
            style={[
              styles.feedbackBadge,
              {
                backgroundColor:
                  item.comprehension_feedback === "understood" ? "#D1FAE5" : "#FEF3C7",
              },
            ]}
          >
            <Ionicons
              name={item.comprehension_feedback === "understood" ? "checkmark-circle" : "bulb-outline"}
              size={11}
              color={item.comprehension_feedback === "understood" ? "#059669" : "#D97706"}
            />
            <Text
              style={[
                styles.feedbackText,
                {
                  color:
                    item.comprehension_feedback === "understood" ? "#059669" : "#D97706",
                },
              ]}
            >
              {t(
                item.comprehension_feedback === "understood"
                  ? "math.comprehension.understood"
                  : "math.comprehension.notUnderstood"
              )}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SoftSurface tone="module" moduleColor={colors.moduleMathPrimary}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <MinimalHeader
        title={t("mathHistory.title")}
        accent={colors.moduleMathPrimary}
      />

      {/* Topic filter pills */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TOPIC_FILTERS as unknown as TopicFilter[]}
          keyExtractor={(k) => k}
          renderItem={({ item }) => renderFilterPill(item)}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="small" color={colors.moduleMathPrimary} />
        </View>
      ) : filteredCount === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="document-text-outline" size={36} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {t("mathHistory.emptyTitle")}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            {t("mathHistory.emptyText")}
          </Text>
          <TouchableOpacity
            style={[styles.emptyCta, { backgroundColor: colors.moduleMathPrimary }]}
            onPress={() => router.replace("/(main)/math")}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyCtaText}>{t("mathHistory.emptyCta")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.moduleMathPrimary}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: SPACING.md }}>
                <ActivityIndicator size="small" color={colors.moduleMathPrimary} />
              </View>
            ) : null
          }
        />
      )}
    </SoftSurface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filtersContainer: { paddingVertical: SPACING.sm },
  filtersContent: { paddingHorizontal: SPACING.lg, gap: SPACING.xs },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: SPACING.xs,
  },
  filterPillText: { fontSize: 12, fontWeight: "600" },

  listContent: { padding: SPACING.lg, paddingTop: SPACING.xs },

  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    gap: SPACING.xs + 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  topicPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  topicText: { fontSize: 11, fontWeight: "600" },
  timeText: { fontSize: 11 },

  problemText: { ...TEXT_STYLES.bodyMedium, fontSize: 14, lineHeight: 20 },
  problemTextInline: { flex: 1 },
  problemRow: { flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start" },
  problemImage: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "#00000008",
  },

  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  answerText: { fontSize: 13, fontWeight: "700", flex: 1 },

  feedbackBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  feedbackText: { fontSize: 10, fontWeight: "600" },

  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyTitle: { ...TEXT_STYLES.titleSmall, fontWeight: "700" },
  emptyText: { fontSize: 13, textAlign: "center" },
  emptyCta: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyCtaText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
