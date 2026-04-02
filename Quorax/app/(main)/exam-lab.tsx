import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
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

import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { InfoCard } from "@/components/common/InfoCard";
import { MinimalUsageBadge } from "@/components/common/MinimalUsageBadge";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import { AILoadingModal } from "@/components/common/AILoadingModal";
import { PremiumModal } from "@/components/common/PremiumModal";
import { BORDER_RADIUS, SHADOWS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useAd } from "@/contexts/AdContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useImagePicker } from "@/hooks/useImagePicker";
import { supabase, SUPABASE_URL, TABLES } from "@/services/supabase";
import { showError, showWarning } from "@/utils/toast";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;

type Screen = "selection" | "exam" | "flashcard";
type AppMode = "exam" | "flashcard";

interface Flashcard {
  front: string;
  back: string;
}

interface Question {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation?: string;
}

// ── Yanlış Soru Accordion Kartı ──────────────────────────────────────────────
function WrongQuestionCard({
  question, userAnswer, colors, t, userLanguage, userId,
}: {
  question: Question;
  userAnswer: string;
  colors: any;
  t: any;
  userLanguage: string;
  userId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExp, setLoadingExp] = useState(false);

  const correctOption = question.options.find((o) => o.label === question.correctAnswer);
  const userOption = question.options.find((o) => o.label === userAnswer);

  const handleExplain = async () => {
    if (explanation) { setExpanded((v) => !v); return; }
    setExpanded(true);
    setLoadingExp(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          problemText: question.question,
          userId: userId || "anonymous",
          userLanguage,
          mode: "explain",
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
    <View style={[wcStyles.card, { borderColor: colors.error + "25", backgroundColor: colors.error + "06" }]}>
      {/* Soru satırı */}
      <View style={wcStyles.row}>
        <View style={[wcStyles.wrongBadge, { backgroundColor: colors.error + "20" }]}>
          <Ionicons name="close" size={12} color={colors.error} />
        </View>
        <Text style={[wcStyles.questionText, { color: colors.textPrimary }]} numberOfLines={expanded ? undefined : 2}>
          {question.question}
        </Text>
      </View>
      {/* Cevap karşılaştırması */}
      <View style={wcStyles.answersRow}>
        <View style={[wcStyles.answerChip, { backgroundColor: colors.error + "15" }]}>
          <Text style={[wcStyles.answerLabel, { color: colors.error }]}>{t("examLab.report.yourAnswer")}: </Text>
          <Text style={[wcStyles.answerText, { color: colors.error }]}>{userAnswer}. {userOption?.text}</Text>
        </View>
        <View style={[wcStyles.answerChip, { backgroundColor: colors.success + "15" }]}>
          <Text style={[wcStyles.answerLabel, { color: colors.success }]}>{t("examLab.report.correctAnswer")}: </Text>
          <Text style={[wcStyles.answerText, { color: colors.success }]}>{question.correctAnswer}. {correctOption?.text}</Text>
        </View>
      </View>
      {/* AI Açıklama butonu */}
      <TouchableOpacity
        style={[wcStyles.explainBtn, { borderColor: colors.moduleExamLabPrimary + "50" }]}
        onPress={handleExplain}
        activeOpacity={0.7}
      >
        {loadingExp
          ? <ActivityIndicator size="small" color={colors.moduleExamLabPrimary} />
          : <Ionicons name={expanded && explanation ? "chevron-up-outline" : "bulb-outline"} size={14} color={colors.moduleExamLabPrimary} />
        }
        <Text style={[wcStyles.explainBtnText, { color: colors.moduleExamLabPrimary }]}>
          {loadingExp ? t("examLab.report.explaining") : expanded && explanation ? t("examLab.report.hideExplanation") : t("examLab.report.explainWithAI")}
        </Text>
      </TouchableOpacity>
      {/* Açıklama içeriği */}
      {expanded && explanation && (
        <View style={[wcStyles.explanationBox, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[wcStyles.explanationText, { color: colors.textSecondary }]}>{explanation}</Text>
        </View>
      )}
    </View>
  );
}

const wcStyles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, gap: SPACING.xs },
  row: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.xs },
  wrongBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  questionText: { flex: 1, fontSize: 13, fontWeight: "500", lineHeight: 18 },
  answersRow: { gap: 4 },
  answerChip: { flexDirection: "row", padding: SPACING.xs, borderRadius: BORDER_RADIUS.sm, flexWrap: "wrap" },
  answerLabel: { fontSize: 11, fontWeight: "700" },
  answerText: { fontSize: 11, flex: 1 },
  explainBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, alignSelf: "flex-start" },
  explainBtnText: { fontSize: 12, fontWeight: "600" },
  explanationBox: { padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm },
  explanationText: { fontSize: 13, lineHeight: 19 },
});


