import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ModuleHeader } from "@/components/common/ModuleHeader";
import { BORDER_RADIUS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase, SUPABASE_URL } from "@/services/supabase";
import { showError } from "@/utils/toast";
import { useTranslation } from "react-i18next";

interface TopicEntry { name: string; count: number }
interface CategoryStat {
  category: string;
  count: number;
  lastSolvedAt: string;
  topTopics: TopicEntry[];
  understoodCount: number;
  notUnderstoodCount: number;
}

// Kategori ikonları
const CATEGORY_ICONS: Record<string, string> = {
  "Kalkülüs": "trending-up-outline",
  "Cebir": "calculator-outline",
  "Geometri": "shapes-outline",
  "Trigonometri": "radio-outline",
  "İstatistik & Olasılık": "stats-chart-outline",
  "Lineer Cebir": "grid-outline",
  "Sayı Teorisi": "infinite-outline",
  "Temel Matematik": "school-outline",
  "Diğer": "ellipsis-horizontal-outline",
};

// Renk paleti — her kategori farklı renk
const CATEGORY_COLORS = [
  "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B",
  "#EF4444", "#3B82F6", "#EC4899", "#84CC16",
];

export default function MathTopicsScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [totalSolved, setTotalSolved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Record<string, string[]>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/get-math-topic-stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCategories(data.categories ?? []);
      setTotalSolved(data.totalSolved ?? 0);
    } catch (e: any) {
      showError("Hata", e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  // Seçilen kategori için benzer sorular üret (Haiku — ucuz)
  const handleGenerateQuestions = async (category: string, topTopics: TopicEntry[]) => {
    if (generatingFor === category) return;
    if (generatedQuestions[category]) {
      // Zaten üretildiyse direkt göster
      setExpandedCategory(expandedCategory === category ? null : category);
      return;
    }

    try {
      setGeneratingFor(category);
      setExpandedCategory(category);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const topicHint = topTopics.map(t => t.name).join(", ") || category;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          problemText: `${category} konusunda (özellikle: ${topicHint}) pratik yapılabilecek sorular üret`,
          userId: user!.id,
          mode: "related",
        }),
      });
      const data = await res.json();
      if (data.relatedQuestions?.length) {
        setGeneratedQuestions(prev => ({ ...prev, [category]: data.relatedQuestions }));
      }
    } catch (e: any) {
      showError("Hata", e.message);
    } finally {
      setGeneratingFor(null);
    }
  };

  // Soruyu seçince matematik ekranına taşı — otomatik çöz
  // dismiss ile stack'i math-topics'e kadar temizle, sonra math'ı replace et
  // böylece math'tan back yapınca ana sayfaya gider
  const handleSelectQuestion = (question: string) => {
    router.dismiss();
    router.replace({ pathname: "/(main)/math", params: { prefillProblem: question, autoSolve: 'true' } });
  };

  const maxCount = categories[0]?.count || 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ModuleHeader
        title={t("math.topics.title")}
        modulePrimary={colors.moduleMathPrimary}
        moduleLight={colors.moduleMathLight}
        onBackPress={() => router.canDismiss() ? router.dismiss() : router.replace("/(main)")}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Özet */}
        <View style={[styles.summaryRow, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: colors.moduleMathPrimary }]}>{totalSolved}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t("math.topics.totalSolved")}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: colors.moduleMathPrimary }]}>{categories.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t("math.topics.topicCount")}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: "#059669" }]}>
              {categories.filter(c => c.understoodCount > c.notUnderstoodCount).length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t("math.topics.masteredCount")}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.moduleMathPrimary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t("loading")}</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            <Ionicons name="analytics-outline" size={40} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t("math.topics.emptyTitle")}</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("math.topics.emptyText")}
            </Text>
            <TouchableOpacity
              style={[styles.goMathBtn, { backgroundColor: colors.moduleMathPrimary }]}
              onPress={() => router.push("/(main)/math")}
            >
              <Text style={styles.goMathBtnText}>{t("math.topics.goToMath")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t("math.topics.sectionTitle")}
            </Text>

            {categories.map((cat, idx) => {
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              const icon = CATEGORY_ICONS[cat.category] ?? "book-outline";
              const barPct = Math.max(12, (cat.count / maxCount) * 100);
              const isExpanded = expandedCategory === cat.category;
              const isGenerating = generatingFor === cat.category;
              const questions = generatedQuestions[cat.category];
              // Kavrama durumu: feedback varsa ona bak, yoksa nötr
              // understoodCount > notUnderstoodCount → güçlü (eşitlik "weak" sayılır)
              const hasFeedback = cat.understoodCount + cat.notUnderstoodCount > 0;
              const masteryStatus: 'strong' | 'weak' | 'neutral' = !hasFeedback
                ? 'neutral'
                : cat.understoodCount > cat.notUnderstoodCount
                ? 'strong'
                : 'weak';

              return (
                <View
                  key={cat.category}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
                >
                  {/* Başlık satırı */}
                  <View style={styles.catHeader}>
                    <View style={[styles.catIconBox, { backgroundColor: color + "18" }]}>
                      <Ionicons name={icon as any} size={18} color={color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.catTitleRow}>
                        <Text style={[styles.catName, { color: colors.textPrimary }]}>{cat.category}</Text>
                        {masteryStatus === 'strong' && (
                          <View style={[styles.weakBadge, { backgroundColor: "#D1FAE5" }]}>
                            <Ionicons name="checkmark-circle-outline" size={10} color="#059669" />
                            <Text style={[styles.weakBadgeText, { color: "#059669" }]}>{t("math.topics.strongBadge")}</Text>
                          </View>
                        )}
                        {masteryStatus === 'weak' && (
                          <View style={[styles.weakBadge, { backgroundColor: "#FEE2E2" }]}>
                            <Ionicons name="alert-circle-outline" size={10} color="#DC2626" />
                            <Text style={[styles.weakBadgeText, { color: "#DC2626" }]}>{t("math.topics.weakBadge")}</Text>
                          </View>
                        )}
                      </View>
                      {/* Progress bar */}
                      <View style={[styles.barTrack, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={[styles.barFill, { width: `${barPct}%`, backgroundColor: color }]} />
                      </View>
                    </View>
                    <Text style={[styles.catCount, { color: color }]}>{cat.count}x</Text>
                  </View>

                  {/* Alt konular */}
                  {cat.topTopics.length > 0 && (
                    <View style={styles.subTopicsRow}>
                      {cat.topTopics.map((t) => (
                        <View key={t.name} style={[styles.subTopicChip, { backgroundColor: color + "12" }]}>
                          <Text style={[styles.subTopicText, { color }]} numberOfLines={1}>{t.name}</Text>
                          <Text style={[styles.subTopicCount, { color: color + "99" }]}>{t.count}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Soru üret butonu */}
                  <TouchableOpacity
                    style={[styles.generateBtn, { borderColor: color + "40", backgroundColor: color + "08" }]}
                    onPress={() => handleGenerateQuestions(cat.category, cat.topTopics)}
                    activeOpacity={0.7}
                  >
                    {isGenerating ? (
                      <ActivityIndicator size="small" color={color} />
                    ) : (
                      <Ionicons
                        name={isExpanded && questions ? "chevron-up-outline" : "flash-outline"}
                        size={14}
                        color={color}
                      />
                    )}
                    <Text style={[styles.generateBtnText, { color }]}>
                      {isGenerating ? t("math.topics.generating") : isExpanded && questions ? t("math.topics.hideQuestions") : t("math.topics.generateBtn")}
                    </Text>
                  </TouchableOpacity>

                  {/* Üretilen sorular */}
                  {isExpanded && questions && (
                    <View style={styles.questionsWrap}>
                      {questions.map((q, qi) => (
                        <TouchableOpacity
                          key={qi}
                          style={[styles.questionItem, { backgroundColor: colors.backgroundSecondary }]}
                          onPress={() => handleSelectQuestion(q)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.qNum, { backgroundColor: color + "18" }]}>
                            <Text style={[styles.qNumText, { color }]}>{qi + 1}</Text>
                          </View>
                          <Text style={[styles.questionText, { color: colors.textSecondary }]}>{q}</Text>
                          <Ionicons name="arrow-forward-outline" size={14} color={colors.textTertiary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: SPACING.xl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, gap: SPACING.md },

  summaryRow: {
    flexDirection: "row",
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  summaryDivider: { width: 1, marginVertical: 4 },
  summaryNum: { fontSize: 24, fontWeight: "700" },
  summaryLabel: { fontSize: 11, fontWeight: "500" },

  loadingBox: { alignItems: "center", gap: 12, paddingVertical: 48 },
  loadingText: { fontSize: 14 },

  emptyBox: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: "center",
    gap: SPACING.sm,
  },
  emptyTitle: { ...TEXT_STYLES.titleSmall, fontWeight: "700", marginTop: 8 },
  emptyText: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  goMathBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, borderRadius: BORDER_RADIUS.lg },
  goMathBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: -4 },

  card: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },

  catHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  catIconBox: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  catTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  catName: { fontSize: 15, fontWeight: "700" },
  weakBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  weakBadgeText: { fontSize: 10, fontWeight: "700", color: "#D97706" },
  barTrack: { height: 5, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 5, borderRadius: 3 },
  catCount: { fontSize: 16, fontWeight: "700", minWidth: 32, textAlign: "right" },

  subTopicsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  subTopicChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    maxWidth: 200,
  },
  subTopicText: { fontSize: 11, fontWeight: "600", flexShrink: 1 },
  subTopicCount: { fontSize: 10, fontWeight: "700" },

  generateBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 9, borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  generateBtnText: { fontSize: 13, fontWeight: "600" },

  questionsWrap: { gap: 6 },
  questionItem: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    padding: SPACING.sm, borderRadius: BORDER_RADIUS.md,
  },
  qNum: { width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  qNumText: { fontSize: 11, fontWeight: "700" },
  questionText: { fontSize: 13, lineHeight: 18, flex: 1 },
});
