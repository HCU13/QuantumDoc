/**
 * Exam Progress Screen
 * Tab 1: Hata Defteri — yanlış sorular flashcard modunda çalışılır
 * Tab 2: Konu Hakimiyeti — her konudaki başarı oranı görselleştirilir
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ModuleHeader } from "@/components/common/ModuleHeader";
import { BORDER_RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { EXAM_COUNTRIES } from "@/constants/examTypes";
import { useAuth } from "@/contexts/AuthContext";
import { useExamProgress } from "@/contexts/ExamProgressContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase, SUPABASE_URL } from "@/services/supabase";

// ── Exam type label/flag lookup ──────────────────────────────────────────────
const EXAM_META: Record<string, { label: string; flag: string }> = {};
EXAM_COUNTRIES.forEach((c) => c.exams.forEach((e) => { EXAM_META[e.id] = { label: e.label, flag: e.flag }; }));
function examLabel(id: string) { return EXAM_META[id]?.label ?? id; }
function examFlag(id: string)  { return EXAM_META[id]?.flag  ?? "📝"; }

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Types ───────────────────────────────────────────────────────────────────
interface WrongQuestion {
  id: string;
  exam_type_id: string;
  subject_id: string | null;
  subject_label: string | null;
  topic: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  user_answer: string | null;
  is_mastered: boolean;
  attempt_count: number;
  last_wrong_at: string;
}

interface TopicMastery {
  id: string;
  exam_type_id: string;
  subject_label: string | null;
  topic: string;
  total_attempts: number;
  correct_count: number;
  last_attempted: string;
  mastery_level: "learning" | "developing" | "proficient" | "mastered";
}


// ── Mastery seviyesi renkleri ────────────────────────────────────────────────
const MASTERY_COLORS: Record<string, string> = {
  learning:   "#f87171",
  developing: "#fbbf24",
  proficient: "#60a5fa",
  mastered:   "#34d399",
};

// ══════════════════════════════════════════════════════════════════════════════
// HATA DEFTERI — Flashcard modu
// ══════════════════════════════════════════════════════════════════════════════
function FlashcardPractice({
  questions,
  onClose,
  onMastered,
  colors,
  t,
  userLanguage,
  userId,
}: {
  questions: WrongQuestion[];
  onClose: () => void;
  onMastered: (id: string) => void;
  colors: any;
  t: any;
  userLanguage: string;
  userId?: string;
}) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIExp, setShowAIExp] = useState(false);

  const handleAIExplain = async (q: WrongQuestion) => {
    if (aiExplanation) { setShowAIExp((v) => !v); return; }
    setShowAIExp(true);
    setLoadingAI(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const correctOpt = q.options.find((o) => o.label === q.correct_answer);
      const userOpt    = q.options.find((o) => o.label === q.user_answer);
      const optionsText = q.options.map((o) => `${o.label}) ${o.text}`).join("\n");
      const problemText = [
        q.question_text, "", optionsText, "",
        `Senin cevabın: ${q.user_answer}. ${userOpt?.text}`,
        `Doğru cevap: ${q.correct_answer}. ${correctOpt?.text}`,
      ].join("\n");
      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ problemText, userId: userId || "anonymous", userLanguage, mode: "wrong_answer_explain" }),
      });
      const data = await res.json();
      setAiExplanation(data.explanation || data.solution || t("examLab.report.explainFailed"));
    } catch {
      setAiExplanation(t("examLab.report.explainFailed"));
    } finally {
      setLoadingAI(false);
    }
  };

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const remaining = questions.filter((q) => !completed.has(q.id));
  const current = remaining[index] ?? null;

  const flipCard = () => {
    if (!showAnswer) {
      Animated.spring(flipAnim, { toValue: 1, useNativeDriver: true }).start();
      setShowAnswer(true);
    } else {
      Animated.spring(flipAnim, { toValue: 0, useNativeDriver: true }).start();
      setShowAnswer(false);
    }
  };

  const nextCard = (mastered: boolean) => {
    if (!current) return;
    if (mastered) {
      onMastered(current.id);
      setCompleted((prev) => new Set([...prev, current.id]));
    }
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: SCREEN_WIDTH, duration: 0, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    flipAnim.setValue(0);
    setShowAnswer(false);
    setAiExplanation(null);
    setShowAIExp(false);
    setLoadingAI(false);
    if (index >= remaining.length - (mastered ? 2 : 1)) {
      setIndex(Math.max(0, remaining.length - (mastered ? 2 : 1) - 1));
    } else {
      setIndex((i) => (mastered ? Math.min(i, remaining.length - 2) : i + 1));
    }
  };

  const frontInterp = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backInterp  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  // Tümü tamamlandı
  if (remaining.length === 0 || !current) {
    return (
      <SafeAreaView style={[fcStyles.container, { backgroundColor: colors.background }]}>
        <View style={fcStyles.doneBox}>
          <Text style={fcStyles.doneEmoji}>🎉</Text>
          <Text style={[fcStyles.doneTitle, { color: colors.textPrimary }]}>{t("examLab.wrongQuestions.allDone")}</Text>
          <Text style={[fcStyles.doneDesc, { color: colors.textSecondary }]}>{t("examLab.wrongQuestions.allDoneDesc")}</Text>
          <TouchableOpacity style={[fcStyles.closeBtn, { backgroundColor: colors.moduleExamLabPrimary }]} onPress={onClose}>
            <Text style={fcStyles.closeBtnText}>{t("common.goBack")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[fcStyles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[fcStyles.header, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[fcStyles.headerTitle, { color: colors.textPrimary }]}>
          {t("examLab.wrongQuestions.reviewMode")}
        </Text>
        <Text style={[fcStyles.counter, { color: colors.textSecondary }]}>
          {t("examLab.wrongQuestions.cardOf", { current: index + 1, total: remaining.length })}
        </Text>
      </View>

      {/* İlerleme çubuğu */}
      <View style={[fcStyles.progressBar, { backgroundColor: colors.borderSubtle }]}>
        <View style={[fcStyles.progressFill, {
          backgroundColor: colors.moduleExamLabPrimary,
          width: `${((completed.size) / (questions.length)) * 100}%`,
        }]} />
      </View>

      {/* Konu etiketi */}
      <View style={fcStyles.topicRow}>
        <Text style={[fcStyles.topicLabel, { color: colors.textSecondary }]}>
          {current.subject_label ?? current.topic}
        </Text>
        {current.attempt_count > 1 && (
          <View style={[fcStyles.attemptBadge, { backgroundColor: colors.error + "20" }]}>
            <Text style={[fcStyles.attemptBadgeText, { color: colors.error }]}>
              {t("examLab.wrongQuestions.attemptCount", { count: current.attempt_count })}
            </Text>
          </View>
        )}
      </View>

      {/* Kart */}
      <TouchableOpacity activeOpacity={0.95} onPress={flipCard} style={fcStyles.cardWrapper}>
        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          {/* Ön yüz: Soru */}
          <Animated.View style={[fcStyles.card, { backgroundColor: colors.card, ...SHADOWS.small }, { transform: [{ rotateY: frontInterp }], backfaceVisibility: "hidden", position: "absolute", top: 0, left: 0, right: 0 }]}>
            <View style={[fcStyles.cardFaceTag, { backgroundColor: colors.moduleExamLabPrimary + "20" }]}>
              <Text style={[fcStyles.cardFaceTagText, { color: colors.moduleExamLabPrimary }]}>{t("examProgress.question")}</Text>
            </View>
            <Text style={[fcStyles.questionText, { color: colors.textPrimary }]}>{current.question_text}</Text>
            <View style={[fcStyles.tapHint, { borderTopColor: colors.borderSubtle }]}>
              <Ionicons name="sync-outline" size={16} color={colors.textTertiary} />
              <Text style={[fcStyles.tapHintText, { color: colors.textTertiary }]}>{t("examLab.wrongQuestions.showAnswer")}</Text>
            </View>
          </Animated.View>

          {/* Arka yüz: Cevap */}
          <Animated.View style={[fcStyles.card, { backgroundColor: colors.card, ...SHADOWS.small }, { transform: [{ rotateY: backInterp }], backfaceVisibility: "hidden" }]}>
            <View style={[fcStyles.cardFaceTag, { backgroundColor: "#34d39920" }]}>
              <Text style={[fcStyles.cardFaceTagText, { color: "#34d399" }]}>{t("examProgress.answer")}</Text>
            </View>

            {/* Seçenekler */}
            {current.options.map((opt) => {
              const isCorrect = opt.label === current.correct_answer;
              const wasWrong  = opt.label === current.user_answer && !isCorrect;
              return (
                <View key={opt.label} style={[fcStyles.option,
                  isCorrect ? { backgroundColor: "#34d39915", borderColor: "#34d39940" } :
                  wasWrong  ? { backgroundColor: "#f8717115", borderColor: "#f8717140" } :
                  { backgroundColor: colors.cardSecondary, borderColor: colors.borderSubtle },
                ]}>
                  <View style={[fcStyles.optionDot,
                    { backgroundColor: isCorrect ? "#34d399" : wasWrong ? "#f87171" : colors.borderSubtle }
                  ]}>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{opt.label}</Text>
                  </View>
                  <Text style={[fcStyles.optionText, { color: isCorrect ? "#34d399" : wasWrong ? "#f87171" : colors.textPrimary }]}>
                    {opt.text}
                  </Text>
                  {isCorrect && <Ionicons name="checkmark-circle" size={18} color="#34d399" />}
                  {wasWrong  && <Ionicons name="close-circle"     size={18} color="#f87171" />}
                </View>
              );
            })}

            {/* AI Açıkla chip butonu */}
            <TouchableOpacity
              style={[fcStyles.aiBtn, { backgroundColor: colors.moduleExamLabPrimary + "10", borderColor: colors.moduleExamLabPrimary + "40" }]}
              onPress={() => handleAIExplain(current)}
              activeOpacity={0.7}
            >
              {loadingAI
                ? <ActivityIndicator size="small" color={colors.moduleExamLabPrimary} />
                : <Ionicons name={showAIExp && aiExplanation ? "chevron-up-outline" : "bulb-outline"} size={14} color={colors.moduleExamLabPrimary} />
              }
              <Text style={[fcStyles.aiBtnText, { color: colors.moduleExamLabPrimary }]}>
                {loadingAI ? t("examLab.report.explaining") : showAIExp && aiExplanation ? t("examLab.report.hideExplanation") : t("examLab.report.explainWithAI")}
              </Text>
            </TouchableOpacity>

            {/* AI açıklama içeriği */}
            {showAIExp && aiExplanation && (
              <View style={[fcStyles.aiBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.moduleExamLabPrimary + "20" }]}>
                <Text style={[fcStyles.aiBoxText, { color: colors.textSecondary }]}>{aiExplanation}</Text>
              </View>
            )}

            <View style={[fcStyles.tapHint, { borderTopColor: colors.borderSubtle }]}>
              <Ionicons name="sync-outline" size={16} color={colors.textTertiary} />
              <Text style={[fcStyles.tapHintText, { color: colors.textTertiary }]}>{t("examLab.wrongQuestions.hideAnswer")}</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {/* Aksiyonlar */}
      {showAnswer && (
        <View style={fcStyles.actionRow}>
          <TouchableOpacity
            style={[fcStyles.actionBtn, { backgroundColor: "#f8717115", borderColor: "#f8717140" }]}
            onPress={() => nextCard(false)}
          >
            <Ionicons name="close-circle-outline" size={22} color="#f87171" />
            <Text style={[fcStyles.actionBtnText, { color: "#f87171" }]}>{t("examLab.wrongQuestions.notMastered")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[fcStyles.actionBtn, { backgroundColor: "#34d39915", borderColor: "#34d39940" }]}
            onPress={() => nextCard(true)}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#34d399" />
            <Text style={[fcStyles.actionBtnText, { color: "#34d399" }]}>{t("examLab.wrongQuestions.markMastered")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ANA EKRAN
// ══════════════════════════════════════════════════════════════════════════════
export default function ExamProgressScreen() {
  const { t, i18n }       = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const insets            = useSafeAreaInsets();
  const router            = useRouter();

  const { wrongQuestions, masteryData, loadingErrors, loadingMastery, load, markMastered, deleteWrongQuestion } = useExamProgress();

  const [practiceMode, setPracticeMode] = useState(false);

  // Sayfaya her girildiğinde taze veri çek
  useEffect(() => {
    if (user?.id) load(user.id);
  }, [user?.id]);

  // ── Mastered işaretleme ──────────────────────────────────────────────────
  const handleMastered = async (id: string) => {
    await markMastered(id);
  };

  // ── Silme ────────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    Alert.alert(
      t("examLab.wrongQuestions.deleteConfirm"),
      "",
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"), style: "destructive",
          onPress: () => deleteWrongQuestion(id),
        },
      ],
    );
  };

  const practiceQueue = wrongQuestions.filter((q) => !q.is_mastered);

  // ── Practice mode ────────────────────────────────────────────────────────
  if (practiceMode && practiceQueue.length > 0) {
    return (
      <FlashcardPractice
        questions={practiceQueue}
        onClose={() => { setPracticeMode(false); if (user?.id) load(user.id); }}
        onMastered={handleMastered}
        colors={colors}
        t={t}
        userLanguage={i18n.language || "tr"}
        userId={user?.id}
      />
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────────────
  const loading = loadingErrors || loadingMastery;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ModuleHeader
        title={t("examLab.wrongQuestions.title")}
        modulePrimary={colors.moduleExamLabPrimary}
        moduleLight={colors.moduleExamLabLight}
        onBackPress={() => router.canDismiss() ? router.dismiss() : router.replace("/(main)")}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + SPACING.xl }]}>

        {/* ── Özet satırı — math-topics summaryRow gibi ── */}
        <View style={[styles.summaryRow, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: colors.moduleExamLabPrimary }]}>
              {wrongQuestions.filter(q => !q.is_mastered).length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t("examLab.wrongQuestions.filterActive")}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: "#34d399" }]}>
              {wrongQuestions.filter(q => q.is_mastered).length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t("examLab.wrongQuestions.filterMastered")}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: colors.textPrimary }]}>
              {masteryData.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t("examLab.mastery.title")}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.moduleExamLabPrimary} />
          </View>
        ) : (
          <>
            {/* ── HATA DEFTERİ BÖLÜMÜ ── */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t("examLab.wrongQuestions.title")}
              {practiceQueue.length > 0 && (
                <Text style={{ color: colors.moduleExamLabPrimary }}> ({practiceQueue.length})</Text>
              )}
            </Text>

            {/* Tümünü çalış butonu */}
            {practiceQueue.length > 0 && (
              <TouchableOpacity
                style={[styles.practiceBtn, { backgroundColor: colors.moduleExamLabPrimary + "15", borderColor: colors.moduleExamLabPrimary + "40" }]}
                onPress={() => setPracticeMode(true)}
                activeOpacity={0.8}
              >
                <View style={[styles.practiceBtnIcon, { backgroundColor: colors.moduleExamLabPrimary }]}>
                  <Ionicons name="play" size={14} color="#fff" />
                </View>
                <Text style={[styles.practiceBtnText, { color: colors.moduleExamLabPrimary }]}>
                  {t("examLab.wrongQuestions.practiceAll")} · {practiceQueue.length} soru
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.moduleExamLabPrimary} />
              </TouchableOpacity>
            )}

            {wrongQuestions.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                <Ionicons name="book-outline" size={40} color={colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t("examLab.wrongQuestions.empty")}</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("examLab.wrongQuestions.emptyDesc")}</Text>
                <TouchableOpacity style={[styles.goBtn, { backgroundColor: colors.moduleExamLabPrimary }]} onPress={() => router.back()}>
                  <Text style={styles.goBtnText}>{t("examLab.wrongQuestions.goToExam")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Sınav tipine göre grupla */
              Object.entries(
                wrongQuestions.reduce<Record<string, WrongQuestion[]>>((acc, q) => {
                  const key = q.exam_type_id;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(q);
                  return acc;
                }, {})
              ).map(([examId, questions]) => (
                <QuestionGroup
                  key={examId}
                  examId={examId}
                  questions={questions}
                  colors={colors}
                  t={t}
                  onMastered={handleMastered}
                  onDelete={handleDelete}
                />
              ))
            )}

            {/* ── KONU HAKİMİYETİ BÖLÜMÜ ── */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: SPACING.md }]}>
              {t("examLab.mastery.title")}
            </Text>

            {masteryData.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                <Ionicons name="bar-chart-outline" size={40} color={colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{t("examLab.mastery.empty")}</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("examLab.mastery.emptyDesc")}</Text>
              </View>
            ) : (
              Object.entries(
                masteryData.reduce<Record<string, TopicMastery[]>>((acc, m) => {
                  const key = m.exam_type_id;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(m);
                  return acc;
                }, {})
              ).map(([examId, items]) => (
                <MasteryGroup key={examId} examId={examId} items={items} colors={colors} t={t} />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Sınav grubu — collapsible ───────────────────────────────────────────────
function QuestionGroup({
  examId, questions, colors, t, onMastered, onDelete,
}: {
  examId: string; questions: WrongQuestion[]; colors: any; t: any;
  onMastered: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const activeCount   = questions.filter((q) => !q.is_mastered).length;
  const masteredCount = questions.filter((q) => q.is_mastered).length;
  const flag  = examFlag(examId);
  const label = examLabel(examId);

  return (
    <View style={{ marginBottom: SPACING.sm }}>
      <TouchableOpacity
        style={[styles.groupHeader, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
        onPress={() => setCollapsed((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.groupFlag}>{flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.groupLabel, { color: colors.textPrimary }]}>{label}</Text>
          <Text style={[styles.groupSub, { color: colors.textSecondary }]}>
            {activeCount > 0 ? t("examProgress.toStudy", { count: activeCount }) : ""}
            {activeCount > 0 && masteredCount > 0 ? " · " : ""}
            {masteredCount > 0 ? t("examProgress.learned", { count: masteredCount }) : ""}
          </Text>
        </View>
        <View style={[styles.groupBadge, { backgroundColor: colors.moduleExamLabPrimary + "18" }]}>
          <Text style={[styles.groupBadgeText, { color: colors.moduleExamLabPrimary }]}>{questions.length}</Text>
        </View>
        <Ionicons
          name={collapsed ? "chevron-down" : "chevron-up"}
          size={16}
          color={colors.textTertiary}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {!collapsed && questions.map((item) => (
        <WrongQuestionRow
          key={item.id}
          item={item}
          colors={colors}
          t={t}
          onMastered={() => onMastered(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </View>
  );
}

// ── Hakimiyet grubu — collapsible ───────────────────────────────────────────
function MasteryGroup({
  examId, items, colors, t,
}: {
  examId: string; items: TopicMastery[]; colors: any; t: any;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const flag  = examFlag(examId);
  const label = examLabel(examId);
  const masteredCount = items.filter((i) => i.mastery_level === "mastered").length;
  const overallPct = items.length > 0
    ? Math.round(items.reduce((s, i) => s + (i.total_attempts > 0 ? (i.correct_count / i.total_attempts) * 100 : 0), 0) / items.length)
    : 0;

  return (
    <View style={{ marginBottom: SPACING.sm }}>
      <TouchableOpacity
        style={[styles.groupHeader, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
        onPress={() => setCollapsed((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.groupFlag}>{flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.groupLabel, { color: colors.textPrimary }]}>{label}</Text>
          <Text style={[styles.groupSub, { color: colors.textSecondary }]}>
            {t("examProgress.masteryStats", { mastered: masteredCount, total: items.length, pct: overallPct })}
          </Text>
        </View>
        <View style={[styles.groupBadge, { backgroundColor: colors.moduleExamLabPrimary + "18" }]}>
          <Text style={[styles.groupBadgeText, { color: colors.moduleExamLabPrimary }]}>{items.length}</Text>
        </View>
        <Ionicons
          name={collapsed ? "chevron-down" : "chevron-up"}
          size={16}
          color={colors.textTertiary}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {!collapsed && items.map((item) => (
        <MasteryRow key={item.id} item={item} colors={colors} t={t} />
      ))}
    </View>
  );
}

// ── Hata Defteri Satır Kartı ────────────────────────────────────────────────
function WrongQuestionRow({
  item, colors, t, onMastered, onDelete,
}: {
  item: WrongQuestion; colors: any; t: any;
  onMastered: () => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = item.is_mastered ? "#34d399" : "#f87171";

  return (
    <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle, ...SHADOWS.subtle }]}>
      {/* Başlık satırı — math-topics catHeader gibi */}
      <TouchableOpacity style={styles.errorCardHeader} onPress={() => setExpanded((v) => !v)} activeOpacity={0.8}>
        <View style={[styles.errorIconBox, { backgroundColor: accentColor + "18" }]}>
          <Ionicons
            name={item.is_mastered ? "checkmark-circle-outline" : "close-circle-outline"}
            size={18}
            color={accentColor}
          />
        </View>
        <View style={{ flex: 1 }}>
          {/* Konu + badge satırı */}
          <View style={styles.errorTitleRow}>
            <Text style={[styles.errorCardTopic, { color: colors.textSecondary }]}>
              {item.subject_label ?? item.exam_type_id}
            </Text>
            {item.attempt_count > 1 && (
              <View style={[styles.errorBadge, { backgroundColor: "#f8717120" }]}>
                <Ionicons name="alert-circle-outline" size={10} color="#f87171" />
                <Text style={[styles.errorBadgeText, { color: "#f87171" }]}>{item.attempt_count}x {t("examLab.wrongQuestions.attemptCount", { count: "" }).replace("{{count}}", "").trim()}</Text>
              </View>
            )}
            {item.is_mastered && (
              <View style={[styles.errorBadge, { backgroundColor: "#34d39920" }]}>
                <Ionicons name="checkmark-circle-outline" size={10} color="#34d399" />
                <Text style={[styles.errorBadgeText, { color: "#34d399" }]}>{t("examLab.wrongQuestions.masteredBadge")}</Text>
              </View>
            )}
          </View>
          {/* Soru metni */}
          <Text style={[styles.errorCardQuestion, { color: colors.textPrimary }]} numberOfLines={expanded ? undefined : 2}>
            {item.question_text}
          </Text>
          {/* Progress bar — attempt oranı */}
          <View style={[styles.errorBarTrack, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[styles.errorBarFill, { backgroundColor: accentColor, width: item.is_mastered ? "100%" : `${Math.min(100, item.attempt_count * 25)}%` }]} />
          </View>
        </View>
        <Text style={[styles.errorCount, { color: accentColor }]}>{item.attempt_count}x</Text>
      </TouchableOpacity>

      {/* Genişletilmiş içerik */}
      {expanded && (
        <View style={[styles.errorCardBody, { borderTopColor: colors.borderSubtle }]}>
          {item.options.map((opt) => {
            const isCorrect = opt.label === item.correct_answer;
            const wasWrong  = opt.label === item.user_answer && !isCorrect;
            return (
              <View key={opt.label} style={[styles.optionSmall,
                isCorrect ? { backgroundColor: "#34d39912", borderColor: "#34d39935" } :
                wasWrong  ? { backgroundColor: "#f8717112", borderColor: "#f8717135" } :
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderSubtle },
              ]}>
                <Text style={[styles.optionSmallLabel, {
                  color: isCorrect ? "#34d399" : wasWrong ? "#f87171" : colors.textTertiary,
                }]}>{opt.label}</Text>
                <Text style={[styles.optionSmallText, {
                  color: isCorrect ? "#34d399" : wasWrong ? "#f87171" : colors.textPrimary,
                }]}>{opt.text}</Text>
              </View>
            );
          })}

          {/* Aksiyon butonları */}
          <View style={styles.errorActions}>
            <TouchableOpacity
              style={[styles.errorActionBtn, { borderColor: colors.borderSubtle, backgroundColor: colors.backgroundSecondary }]}
              onPress={onDelete}
            >
              <Ionicons name="trash-outline" size={14} color={colors.textTertiary} />
              <Text style={[styles.errorActionText, { color: colors.textTertiary }]}>{t("common.delete")}</Text>
            </TouchableOpacity>
            {!item.is_mastered && (
              <TouchableOpacity
                style={[styles.errorActionBtn, { backgroundColor: "#34d39915", borderColor: "#34d39940" }]}
                onPress={onMastered}
              >
                <Ionicons name="checkmark-circle-outline" size={14} color="#34d399" />
                <Text style={[styles.errorActionText, { color: "#34d399" }]}>{t("examLab.wrongQuestions.markMastered")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Hakimiyet Satır Kartı ───────────────────────────────────────────────────
function MasteryRow({ item, colors, t }: { item: TopicMastery; colors: any; t: any }) {
  const pct   = item.total_attempts > 0 ? Math.round((item.correct_count / item.total_attempts) * 100) : 0;
  const color = MASTERY_COLORS[item.mastery_level] ?? "#94a3b8";
  const dateStr = new Date(item.last_attempted).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

  return (
    <View style={[styles.masteryCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle, ...SHADOWS.subtle }]}>
      {/* Başlık satırı — math-topics catHeader gibi */}
      <View style={styles.masteryCardTop}>
        <View style={[styles.masteryIconBox, { backgroundColor: color + "18" }]}>
          <Ionicons name="bar-chart-outline" size={18} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.masteryTitleRow}>
            <Text style={[styles.masteryTopic, { color: colors.textPrimary }]}>{item.topic}</Text>
            <View style={[styles.masteryLevelBadge, { backgroundColor: color + "20", borderColor: color + "40" }]}>
              <Text style={[styles.masteryLevelText, { color }]}>{t(`examLab.mastery.level.${item.mastery_level}`)}</Text>
            </View>
          </View>
          <Text style={[styles.masterySubject, { color: colors.textSecondary }]}>
            {[item.subject_label, examLabel(item.exam_type_id)].filter(Boolean).join(" · ")}
          </Text>
          {/* Progress bar */}
          <View style={[styles.masteryBar, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[styles.masteryBarFill, { width: `${pct}%`, backgroundColor: color }]} />
          </View>
        </View>
        <Text style={[styles.masteryPct, { color }]}>{pct}%</Text>
      </View>

      <View style={styles.masteryCardBottom}>
        <Text style={[styles.masteryStats, { color: colors.textSecondary }]}>
          {t("examLab.mastery.stats", { correct: item.correct_count, total: item.total_attempts })}
        </Text>
        <Text style={[styles.masteryDate, { color: colors.textTertiary }]}>{dateStr}</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 13 },
  tabBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  // Practice
  practiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    margin: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  practiceBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Filters
  filterRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: "600" },

  // Empty state
  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 17, fontWeight: "700", textAlign: "center", marginBottom: SPACING.sm },
  emptyDesc:  { fontSize: 14, textAlign: "center", lineHeight: 20, opacity: 0.7 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
  emptyCta: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyCtaText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Error cards
  errorCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  errorCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  errorCardLeft: { flex: 1, flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start" },
  wrongDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, flexShrink: 0 },
  errorIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  errorTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  errorBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  errorBadgeText: { fontSize: 10, fontWeight: "700" },
  errorBarTrack: { height: 5, borderRadius: 3, overflow: "hidden", marginTop: 6 },
  errorBarFill: { height: 5, borderRadius: 3 },
  errorCount: { fontSize: 16, fontWeight: "700", minWidth: 32, textAlign: "right" },
  errorCardTopic: { fontSize: 11, fontWeight: "600" },
  errorCardQuestion: { fontSize: 14, lineHeight: 20, fontWeight: "500", marginBottom: 2 },
  errorCardBody: { borderTopWidth: 1, padding: SPACING.md, gap: SPACING.sm },
  optionSmall: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "flex-start",
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  optionSmallLabel: { fontWeight: "700", fontSize: 13, width: 16 },
  optionSmallText: { flex: 1, fontSize: 13, lineHeight: 18 },
  errorActions: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.xs },
  errorActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  errorActionText: { fontSize: 12, fontWeight: "600" },

  // Group header styles
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: 2,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.subtle,
  },
  groupFlag: { fontSize: 20 },
  groupLabel: { fontSize: 15, fontWeight: "700" },
  groupSub: { fontSize: 12, marginTop: 1 },
  groupBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  groupBadgeText: { fontSize: 12, fontWeight: "700" },

  // New scroll/section styles
  scroll: { paddingTop: SPACING.md },
  summaryRow: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    ...SHADOWS.subtle,
  },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: SPACING.xl * 2 },
  sectionTitle: { fontSize: 13, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  practiceBtnIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 14, textAlign: "center", marginBottom: SPACING.md },
  goBtn: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg },
  goBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Mastery summary — math-topics ile aynı 3'lü stat dili
  summaryBox: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    ...SHADOWS.subtle,
  },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  summaryNum: { fontSize: 24, fontWeight: "700" },
  summaryLabel: { fontSize: 11, fontWeight: "500" },
  summaryDivider: { width: 1, marginVertical: 4 },
  masteryCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  masteryCardTop: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  masteryIconBox: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  masteryTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  masterySubject: { fontSize: 11, fontWeight: "500", marginBottom: 4 },
  masteryTopic: { fontSize: 15, fontWeight: "700", flex: 1 },
  masteryPct: { fontSize: 16, fontWeight: "700", minWidth: 42, textAlign: "right" },
  masteryLevelBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xs ?? 4,
    borderWidth: 1,
  },
  masteryLevelText: { fontSize: 11, fontWeight: "700" },
  masteryBar: { height: 5, borderRadius: 3, overflow: "hidden", marginTop: 6 },
  masteryBarFill: { height: 5, borderRadius: 3 },
  masteryCardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  masteryStats: { fontSize: 12 },
  masteryDate: { fontSize: 11 },
});

// Flashcard styles
const fcStyles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  counter: { fontSize: 13 },
  progressBar: { height: 4 },
  progressFill: { height: 4 },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  topicLabel: { fontSize: 13, fontWeight: "600", flex: 1 },
  attemptBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 8 },
  attemptBadgeText: { fontSize: 11, fontWeight: "700" },
  cardWrapper: {
    flex: 1,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 300,
    gap: SPACING.md,
  },
  cardFaceTag: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  cardFaceTagText: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  questionText: { fontSize: 16, lineHeight: 24, fontWeight: "500", flex: 1 },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    marginTop: "auto",
  },
  tapHintText: { fontSize: 12 },
  option: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  optionDot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  optionText: { flex: 1, fontSize: 14, lineHeight: 20 },
  actionRow: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  actionBtnText: { fontWeight: "700", fontSize: 14 },
  doneBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl },
  doneEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  doneTitle: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: SPACING.sm },
  doneDesc: { fontSize: 15, textAlign: "center", marginBottom: SPACING.xl },
  closeBtn: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md },
  closeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  aiBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 7, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.md, borderWidth: 1, alignSelf: "flex-start", marginTop: 4 },
  aiBtnText: { fontSize: 12, fontWeight: "600" },
  aiBox: { padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, marginTop: 6 },
  aiBoxText: { fontSize: 13, lineHeight: 19 },
});
