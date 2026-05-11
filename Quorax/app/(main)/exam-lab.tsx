import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    Animated,
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { MinimalUsageBadge } from "@/components/common/MinimalUsageBadge";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import { NotebookBackground } from "@/components/common/NotebookBackground";
import { AILoadingModal } from "@/components/common/AILoadingModal";
import { PremiumModal } from "@/components/common/PremiumModal";
import { BORDER_RADIUS, SHADOWS, SPACING, TEXT_STYLES } from "@/constants/theme";
import {
  EXAM_COUNTRIES,
  EXAM_TYPE_STORAGE_KEY,
  SAVED_EXAM_STORAGE_KEY,
  ExamSubject,
  ExamType,
  getExamTypeById,
} from "@/constants/examTypes";
import { useAd } from "@/contexts/AdContext";
import { useAuth } from "@/contexts/AuthContext";
import { useExamProgress } from "@/contexts/ExamProgressContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useImagePicker } from "@/hooks/useImagePicker";
import { supabase, SUPABASE_URL, TABLES } from "@/services/supabase";
import { showError, showWarning } from "@/utils/toast";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;
const REAL_EXAM_MODE_ENABLED = false; // TODO: Gerçek sınav modu hazır olunca true yap

type Screen = "selection" | "exam";

interface Question {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

// ── Sınav Soru Kartı — flip animasyonlu ─────────────────────────────────────
function QuestionCard({
  item, isSelected, showFeedbackForThis,
  colors, t, onAnswerSelect,
}: {
  item: Question;
  isSelected: string | undefined;
  showFeedbackForThis: boolean;
  colors: any;
  t: any;
  onAnswerSelect: (questionId: number, answer: string) => void;
}) {
  const isCorrect = isSelected === item.correctAnswer;
  const flipAnim  = useRef(new Animated.Value(0)).current;
  const flipped   = useRef(false);

  // Kart (item.id) değişince animasyonu sıfırla
  useEffect(() => {
    flipped.current = false;
    flipAnim.setValue(0);
  }, [item.id]);

  // showFeedback true olunca flip yap
  useEffect(() => {
    if (showFeedbackForThis && !flipped.current) {
      flipped.current = true;
      Animated.spring(flipAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
    }
    if (!showFeedbackForThis) {
      flipped.current = false;
      flipAnim.setValue(0);
    }
  }, [showFeedbackForThis]);

  const frontRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate   = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  // Android'de backfaceVisibility çalışmadığı için opacity ile gizle
  const frontOpacity = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [1, 0] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [0, 1] });

  return (
    <View style={[styles.questionCardScroll, styles.questionCardContent]}>
      {/* ÖN YÜZ — Soru + şıklar */}
      <Animated.View style={[
        styles.questionCard,
        { backgroundColor: colors.card, borderColor: colors.borderSubtle },
        { transform: [{ rotateY: frontRotate }], opacity: frontOpacity },
        showFeedbackForThis && { position: "absolute", top: 0, left: 16, right: 16, zIndex: 0 },
      ]}>
        <View style={styles.questionTextContainer}>
          <Text style={[styles.questionText, { color: colors.textPrimary }]}>{item.question}</Text>
        </View>
        <View style={styles.optionsContainer}>
          {item.options.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[styles.optionBase, styles.option, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle, borderWidth: 1.5 }]}
              onPress={() => onAnswerSelect(item.id, option.label)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  <View style={[styles.optionLabelBadge, { backgroundColor: colors.moduleExamLabPrimary + "20" }]}>
                    <Text style={[styles.optionLabelText, { color: colors.moduleExamLabPrimary }]}>{option.label}</Text>
                  </View>
                  <Text style={[styles.optionText, { color: colors.textPrimary }]} numberOfLines={3}>
                    {option.text?.trim() || "—"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* ARKA YÜZ — Feedback + cevaplar */}
      <Animated.View style={[
        styles.questionCard,
        { backgroundColor: colors.card, borderColor: isCorrect ? colors.success + "60" : colors.error + "60", borderWidth: 2 },
        { transform: [{ rotateY: backRotate }], opacity: backOpacity },
      ]}>
        {/* Soru metni — arka yüzde de göster */}
        <Text style={[styles.questionText, { color: colors.textSecondary, fontSize: 13, marginBottom: 10 }]} numberOfLines={3}>
          {item.question}
        </Text>

        {/* Sonuç başlık */}
        <View style={[
          styles.feedbackHeader,
          { backgroundColor: isCorrect ? colors.success + "12" : colors.error + "12", borderRadius: 10, padding: 12, marginBottom: 12 },
        ]}>
          <View style={[styles.feedbackIconContainer, { backgroundColor: isCorrect ? colors.success + "20" : colors.error + "20" }]}>
            <Ionicons name={isCorrect ? "checkmark-circle" : "close-circle"} size={28} color={isCorrect ? colors.success : colors.error} />
          </View>
          <View style={styles.feedbackTextContainer}>
            <Text style={[styles.feedbackText, { color: isCorrect ? colors.success : colors.error }]}>
              {isCorrect ? t("examLab.correct") : t("examLab.incorrect")}
            </Text>
            {isCorrect && <Text style={[styles.feedbackSubtext, { color: colors.textSecondary }]}>{t("examLab.correctSubtext")}</Text>}
          </View>
        </View>

        {/* Şıklar — renkli */}
        <View style={styles.optionsContainer}>
          {item.options.map((option) => {
            const isCorrectOption  = option.label === item.correctAnswer;
            const isSelectedOption = isSelected === option.label;
            const isWrongSelected  = isSelectedOption && !isCorrect;
            return (
              <View key={option.label} style={[styles.optionBase, {
                backgroundColor: isCorrectOption ? colors.success + "15" : isWrongSelected ? colors.error + "15" : colors.surfaceMuted,
                borderColor:     isCorrectOption ? colors.success        : isWrongSelected ? colors.error        : colors.borderSubtle,
                borderWidth: isCorrectOption || isWrongSelected ? 2 : 1.5,
              }]}>
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <View style={[styles.optionLabelBadge, {
                      backgroundColor: isCorrectOption ? colors.success : isWrongSelected ? colors.error : colors.moduleExamLabPrimary + "20",
                    }]}>
                      <Text style={[styles.optionLabelText, { color: isCorrectOption || isWrongSelected ? "#fff" : colors.moduleExamLabPrimary }]}>{option.label}</Text>
                    </View>
                    <Text style={[styles.optionText, { color: isCorrectOption ? colors.success : isWrongSelected ? colors.error : colors.textPrimary }]} numberOfLines={3}>
                      {option.text?.trim() || "—"}
                    </Text>
                  </View>
                  {isCorrectOption && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
                  {isWrongSelected  && <Ionicons name="close-circle"    size={20} color={colors.error}   />}
                </View>
              </View>
            );
          })}
        </View>

      </Animated.View>
    </View>
  );
}

// ── Yanlış Soru Accordion Kartı ──────────────────────────────────────────────
function WrongQuestionCard({
  question, userAnswer, colors, t, userLanguage, userId, isPremium, onProGate,
}: {
  question: Question;
  userAnswer: string;
  colors: any;
  t: any;
  userLanguage: string;
  userId?: string;
  isPremium: boolean;
  onProGate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExp, setLoadingExp] = useState(false);

  const correctOption = question.options.find((o) => o.label === question.correctAnswer);
  const userOption = question.options.find((o) => o.label === userAnswer);

  const handleExplain = async () => {
    if (!isPremium) { onProGate(); return; }
    if (explanation) { setExpanded((v) => !v); return; }
    setExpanded(true);
    setLoadingExp(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const optionsText = question.options.map((o) => `${o.label}) ${o.text}`).join("\n");
      const problemText = [
        question.question,
        "",
        optionsText,
        "",
        `${t("examLab.report.yourAnswer")}: ${userAnswer}. ${userOption?.text}`,
        `${t("examLab.report.correctAnswer")}: ${question.correctAnswer}. ${correctOption?.text}`,
      ].join("\n");

      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          problemText,
          userId: userId || "anonymous",
          userLanguage,
          mode: "wrong_answer_explain",
        }),
      });
      const data = await res.json();
      setExplanation(data.explanation || data.solution || t("examLab.report.explainFailed"));
    } catch {
      setExplanation(t("examLab.report.explainFailed"));
    } finally {
      setLoadingExp(false);
    }
  };

  return (
    <View style={[wcStyles.card, { borderColor: colors.borderSubtle, backgroundColor: colors.card }]}>
      {/* Üst satır — ikon + soru */}
      <View style={wcStyles.row}>
        <View style={[wcStyles.iconBox, { backgroundColor: colors.error + "15" }]}>
          <Ionicons name="close-circle-outline" size={18} color={colors.error} />
        </View>
        <Text style={[wcStyles.questionText, { color: colors.textPrimary }]}>
          {question.question}
        </Text>
      </View>
      {/* Cevap karşılaştırması */}
      <View style={[wcStyles.answersRow, { borderTopColor: colors.borderSubtle }]}>
        <View style={[wcStyles.answerChip, { backgroundColor: colors.error + "10", borderColor: colors.error + "30" }]}>
          <Ionicons name="close-circle" size={12} color={colors.error} />
          <Text style={[wcStyles.answerLabel, { color: colors.error }]}>{t("examLab.report.yourAnswer")}: </Text>
          <Text style={[wcStyles.answerText, { color: colors.error }]}>{userAnswer}. {userOption?.text}</Text>
        </View>
        <View style={[wcStyles.answerChip, { backgroundColor: colors.success + "10", borderColor: colors.success + "30" }]}>
          <Ionicons name="checkmark-circle" size={12} color={colors.success} />
          <Text style={[wcStyles.answerLabel, { color: colors.success }]}>{t("examLab.report.correctAnswer")}: </Text>
          <Text style={[wcStyles.answerText, { color: colors.success }]}>{question.correctAnswer}. {correctOption?.text}</Text>
        </View>
      </View>
      {/* AI Açıklama butonu */}
      <TouchableOpacity
        style={[wcStyles.explainBtn, { backgroundColor: colors.moduleExamLabPrimary + "10", borderColor: colors.moduleExamLabPrimary + "40" }]}
        onPress={handleExplain}
        activeOpacity={0.7}
      >
        {loadingExp
          ? <ActivityIndicator size="small" color={colors.moduleExamLabPrimary} />
          : <Ionicons name={!isPremium ? "lock-closed-outline" : expanded && explanation ? "chevron-up-outline" : "bulb-outline"} size={14} color={colors.moduleExamLabPrimary} />
        }
        <Text style={[wcStyles.explainBtnText, { color: colors.moduleExamLabPrimary }]}>
          {loadingExp ? t("examLab.report.explaining") : expanded && explanation ? t("examLab.report.hideExplanation") : t("examLab.report.explainWithAI")}
        </Text>
        {!isPremium && (
          <View style={{ backgroundColor: "#8B5CF6", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 2 }}>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>PRO</Text>
          </View>
        )}
      </TouchableOpacity>
      {/* Açıklama içeriği */}
      {expanded && explanation && (
        <View style={[wcStyles.explanationBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.moduleExamLabPrimary + "20" }]}>
          <Text style={[wcStyles.explanationText, { color: colors.textSecondary }]}>{explanation}</Text>
        </View>
      )}
    </View>
  );
}