export default function ExamLabScreen() {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { pickFromGallery, takePhoto, loading: imageLoading } = useImagePicker();
  const { user, isLoggedIn } = useAuth();
  const { checkUsageLimit, isPremium } = useSubscription();
  const { showAdBeforeAction } = useAd();

  const [screen, setScreen] = useState<Screen>("selection");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
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
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(isPremium ? "medium" : "easy");
  const [questionCount, setQuestionCount] = useState<number>(5);
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
  const [appMode, setAppMode] = useState<AppMode>("exam");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef<FlatList>(null);
  const reportSavedRef = useRef(false);

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

  // Mock questions - Backend'den gelecek
  const mockQuestions: Question[] = [
    {
      id: 1,
      question: "f(x) = x² + 3x - 2 fonksiyonunun türevi nedir?",
      options: [
        { label: "A", text: "2x + 3" },
        { label: "B", text: "2x - 3" },
        { label: "C", text: "x + 3" },
        { label: "D", text: "x² + 3" },
      ],
      correctAnswer: "A",
      explanation: "Türev kuralına göre: f'(x) = 2x + 3",
    },
    {
      id: 2,
      question: "lim(x→0) (sin x / x) değeri nedir?",
      options: [
        { label: "A", text: "0" },
        { label: "B", text: "1" },
        { label: "C", text: "∞" },
        { label: "D", text: "Tanımsız" },
      ],
      correctAnswer: "B",
      explanation: "Bu temel limit değeri 1'e eşittir.",
    },
    {
      id: 3,
      question: "2x + 5 = 13 denkleminin çözümü nedir?",
      options: [
        { label: "A", text: "x = 3" },
        { label: "B", text: "x = 4" },
        { label: "C", text: "x = 5" },
        { label: "D", text: "x = 6" },
      ],
      correctAnswer: "B",
      explanation: "2x = 13 - 5 = 8, dolayısıyla x = 4",
    },
    {
      id: 4,
      question: "∫(2x + 3)dx integralinin sonucu nedir?",
      options: [
        { label: "A", text: "x² + 3x + C" },
        { label: "B", text: "x² + 3x" },
        { label: "C", text: "2x² + 3x + C" },
        { label: "D", text: "x² + 3" },
      ],
      correctAnswer: "A",
      explanation: "İntegral kuralına göre: ∫(2x + 3)dx = x² + 3x + C",
    },
    {
      id: 5,
      question: "f(x) = x³ - 2x fonksiyonunun x = 1 noktasındaki türevi nedir?",
      options: [
        { label: "A", text: "1" },
        { label: "B", text: "2" },
        { label: "C", text: "3" },
        { label: "D", text: "0" },
      ],
      correctAnswer: "A",
      explanation: "f'(x) = 3x² - 2, f'(1) = 3(1)² - 2 = 1",
    },
  ];

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
      setLoadingTopic(null);
      Alert.alert(
        t("modules.locked"),
        t("profile.loginToContinue")
      );
      return;
    }

    // ✅ Check usage limit before creating exam
    if (!isPremium) {
      const usage = await checkUsageLimit('exam_lab');
      if (usage && !usage.allowed) {
        setLoading(false);
        setLoadingTopic(null);
        setUsageInfo(usage);
        openLimitModal();
        return;
      }
    }

    // Topic'i max 6 kelime ile sınırla
    const limitedTopic = topic.split(' ').slice(0, 6).join(' ');
    setSelectedTopic(limitedTopic);
    setLoadingTopic(limitedTopic);
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
          explanation: q.explanation || "",
        };
      });

      setQuestions(formattedQuestions);
      setScreen("exam");
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowFeedback({});
      setShowExplanation({});
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
      setLoadingTopic(null);
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

  const flipCard = (toBack: boolean) => {
    Animated.timing(flipAnim, {
      toValue: toBack ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setCardFlipped(toBack));
  };

  const handleFlipCard = () => {
    flipCard(!cardFlipped);
  };

  const handleCardNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      flipAnim.setValue(0);
      setCardFlipped(false);
      setCurrentCardIndex((i) => i + 1);
    }
  };

  const handleCardPrev = () => {
    if (currentCardIndex > 0) {
      flipAnim.setValue(0);
      setCardFlipped(false);
      setCurrentCardIndex((i) => i - 1);
    }
  };

  const handleCreateFlashcards = async () => {
    if (inputMethod === "topic" && !customTopic.trim()) {
      showWarning(t("examLab.errors.emptyTopic"), t("examLab.errors.emptyTopicMessage"));
      return;
    }
    if (inputMethod === "photo" && !selectedImage) {
      showWarning(t("examLab.errors.noImage"), t("examLab.errors.noImageMessage"));
      return;
    }

    if (!isLoggedIn || !user?.id) {
      Alert.alert(t("modules.locked"), t("profile.loginToContinue"));
      return;
    }

    if (!isPremium) {
      const usage = await checkUsageLimit("exam_lab");
      if (usage && !usage.allowed) {
        setUsageInfo(usage);
        openLimitModal();
        return;
      }
    }

    setLoadingFlashcards(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const userLanguage = i18n.language || "tr";
      const body: any = { userId: user.id, userLanguage, cardCount: questionCount };
      if (inputMethod === "photo" && selectedImage) {
        body.topicImageUrl = await convertImageToBase64(selectedImage);
      } else {
        body.topic = customTopic.trim();
      }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
        throw new Error(t("examLab.errors.failedMessage"));
      }

      setFlashcards(data.flashcards);
      setCurrentCardIndex(0);
      flipAnim.setValue(0);
      setCardFlipped(false);
      setScreen("flashcard");
    } catch (err: any) {
      showError(t("examLab.errors.failed"), err.message || t("examLab.errors.failedMessage"));
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const handleCreateExam = async () => {
    if (inputMethod === "topic" && !customTopic.trim()) {
      setLoading(false);
      showWarning(
        t("examLab.errors.emptyTopic"),
        t("examLab.errors.emptyTopicMessage")
      );
      return;
    }

    if (inputMethod === "photo" && !selectedImage) {
      setLoading(false);
      showWarning(
        t("examLab.errors.noImage"),
        t("examLab.errors.noImageMessage")
      );
      return;
    }

    try {
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
      setLoadingTopic(null);
      showError(
        t("examLab.errors.failed"),
        error.message || t("examLab.errors.failedMessage")
      );
    }
  };


  const canCreateExam =
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

  const handleShowExplanation = (questionId: number) => {
    setShowExplanation((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: nextIndex, 
          animated: true,
          viewPosition: 0.5
        });
      }, 100);
    } else {
      // Son soru, raporu göster
      setShowReportModal(true);
    }
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

  // Rapor ilk açıldığında exam_results'a kaydet (geçmiş işlemlerde görünsün)
  useEffect(() => {
    if (!showReportModal || !user?.id || reportSavedRef.current || questions.length === 0) return;

    const topicTitle = selectedTopic || t("examLab.exam");
    let correctCount = 0;
    const reportRows: {
      questionText: string;
      userAnswer: string;
      correctAnswer: string;
      correct: boolean;
      options: { label: string; text: string }[];
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
    });

    reportSavedRef.current = true;
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
  }, [showReportModal, user?.id, questions, selectedAnswers, selectedTopic, t]);

  const handleCloseReport = () => {
    setShowReportModal(false);
    setScreen("selection");
    setQuestions([]);
    setSelectedAnswers({});
    setShowFeedback({});
    setShowExplanation({});
    setCurrentQuestionIndex(0);
    reportSavedRef.current = false;
  };

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
            setSavedExam({
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
            setShowExplanation({});
            setCurrentQuestionIndex(0);
          },
        }] : []),
        {
          text: t("examLab.exitConfirmLeave"),
          style: "destructive",
          onPress: () => {
            setSavedExam(null);
            setScreen("selection");
            setQuestions([]);
            setSelectedAnswers({});
            setShowFeedback({});
            setShowExplanation({});
            setCurrentQuestionIndex(0);
          },
        },
      ]
    );
  };

  // Android donanım geri tuşu: sınav ekranındayken aynı onayı göster, ana sayfaya gitme
  useEffect(() => {
    if (screen !== "exam") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleExitExam();
      return true;
    });
    return () => sub.remove();
  }, [screen, t]);

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

  const renderReportModal = () => {
    const results = calculateExamResults();
    const scoreColor = results.percentage >= 80 ? colors.success : results.percentage >= 50 ? colors.moduleExamLabPrimary : colors.error;
    const wrongQuestions = questions.filter((q) => selectedAnswers[q.id] && selectedAnswers[q.id] !== q.correctAnswer);
    const correctQuestions = questions.filter((q) => selectedAnswers[q.id] === q.correctAnswer);

    return (
      <Modal visible={showReportModal} animationType="slide" transparent onRequestClose={handleCloseReport}>
        <View style={styles.modalOverlay}>
          <View style={[styles.reportModalContent, { backgroundColor: colors.card }, SHADOWS.small]}>

            {/* Header */}
            <View style={styles.reportModalHeader}>
              <Text style={[styles.reportModalTitle, { color: colors.textPrimary }]}>
                {t("examLab.report.title")}
              </Text>
              <TouchableOpacity onPress={handleCloseReport} style={styles.reportCloseButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.reportModalBody} showsVerticalScrollIndicator={false}>

              {/* ── Skor Kartı ── */}
              <View style={[styles.scoreCard, { backgroundColor: scoreColor + "12", borderColor: scoreColor }]}>
                {/* Büyük yüzde */}
                <View style={styles.scoreBigCircle}>
                  <Text style={[styles.scorePercentage, { color: scoreColor }]}>{results.percentage}%</Text>
                  <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                    {results.percentage >= 80 ? t("examLab.report.excellent") : results.percentage >= 50 ? t("examLab.report.good") : t("examLab.report.needsImprovement")}
                  </Text>
                </View>
                {/* Progress bar */}
                <View style={[styles.scoreBar, { backgroundColor: colors.borderSubtle }]}>
                  <View style={[styles.scoreBarFill, { backgroundColor: scoreColor, width: `${results.percentage}%` as any }]} />
                </View>
                {/* İstatistikler */}
                <View style={styles.scoreStats}>
                  <View style={styles.scoreStatItem}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={[styles.scoreStatNum, { color: colors.textPrimary }]}>{results.correct}</Text>
                    <Text style={[styles.scoreStatLabel, { color: colors.textSecondary }]}>{t("examLab.report.correct")}</Text>
                  </View>
                  <View style={[styles.scoreStatDivider, { backgroundColor: colors.borderSubtle }]} />
                  <View style={styles.scoreStatItem}>
                    <Ionicons name="close-circle" size={16} color={colors.error} />
                    <Text style={[styles.scoreStatNum, { color: colors.textPrimary }]}>{results.incorrect}</Text>
                    <Text style={[styles.scoreStatLabel, { color: colors.textSecondary }]}>{t("examLab.report.incorrect")}</Text>
                  </View>
                  {results.unanswered > 0 && (
                    <>
                      <View style={[styles.scoreStatDivider, { backgroundColor: colors.borderSubtle }]} />
                      <View style={styles.scoreStatItem}>
                        <Ionicons name="remove-circle-outline" size={16} color={colors.textTertiary} />
                        <Text style={[styles.scoreStatNum, { color: colors.textPrimary }]}>{results.unanswered}</Text>
                        <Text style={[styles.scoreStatLabel, { color: colors.textSecondary }]}>{t("examLab.report.unanswered")}</Text>
                      </View>
                    </>
                  )}
                  <View style={[styles.scoreStatDivider, { backgroundColor: colors.borderSubtle }]} />
                  <View style={styles.scoreStatItem}>
                    <Ionicons name="list-outline" size={16} color={colors.moduleExamLabPrimary} />
                    <Text style={[styles.scoreStatNum, { color: colors.textPrimary }]}>{results.total}</Text>
                    <Text style={[styles.scoreStatLabel, { color: colors.textSecondary }]}>{t("examLab.report.total")}</Text>
                  </View>
                </View>
              </View>

              {/* ── Yanlış Sorular — Accordion + AI Açıklama ── */}
              {wrongQuestions.length > 0 && (
                <View style={styles.wrongSection}>
                  <Text style={[styles.wrongSectionTitle, { color: colors.textPrimary }]}>
                    {t("examLab.report.wrongAnswers")}
                  </Text>
                  {wrongQuestions.map((q) => (
                    <WrongQuestionCard
                      key={q.id}
                      question={q}
                      userAnswer={selectedAnswers[q.id]}
                      colors={colors}
                      t={t}
                      userLanguage={i18n.language || "tr"}
                      userId={user?.id}
                    />
                  ))}
                </View>
              )}

              {/* Tüm doğru */}
              {wrongQuestions.length === 0 && (
                <View style={[styles.allCorrectBanner, { backgroundColor: colors.success + "15" }]}>
                  <Ionicons name="trophy" size={22} color={colors.success} />
                  <Text style={[styles.allCorrectText, { color: colors.success }]}>
                    {t("examLab.report.weakTopicsEmpty")}
                  </Text>
                </View>
              )}

            </ScrollView>

            <View style={styles.reportModalFooter}>
              <Button
                title={t("examLab.report.newExam")}
                onPress={handleCloseReport}
                variant="primary"
                fullWidth
                icon="refresh-outline"
                iconPosition="left"
                modulePrimary={colors.moduleExamLabPrimary}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSelectionScreen = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <InfoCard
        title={t("examLab.info.title")}
        content={t("examLab.info.content")}
        modulePrimary="#F59E0B"
      />

      {/* ── Mod Seçici: Sınav / Flashcard ── */}
      <View style={[styles.segment, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderSubtle }]}>
        {(["exam", "flashcard"] as AppMode[]).map((m) => {
          const active = appMode === m;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.segmentBtn, active && { backgroundColor: colors.moduleExamLabPrimary }]}
              onPress={() => setAppMode(m)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={m === "exam" ? "document-text-outline" : "albums-outline"}
                size={14}
                color={active ? "#fff" : colors.textSecondary}
              />
              <Text style={[styles.segmentText, { color: active ? "#fff" : colors.textSecondary }]}>
                {t(m === "exam" ? "examLab.flashcard.mode.exam" : "examLab.flashcard.mode.flashcard")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Devam Et Kartı ── */}
      {savedExam && (
        <TouchableOpacity
          style={[styles.resumeCard, { backgroundColor: colors.moduleExamLabLight, borderColor: colors.moduleExamLabPrimary }]}
          onPress={() => {
            setSelectedTopic(savedExam.topic);
            setQuestions(savedExam.questions);
            setSelectedAnswers(savedExam.answers);
            setShowFeedback(savedExam.feedback);
            setShowExplanation({});
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
              onPress={(e) => { e.stopPropagation(); setSavedExam(null); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={20} color={colors.moduleExamLabPrimary + "80"} />
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={18} color={colors.moduleExamLabPrimary} />
          </View>
        </TouchableOpacity>
      )}

      {/* Popular Topics */}
      <View style={styles.popularSection}>
        <Text style={[styles.popularTitle, { color: colors.textSecondary }]}>
          {t("examLab.popularTopics")}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularScrollContent}
        >
          {(t("examLab.popularTopicsItems", { returnObjects: true }) as string[]).map((topic) => (
            <TouchableOpacity
              key={topic}
              style={[
                styles.popularChip,
                {
                  backgroundColor: customTopic === topic ? colors.moduleExamLabLight : colors.backgroundSecondary,
                  borderColor: customTopic === topic ? colors.moduleExamLabPrimary : colors.borderSubtle,
                },
              ]}
              onPress={() => { setCustomTopic(topic); setInputMethod("topic"); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.popularChipText, { color: customTopic === topic ? colors.moduleExamLabPrimary : colors.textSecondary }]}>
                {topic}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        {/* Method Selector */}
        <View style={styles.methodSelector}>
          <Chip
            label={t("examLab.input.topic")}
            icon="book-outline"
            selected={inputMethod === "topic"}
            flex={true}
            modulePrimary={colors.moduleExamLabPrimary}
            moduleLight={colors.moduleExamLabLight}
            onPress={() => {
              setInputMethod("topic");
              setSelectedImage(null);
              setImageSource(null);
            }}
          />
          <Chip
            label={t("examLab.input.gallery")}
            icon="image-outline"
            selected={inputMethod === "photo" && imageSource === "gallery"}
            flex={true}
            modulePrimary={colors.moduleExamLabPrimary}
            moduleLight={colors.moduleExamLabLight}
            onPress={handleImagePicker}
          />
          <Chip
            label={t("examLab.input.camera")}
            icon="camera-outline"
            selected={inputMethod === "photo" && imageSource === "camera"}
            flex={true}
            modulePrimary={colors.moduleExamLabPrimary}
            moduleLight={colors.moduleExamLabLight}
            onPress={handlePhotoCapture}
          />
        </View>

        {/* Input Area */}
        {inputMethod === "topic" ? (
          <View
            style={[
              styles.inputArea,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <TextInput
              style={[styles.textInputArea, { color: colors.textPrimary }]}
              placeholder={t("examLab.customTopic.placeholder")}
              placeholderTextColor={colors.textTertiary}
              value={customTopic}
              onChangeText={(text) => {
                // Maksimum 6 kelime
                const words = text.trim().split(/\s+/);
                if (words.length <= 6) {
                  setCustomTopic(text);
                } else {
                  setCustomTopic(words.slice(0, 6).join(" "));
                  showWarning(t("examLab.customTopic.wordLimit"), t("examLab.customTopic.wordLimitMessage"));
                }
              }}
              returnKeyType="done"
              maxLength={50}
            />
          </View>
        ) : (
          <View
            style={[
              styles.inputArea,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            {selectedImage ? (
              <View style={styles.imageArea}>
                <Image source={{ uri: selectedImage }} style={styles.image} />
                <TouchableOpacity
                  onPress={handleClearImage}
                  style={[
                    styles.removeButton,
                    { backgroundColor: colors.error },
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={colors.textOnPrimary}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="camera-outline"
                  size={48}
                  color={colors.textTertiary}
                />
                <Text
                  style={[
                    styles.placeholderText,
                    { color: colors.textTertiary },
                  ]}
                >
                  {t("examLab.photoCapture.placeholder")}
                </Text>
              </View>
            )}
          </View>
        )}

        {inputMethod === "photo" && (
          <Text style={[styles.photoTopicHint, { color: colors.textSecondary }]}>
            {t("examLab.photoTopicDetected")}
          </Text>
        )}

        {/* Image Loading */}
        {imageLoading && (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <ActivityIndicator size="small" color={colors.moduleExamLabPrimary} />
            <Text
              style={[styles.loadingText, { color: colors.textSecondary }]}
            >
              {t("common.loading")}
            </Text>
          </View>
        )}

        {/* Difficulty and Question Count Selector */}
        <View style={styles.optionsSection}>
          {/* Difficulty Selector */}
          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
              {t("examLab.difficulty")}
            </Text>
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
                  if (!isPremium) { openProGate(); return; }
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
                  if (!isPremium) { openProGate(); return; }
                  setDifficulty("hard");
                }}
              />
            </View>
          </View>

          {/* Question Count Selector */}
          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
              {t("examLab.questionCount")} ({questionCount})
            </Text>
            <View style={styles.quickCountButtons}>
              {[5, 10, 15, 20].map((count) => {
                const locked = !isPremium && count > 5;
                const selected = questionCount === count;
                return (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.quickCountButton,
                      {
                        backgroundColor: selected ? colors.moduleExamLabPrimary : colors.backgroundSecondary,
                        borderColor: selected ? colors.moduleExamLabPrimary : colors.borderSubtle,
                        opacity: locked ? 0.55 : 1,
                      },
                    ]}
                    onPress={() => {
                      if (locked) { openProGate(); return; }
                      setQuestionCount(count);
                    }}
                  >
                    {locked && (
                      <Ionicons name="lock-closed" size={10} color={colors.textTertiary} style={{ marginRight: 2 }} />
                    )}
                    <Text style={[styles.quickCountButtonText, { color: selected ? colors.textOnPrimary : colors.textPrimary }]}>
                      {count}
                    </Text>
                    {locked && (
                      <View style={styles.proTagInline}>
                        <Text style={styles.proTagInlineText}>PRO</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Create Button - exam veya flashcard moduna göre */}
        {appMode === "exam" ? (
          <Button
            title={t("examLab.createExam")}
            onPress={() => {
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
        ) : (
          <Button
            title={t("examLab.flashcard.button")}
            onPress={() => showAdBeforeAction(handleCreateFlashcards, "exam")}
            disabled={!canCreateExam || loadingFlashcards}
            loading={loadingFlashcards}
            icon="albums-outline"
            iconPosition="left"
            fullWidth
            variant="primary"
            size="large"
            modulePrimary={colors.moduleExamLabPrimary}
          />
        )}
      </View>
    </ScrollView>
  );

  const renderQuestionCard = ({ item, index }: { item: Question; index: number }) => {
    const isSelected = selectedAnswers[item.id];
    const isCorrect = isSelected === item.correctAnswer;
    const showFeedbackForThis = showFeedback[item.id];
    const showExplanationForThis = showExplanation[item.id];

    return (
      <ScrollView
        style={styles.questionCardScroll}
        contentContainerStyle={styles.questionCardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
        {/* Soru Metni */}
        <View style={styles.questionTextContainer}>
          <Text style={[styles.questionText, { color: colors.textPrimary }]}>
            {item.question}
          </Text>
        </View>

        {/* Şıklar */}
        <View style={styles.optionsContainer}>
          {item.options.map((option) => {
            const isSelectedOption = isSelected === option.label;
            const isCorrectOption = option.label === item.correctAnswer;
            let optionStyle = styles.option;
            let optionTextStyle = { color: colors.textPrimary };
            let icon = null;

            if (showFeedbackForThis) {
              if (isSelectedOption) {
                if (isCorrect) {
                  optionStyle = [styles.option, styles.optionCorrect, { backgroundColor: colors.success + "20", borderColor: colors.success }];
                  optionTextStyle = { color: colors.success };
                  icon = <Ionicons name="checkmark-circle" size={20} color={colors.success} />;
                } else {
                  optionStyle = [styles.option, styles.optionIncorrect, { backgroundColor: colors.error + "20", borderColor: colors.error }];
                  optionTextStyle = { color: colors.error };
                  icon = <Ionicons name="close-circle" size={20} color={colors.error} />;
                }
              } else if (isCorrectOption) {
                optionStyle = [styles.option, styles.optionCorrect, { backgroundColor: colors.success + "20", borderColor: colors.success }];
                optionTextStyle = { color: colors.success };
                icon = <Ionicons name="checkmark-circle" size={20} color={colors.success} />;
              }
            } else {
              if (isSelectedOption) {
                optionStyle = [styles.option, styles.optionSelected, { backgroundColor: colors.moduleExamLabLight, borderColor: colors.moduleExamLabPrimary }];
                optionTextStyle = { color: colors.moduleExamLabPrimary };
              }
            }

            return (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.optionBase,
                  optionStyle,
                  {
                    backgroundColor: 
                      showFeedbackForThis && isCorrectOption
                        ? colors.success + "15"
                        : showFeedbackForThis && isSelectedOption && !isCorrect
                        ? colors.error + "15"
                        : isSelectedOption && !showFeedbackForThis
                        ? colors.moduleExamLabLight
                        : colors.surfaceMuted,
                    borderColor: 
                      showFeedbackForThis && isCorrectOption
                        ? colors.success
                        : showFeedbackForThis && isSelectedOption && !isCorrect
                        ? colors.error
                        : isSelectedOption && !showFeedbackForThis
                        ? colors.moduleExamLabPrimary
                        : colors.borderSubtle,
                    borderWidth: showFeedbackForThis || isSelectedOption ? 2 : 1.5,
                  },
                ]}
                onPress={() => handleAnswerSelect(item.id, option.label)}
                activeOpacity={0.7}
                disabled={showFeedbackForThis}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <View 
                      style={[
                        styles.optionLabelBadge, 
                        { 
                          backgroundColor: 
                            showFeedbackForThis && isCorrectOption
                              ? colors.success
                              : showFeedbackForThis && isSelectedOption && !isCorrect
                              ? colors.error
                              : isSelectedOption && !showFeedbackForThis
                              ? colors.moduleExamLabPrimary
                              : colors.moduleExamLabPrimary + "20"
                        }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.optionLabelText, 
                          { 
                            color: 
                              showFeedbackForThis && (isCorrectOption || isSelectedOption)
                                ? "#FFFFFF"
                                : isSelectedOption && !showFeedbackForThis
                                ? "#FFFFFF"
                                : colors.moduleExamLabPrimary
                          }
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, optionTextStyle]} numberOfLines={3}>
                      {option.text?.trim() || "—"}
                    </Text>
                  </View>
                  {icon && <View style={styles.optionIcon}>{icon}</View>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Geri Bildirim */}
        {showFeedbackForThis && (
          <View
            style={[
              styles.feedbackContainer,
              {
                backgroundColor: isCorrect ? colors.success + "08" : colors.error + "08",
                borderLeftColor: isCorrect ? colors.success : colors.error,
                borderLeftWidth: 4,
              },
            ]}
          >
            <View style={styles.feedbackHeader}>
              <View 
                style={[
                  styles.feedbackIconContainer,
                  { backgroundColor: isCorrect ? colors.success + "20" : colors.error + "20" }
                ]}
              >
                <Ionicons
                  name={isCorrect ? "checkmark-circle" : "close-circle"}
                  size={28}
                  color={isCorrect ? colors.success : colors.error}
                />
              </View>
              <View style={styles.feedbackTextContainer}>
                <Text
                  style={[
                    styles.feedbackText,
                    { color: isCorrect ? colors.success : colors.error },
                  ]}
                >
                  {isCorrect
                    ? t("examLab.correct")
                    : t("examLab.incorrect")}
                </Text>
                {isCorrect && (
                  <Text style={[styles.feedbackSubtext, { color: colors.textSecondary }]}>
                    {t("examLab.correctSubtext")}
                  </Text>
                )}
              </View>
            </View>

            {/* Açıklama */}
            {showExplanationForThis && item.explanation && (
              <View style={[styles.explanationContainer, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.explanationHeader}>
                  <Ionicons name="information-circle" size={20} color={colors.moduleExamLabPrimary} />
                  <Text style={[styles.explanationTitle, { color: colors.textPrimary }]}>
                    {t("examLab.explanation")}
                  </Text>
                </View>
                <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
                  {item.explanation}
                </Text>
              </View>
            )}
          </View>
        )}
        </View>
      </ScrollView>
    );
  };

  const renderFlashcardScreen = () => {
    const card = flashcards[currentCardIndex];
    if (!card) return null;

    const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
    const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.examHeader, { backgroundColor: colors.card, borderBottomColor: colors.borderSubtle }]}>
          <View style={styles.examHeaderTop}>
            <View style={styles.examHeaderLeft}>
              <View style={[styles.examIconContainer, { backgroundColor: colors.moduleExamLabLight }]}>
                <Ionicons name="albums" size={20} color={colors.moduleExamLabPrimary} />
              </View>
              <View>
                <Text style={[styles.examHeaderTitle, { color: colors.textPrimary }]}>
                  {t("examLab.flashcard.title")}
                </Text>
                <Text style={[styles.examHeaderSubtitle, { color: colors.textSecondary }]}>
                  {selectedTopic || customTopic}
                </Text>
              </View>
            </View>
            <View style={[styles.progressIndicator, { backgroundColor: colors.moduleExamLabLight }]}>
              <Text style={[styles.progressText, { color: colors.moduleExamLabPrimary }]}>
                {currentCardIndex + 1}/{flashcards.length}
              </Text>
            </View>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
            <View style={[styles.progressFill, {
              width: `${((currentCardIndex + 1) / flashcards.length) * 100}%`,
              backgroundColor: colors.moduleExamLabPrimary,
            }]} />
          </View>
        </View>

        {/* Flip Card Area */}
        <View style={styles.flashcardArea}>
          <TouchableOpacity onPress={handleFlipCard} activeOpacity={0.95} style={styles.flashcardTouchable}>
            {/* Front */}
            <Animated.View style={[styles.flashcardFace, styles.flashcardFront,
              { backgroundColor: colors.card, borderColor: colors.moduleExamLabPrimary + "40", transform: [{ rotateY: frontInterpolate }] },
              cardFlipped && styles.flashcardHidden,
            ]}>
              <View style={[styles.flashcardLabel, { backgroundColor: colors.moduleExamLabLight }]}>
                <Text style={[styles.flashcardLabelText, { color: colors.moduleExamLabPrimary }]}>
                  {t("examLab.flashcard.front")}
                </Text>
              </View>
              <Text style={[styles.flashcardText, { color: colors.textPrimary }]}>{card.front}</Text>
              <View style={styles.flashcardHint}>
                <Ionicons name="sync-outline" size={16} color={colors.textTertiary} />
                <Text style={[styles.flashcardHintText, { color: colors.textTertiary }]}>
                  {t("examLab.flashcard.flip")}
                </Text>
              </View>
            </Animated.View>

            {/* Back */}
            <Animated.View style={[styles.flashcardFace, styles.flashcardBack,
              { backgroundColor: colors.moduleExamLabLight, borderColor: colors.moduleExamLabPrimary, transform: [{ rotateY: backInterpolate }] },
              !cardFlipped && styles.flashcardHidden,
            ]}>
              <View style={[styles.flashcardLabel, { backgroundColor: colors.moduleExamLabPrimary + "20" }]}>
                <Text style={[styles.flashcardLabelText, { color: colors.moduleExamLabPrimary }]}>
                  {t("examLab.flashcard.back")}
                </Text>
              </View>
              <Text style={[styles.flashcardText, { color: colors.textPrimary }]}>{card.back}</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={[styles.navigationContainer, { backgroundColor: colors.card, borderTopColor: colors.borderSubtle }]}>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonSecondary, {
              backgroundColor: currentCardIndex === 0 ? colors.surfaceMuted : colors.backgroundSecondary,
              borderColor: colors.borderSubtle,
              opacity: currentCardIndex === 0 ? 0.5 : 1,
            }]}
            onPress={handleCardPrev}
            disabled={currentCardIndex === 0}
          >
            <Ionicons name="chevron-back" size={18} color={currentCardIndex === 0 ? colors.textTertiary : colors.textPrimary} />
            <Text style={[styles.navButtonTextSecondary, { color: currentCardIndex === 0 ? colors.textTertiary : colors.textPrimary }]}>
              {t("examLab.flashcard.previous")}
            </Text>
          </TouchableOpacity>

          {currentCardIndex === flashcards.length - 1 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary, { backgroundColor: colors.success }]}
              onPress={() => {
                Alert.alert(
                  t("examLab.flashcard.finishTitle"),
                  t("examLab.flashcard.finishMessage", { count: flashcards.length }),
                  [
                    {
                      text: t("examLab.flashcard.restartCards"),
                      onPress: () => { flipAnim.setValue(0); setCardFlipped(false); setCurrentCardIndex(0); },
                    },
                    {
                      text: t("examLab.flashcard.exitCards"),
                      style: "default",
                      onPress: () => { setScreen("selection"); setFlashcards([]); setCurrentCardIndex(0); },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.navButtonText}>{t("examLab.flashcard.finish")}</Text>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary, { backgroundColor: colors.moduleExamLabPrimary }]}
              onPress={handleCardNext}
            >
              <Text style={styles.navButtonText}>{t("examLab.flashcard.next")}</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderExamScreen = () => {
    const screenHeight = Dimensions.get("window").height;
    const headerHeight = 100; // Approximate header height
    const navHeight = 80; // Approximate navigation height
    const availableHeight = screenHeight - headerHeight - navHeight;

    return (
      <View style={styles.container}>
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
          getItemLayout={(data, index) => ({
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

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            {
              backgroundColor:
                currentQuestionIndex === questions.length - 1
                  ? colors.success
                  : colors.moduleExamLabPrimary,
            },
          ]}
          onPress={handleNextQuestion}
        >
          <Text style={styles.navButtonText}>
            {currentQuestionIndex === questions.length - 1
              ? t("examLab.finish")
              : t("examLab.next")}
          </Text>
          {currentQuestionIndex < questions.length - 1 && (
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ModuleHeader
        title={t("modules.examLab.title")}
        modulePrimary={colors.moduleExamLabPrimary}
        moduleLight={colors.moduleExamLabLight}
        onBackPress={screen === "exam" ? handleExitExam : screen === "flashcard" ? () => { setScreen("selection"); setFlashcards([]); setCurrentCardIndex(0); } : () => router.canDismiss() ? router.dismiss() : router.replace("/(main)")}
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

      {screen === "selection" ? renderSelectionScreen() : screen === "flashcard" ? renderFlashcardScreen() : renderExamScreen()}
      {renderReportModal()}

      {/* AI Loading Modals */}
      <AILoadingModal visible={loading} type="exam" />
      <AILoadingModal visible={loadingFlashcards} type="flashcard" />

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => { setShowPremiumModal(false); setPremiumModalIsProGate(false); }}
        moduleType="exam_lab"
        usageInfo={premiumModalIsProGate ? undefined : usageInfo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
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
  proTagInline: {
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
    marginLeft: 3,
  },
  proTagInlineText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
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
  reportModalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "70%",
    paddingBottom: SPACING.md,
  },
  reportModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  reportModalTitle: {
    ...TEXT_STYLES.titleMedium,
    fontWeight: "700",
    fontSize: 18,
  },
  reportCloseButton: {
    padding: SPACING.xs,
  },
  reportModalBody: {
    padding: SPACING.md,
  },
  reportModalFooter: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  scoreCard: {
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
    flexDirection: "column",
    gap: SPACING.sm,
  },
  scorePercentage: {
    fontSize: 24,
    fontWeight: "700",
  },
  scoreLabel: {
    ...TEXT_STYLES.bodyMedium,
    fontWeight: "600",
    fontSize: 14,
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
  // ── Yeni Skor Kartı ──
  scoreBigCircle: {
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  scoreBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: 6,
    borderRadius: 3,
  },
  scoreStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    flexWrap: "wrap",
  },
  scoreStatItem: {
    alignItems: "center",
    gap: 2,
  },
  scoreStatNum: {
    fontSize: 18,
    fontWeight: "700",
  },
  scoreStatLabel: {
    fontSize: 11,
  },
  scoreStatDivider: {
    width: 1,
    height: 32,
  },
  // ── Yanlış Sorular Bölümü ──
  wrongSection: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  wrongSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  allCorrectBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  allCorrectText: {
    fontSize: 14,
    fontWeight: "600",
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
    ...SHADOWS.medium,
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
});

