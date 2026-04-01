import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useActivity } from "@/contexts/ActivityContext";
import { supabase, TABLES } from "@/services/supabase";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import {
  SPACING,
  BORDER_RADIUS,
  TEXT_STYLES,
  SHADOWS,
} from "@/constants/theme";

export default function ActivityDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const { user } = useAuth();
  const { deleteActivity, refreshActivities } = useActivity();

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<any>(null);

  useEffect(() => {
    if (id && user) {
      loadActivityDetail();
    }
  }, [id, user]);

  const loadActivityDetail = async () => {
    if (!id || !user?.id) return;

    setLoading(true);
    try {
      if (type === "math" && id.startsWith("math-")) {
        const mathId = id.replace("math-", "");
        const { data } = await supabase
          .from("math_solutions")
          .select("*")
          .eq("id", mathId)
          .eq("user_id", user.id)
          .single();

        if (data) {
          setActivity({
            type: "math",
            title: data.problem_text || t("home.activity.mathProblem"),
            problem: data.problem_text,
            solution: data.solution_text,
            problemImage: data.problem_image_url,
            tokensUsed: data.tokens_used || 0,
            createdAt: data.created_at,
            metadata: {
              problemType: data.problem_type,
              difficulty: data.difficulty_level,
              hasImage: !!data.problem_image_url,
            },
          });
        }
      } else if (type === "exam" && id.startsWith("exam-")) {
        const examId = id.replace("exam-", "");
        const { data } = await supabase
          .from(TABLES.EXAM_RESULTS)
          .select("*")
          .eq("id", examId)
          .eq("user_id", user.id)
          .single();

        if (data) {
          setActivity({
            type: "exam",
            title: data.topic || t("home.activity.exam"),
            description: null,
            metadata: {},
            createdAt: data.created_at,
            examTopic: data.topic,
            examTotal: data.total_questions,
            examCorrect: data.correct_count,
            examReport: data.report || [],
          });
        }
      } else {
        const { data } = await supabase
          .from(TABLES.USER_ACTIVITIES)
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (data) {
          setActivity({
            type: data.activity_type || type,
            title: data.title || t("home.activity.activity"),
            description: data.description || "",
            metadata: data.metadata || {},
            createdAt: data.created_at,
            tokenCost: data.metadata?.tokenCost || 0,
          });
        }
      }
    } catch (error) {
      console.error("Error loading activity detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Aktiviteyi sil
  const handleDeleteActivity = () => {
    if (!id || !type) return;

    Alert.alert(
      t("home.activity.delete.title"),
      t("home.activity.delete.message"),
      [
        {
          text: t("common.cancel") === "common.cancel" ? "İptal" : t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("home.activity.delete.confirm"),
          style: "destructive",
          onPress: async () => {
            const success = await deleteActivity(id, type);
            if (success) {
              // Ana sayfadaki aktiviteleri yenile
              await refreshActivities();
              // Geri git
              router.back();
              Alert.alert(
                t("common.success") === "common.success" ? "Başarılı" : t("common.success"),
                t("home.activity.delete.success")
              );
            } else {
              Alert.alert(
                t("common.error") === "common.error" ? "Hata" : t("common.error"),
                t("home.activity.delete.error")
              );
            }
          },
        },
      ]
    );
  };

  const getActivityColor = (): { primary: string; light: string } => {
    const activityColors: Record<string, { primary: string; light: string }> = {
      chat: { primary: "#8B5CF6", light: "#F3E8FF" },
      math: { primary: "#10B981", light: "#ECFDF5" },
      calculator: { primary: "#3B82F6", light: "#EFF6FF" },
      exam: { primary: "#F59E0B", light: "#FFF4E6" },
      "exam-lab": { primary: "#F59E0B", light: "#FFF4E6" },
    };
    return activityColors[activity?.type || "chat"] || { primary: colors.primary, light: colors.primarySoft };
  };

  const activityColor = activity ? getActivityColor() : { primary: colors.primary, light: colors.primarySoft };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModuleHeader title={t("home.recentActivity")} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModuleHeader title={t("home.recentActivity")} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            {t("home.activity.detail.notFound")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModuleHeader
        title={t("home.activity.detail.title")}
        rightAction={
          <TouchableOpacity
            onPress={handleDeleteActivity}
            style={[styles.deleteButton, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error || "#EF4444"} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderSubtle,
            },
            SHADOWS.small,
          ]}
        >
          {/* Icon - Left */}
          <View style={[styles.iconContainer, { backgroundColor: activityColor.light }]}>
            <Ionicons
              name={
                activity.type === "math"
                  ? "calculator-outline"
                  : activity.type === "chat"
                  ? "chatbubble-outline"
                  : activity.type === "exam" || activity.type === "exam-lab"
                  ? "document-text-outline"
                  : "grid-outline"
              }
              size={24}
              color={activityColor.primary}
            />
          </View>

          {/* Content - Right */}
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{activity.title}</Text>

            <View style={styles.metaRow}>
              <View style={[styles.metaBadge, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {formatTime(activity.createdAt)}
                </Text>
              </View>

              {activity.type === "exam" && activity.examTotal != null && (
                <View style={[styles.metaBadge, { backgroundColor: activityColor.light }]}>
                  <Text style={[styles.metaText, { color: activityColor.primary }]}>
                    {activity.examCorrect}/{activity.examTotal} {t("home.activity.detail.correctShort")}
                  </Text>
                </View>
              )}
              {(activity.tokensUsed > 0 || activity.tokenCost > 0) && (
                <View style={[styles.metaBadge, { backgroundColor: activityColor.light }]}>
                  <Ionicons name="diamond-outline" size={14} color={activityColor.primary} />
                  <Text style={[styles.metaText, { color: activityColor.primary }]}>
                    {activity.tokensUsed || activity.tokenCost} {t("home.tokens")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        {activity.type === "exam" && activity.examTotal != null ? (
          <>
            <View
              style={[
                styles.contentCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.borderSubtle,
                },
                SHADOWS.small,
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t("home.activity.detail.examScore")}
              </Text>
              <View style={styles.examScoreRow}>
                <Text style={[styles.contentText, { color: colors.textSecondary }]}>
                  {activity.examCorrect} / {activity.examTotal} {t("home.activity.detail.correctShort")}
                  {activity.examTotal > 0
                    ? ` (${Math.round((Number(activity.examCorrect) / activity.examTotal) * 100)}%)`
                    : ""}
                </Text>
              </View>
            </View>
            {Array.isArray(activity.examReport) && activity.examReport.length > 0 && (
              <View
                style={[
                  styles.contentCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.borderSubtle,
                  },
                  SHADOWS.small,
                ]}
              >
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {t("home.activity.detail.report")}
                </Text>
                {(activity.examReport as {
                  questionText: string;
                  userAnswer: string;
                  correctAnswer: string;
                  correct: boolean;
                  options?: { label: string; text: string }[];
                }[]).map((row, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.reportRow,
                      {
                        borderLeftColor: row.correct ? colors.success : colors.error,
                        backgroundColor: row.correct ? colors.success + "08" : colors.error + "08",
                      },
                    ]}
                  >
                    <Ionicons
                      name={row.correct ? "checkmark-circle" : "close-circle"}
                      size={18}
                      color={row.correct ? colors.success : colors.error}
                      style={styles.reportIcon}
                    />
                    <View style={styles.reportTextWrap}>
                      <Text style={[styles.reportQuestion, { color: colors.textPrimary }]} numberOfLines={3}>
                        {row.questionText || `Soru ${idx + 1}`}
                      </Text>
                      {Array.isArray(row.options) && row.options.length > 0 && (
                        <View style={styles.reportOptionsWrap}>
                          {row.options.map((opt) => (
                            <Text
                              key={opt.label}
                              style={[styles.reportOptionLine, { color: colors.textSecondary }]}
                              numberOfLines={1}
                            >
                              {opt.label}: {opt.text}
                            </Text>
                          ))}
                        </View>
                      )}
                      <Text style={[styles.reportAnswer, { color: colors.textSecondary }]}>
                        {row.correct
                          ? t("home.activity.detail.correctAnswer")
                          : `${t("home.activity.detail.yourAnswer")}: ${row.userAnswer || "—"} · ${t("home.activity.detail.correctAnswer")}: ${row.correctAnswer}`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : activity.type === "math" ? (
          <>
            {/* Problem Image - Math module style */}
            {activity.problemImage && 
             activity.problemImage !== "base64-image" && 
             (activity.problemImage.startsWith("data:image") || 
              activity.problemImage.startsWith("http://") || 
              activity.problemImage.startsWith("https://")) && (
              <View
                style={[
                  styles.contentCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.borderSubtle,
                  },
                  SHADOWS.small,
                ]}
              >
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {t("home.activity.detail.problem")}
                </Text>
                <View style={styles.imageArea}>
                  <Image
                    source={{ uri: activity.problemImage }}
                    style={styles.problemImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            )}

            {activity.solution && (
              <View
                style={[
                  styles.contentCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.borderSubtle,
                  },
                  SHADOWS.small,
                ]}
              >
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {t("home.activity.detail.solution")}
                </Text>
                <Text style={[styles.contentText, { color: colors.textSecondary }]}>
                  {activity.solution}
                </Text>
              </View>
            )}
          </>
        ) : (
          activity.description && (
            <View
              style={[
                styles.contentCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.borderSubtle,
                },
                SHADOWS.small,
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t("home.activity.detail.description")}
              </Text>
              <Text style={[styles.contentText, { color: colors.textSecondary }]}>
                {activity.description}
              </Text>
            </View>
          )
        )}

        <View style={{ height: SPACING.xl }} />
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
  headerCard: {
    flexDirection: "row",
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  headerContent: {
    flex: 1,
    gap: SPACING.sm,
  },
  title: {
    ...TEXT_STYLES.titleMedium,
    fontWeight: "700",
    marginBottom: 0,
    textAlign: "left",
  },
  metaRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs / 2,
  },
  metaText: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
  },
  contentCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.titleSmall,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  contentText: {
    ...TEXT_STYLES.bodyMedium,
    lineHeight: 24,
  },
  examScoreRow: {
    marginTop: SPACING.xs,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
  },
  reportIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  reportTextWrap: {
    flex: 1,
  },
  reportQuestion: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "600",
    marginBottom: 4,
  },
  reportOptionsWrap: {
    marginBottom: 6,
  },
  reportOptionLine: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
    marginTop: 2,
  },
  reportAnswer: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
  },
  imageArea: {
    position: "relative",
    width: "100%",
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  problemImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: BORDER_RADIUS.md,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
  },
  keyPointItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  keyPointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    flexShrink: 0,
  },
  qaItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  qaQuestion: {
    ...TEXT_STYLES.bodyMedium,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  qaAnswer: {
    ...TEXT_STYLES.bodySmall,
    lineHeight: 20,
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  keywordChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  keywordText: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "600",
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  metadataLabel: {
    ...TEXT_STYLES.bodySmall,
    flex: 1,
  },
  metadataValue: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "600",
  },
});