const wcStyles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: BORDER_RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.sm },
  row: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  wrongBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  questionText: { flex: 1, fontSize: 13, fontWeight: "500", lineHeight: 18 },
  answersRow: { gap: 6, borderTopWidth: 1, paddingTop: SPACING.sm },
  answerChip: { flexDirection: "row", alignItems: "flex-start", padding: SPACING.xs, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, flexWrap: "wrap", gap: 4 },
  answerLabel: { fontSize: 11, fontWeight: "700" },
  answerText: { fontSize: 11, flex: 1 },
  explainBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.sm, borderRadius: BORDER_RADIUS.md, borderWidth: 1, alignSelf: "flex-start" },
  explainBtnText: { fontSize: 12, fontWeight: "600" },
  explanationBox: { padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm },
  explanationText: { fontSize: 13, lineHeight: 19 },
});


export default function ExamLabScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { pickFromGallery, takePhoto, loading: imageLoading } = useImagePicker();
  const { user, isLoggedIn } = useAuth();
  const { checkUsageLimit, isPremium } = useSubscription();
  const { showAdBeforeAction } = useAd();
  const { load: loadExamProgress } = useExamProgress();

  const [screen, setScreen] = useState<Screen>("selection");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [customTopic, setCustomTopic] = useState("");
  const [inputMethod, setInputMethod] = useState<"topic" | "photo">("topic");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<"gallery" | "camera" | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumModalIsProGate, setPremiumModalIsProGate] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);

  const openProGate = () => { setPremiumModalIsProGate(true); setShowPremiumModal(true); };
  const openLimitModal = () => { setPremiumModalIsProGate(false); setShowPremiumModal(true); };

  const persistSavedExam = (exam: typeof savedExam) => {
    setSavedExam(exam);
    if (exam) {
      AsyncStorage.setItem(SAVED_EXAM_STORAGE_KEY, JSON.stringify(exam)).catch(() => {});
    } else {
      AsyncStorage.removeItem(SAVED_EXAM_STORAGE_KEY).catch(() => {});
    }
  };
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(isPremium ? "medium" : "easy");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<ExamSubject | null>(null);
  const [showExamTypeModal, setShowExamTypeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [savedExam, setSavedExam] = useState<{
    topic: string | null;
    questions: Question[];
    answers: Record<number, string>;
    feedback: Record<number, boolean>;
    index: number;
    difficulty: "easy" | "medium" | "hard";
    questionCount: number;
  } | null>(null);
  const [examStartTime, setExamStartTime] = useState<number | null>(null);
  const [examDuration, setExamDuration] = useState<number>(0); // saniye cinsinden

  // ── Gerçek Sınav Modu ──────────────────────────────────────────────────────
  const [realExamMode, setRealExamMode] = useState(false);
  const [realExamTimeLimitSec, setRealExamTimeLimitSec] = useState<number | null>(null);
  const [realExamTimeLeft, setRealExamTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const reportSavedRef = useRef(false);

  const [settingsExpanded] = useState(true);

  // ── Hızlı Sınav Bottom Sheet ───────────────────────────────────────────────
  const [showQuickSheet, setShowQuickSheet] = useState(false);
  const [quickSubject, setQuickSubject] = useState<ExamSubject | null>(null);
  const quickSheetAnim = useRef(new Animated.Value(0)).current;
  const quickGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sürekli parlama animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(quickGlowAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(quickGlowAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const openQuickSheet = () => {
    if (!isPremium) { openProGate(); return; }
    setQuickSubject(selectedSubject);
    setShowQuickSheet(true);
    Animated.spring(quickSheetAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 65 }).start();
  };

  const closeQuickSheet = () => {
    Animated.timing(quickSheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowQuickSheet(false));
  };

  const startQuickExam = () => {
    if (!selectedExamType && !quickSubject && !customTopic.trim()) return;
    const topic = customTopic.trim() || quickSubject?.label || selectedExamType?.label || "";
    if (!topic) return;
    closeQuickSheet();
    setQuestionCount(5);
    setDifficulty("easy");
    if (quickSubject) setSelectedSubject(quickSubject);
    setTimeout(() => handleTopicSelect(topic), 250);
  };

  // Free kullanıcı için günlük kullanım bilgisini yükle
  useEffect(() => {
    if (isLoggedIn && !isPremium && user?.id) {
      checkUsageLimit('exam_lab').then((data) => {
        if (data) setUsageInfo(data);
      });
    } else {
      setUsageInfo(null);
    }
  }, [isLoggedIn, isPremium, user?.id]);

  // Sayfa açılınca hata defteri verisini arka planda önceden yükle
  useEffect(() => {
    if (isLoggedIn && user?.id) loadExamProgress(user.id);
  }, [isLoggedIn, user?.id]);

  // Kaydedilmiş sınav tipini ve yarım kalan sınavı yükle
  useEffect(() => {
    AsyncStorage.getItem(EXAM_TYPE_STORAGE_KEY).then((val) => {
      if (val) {
        const found = getExamTypeById(val);
        if (found) setSelectedExamType(found);
      }
    });
    AsyncStorage.getItem(SAVED_EXAM_STORAGE_KEY).then((val) => {
      if (val) {
        try { setSavedExam(JSON.parse(val)); } catch { /* bozuk veri */ }
      }
    });
  }, []);

  // Convert image to base64
  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    try {
      // If already base64 data URL, return as is
      if (imageUri.startsWith("data:image")) {
        return imageUri;
      }

      // Fetch image and convert to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Result = reader.result as string;
          resolve(base64Result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error("Görsel işlenemedi");
    }
  };

  const handleTopicSelect = async (topic: string, imageBase64?: string) => {
    if (!isLoggedIn || !user?.id) {
      setLoading(false);
            Alert.alert(
        t("modules.locked"),
        t("profile.loginToContinue")
      );
      return;
    }

    // ✅ Check usage limit before creating exam
    if (!isPremium) {
      const usage = await checkUsageLimit('exam_lab');
      if (usage?.allowed === false) {
        setLoading(false);
                setUsageInfo(usage);
        openLimitModal();
        return;
      }
    }

    // Topic'i max 6 kelime ile sınırla
    const limitedTopic = topic.split(' ').slice(0, 6).join(' ');
    setSelectedTopic(limitedTopic);
    setLoading(true);

    try {
      // Get user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User session not found");
      }

      // Get user language
      const userLanguage = i18n.language || "tr";

      // Prepare request body
      const requestBody: any = {
        userId: user.id,
        userLanguage: userLanguage,
        difficulty: difficulty,
        questionCount: questionCount,
        examType: selectedExamType?.id || "general",
        examPromptHint: selectedExamType?.promptHint || "",
        subjectLabel: selectedSubject?.label || "",
        subjectPromptHint: selectedSubject?.promptHint || "",
      };

      if (imageBase64) {
        requestBody.topicImageUrl = imageBase64;
      } else {
        requestBody.topic = limitedTopic;
      }

      // Call Edge Function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-exam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = t("examLab.errors.failedMessage");
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch (e) {
          console.error("Exam API Error:", errorText);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error === "USAGE_LIMIT_EXCEEDED" || data.error === "PREMIUM_REQUIRED") {
        setUsageInfo(data.usageInfo);
        setLoading(false);
                openLimitModal();
        return;
      }

      if (data.error) {
        throw new Error(data.error || data.message || t("examLab.errors.failedMessage"));
      }

      if (!Array.isArray(data.questions)) {
        throw new Error(t("examLab.errors.failedMessage"));
      }

      const VALID_LABELS = ["A", "B", "C", "D"];
      // Format questions — correctAnswer'ı frontend'de de güvenli normalize et
      const formattedQuestions: Question[] = data.questions.map((q: any, index: number) => {
        const options: { label: string; text: string }[] = Array.isArray(q.options) ? q.options : [];
        const raw = String(q.correctAnswer || "").trim().toUpperCase();
        // Tek harf doğrudan geçerli mi?
        let correctAnswer = VALID_LABELS.includes(raw) ? raw : "";
        // Değilse içinden A/B/C/D çıkar
        if (!correctAnswer) {
          const m = raw.match(/[ABCD]/);
          correctAnswer = m ? m[0] : "A";
        }
        return {
          id: index + 1,
          question: q.question || "",
          options,
          correctAnswer,
        };
      });

      setQuestions(formattedQuestions);
      setScreen("exam");
      setExamStartTime(Date.now());
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowFeedback({});
      // Gerçek Sınav Modu aktifse geri sayımı başlat
      if (realExamMode && realExamTimeLimitSec !== null) {
        setRealExamTimeLeft(realExamTimeLimitSec);
      }
      // Free kullanıcı için kullanım bilgisini güncelle
      if (!isPremium) {
        checkUsageLimit('exam_lab').then((data) => {
          if (data) setUsageInfo(data);
        }).catch(() => {});
      }
    } catch (error: any) {
      console.error("Exam creation error:", error);
      showError(
        t("examLab.errors.failed"),
        error.message || t("examLab.errors.failedMessage")
      );
    } finally {
      setLoading(false);
          }
  };

  const handleImagePicker = async () => {
    if (!isLoggedIn || !user?.id) {
      Alert.alert(
        t("modules.locked"),
        t("profile.loginToContinue")
      );
      return;
    }

    try {
      const result = await pickFromGallery();
      if (result) {
        setSelectedImage(result);
        setInputMethod("photo");
        setImageSource("gallery");
        setCustomTopic("");
      } else {
        // Picker cancelled — reset to topic if no image already selected
        setInputMethod((prev) => (prev === "photo" && !selectedImage ? "topic" : prev));
        setImageSource((prev) => (prev === "gallery" && !selectedImage ? null : prev));
      }
    } catch (error: any) {
      showWarning(
        t("examLab.errors.galleryDenied"),
        t("examLab.errors.galleryDeniedMessage")
      );
    }
  };

  const handlePhotoCapture = async () => {
    if (!isLoggedIn || !user?.id) {
      Alert.alert(
        t("modules.locked"),
        t("profile.loginToContinue")
      );
      return;
    }

    try {
      const result = await takePhoto();
      if (result) {
        setSelectedImage(result);
        setInputMethod("photo");
        setImageSource("camera");
        setCustomTopic("");
      } else {
        // Picker cancelled — reset to topic if no image already selected
        setInputMethod((prev) => (prev === "photo" && !selectedImage ? "topic" : prev));
        setImageSource((prev) => (prev === "camera" && !selectedImage ? null : prev));
      }
    } catch (error: any) {
      showWarning(
        t("examLab.errors.cameraDenied"),
        t("examLab.errors.cameraDeniedMessage")
      );
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageSource(null);
    setInputMethod("topic");
  };

  const handleCreateExam = async () => {
    // Sınav tipi seçilmemişse konu zorunlu
    if (!hasSpecificExamType && inputMethod === "topic" && !customTopic.trim()) {
      setLoading(false);
      showWarning(
        t("examLab.errors.emptyTopic"),
        t("examLab.errors.emptyTopicMessage")
      );
      return;
    }

    if (!hasSpecificExamType && inputMethod === "photo" && !selectedImage) {
      setLoading(false);
      showWarning(
        t("examLab.errors.noImage"),
        t("examLab.errors.noImageMessage")
      );
      return;
    }

    try {
      // Sınav tipi seçiliyse topic olarak label kullan (id değil), opsiyonel konu varsa ekle
      if (hasSpecificExamType && selectedImage) {
        const base64Image = await convertImageToBase64(selectedImage);
        await handleTopicSelect(selectedExamType!.label, base64Image);
        return;
      }
      if (hasSpecificExamType) {
        // Subject seçildiyse label'ını, yoksa serbest konu girişini, o da yoksa examType label'ını kullan
        const topic = customTopic.trim() || selectedSubject?.label || selectedExamType!.label;
        await handleTopicSelect(topic);
        return;
      }
      if (inputMethod === "topic") {
        const topic = customTopic.trim();
        await handleTopicSelect(topic);
      } else if (inputMethod === "photo" && selectedImage) {
        // Convert image to base64
        const base64Image = await convertImageToBase64(selectedImage);
        // Backend fotoğraftan konu tespit edecek, biz generic bir topic gönderiyoruz
        await handleTopicSelect("Sınav", base64Image);
      }
    } catch (error: any) {
      console.error("Create exam error:", error);
      setLoading(false);
            showError(
        t("examLab.errors.failed"),
        error.message || t("examLab.errors.failedMessage")
      );
    }
  };


  const hasSpecificExamType = !!selectedExamType && selectedExamType.id !== "general";
  const canCreateExam =
    hasSpecificExamType || // sınav tipi seçiliyse konu zorunlu değil
    (inputMethod === "topic" && customTopic.trim()) ||
    (inputMethod === "photo" && selectedImage !== null);

  const handleAnswerSelect = (questionId: number, answer: string) => {
    if (showFeedback[questionId]) return; // Zaten cevaplandı

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Anlık geri bildirim göster
    setShowFeedback((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswered = currentQuestion && !!showFeedback[currentQuestion.id];
    const isLast = currentQuestionIndex === questions.length - 1;

    // Son soruysa — cevaplanmamışsa uyar
    if (isLast) {
      if (!isAnswered) {
        Alert.alert(
          t("examLab.finishWithoutAnswer"),
          t("examLab.finishWithoutAnswerDesc"),
          [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("examLab.finish"), style: "destructive",
              onPress: () => {
                if (examStartTime) setExamDuration(Math.round((Date.now() - examStartTime) / 1000));
                setShowReportModal(true);
              },
            },
          ]
        );
      } else {
        if (examStartTime) setExamDuration(Math.round((Date.now() - examStartTime) / 1000));
        setShowReportModal(true);
      }
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
        viewPosition: 0.5
      });
    }, 100);
  };

  const calculateExamResults = () => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    questions.forEach((question) => {
      const userAnswer = selectedAnswers[question.id];
      if (!userAnswer) {
        unanswered++;
      } else if (userAnswer === question.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      correct,
      incorrect,
      unanswered,
      percentage,
    };
  };

  // Rapor ilk açıldığında exam_results + hata defteri + konu hakimiyeti kaydet
  useEffect(() => {
    if (!showReportModal || !user?.id || reportSavedRef.current || questions.length === 0) return;

    const topicTitle = selectedTopic || t("examLab.exam");
    let correctCount = 0;

    // exam_results için özet + RPC için tam soru listesi
    const reportRows: {
      questionText: string;
      userAnswer: string;
      correctAnswer: string;
      correct: boolean;
      options: { label: string; text: string }[];
    }[] = [];

    const rpcQuestions: {
      question: string;
      options: { label: string; text: string }[];
      correctAnswer: string;
      userAnswer: string;
      correct: boolean;
    }[] = [];

    questions.forEach((q) => {
      const userAnswer = selectedAnswers[q.id] ?? "";
      const correct = userAnswer === q.correctAnswer;
      if (correct) correctCount++;
      reportRows.push({
        questionText: q.question?.slice(0, 200) || "",
        userAnswer,
        correctAnswer: q.correctAnswer,
        correct,
        options: Array.isArray(q.options) ? q.options : [],
      });
      // Boş bırakılan soruları hata defterine kaydetme — sadece cevaplanan soruları gönder
      if (userAnswer !== "") {
        rpcQuestions.push({
          question: q.question || "",
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correctAnswer,
          userAnswer,
          correct,
        });
      }
    });

    reportSavedRef.current = true;

    // 1. exam_results kaydet
    supabase
      .from(TABLES.EXAM_RESULTS)
      .insert({
        user_id: user.id,
        topic: topicTitle,
        total_questions: questions.length,
        correct_count: correctCount,
        report: reportRows,
      })
      .then(({ error }) => {
        if (error) console.warn("Exam result save failed:", error);
      });

    // 2. Hata defteri + Konu hakimiyeti (tek RPC çağrısı)
    supabase.rpc("upsert_exam_results", {
      p_user_id:      user.id,
      p_exam_type_id: selectedExamType?.id ?? "general",
      p_subject_id:   selectedSubject?.id ?? null,
      p_subject_label: selectedSubject?.label ?? null,
      p_topic:        topicTitle,
      p_questions:    rpcQuestions,
    }).then(({ error }) => {
      if (error) console.warn("Exam RPC failed:", error);
    });
  }, [showReportModal, user?.id, questions, selectedAnswers, selectedTopic, selectedExamType, selectedSubject, t]);

  const handleCloseReport = () => {
    // Önce modal kapat + screen değiştir, SONRA state temizle
    // Aksi takdirde FlatList boş data ile render olup donuyor
    setShowReportModal(false);
    setScreen("selection");
    // Bir sonraki frame'de temizle — screen="selection" render'landıktan sonra
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimeout(() => {
      setQuestions([]);
      setSelectedAnswers({});
      setShowFeedback({});
      setCurrentQuestionIndex(0);
      setExamStartTime(null);
      setExamDuration(0);
      setRealExamMode(false);
      setRealExamTimeLimitSec(null);
      setRealExamTimeLeft(null);
      reportSavedRef.current = false;
    }, 50);
  };

  // Gerçek Sınav Modu — geri sayım timer (REAL_EXAM_MODE_ENABLED=false iken çalışmaz)
  useEffect(() => {
    if (!REAL_EXAM_MODE_ENABLED || screen !== "exam" || !realExamMode || realExamTimeLeft === null) return;
    if (realExamTimeLeft <= 0) {
      // Süre doldu — raporu göster
      if (examStartTime) setExamDuration(Math.round((Date.now() - examStartTime) / 1000));
      Alert.alert(t("examLab.realExam.timeUp"), t("examLab.realExam.timeUpMessage"));
      setShowReportModal(true);
      return;
    }
    timerRef.current = setInterval(() => {
      setRealExamTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, realExamMode, realExamTimeLeft]);



  // Sınavdayken geri basılınca: kaydet ve çık seçeneği sun
  const handleExitExam = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    Alert.alert(
      t("examLab.exitConfirmTitle"),
      t("examLab.exitConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        // Cevap verilmiş soru varsa "Kaydet ve Çık" seçeneği sun
        ...(answeredCount > 0 ? [{
          text: t("examLab.exitSaveAndLeave"),
          onPress: () => {
            persistSavedExam({
              topic: selectedTopic,
              questions,
              answers: selectedAnswers,
              feedback: showFeedback,
              index: currentQuestionIndex,
              difficulty,
              questionCount,
            });
            setScreen("selection");
            setQuestions([]);
            setSelectedAnswers({});
            setShowFeedback({});
            setCurrentQuestionIndex(0);
          },
        }] : []),
        {
          text: t("examLab.exitConfirmLeave"),
          style: "destructive",
          onPress: () => {
            persistSavedExam(null);
            setScreen("selection");
            setQuestions([]);
            setSelectedAnswers({});
            setShowFeedback({});
            setCurrentQuestionIndex(0);
          },
        },
      ]
    );
  };

  // Android donanım geri tuşu: sınav ekranındayken aynı onayı göster, ana sayfaya gitme
  useEffect(() => {
    if (screen !== "exam" || showReportModal) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleExitExam();
      return true;
    });
    return () => sub.remove();
  }, [screen, showReportModal, t]);

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: prevIndex, 
          animated: true,
          viewPosition: 0.5
        });
      }, 100);
    }
  };

  const renderExamTypeModal = () => (
    <Modal visible={showExamTypeModal} animationType="slide" transparent onRequestClose={() => setShowExamTypeModal(false)}>
      <View style={styles.examTypeModalOverlay}>
        <View style={[styles.examTypeModalContent, { backgroundColor: colors.card }]}>
          <View style={styles.examTypeModalHeader}>
            <Text style={[styles.examTypeModalTitle, { color: colors.textPrimary }]}>
              {t("examLab.examType.selectTitle")}
            </Text>
            <TouchableOpacity onPress={() => setShowExamTypeModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {EXAM_COUNTRIES.map((country) => (
              <View key={country.id} style={styles.examTypeCountrySection}>
                <Text style={[styles.examTypeCountryLabel, { color: colors.textTertiary }]}>
                  {country.flag} {t(country.nameKey)}
                </Text>
                {country.exams.map((exam) => {
                  const isSelected = selectedExamType?.id === exam.id;
                  return (
                    <TouchableOpacity
                      key={exam.id}
                      style={[
                        styles.examTypeOption,
                        {
                          backgroundColor: isSelected ? colors.moduleExamLabLight : colors.backgroundSecondary,
                          borderColor: isSelected ? colors.moduleExamLabPrimary : colors.borderSubtle,
                        },
                      ]}
                      onPress={() => {
                        setSelectedExamType(exam);
                        setSelectedSubject(null); // Sınav değişince konu sıfırla
                        setCustomTopic("");
                        AsyncStorage.setItem(EXAM_TYPE_STORAGE_KEY, exam.id);
                        setShowExamTypeModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.examTypeOptionFlag}>{exam.flag}</Text>
                      <Text style={[styles.examTypeOptionLabel, { color: isSelected ? colors.moduleExamLabPrimary : colors.textPrimary }]}>
                        {exam.label}
                      </Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={18} color={colors.moduleExamLabPrimary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const getReportData = () => {
    const results = calculateExamResults();
    const scoreColor = results.percentage >= 80 ? colors.success : results.percentage >= 50 ? colors.moduleExamLabPrimary : colors.error;
    const durationMin = Math.floor(examDuration / 60);
    const durationSec = examDuration % 60;
    const performanceMsg =
      results.percentage === 100 ? t("examLab.report.perfect") :
      results.percentage >= 80 ? t("examLab.report.excellent") :
      results.percentage >= 60 ? t("examLab.report.good") :
      results.percentage >= 40 ? t("examLab.report.needsImprovement") :
      t("examLab.report.keepPracticing");
    const performanceEmoji =
      results.percentage === 100 ? "🏆" :
      results.percentage >= 80 ? "🎯" :
      results.percentage >= 60 ? "👍" :
      results.percentage >= 40 ? "📖" : "💪";
    const shareTopicText = (selectedTopic && selectedTopic !== selectedExamType?.label)
      ? selectedTopic
      : selectedExamType?.label || t("examLab.exam");
    return { results, scoreColor, durationMin, durationSec, performanceMsg, performanceEmoji, shareTopicText };
  };


  const renderReportModal = () => {
    const { results, scoreColor, durationMin, durationSec, performanceMsg, performanceEmoji } = getReportData();
    const wrongQuestions = questions.filter((q) => selectedAnswers[q.id] && selectedAnswers[q.id] !== q.correctAnswer);
    const correctQuestions = questions.filter((q) => selectedAnswers[q.id] === q.correctAnswer);
    const unansweredQuestions = questions.filter((q) => !selectedAnswers[q.id]);

    return (
      <Modal visible={showReportModal} animationType="slide" transparent={false} onRequestClose={handleCloseReport}>
        <View style={[styles.reportFullScreen, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.reportHeader, { backgroundColor: colors.card, borderBottomColor: colors.borderSubtle, paddingTop: insets.top + SPACING.sm }]}>
            <TouchableOpacity onPress={handleCloseReport} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.reportHeaderTitle, { color: colors.textPrimary }]}>
              {t("examLab.report.title")}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.reportScrollContent}>

            {/* ── Hero Skor Kartı ── */}
            <View style={[styles.reportHeroCard, { backgroundColor: scoreColor + "12", borderColor: scoreColor + "30" }]}>
              {/* Sınav tipi badge + konu */}
              <View style={styles.reportHeroTopRow}>
                {selectedExamType && selectedExamType.id !== "general" && (
                  <View style={[styles.reportExamTypeBadge, { backgroundColor: scoreColor + "20" }]}>
                    <Text style={styles.reportExamTypeBadgeFlag}>{selectedExamType.flag}</Text>
                    <Text style={[styles.reportExamTypeBadgeText, { color: scoreColor }]}>{selectedExamType.label}</Text>
                  </View>
                )}
                {(selectedTopic && selectedTopic !== selectedExamType?.label) && (
                  <Text style={[styles.reportHeroTopic, { color: colors.textSecondary }]} numberOfLines={1}>
                    {selectedTopic}
                  </Text>
                )}
                {!selectedTopic && (
                  <Text style={[styles.reportHeroTopic, { color: colors.textSecondary }]} numberOfLines={1}>
                    {t("examLab.exam")}
                  </Text>
                )}
              </View>

              {/* % + performans */}
              <View style={styles.reportHeroScoreBlock}>
                <Text style={[styles.reportBigPercent, { color: scoreColor }]}>{results.percentage}%</Text>
                <View style={styles.reportHeroRight}>
                  <Text style={[styles.reportHeroPerf, { color: scoreColor }]}>{performanceEmoji} {performanceMsg}</Text>
                  <View style={[styles.reportScoreBar, { backgroundColor: colors.borderSubtle }]}>
                    <View style={[styles.reportScoreBarFill, { backgroundColor: scoreColor, width: `${results.percentage}%` as any }]} />
                  </View>
                  <Text style={[styles.reportScoreFraction, { color: colors.textSecondary }]}>
                    {results.correct}/{results.total} {t("examLab.report.correct")}
                  </Text>
                </View>
              </View>

              {/* Stat grid */}
              <View style={[styles.reportStatGrid, { borderTopColor: scoreColor + "25" }]}>
                <View style={styles.reportStatItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.reportStatNum, { color: colors.textPrimary }]}>{results.correct}</Text>
                  <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>{t("examLab.report.correct")}</Text>
                </View>
                <View style={[styles.reportStatDivider, { backgroundColor: scoreColor + "30" }]} />
                <View style={styles.reportStatItem}>
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                  <Text style={[styles.reportStatNum, { color: colors.textPrimary }]}>{results.incorrect}</Text>
                  <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>{t("examLab.report.incorrect")}</Text>
                </View>
                <View style={[styles.reportStatDivider, { backgroundColor: scoreColor + "30" }]} />
                <View style={styles.reportStatItem}>
                  <Ionicons name="remove-circle-outline" size={20} color={colors.textTertiary} />
                  <Text style={[styles.reportStatNum, { color: colors.textPrimary }]}>{results.unanswered}</Text>
                  <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>{t("examLab.report.unanswered")}</Text>
                </View>
                {examDuration > 0 && (
                  <>
                    <View style={[styles.reportStatDivider, { backgroundColor: scoreColor + "30" }]} />
                    <View style={styles.reportStatItem}>
                      <Ionicons name="time-outline" size={20} color={colors.info} />
                      <Text style={[styles.reportStatNum, { color: colors.textPrimary }]}>
                        {durationMin > 0 ? `${durationMin}:${durationSec.toString().padStart(2, "0")}` : `${durationSec}s`}
                      </Text>
                      <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>{t("examLab.report.duration")}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>


            {/* ── Tüm Doğru Banner ── */}
            {results.percentage === 100 && (
              <View style={[styles.reportPerfectBanner, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}>
                <Text style={styles.reportPerfectEmoji}>🏆</Text>
                <Text style={[styles.reportPerfectText, { color: colors.success }]}>{t("examLab.report.perfectScore")}</Text>
              </View>
            )}

            {/* ── Yanlış Sorular ── */}
            {wrongQuestions.length > 0 && (
              <View style={styles.reportSection}>
                <View style={styles.reportSectionHeader}>
                  <View style={[styles.reportSectionDot, { backgroundColor: colors.error }]} />
                  <Text style={[styles.reportSectionTitle, { color: colors.textPrimary }]}>
                    {t("examLab.report.wrongAnswers")} ({wrongQuestions.length})
                  </Text>
                </View>
                {wrongQuestions.map((q) => (
                  <WrongQuestionCard
                    key={q.id}
                    question={q}
                    userAnswer={selectedAnswers[q.id]}
                    colors={colors}
                    t={t}
                    userLanguage={i18n.language || "tr"}
                    userId={user?.id}
                    isPremium={isPremium}
                    onProGate={openProGate}
                  />
                ))}
              </View>
            )}

            {/* ── Boş Bırakılan Sorular ── */}
            {unansweredQuestions.length > 0 && (
              <View style={styles.reportSection}>
                <View style={styles.reportSectionHeader}>
                  <View style={[styles.reportSectionDot, { backgroundColor: colors.textTertiary }]} />
                  <Text style={[styles.reportSectionTitle, { color: colors.textPrimary }]}>
                    {t("examLab.report.skipped")} ({unansweredQuestions.length})
                  </Text>
                </View>
                {unansweredQuestions.map((q) => (
                  <View key={q.id} style={[styles.reportSkippedCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                    <View style={[styles.reportSkippedBadge, { backgroundColor: colors.textTertiary + "20" }]}>
                      <Text style={[styles.reportSkippedNum, { color: colors.textTertiary }]}>{q.id}</Text>
                    </View>
                    <Text style={[styles.reportSkippedText, { color: colors.textSecondary }]} numberOfLines={2}>
                      {q.question}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* ── Doğru Sorular (collapse) ── */}
            {correctQuestions.length > 0 && (
              <View style={styles.reportSection}>
                <View style={styles.reportSectionHeader}>
                  <View style={[styles.reportSectionDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.reportSectionTitle, { color: colors.textPrimary }]}>
                    {t("examLab.report.correctAnswers")} ({correctQuestions.length})
                  </Text>
                </View>
                {correctQuestions.map((q) => (
                  <View key={q.id} style={[styles.reportCorrectCard, { backgroundColor: colors.success + "08", borderColor: colors.success + "25" }]}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginTop: 1 }} />
                    <Text style={[styles.reportCorrectText, { color: colors.textSecondary }]} numberOfLines={2}>
                      {q.question}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: SPACING.xl }} />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.reportFooter, { backgroundColor: colors.card, borderTopColor: colors.borderSubtle, paddingBottom: insets.bottom + SPACING.sm }]}>
            {wrongQuestions.length > 0 && (
              <TouchableOpacity
                style={[styles.reportErrorNotebookBtn, { backgroundColor: colors.error + "12", borderColor: colors.error + "30" }]}
                onPress={() => { handleCloseReport(); router.push("/(main)/exam-progress" as any); }}
                activeOpacity={0.8}
              >
                <Ionicons name="book-outline" size={16} color={colors.error} />
                <Text style={[styles.reportErrorNotebookText, { color: colors.error }]}>
                  {t("examLab.report.goToErrorNotebook", { count: wrongQuestions.length })}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.error} />
              </TouchableOpacity>
            )}
            <Button
              title={t("examLab.report.newExam")}
              onPress={handleCloseReport}
              variant="primary"
              icon="add-outline"
              iconPosition="left"
              fullWidth
              modulePrimary={colors.moduleExamLabPrimary}
            />
          </View>
        </View>{/* reportFullScreen */}
      </Modal>
    );
  };

  const renderSelectionScreen = () => (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hızlı Erişim: 2'li grid ── */}
        {isLoggedIn ? (
          <View style={selStyles.quickRow}>
            <TouchableOpacity
              style={[selStyles.quickTile, { backgroundColor: colors.moduleExamLabPrimary + "12", borderColor: colors.moduleExamLabPrimary + "35" }]}
              onPress={() => router.push("/(main)/exam-progress" as any)}
              activeOpacity={0.8}
            >
              <View style={[selStyles.quickTileIcon, { backgroundColor: colors.moduleExamLabPrimary + "22" }]}>
                <Ionicons name="analytics-outline" size={20} color={colors.moduleExamLabPrimary} />
              </View>
              <Text style={[selStyles.quickTileTitle, { color: colors.textPrimary }]}>{t("examLab.errorNotebook.title")}</Text>
              <Text style={[selStyles.quickTileDesc, { color: colors.textSecondary }]}>{t("examLab.errorNotebook.desc")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[selStyles.quickTile, { backgroundColor: colors.moduleExamLabPrimary, borderColor: colors.moduleExamLabPrimary }]}
              onPress={openQuickSheet}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={[selStyles.quickTileIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                  <Ionicons name={isPremium ? "flash" : "lock-closed"} size={20} color="#fff" />
                </View>
                {!isPremium && (
                  <View style={{ backgroundColor: "#F59E0B", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
                    <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={[selStyles.quickTileTitle, { color: "#fff" }]}>{t("examLab.quickDrill.title")}</Text>
              <Text style={[selStyles.quickTileDesc, { color: "rgba(255,255,255,0.75)" }]}>{t("examLab.quickDrill.desc")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.loginCtaBanner, { backgroundColor: colors.card, borderColor: colors.moduleExamLabPrimary + "30" }]}
            onPress={() => router.push("/(main)/signup" as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.loginCtaIcon, { backgroundColor: colors.moduleExamLabPrimary + "20" }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.moduleExamLabPrimary} />
            </View>
            <View style={styles.loginCtaText}>
              <Text style={[styles.loginCtaTitle, { color: colors.textPrimary }]}>{t("examLab.examType.loginCta.title")}</Text>
              <Text style={[styles.loginCtaDesc, { color: colors.textSecondary }]}>{t("examLab.examType.loginCta.desc")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* ── Hızlı Sınav Bottom Sheet ── */}
        <Modal visible={showQuickSheet} transparent animationType="none" onRequestClose={closeQuickSheet}>
          <TouchableOpacity style={styles.quickSheetOverlay} activeOpacity={1} onPress={closeQuickSheet} />
          <Animated.View style={[styles.quickSheetContainer, { backgroundColor: colors.card,
            transform: [{ translateY: quickSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }],
          }]}>
            <View style={[styles.quickSheetHandle, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.quickSheetHeader}>
              <View style={[styles.quickSheetIconWrap, { backgroundColor: colors.moduleExamLabPrimary }]}>
                <Ionicons name="flash" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.quickSheetTitle, { color: colors.textPrimary }]}>{t("examLab.quickDrill.title")}</Text>
                <Text style={[styles.quickSheetSub, { color: colors.textSecondary }]}>{t("examLab.quickDrill.subtitle")}</Text>
              </View>
            </View>

            {!selectedExamType && !customTopic.trim() && (
              <Text style={[styles.quickSheetWarn, { color: colors.textSecondary }]}>
                {t("examLab.examType.selectFirst")}
              </Text>
            )}

            {selectedExamType && selectedExamType.subjects.length > 0 && (
              <>
                <Text style={[styles.quickSheetLabel, { color: colors.textSecondary }]}>{t("examLab.examType.selectSubject")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.sm }}>
                  <View style={{ flexDirection: "row", gap: SPACING.xs, paddingHorizontal: 2 }}>
                    {selectedExamType.subjects.map((subj) => {
                      const active = quickSubject?.id === subj.id;
                      return (
                        <TouchableOpacity
                          key={subj.id}
                          style={[styles.quickSubjChip, { backgroundColor: active ? colors.moduleExamLabPrimary : colors.backgroundSecondary, borderColor: active ? colors.moduleExamLabPrimary : colors.borderSubtle }]}
                          onPress={() => setQuickSubject(active ? null : subj)}
                        >
                          <Text style={[styles.quickSubjChipText, { color: active ? "#fff" : colors.textPrimary }]}>{subj.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </>
            )}

            <TouchableOpacity
              style={[styles.quickSheetBtn, { backgroundColor: (!selectedExamType && !customTopic.trim()) ? colors.borderSubtle : colors.moduleExamLabPrimary }]}
              onPress={startQuickExam}
              disabled={!selectedExamType && !customTopic.trim()}
              activeOpacity={0.85}
            >
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={styles.quickSheetBtnText}>5 {t("examLab.quickDrill.title")}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>

        {/* ── Devam Et Kartı ── */}
        {savedExam && (
          <TouchableOpacity
            style={[styles.resumeCard, { backgroundColor: colors.moduleExamLabLight, borderColor: colors.moduleExamLabPrimary, marginTop: SPACING.md }]}
            onPress={() => {
              setSelectedTopic(savedExam.topic);
              setQuestions(savedExam.questions);
              setSelectedAnswers(savedExam.answers);
              setShowFeedback(savedExam.feedback);
              setCurrentQuestionIndex(savedExam.index);
              setDifficulty(savedExam.difficulty);
              setQuestionCount(savedExam.questionCount);
              setScreen("exam");
              reportSavedRef.current = false;
            }}
            activeOpacity={0.8}
          >
            <View style={styles.resumeLeft}>
              <View style={[styles.resumeIconBox, { backgroundColor: colors.moduleExamLabPrimary + "20" }]}>
                <Ionicons name="play-circle" size={24} color={colors.moduleExamLabPrimary} />
              </View>
              <View>
                <Text style={[styles.resumeTitle, { color: colors.moduleExamLabPrimary }]}>
                  {t("examLab.resume.title")}
                </Text>
                <Text style={[styles.resumeSubtitle, { color: colors.moduleExamLabPrimary + "AA" }]}>
                  {savedExam.topic || t("examLab.exam")} · {t("examLab.resume.progress", {
                    answered: Object.keys(savedExam.answers).length,
                    total: savedExam.questions.length,
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.resumeRight}>
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); persistSavedExam(null); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={20} color={colors.moduleExamLabPrimary + "80"} />
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={18} color={colors.moduleExamLabPrimary} />
            </View>
          </TouchableOpacity>
        )}

        {/* ── ADIM 1: Sınav Türü ── */}
        <View style={selStyles.stepRow}>
          <View style={[selStyles.stepDot, { backgroundColor: colors.moduleExamLabPrimary }]}>
            <Text style={selStyles.stepDotText}>1</Text>
          </View>
          <Text style={[selStyles.stepLabel, { color: colors.textSecondary }]}>{t("examLab.examType.label")}</Text>
        </View>
        <TouchableOpacity
          style={[selStyles.examTypeBtn, { backgroundColor: colors.card, borderColor: selectedExamType && selectedExamType.id !== "general" ? colors.moduleExamLabPrimary : colors.borderSubtle }]}
          onPress={() => setShowExamTypeModal(true)}
          activeOpacity={0.8}
        >
          <View style={[selStyles.examTypeBtnIcon, { backgroundColor: colors.moduleExamLabLight }]}>
            <Text style={{ fontSize: 20 }}>{selectedExamType ? selectedExamType.flag : "🌐"}</Text>
          </View>
          <Text style={[selStyles.examTypeBtnValue, { color: colors.textPrimary }]}>
            {selectedExamType ? selectedExamType.label : t("examLab.examType.general")}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* ── ADIM 2: Konu ── */}
        <View style={selStyles.stepRow}>
          <View style={[selStyles.stepDot, { backgroundColor: colors.moduleExamLabPrimary }]}>
            <Text style={selStyles.stepDotText}>2</Text>
          </View>
          <Text style={[selStyles.stepLabel, { color: colors.textSecondary }]}>
            {(!selectedExamType || selectedExamType.id === "general") ? t("examLab.popularTopics") : t("examLab.examType.selectSubjectDesc")}
          </Text>
        </View>

        {/* Genel mod: popüler chip'ler + inline input */}
        {(!selectedExamType || selectedExamType.id === "general") && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.popularScrollContent, { paddingHorizontal: 2 }]}
              style={{ marginBottom: SPACING.sm }}
            >
              {(t("examLab.popularTopicsItems", { returnObjects: true }) as string[]).map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={[styles.popularChip, {
                    backgroundColor: customTopic === topic ? colors.moduleExamLabLight : colors.backgroundSecondary,
                    borderColor: customTopic === topic ? colors.moduleExamLabPrimary : colors.borderSubtle,
                  }]}
                  onPress={() => { setCustomTopic(topic); setInputMethod("topic"); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.popularChipText, { color: customTopic === topic ? colors.moduleExamLabPrimary : colors.textSecondary }]}>
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Inline input: metin + fotoğraf ikonları sağda */}
            {inputMethod === "topic" ? (
              <View style={[selStyles.inlineInput, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                <TextInput
                  style={[selStyles.inlineInputText, { color: colors.textPrimary, flex: 1 }]}
                  placeholder={t("examLab.customTopic.placeholder")}
                  placeholderTextColor={colors.textTertiary}
                  value={customTopic}
                  onChangeText={(text) => {
                    const words = text.trim().split(/\s+/);
                    if (words.length <= 6) setCustomTopic(text);
                    else { setCustomTopic(words.slice(0, 6).join(" ")); showWarning(t("examLab.customTopic.wordLimit"), t("examLab.customTopic.wordLimitMessage")); }
                  }}
                  returnKeyType="done"
                  maxLength={50}
                />
                <TouchableOpacity onPress={handleImagePicker} style={selStyles.inlineInputIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="image-outline" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePhotoCapture} style={selStyles.inlineInputIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="camera-outline" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.inputArea, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                {selectedImage ? (
                  <View style={styles.imageArea}>
                    <Image source={{ uri: selectedImage }} style={styles.image} />
                    <TouchableOpacity onPress={handleClearImage} style={[styles.removeButton, { backgroundColor: colors.error }]}>
                      <Ionicons name="close" size={16} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={48} color={colors.textTertiary} />
                    <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                      {t("examLab.photoCapture.placeholder")}
                    </Text>
                  </View>
                )}
              </View>
            )}
            {imageLoading && (
              <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
                <ActivityIndicator size="small" color={colors.moduleExamLabPrimary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t("common.loading")}</Text>
              </View>
            )}
          </>
        )}

        {/* Spesifik sınav modu: ders chip'leri + alt konu inputu */}
        {selectedExamType && selectedExamType.id !== "general" && (
          <View style={[selStyles.subjectCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            {selectedExamType.subjects.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectChipRow}>
                {selectedExamType.subjects.map((subj) => {
                  const isSelected = selectedSubject?.id === subj.id;
                  return (
                    <TouchableOpacity
                      key={subj.id}
                      style={[styles.subjectChip, {
                        backgroundColor: isSelected ? colors.moduleExamLabPrimary : colors.backgroundSecondary,
                        borderColor: isSelected ? colors.moduleExamLabPrimary : colors.borderSubtle,
                      }]}
                      onPress={() => { setSelectedSubject(isSelected ? null : subj); setCustomTopic(""); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.subjectChipText, { color: isSelected ? "#fff" : colors.textSecondary }]}>
                        {subj.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Inline konu inputu */}
            <View style={[selStyles.inlineInput, { backgroundColor: colors.backgroundSecondary, borderColor: selectedSubject ? colors.moduleExamLabPrimary + "60" : colors.borderSubtle, marginTop: SPACING.sm }]}>
              <TextInput
                style={[selStyles.inlineInputText, { color: colors.textPrimary, flex: 1 }]}
                placeholder={
                  selectedSubject?.subjectPlaceholder
                    ? t(selectedSubject.subjectPlaceholder)
                    : t(selectedExamType.topicPlaceholder)
                }
                placeholderTextColor={colors.textTertiary}
                value={customTopic}
                onChangeText={(text) => {
                  const words = text.trim().split(/\s+/);
                  if (words.length <= 6) setCustomTopic(text);
                }}
                returnKeyType="done"
                maxLength={60}
              />
            </View>

            {!selectedSubject && !customTopic.trim() && selectedExamType.subjects.length > 0 && (
              <View style={[styles.examTypeHint, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="information-circle-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.examTypeHintText, { color: colors.textTertiary }]}>
                  {t("examLab.examType.noSubjectHint")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── ADIM 3: Ayarlar ── */}
        <View style={selStyles.stepRow}>
          <View style={[selStyles.stepDot, { backgroundColor: colors.moduleExamLabPrimary }]}>
            <Text style={selStyles.stepDotText}>3</Text>
          </View>
          <Text style={[selStyles.stepLabel, { color: colors.textSecondary }]}>{t("examLab.configTitle")}</Text>
        </View>

        {settingsExpanded && (
          <View style={[selStyles.settingsPanel, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            {/* Zorluk */}
            <View style={styles.optionGroup}>
              <Text style={[styles.optionLabel, { color: colors.textSecondary }]}>{t("examLab.difficulty")}</Text>
              <View style={styles.chipRow}>
                <Chip
                  label={t("examLab.difficultyOptions.easy")}
                  icon="trending-down-outline"
                  selected={difficulty === "easy"}
                  flex={true}
                  modulePrimary={colors.moduleExamLabPrimary}
                  moduleLight={colors.moduleExamLabLight}
                  onPress={() => setDifficulty("easy")}
                />
                <Chip
                  label={t("examLab.difficultyOptions.medium")}
                  icon={!isPremium ? "lock-closed-outline" : "remove-outline"}
                  selected={difficulty === "medium"}
                  flex={true}
                  modulePrimary={colors.moduleExamLabPrimary}
                  moduleLight={colors.moduleExamLabLight}
                  proTag={!isPremium}
                  onPress={() => {
                    if (!isPremium) { showWarning(t("premium.proFeature"), t("examLab.proOnlyDifficulty")); openProGate(); return; }
                    setDifficulty("medium");
                  }}
                />
                <Chip
                  label={t("examLab.difficultyOptions.hard")}
                  icon={!isPremium ? "lock-closed-outline" : "trending-up-outline"}
                  selected={difficulty === "hard"}
                  flex={true}
                  modulePrimary={colors.moduleExamLabPrimary}
                  moduleLight={colors.moduleExamLabLight}
                  proTag={!isPremium}
                  onPress={() => {
                    if (!isPremium) { showWarning(t("premium.proFeature"), t("examLab.proOnlyDifficulty")); openProGate(); return; }
                    setDifficulty("hard");
                  }}
                />
              </View>
            </View>

            {/* Soru Adedi */}
            <View style={[styles.optionGroup, { marginTop: SPACING.md }]}>
              <Text style={[styles.optionLabel, { color: colors.textSecondary }]}>
                {t("examLab.questionCount")} ({questionCount})
              </Text>
              <View style={styles.quickCountButtons}>
                {[5, 10, 15, 20].map((count) => {
                  const locked = !isPremium && count > 5;
                  const selected = questionCount === count;
                  return (
                    <TouchableOpacity
                      key={count}
                      style={[styles.quickCountButton, {
                        backgroundColor: locked ? colors.backgroundSecondary : selected ? colors.moduleExamLabPrimary : colors.backgroundSecondary,
                        borderColor: locked ? colors.borderSubtle : selected ? colors.moduleExamLabPrimary : colors.borderSubtle,
                      }]}
                      onPress={() => {
                        if (locked) { showWarning(t("premium.proFeature"), t("examLab.proOnlyCount")); openProGate(); return; }
                        setQuestionCount(count);
                      }}
                    >
                      {locked ? (
                        <View style={styles.lockedCountContent}>
                          <Ionicons name="lock-closed" size={11} color={colors.textTertiary} />
                          <Text style={[styles.quickCountButtonText, { color: colors.textTertiary }]}>{count}</Text>
                        </View>
                      ) : (
                        <Text style={[styles.quickCountButtonText, { color: selected ? colors.textOnPrimary : colors.textPrimary }]}>
                          {count}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

      {/* ── Gerçek Sınav Modu — COMING SOON, şu an devre dışı ── */}
      {(REAL_EXAM_MODE_ENABLED && hasSpecificExamType) && (() => {
        // Seçili sınav tipine göre preset bul
        const PRESETS: Record<string, { label: string; questions: number; minutes: number; subjectId?: string }[]> = {
          "ales":    [{ label: "Sayısal", questions: 50, minutes: 100, subjectId: "sayisal" }, { label: "Sözel", questions: 50, minutes: 100, subjectId: "sozel" }],
          "yks-tyt": [{ label: "TYT Tam Sınav", questions: 120, minutes: 135 }],
          "yks-ayt": [{ label: "AYT Tam Sınav", questions: 80,  minutes: 180 }],
          "lgs":     [{ label: "LGS Tam Sınav", questions: 90,  minutes: 130 }],
          "sat":     [{ label: "SAT Tam Sınav", questions: 98,  minutes: 134 }],
          "act":     [{ label: "ACT Tam Sınav", questions: 40,  minutes: 60  }],
          "gre":     [{ label: "GRE Verbal",    questions: 20,  minutes: 35  }, { label: "GRE Quant", questions: 20, minutes: 35 }],
          "kpss":    [{ label: "KPSS GK/GY",    questions: 60,  minutes: 90  }],
        };
        const presets = PRESETS[selectedExamType?.id ?? ""];
        if (!presets) return null;
        return (
          <View style={[styles.realExamSection, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            <View style={styles.realExamHeader}>
              <Ionicons name="timer-outline" size={18} color={colors.moduleExamLabPrimary} />
              <Text style={[styles.realExamTitle, { color: colors.textPrimary }]}>{t("examLab.realExam.title")}</Text>
              {realExamMode && (
                <View style={[styles.realExamActiveBadge, { backgroundColor: colors.moduleExamLabPrimary + "20" }]}>
                  <Text style={[styles.realExamActiveBadgeText, { color: colors.moduleExamLabPrimary }]}>Aktif</Text>
                </View>
              )}
            </View>
            <Text style={[styles.realExamSubtitle, { color: colors.textSecondary }]}>{t("examLab.realExam.subtitle")}</Text>
            <View style={styles.realExamPresets}>
              {presets.map((p) => {
                const isActive = realExamMode && realExamTimeLimitSec === p.minutes * 60 && questionCount === p.questions;
                return (
                  <TouchableOpacity
                    key={p.label}
                    style={[styles.presetChip, {
                      backgroundColor: isActive ? colors.moduleExamLabPrimary : colors.backgroundSecondary,
                      borderColor: isActive ? colors.moduleExamLabPrimary : colors.borderSubtle,
                    }]}
                    onPress={() => {
                      if (isActive) {
                        // Toggle off
                        setRealExamMode(false);
                        setRealExamTimeLimitSec(null);
                        setQuestionCount(5);
                      } else {
                        setRealExamMode(true);
                        setRealExamTimeLimitSec(p.minutes * 60);
                        setQuestionCount(Math.min(p.questions, isPremium ? p.questions : 20));
                        if (p.subjectId && selectedExamType?.subjects) {
                          const sub = selectedExamType.subjects.find((s) => s.id === p.subjectId);
                          if (sub) setSelectedSubject(sub);
                        }
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.presetChipLabel, { color: isActive ? "#fff" : colors.textPrimary }]}>{p.label}</Text>
                    <Text style={[styles.presetChipMeta, { color: isActive ? "rgba(255,255,255,0.75)" : colors.textTertiary }]}>
                      {p.questions} soru · {p.minutes} dk
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })()}

      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={[selStyles.stickyFooter, { backgroundColor: colors.background, borderTopColor: colors.borderSubtle, paddingBottom: insets.bottom + SPACING.sm }]}>
        <Button
          title={t("examLab.createExam")}
          onPress={() => {
            if (!isPremium && usageInfo?.allowed === false) { openLimitModal(); return; }
            setLoading(true);
            showAdBeforeAction(handleCreateExam, "exam");
          }}
          disabled={!canCreateExam || loading}
          loading={loading}
          icon="document-text-outline"
          iconPosition="left"
          fullWidth
          variant="primary"
          size="large"
          modulePrimary={colors.moduleExamLabPrimary}
        />
      </View>
    </View>
  );

  const renderQuestionCard = ({ item }: { item: Question }) => (
    <QuestionCard
      item={item}
      isSelected={selectedAnswers[item.id]}
      showFeedbackForThis={!!showFeedback[item.id]}
      colors={colors}
      t={t}
      onAnswerSelect={handleAnswerSelect}
    />
  );

  const renderExamScreen = () => {
    return (
      <View style={styles.container}>
        {/* Gerçek Sınav Modu — Geri Sayım */}
        {realExamMode && realExamTimeLeft !== null && (
          <View style={[styles.timerBar, {
            backgroundColor: realExamTimeLeft < 300 ? "#ef444420" : colors.moduleExamLabPrimary + "15",
            borderBottomColor: realExamTimeLeft < 300 ? "#ef444440" : colors.moduleExamLabPrimary + "30",
          }]}>
            <Ionicons name="timer-outline" size={14} color={realExamTimeLeft < 300 ? "#ef4444" : colors.moduleExamLabPrimary} />
            <Text style={[styles.timerText, { color: realExamTimeLeft < 300 ? "#ef4444" : colors.moduleExamLabPrimary }]}>
              {t("examLab.realExam.timeLeft")}: {String(Math.floor(realExamTimeLeft / 60)).padStart(2, "0")}:{String(realExamTimeLeft % 60).padStart(2, "0")}
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={[styles.examHeader, { backgroundColor: colors.card, borderBottomColor: colors.borderSubtle }]}>
        <View style={styles.examHeaderTop}>
          <View style={styles.examHeaderLeft}>
            <View style={[styles.examIconContainer, { backgroundColor: colors.moduleExamLabLight }]}>
              <Ionicons name="document-text" size={20} color={colors.moduleExamLabPrimary} />
            </View>
            <View>
              <Text style={[styles.examHeaderTitle, { color: colors.textPrimary }]}>
                {selectedTopic || t("examLab.exam")}
              </Text>
              <Text style={[styles.examHeaderSubtitle, { color: colors.textSecondary }]}>
                {questions.length} {t("examLab.question")}
              </Text>
            </View>
          </View>
          <View style={[styles.progressIndicator, { backgroundColor: colors.moduleExamLabLight }]}>
            <Text style={[styles.progressText, { color: colors.moduleExamLabPrimary }]}>
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
          </View>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                backgroundColor: colors.moduleExamLabPrimary,
              },
            ]}
          />
        </View>
      </View>

      {/* Questions FlatList */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={questions}
          renderItem={renderQuestionCard}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={styles.questionsList}
          getItemLayout={(_data, index) => ({
            length: CARD_WIDTH + SPACING.md,
            offset: (CARD_WIDTH + SPACING.md) * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
            });
          }}
        />
      </View>

      {/* Navigation Buttons */}
      <View style={[styles.navigationContainer, { backgroundColor: colors.card, borderTopColor: colors.borderSubtle }]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonSecondary,
            {
              backgroundColor: currentQuestionIndex === 0 ? colors.surfaceMuted : colors.backgroundSecondary,
              borderColor: currentQuestionIndex === 0 ? colors.borderSubtle : colors.borderSubtle,
              opacity: currentQuestionIndex === 0 ? 0.5 : 1,
            },
          ]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={18} 
            color={currentQuestionIndex === 0 ? colors.textTertiary : colors.textPrimary} 
          />
          <Text style={[styles.navButtonTextSecondary, { color: currentQuestionIndex === 0 ? colors.textTertiary : colors.textPrimary }]}>
            {t("examLab.previous")}
          </Text>
        </TouchableOpacity>

        {(() => {
          const currentQuestion = questions[currentQuestionIndex];
          const isAnswered = currentQuestion && !!showFeedback[currentQuestion.id];
          const isLast = currentQuestionIndex === questions.length - 1;
          const btnColor = isLast
            ? colors.success
            : isAnswered
            ? colors.moduleExamLabPrimary
            : colors.moduleExamLabPrimary + "60";
          return (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary, { backgroundColor: btnColor }]}
              onPress={handleNextQuestion}
            >
              <Text style={styles.navButtonText}>
                {isLast ? t("examLab.finish") : t("examLab.next")}
              </Text>
              {!isLast && <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />}
            </TouchableOpacity>
          );
        })()}
      </View>
    </View>
    );
  };

  return (
    <NotebookBackground cornerGlyphs={["α", "β"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ModuleHeader
        title={t("modules.examLab.title")}
        modulePrimary={colors.moduleExamLabPrimary}
        moduleLight={colors.moduleExamLabLight}
        onBackPress={screen === "exam" ? handleExitExam : () => router.canDismiss() ? router.dismiss() : router.replace("/(main)")}
        rightAction={
          isLoggedIn && !isPremium && usageInfo ? (
            <MinimalUsageBadge
              used={usageInfo.used}
              limit={usageInfo.limit}
              modulePrimary={colors.moduleExamLabPrimary}
            />
          ) : undefined
        }
      />

      {screen === "selection" ? renderSelectionScreen() : renderExamScreen()}
      {renderReportModal()}
      {renderExamTypeModal()}

      {/* AI Loading Modal */}
      <AILoadingModal visible={loading} type="exam" />

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => { setShowPremiumModal(false); setPremiumModalIsProGate(false); }}
        moduleType="exam_lab"
        usageInfo={premiumModalIsProGate ? undefined : usageInfo}
      />
    </NotebookBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  popularSection: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  popularTitle: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 11,
    opacity: 0.7,
  },
  popularScrollContent: {
    gap: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  popularChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
  },
  popularChipText: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "500",
  },
  inputSection: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.titleSmall,
    fontWeight: "700",
    marginBottom: SPACING.md,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    ...SHADOWS.subtle,
  },
  inputIcon: {
    marginRight: SPACING.xs,
  },
  textInput: {
    ...TEXT_STYLES.bodyMedium,
    flex: 1,
    paddingVertical: SPACING.xs,
    fontSize: 15,
  },
  submitButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  methodSelector: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  inputArea: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  textInputArea: {
    ...TEXT_STYLES.bodyMedium,
    padding: SPACING.md,
    height: 48,
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
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: BORDER_RADIUS.md,
  },
  imagePlaceholder: {
    width: "100%",
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  placeholderText: {
    ...TEXT_STYLES.bodySmall,
    textAlign: "center",
  },
  photoTopicHint: {
    ...TEXT_STYLES.bodySmall,
    textAlign: "center",
    marginTop: SPACING.sm,
    fontStyle: "italic",
  },
  removeButton: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
  },
  loadingText: {
    ...TEXT_STYLES.bodySmall,
  },
  optionsSection: {
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  optionGroup: {
    gap: SPACING.sm,
  },
  optionLabel: {
    ...TEXT_STYLES.labelMedium,
    fontWeight: "600",
    fontSize: 14,
  },
  chipRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  quickCountButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  quickCountButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  quickCountButtonText: {
    ...TEXT_STYLES.labelMedium,
    fontWeight: "700",
    fontSize: 15,
  },
  lockedCountContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  examHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.sm,
  },
  examHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  examHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  examIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  examHeaderTitle: {
    ...TEXT_STYLES.titleSmall,
    fontWeight: "700",
    marginBottom: 1,
    fontSize: 16,
  },
  examHeaderSubtitle: {
    ...TEXT_STYLES.bodySmall,
    fontSize: 11,
  },
  progressIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  progressText: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "700",
    fontSize: 11,
  },
  progressBar: {
    height: 4,
    borderRadius: BORDER_RADIUS.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: BORDER_RADIUS.sm,
  },
  questionsList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  questionCardScroll: {
    width: CARD_WIDTH,
    marginRight: SPACING.md,
    flex: 1,
  },
  questionCard: {
    width: "100%",
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.small,
  },
  questionCardContent: {
    paddingBottom: SPACING.sm,
  },
  questionHeader: {
    marginBottom: SPACING.md,
  },
  questionNumberBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
  },
  questionNumber: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "700",
    fontSize: 11,
  },
  questionTextContainer: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  questionText: {
    ...TEXT_STYLES.titleMedium,
    fontWeight: "600",
    lineHeight: 22,
    fontSize: 16,
  },
  optionsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  optionBase: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 48,
    justifyContent: "center",
  },
  option: {
    // Base style - handled inline
  },
  optionSelected: {
    // Handled inline
  },
  optionCorrect: {
    // Handled inline
  },
  optionIncorrect: {
    // Handled inline
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flex: 1,
  },
  optionLabelBadge: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  optionLabelText: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "700",
    fontSize: 12,
  },
  optionText: {
    ...TEXT_STYLES.bodyMedium,
    flex: 1,
    lineHeight: 20,
    fontWeight: "500",
    fontSize: 14,
  },
  optionIcon: {
    marginLeft: SPACING.sm,
    flexShrink: 0,
  },
  feedbackContainer: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  feedbackIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  feedbackTextContainer: {
    flex: 1,
    gap: 2,
  },
  feedbackText: {
    ...TEXT_STYLES.titleSmall,
    fontWeight: "700",
    fontSize: 14,
  },
  feedbackSubtext: {
    ...TEXT_STYLES.bodySmall,
    fontSize: 12,
    marginTop: 1,
  },
  explanationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: "flex-start",
    marginTop: SPACING.xs,
    ...SHADOWS.small,
  },
  explanationButtonText: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "600",
    color: "#FFFFFF",
    fontSize: 13,
  },
  explanationContainer: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  explanationTitle: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "700",
    fontSize: 13,
  },
  explanationText: {
    ...TEXT_STYLES.bodySmall,
    lineHeight: 20,
    fontSize: 13,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    gap: SPACING.sm,
    marginTop: -SPACING.xl,
    marginBottom: SPACING.md,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
  },
  navButtonPrimary: {
    flex: 1,
    ...SHADOWS.small,
  },
  navButtonSecondary: {
    borderWidth: 1.5,
    flex: 0,
    minWidth: 75,
  },
  navButtonText: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 14,
  },
  navButtonTextSecondary: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: "600",
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  statisticsContainer: {
    gap: SPACING.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.titleSmall,
    fontWeight: "700",
    fontSize: 18,
  },
  statLabel: {
    ...TEXT_STYLES.bodySmall,
    fontSize: 12,
    marginTop: 2,
  },
  // ── Devam Et Kartı ──
  resumeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
  },
  resumeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  resumeIconBox: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  resumeTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  resumeSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  resumeRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  // ── Konu Analizi (Zayıflık Haritası) — eski stiller, tutarlılık için kalabilir ──
  weakTopicsSection: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  weakTopicsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  weakTopicsEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  weakTopicsEmptyText: {
    fontSize: 13,
    fontWeight: "500",
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    flexWrap: "wrap",
  },
  topicDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topicName: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  topicScore: {
    fontSize: 12,
  },
  topicBarBg: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  topicBarFill: {
    height: 4,
    borderRadius: 2,
  },
  wrongQuestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  wrongQuestionNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  wrongQuestionNumText: {
    fontSize: 11,
    fontWeight: "700",
  },
  wrongQuestionText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  // ── Mod Seçici (segmented control — matematik ile aynı) ──
  segment: {
    flexDirection: "row",
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: 3,
    gap: 3,
    marginTop: SPACING.md,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: SPACING.sm + 1,
    borderRadius: BORDER_RADIUS.lg,
  },
  segmentText: { fontSize: 13, fontWeight: "600" },
  // ── Flashcard Ekranı ──
  flashcardArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  flashcardTouchable: {
    width: "100%",
    aspectRatio: 0.75,
    maxHeight: 420,
  },
  flashcardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.lg,
    backfaceVisibility: "hidden",
    ...SHADOWS.small,
  },
  flashcardFront: {},
  flashcardBack: {},
  flashcardHidden: {
    opacity: 0,
  },
  flashcardLabel: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    position: "absolute",
    top: SPACING.md,
  },
  flashcardLabelText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  flashcardText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 26,
  },
  flashcardHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "absolute",
    bottom: SPACING.md,
  },
  flashcardHintText: {
    fontSize: 11,
  },
  examTypeSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  examTypeSelectorIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  examTypeSelectorFlag: {
    fontSize: 20,
  },
  examTypeSelectorText: {
    flex: 1,
    gap: 2,
  },
  examTypeSelectorLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  examTypeSelectorValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  examTypeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  examTypeModalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "80%",
    paddingBottom: SPACING.xl,
  },
  examTypeModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  examTypeModalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  examTypeCountrySection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  examTypeCountryLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  examTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: 6,
  },
  examTypeOptionFlag: {
    fontSize: 18,
    width: 28,
    textAlign: "center",
  },
  examTypeOptionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  examTypeReadyCard: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  examTypeReadyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  examTypeReadyFlag: {
    fontSize: 28,
  },
  examTypeReadyTextWrap: {
    flex: 1,
    gap: 2,
  },
  examTypeReadyTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  examTypeReadyDesc: {
    fontSize: 12,
  },
  examTypeHint: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm, marginTop: SPACING.xs,
  },
  examTypeHintText: { fontSize: 12, flex: 1 },
  examTypeTopicInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  subjectChipWrapper: {
    position: "relative",
  },
  subjectChipRow: {
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },

  subjectChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1.5,
  },
  subjectChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  examTypePhotoRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  examTypePhotoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  examTypePhotoBtnText: {
    fontSize: 13,
    fontWeight: "500",
  },
  examTypeImagePreview: {
    position: "relative",
    alignSelf: "flex-start",
  },
  examTypeImageThumb: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
  },
  examTypeImageRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  configSection: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  configSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  createButtonWrapper: {
    marginTop: SPACING.sm,
  },
  createButtonDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  createButtonDividerLine: {
    flex: 1,
    height: 1,
  },
  createButtonDividerText: {
    fontSize: 11,
    fontWeight: "500",
    paddingHorizontal: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // ── Rapor Tam Ekran ──────────────────────────────────────────
  reportFullScreen: { flex: 1 },
  reportHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 4,
    borderBottomWidth: 1,
  },
  reportHeaderTitle: { fontSize: 16, fontWeight: "700" },
  reportScrollContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
  reportHeroCard: {
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.md, gap: SPACING.md,
  },
  reportHeroTop: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm },
  reportHeroTopRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, flexWrap: "wrap" },
  reportHeroScoreBlock: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  reportHeroRight: { flex: 1, gap: 6 },
  reportHeroEmoji: { fontSize: 36 },
  reportHeroMeta: { flex: 1, gap: 4 },
  reportExamTypeBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  reportExamTypeBadgeFlag: { fontSize: 12 },
  reportExamTypeBadgeText: { fontSize: 11, fontWeight: "700" },
  reportHeroTopic: { fontSize: 15, fontWeight: "700" },
  reportHeroPerf: { fontSize: 13, fontWeight: "600" },
  reportScoreRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  reportBigPercent: { fontSize: 48, fontWeight: "800", lineHeight: 54 },
  reportScoreRight: { flex: 1, gap: 6 },
  reportScoreBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  reportScoreBarFill: { height: 8, borderRadius: 4 },
  reportScoreFraction: { fontSize: 12 },
  reportStatGrid: {
    flexDirection: "row", alignItems: "center",
    paddingTop: SPACING.sm, marginTop: SPACING.xs,
    borderTopWidth: 1,
  },
  reportStatItem: { flex: 1, alignItems: "center", gap: 3 },
  reportStatNum: { fontSize: 16, fontWeight: "700" },
  reportStatLabel: { fontSize: 10, textAlign: "center" },
  reportStatDivider: { width: 1, height: 32, opacity: 0.5 },
  reportShareBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.xs, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, marginBottom: SPACING.md,
  },
  reportShareBtnText: { fontSize: 14, fontWeight: "600" },
  reportPerfectBanner: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1,
    marginBottom: SPACING.md,
  },
  reportPerfectEmoji: { fontSize: 24 },
  reportPerfectText: { fontSize: 14, fontWeight: "600", flex: 1 },
  reportSection: { marginBottom: SPACING.md },
  reportSectionHeader: {
    flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginBottom: SPACING.sm,
  },
  reportSectionDot: { width: 8, height: 8, borderRadius: 4 },
  reportSectionTitle: { fontSize: 14, fontWeight: "700" },
  reportSkippedCard: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, borderWidth: 1, marginBottom: 6,
  },
  reportSkippedBadge: {
    width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  reportSkippedNum: { fontSize: 11, fontWeight: "700" },
  reportSkippedText: { flex: 1, fontSize: 13 },
  reportCorrectCard: {
    flexDirection: "row", alignItems: "flex-start", gap: SPACING.xs,
    padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, borderWidth: 1, marginBottom: 6,
  },
  reportCorrectText: { flex: 1, fontSize: 13, lineHeight: 18 },
  reportFooter: {
    gap: SPACING.sm, padding: SPACING.md,
    borderTopWidth: 1,
  },
  reportErrorNotebookBtn: {
    flexDirection: "row", alignItems: "center", gap: SPACING.xs,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1,
  },
  reportErrorNotebookText: { flex: 1, fontSize: 13, fontWeight: "600" },
  reportRetryBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1,
  },
  reportRetryBtnText: { fontSize: 13, fontWeight: "600" },
  reportProTag: {
    backgroundColor: "#8B5CF6", borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  reportProTagText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  reportFreeTag: {
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
  },
  reportFreeTagText: { fontSize: 10, fontWeight: "700" },

  // ── Progress Banner (Hata Defteri & Hakimiyet kısayolu) ──────────────
  progressBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
  },
  progressBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flex: 1,
  },
  progressBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  progressBannerDesc: {
    fontSize: 12,
  },

  // ── Top Cards Row ────────────────────────────────────────────────────
  topCardsRow: {
    flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.md,
  },
  quickCard: {
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    alignItems: "center", justifyContent: "center",
    gap: 4, overflow: "hidden", minHeight: 80,
  },
  quickCardGlow: {
    position: "absolute", width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#fff",
  },
  quickCardTitle: { color: "#fff", fontSize: 12, fontWeight: "700", textAlign: "center" },
  quickCardBadge: {
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  quickCardBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  // ── Quick Pill ───────────────────────────────────────────────────────
  quickPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  quickPillText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // ── Quick Sheet ──────────────────────────────────────────────────────
  quickSheetOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)",
  },
  quickSheetContainer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.lg, paddingBottom: SPACING.xl + 8,
    gap: SPACING.md,
  },
  quickSheetHandle: {
    width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4,
  },
  quickSheetHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  quickSheetIconWrap: {
    width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center",
  },
  quickSheetTitle: { fontSize: 16, fontWeight: "700" },
  quickSheetSub: { fontSize: 12, marginTop: 2 },
  quickSheetWarn: { fontSize: 13, textAlign: "center", paddingVertical: SPACING.sm },
  quickSheetLabel: { fontSize: 12, fontWeight: "600", marginBottom: -4 },
  quickSubjChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round, borderWidth: 1,
  },
  quickSubjChipText: { fontSize: 13, fontWeight: "600" },
  quickSheetBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.xs, borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md, marginTop: 4,
  },
  quickSheetBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // ── Quick Drill Button ───────────────────────────────────────────────
  quickDrillBtn: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  quickDrillIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  quickDrillText: { flex: 1 },
  quickDrillTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  quickDrillDesc: { fontSize: 12 },
  quickDrillBadge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  quickDrillBadgeText: { color: "#fff", fontSize: 13, fontWeight: "800" },

  // ── Real Exam Timer Bar ───────────────────────────────────────────────
  timerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
  },
  timerText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Real Exam Mode Section ────────────────────────────────────────────
  realExamSection: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  realExamHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  realExamTitle: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  realExamActiveBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  realExamActiveBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  realExamSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  realExamPresets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  presetChip: {
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 2,
  },
  presetChipLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  presetChipMeta: {
    fontSize: 11,
  },

  // ── Login CTA Banner ─────────────────────────────────────────────────
  loginCtaBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  loginCtaIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  loginCtaText: {
    flex: 1,
  },
  loginCtaTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  loginCtaDesc: {
    fontSize: 12,
  },
});

const selStyles = StyleSheet.create({
  // ── Hızlı Erişim 2'li Grid ──────────────────────────────────────────
  quickRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickTile: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    gap: 4,
  },
  quickTileIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  quickTileTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  quickTileDesc: {
    fontSize: 11,
  },

  // ── Adım Satırı ──────────────────────────────────────────────────────
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Sınav Türü Butonu ────────────────────────────────────────────────
  examTypeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    marginBottom: SPACING.xs,
  },
  examTypeBtnIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  examTypeBtnValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },

  // ── Inline Input (konu yazma) ────────────────────────────────────────
  inlineInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    gap: SPACING.xs,
  },
  inlineInputText: {
    fontSize: 14,
    paddingVertical: 10,
  },
  inlineInputIcon: {
    padding: 4,
  },

  // ── Spesifik sınav konu kartı ────────────────────────────────────────
  subjectCard: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },

  // ── Ayarlar Özet Badge ───────────────────────────────────────────────
  settingsSummary: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  settingsSummaryText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // ── Ayarlar Panel ────────────────────────────────────────────────────
  settingsPanel: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },

  // ── Sticky Footer CTA ────────────────────────────────────────────────
  stickyFooter: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
});


