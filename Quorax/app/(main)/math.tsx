import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  I18nManager,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { MinimalUsageBadge } from "@/components/common/MinimalUsageBadge";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import { AILoadingModal } from "@/components/common/AILoadingModal";
import { PremiumModal } from "@/components/common/PremiumModal";
import { BORDER_RADIUS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useActivity } from "@/contexts/ActivityContext";
import { useAd } from "@/contexts/AdContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";
import FunctionGraph, { containsFunctionExpression } from "@/components/math/FunctionGraph";
import MathText from "@/components/math/MathText";
import MathSymbolBar from "@/components/math/MathSymbolBar";
import { formatTopicDisplay } from "@/utils/topicLabel";
import { useImagePicker } from "@/hooks/useImagePicker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { supabase, SUPABASE_URL } from "@/services/supabase";
import { showError, showWarning } from "@/utils/toast";

type InputMethod = "text" | "image";
type AppMode = "solve" | "verify";

interface VerifyResult {
  result: string;
  steps: Array<{ text: string; isCorrect: boolean }>;
  error: string;
  tip: string;
}

export default function MathScreen() {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { prefillProblem, autoSolve } = useLocalSearchParams<{ prefillProblem?: string; autoSolve?: string }>();
  const { pickFromGallery, takePhoto, loading: imageLoading } = useImagePicker();
  const { user, isLoggedIn } = useAuth();
  const { checkUsageLimit, isPremium } = useSubscription();
  const { showAdBeforeAction } = useAd();
  const { refreshActivities } = useActivity();
  const scrollViewRef = useRef<any>(null);
  const solveButtonScale = useRef(new Animated.Value(1)).current;

  // — Mod —
  const [appMode, setAppMode] = useState<AppMode>("solve");

  // — Problem girişi —
  const [inputMethod, setInputMethod] = useState<InputMethod>("text");
  const [imageSource, setImageSource] = useState<"gallery" | "camera" | null>(null);
  const [problem, setProblem] = useState("");
  const [problemSelection, setProblemSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const problemInputRef = useRef<TextInput>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // — Çözüm girişi (Doğrula modu) —
  const [solutionMethod, setSolutionMethod] = useState<InputMethod>("text");
  const [solutionImageSource, setSolutionImageSource] = useState<"gallery" | "camera" | null>(null);
  const [userSolutionText, setUserSolutionText] = useState("");
  const [solutionImage, setSolutionImage] = useState<string | null>(null);

  // — İşlem durumu —
  const [solving, setSolving] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumModalIsProGate, setPremiumModalIsProGate] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);

  const openProGate = () => { setPremiumModalIsProGate(true); setShowPremiumModal(true); };
  const openLimitModal = () => { setPremiumModalIsProGate(false); setShowPremiumModal(true); };

  // — Çözüm sonuçları —
  const [solution, setSolution] = useState<{
    answer: string;
    steps: string[];
    explanation?: string;
  } | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [solutionKey, setSolutionKey] = useState(0);
  const [solutionId, setSolutionId] = useState<string | null>(null);
  const [comprehension, setComprehension] = useState<'understood' | 'not_understood' | null>(null);
  const [topicExplanation, setTopicExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  // Per-step "why?" explanations — keyed by step index so taps are independent
  const [stepExplanations, setStepExplanations] = useState<Record<number, { text?: string; loading?: boolean }>>({});
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());


  // — Konu analizinden gelen prefill + otomatik çöz —
  // Race condition fix: problem state'ini beklemek yerine handleSolveWithText kullan
  const autoSolveTriggered = useRef(false);
  useEffect(() => {
    if (!prefillProblem || autoSolveTriggered.current || !isLoggedIn || !user?.id) return;
    setProblem(prefillProblem);
    setInputMethod("text");
    if (autoSolve === 'true') {
      autoSolveTriggered.current = true;
      const t = setTimeout(() => {
        // prefillProblem'i direkt kullan — problem state'inin settle olmasını bekleme
        showAdBeforeAction(() => handleSolve(prefillProblem), "math");
      }, 150);
      return () => clearTimeout(t);
    }
  }, [prefillProblem, autoSolve, isLoggedIn, user?.id]); // eslint-disable-line

  // — Mod geçişi —
  const switchMode = useCallback((mode: AppMode) => {
    setAppMode(mode);
    setSolution(null);
    setTopic(null);
    setRelatedQuestions([]);
    setVerifyResult(null);
    setLastError(null);
    if (mode === "solve") {
      setSolutionMethod("text");
      setSolutionImageSource(null);
      setSolutionImage(null);
      setUserSolutionText("");
    }
  }, []);

  const convertImageToBase64 = useCallback(async (uri: string): Promise<string> => {
    if (uri.startsWith("data:image")) return uri;
    // Resize to max 1024px wide + base64 encode in one step
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: SaveFormat.JPEG, base64: true }
    );
    return `data:image/jpeg;base64,${result.base64}`;
  }, []);

  const parseSolution = useCallback((raw: string) => {
    if (!raw?.trim()) return { answer: raw || "", steps: [], explanation: "" };
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return { answer: raw, steps: [], explanation: "" };

    const isStepLine = (l: string) => /^\d+[.)]\s+.+/.test(l);

    // Cevap tespiti:
    // İlk satır adım gibi görünüyorsa veya çok uzunsa (>80 karakter = muhtemelen açıklama),
    // ilk adımdan önce gelen kısa satırı cevap al.
    let answerRaw = lines[0];
    if (isStepLine(answerRaw) || answerRaw.length > 80) {
      const firstStepIdx = lines.findIndex(isStepLine);
      if (firstStepIdx > 0) {
        // İlk adımdan önceki satırlar içinden en kısa olanı al (açıklama değil, sonuç)
        const candidates = lines.slice(0, firstStepIdx);
        answerRaw = candidates.reduce((a, b) => (a.length <= b.length ? a : b));
      }
    }

    const answer = answerRaw
      .replace(/^(Cevap|Answer|Sonuç|Result|Yanıt)[:\s]+/i, "")
      .replace(/✓\s*$/, "")
      .trim();

    // İlk satırı atla (cevap satırı), adımları ve açıklamayı topla
    // indexOf yerine findIndex: aynı içerik birden fazla kez geçse bile doğru satırı bulur
    const startIdx = lines.findIndex((l) => l === answerRaw) + 1;
    const steps: string[] = [];
    let explanation = "";
    let inExp = false;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      // TOPIC:/KONU: markers are stripped at the edge; skip if any slips through
      if (/^(TOPIC|KONU):\s*/i.test(line)) continue;
      const sm = line.match(/^(\d+)[.)]\s+(.+)$/);
      if (sm && !inExp) {
        const st = sm[2].trim();
        if (st) steps.push(st);
      } else {
        if (steps.length) inExp = true;
        if (inExp) explanation = explanation ? `${explanation}\n\n${line}` : line;
        else steps.push(line);
      }
    }

    if (explanation) {
      explanation = explanation
        .replace(/^(Açıklama|Explanation|Explicación|شرح|व्याख्या|Genel|General):\s*/i, "")
        .trim();
      if (explanation.length < 20) explanation = "";
    }

    return { answer, steps, explanation };
  }, []);

  // Verify result uses language-neutral markers: RESULT:, STEPS:, ERROR:, HINT:
  // Correctness values (Correct/Wrong/Partial) are fixed English — AI is instructed to keep them as-is.
  // Legacy TR markers (SONUÇ:/ADIM ADIM:/HATA:/İPUCU:) kept for backward compat with cached/in-flight responses.
  const parseVerifyResult = useCallback((text: string): VerifyResult => {
    const resultRaw =
      text.match(/(?:RESULT|SONUÇ):\s*(.+)/i)?.[1]?.trim() ||
      t("math.verify.result.partial");
    const stepsSection =
      text.match(/(?:STEPS|ADIM ADIM):([\s\S]*?)(?:(?:ERROR|HATA|HINT|İPUCU):|$)/i)?.[1] || "";
    const steps: Array<{ text: string; isCorrect: boolean }> = [];
    stepsSection.split("\n").forEach((line) => {
      const m = line.match(/^\d+\.\s*(.+?):\s*(Correct|Wrong|Partial|Doğru|Yanlış)/i);
      if (m) steps.push({ text: m[1].trim(), isCorrect: /correct|doğru/i.test(m[2]) });
    });
    return {
      result: resultRaw,
      steps,
      error: text.match(/(?:ERROR|HATA):\s*(.+)/i)?.[1]?.trim() || "",
      tip: text.match(/(?:HINT|İPUCU):\s*(.+)/i)?.[1]?.trim() || "",
    };
  }, [t]);

  // — Problem görsel seçimi —
  const handleImagePicker = async () => {
    const uri = await pickFromGallery();
    if (uri) { setInputMethod("image"); setImageSource("gallery"); setSelectedImage(uri); setProblem(""); setSolution(null); setTopic(null); setRelatedQuestions([]); }
  };
  const handleCamera = async () => {
    const uri = await takePhoto();
    if (uri) { setInputMethod("image"); setImageSource("camera"); setSelectedImage(uri); setProblem(""); setSolution(null); setTopic(null); setRelatedQuestions([]); }
  };

  // — Çözüm görsel seçimi (Doğrula modu) —
  const handleSolutionGallery = async () => {
    const uri = await pickFromGallery();
    if (uri) { setSolutionMethod("image"); setSolutionImageSource("gallery"); setSolutionImage(uri); setUserSolutionText(""); }
  };
  const handleSolutionCamera = async () => {
    const uri = await takePhoto();
    if (uri) { setSolutionMethod("image"); setSolutionImageSource("camera"); setSolutionImage(uri); setUserSolutionText(""); }
  };

  const clearAll = () => {
    setSolution(null); setLastError(null);
    setTopic(null); setRelatedQuestions([]); setVerifyResult(null);
    setTopicExplanation(null); setSolutionId(null); setComprehension(null);
    setStepExplanations({}); setExpandedSteps(new Set());
  };

  // Toggle a step's inline "why?" expansion. Fetches once, caches thereafter.
  const handleStepToggle = useCallback(async (index: number, stepText: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });

    // If already fetched or currently fetching, do nothing.
    const existing = stepExplanations[index];
    if (existing?.text || existing?.loading) return;
    if (!user?.id || !solution) return;

    setStepExplanations(prev => ({ ...prev, [index]: { loading: true } }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("no session");

      // Build a focused context prompt so the Haiku explainer stays on the specific step.
      const ctx = [
        problem.trim() ? `Problem: ${problem.trim()}` : (topic ? `Topic: ${topic}` : ""),
        `Final answer: ${solution.answer}`,
        `Step ${index + 1}: ${stepText}`,
        `Explain in 1-2 concise sentences why this specific step is taken (the reasoning/rule behind it), not just what it does.`,
      ].filter(Boolean).join("\n");

      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        // solutionId + stepIndex enable persistent server-side caching of this step's explanation,
        // so re-taps on the same step across sessions don't rebill Haiku tokens.
        body: JSON.stringify({
          problemText: ctx,
          userId: user.id,
          userLanguage: i18n.language || "en",
          mode: "explain",
          solutionId,
          stepIndex: index,
        }),
      });
      const data = await res.json();
      setStepExplanations(prev => ({
        ...prev,
        [index]: { text: data.explanation || t("math.errors.solveFailed"), loading: false },
      }));
    } catch {
      setStepExplanations(prev => ({ ...prev, [index]: { text: t("math.errors.solveFailed"), loading: false } }));
    }
  }, [user?.id, solution, problem, topic, i18n.language, t, stepExplanations]);

  // — Çöz (overrideProblemText: race condition fix için) —
  const handleSolve = async (overrideProblemText?: string) => {
    if (!isLoggedIn || !user?.id) {
      Alert.alert(t("modules.locked"), t("profile.loginToContinue"), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.login"), onPress: () => router.push("/(main)/login") },
      ]);
      return;
    }
    if (inputMethod === "text" && !(overrideProblemText ?? problem).trim()) { showWarning(t("math.errors.emptyProblem"), t("math.errors.emptyProblemMessage")); return; }
    if (inputMethod === "image" && !selectedImage) { showWarning(t("math.errors.noImage"), t("math.errors.noImageMessage")); return; }

    try {
      setSolving(true); clearAll();
      if (!isPremium) {
        const usage = await checkUsageLimit("math");
        if (usage?.allowed === false) { setUsageInfo(usage); openLimitModal(); setSolving(false); return; }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session not found");

      const body: any = { userId: user.id, userLanguage: i18n.language || "en", mode: "solve" };
      if (inputMethod === "image" && selectedImage) body.problemImageUrl = await convertImageToBase64(selectedImage);
      else body.problemText = (overrideProblemText ?? problem).trim();

      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error === "USAGE_LIMIT_EXCEEDED") { setUsageInfo(data.usageInfo); openLimitModal(); return; }
      if (!res.ok || data.error) throw new Error(data.error || t("math.errors.solveFailed"));

      const parsed = parseSolution(data.solution);
      setSolution(parsed);
      setSolutionKey(k => k + 1);
      setSolutionId(data.solutionId || null);
      setComprehension(null);
      setTopic(data.topic || null);
      await refreshActivities();
      if (!isPremium) checkUsageLimit("math").then((d) => { if (d) setUsageInfo(d); }).catch(() => {});
    } catch (e: any) {
      setLastError(e.message); showError(t("common.error"), e.message);
    } finally {
      setSolving(false);
    }
  };

  // — Doğrula —
  const handleVerify = async () => {
    if (!isLoggedIn || !user?.id) {
      Alert.alert(t("modules.locked"), t("profile.loginToContinue"), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.login"), onPress: () => router.push("/(main)/login") },
      ]);
      return;
    }
    if (inputMethod === "text" && !problem.trim()) { showWarning(t("math.errors.emptyProblem"), t("math.errors.emptyProblemMessage")); return; }
    if (inputMethod === "image" && !selectedImage) { showWarning(t("math.errors.noImage"), t("math.errors.noImageMessage")); return; }
    if (solutionMethod === "text" && !userSolutionText.trim()) { showWarning(t("math.errors.emptySolution"), t("math.errors.emptySolutionMessage")); return; }
    if (solutionMethod === "image" && !solutionImage) { showWarning(t("math.errors.noSolutionImage"), t("math.errors.noSolutionImageMessage")); return; }

    try {
      setSolving(true); clearAll();
      if (!isPremium) {
        const usage = await checkUsageLimit("math");
        if (usage?.allowed === false) { setUsageInfo(usage); openLimitModal(); setSolving(false); return; }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session not found");

      const body: any = { userId: user.id, userLanguage: i18n.language || "en", mode: "verify" };
      if (inputMethod === "image" && selectedImage) body.problemImageUrl = await convertImageToBase64(selectedImage);
      else body.problemText = problem.trim();
      if (solutionMethod === "image" && solutionImage) body.userSolutionImageUrl = await convertImageToBase64(solutionImage);
      else body.userSolution = userSolutionText.trim();

      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error === "USAGE_LIMIT_EXCEEDED") { setUsageInfo(data.usageInfo); openLimitModal(); return; }
      if (!res.ok || data.error) throw new Error(data.error || t("math.errors.solveFailed"));

      setVerifyResult(parseVerifyResult(data.verification || ""));
      await refreshActivities();
      if (!isPremium) checkUsageLimit("math").then((d) => { if (d) setUsageInfo(d); }).catch(() => {});
    } catch (e: any) {
      setLastError(e.message); showError(t("common.error"), e.message);
    } finally {
      setSolving(false);
    }
  };

  // — Benzer Sorular —
  // Difficulty is nudged into the AI prompt — 'same' matches the current problem, 'easier' simplifies,
  // 'harder' raises complexity (larger numbers, extra constraints, deeper reasoning).
  type RelatedDifficulty = "easier" | "same" | "harder";
  const [relatedDifficulty, setRelatedDifficulty] = useState<RelatedDifficulty>("same");

  const handleFetchRelated = async (difficulty: RelatedDifficulty = relatedDifficulty) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !user?.id) return;

    // Build a language-neutral context string; AI respects userLanguage for output.
    let desc = problem.trim();
    if (!desc && solution) {
      const stepsSnippet = solution.steps.slice(0, 2).join(" | ");
      desc = topic
        ? `Topic: ${topic}. Answer: ${solution.answer}. Context: ${stepsSnippet}`
        : `Math problem with answer: ${solution.answer}. Context: ${stepsSnippet}`;
    }
    if (!desc) desc = topic ? `Example problem on topic: ${topic}` : "Basic algebra problem";

    // Append the difficulty nudge as a suffix so the MATH_RELATED prompt picks it up.
    const difficultyHint = difficulty === "easier"
      ? "Generate questions that are EASIER than the source problem (simpler numbers, one fewer step)."
      : difficulty === "harder"
      ? "Generate questions that are HARDER than the source problem (larger numbers, extra step or constraint)."
      : "Generate questions at the SAME difficulty as the source problem.";

    setRelatedDifficulty(difficulty);
    setLoadingRelated(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          // solutionId lets the server cache default-difficulty results on the solution row.
          // Easier/harder variants bypass cache (server detects this from the difficulty hint).
          solutionId,
          problemText: `${desc}\n\n${difficultyHint}`,
          userId: user.id,
          userLanguage: i18n.language || "en",
          mode: "related",
        }),
      });
      const data = await res.json();
      if (data.relatedQuestions?.length) {
        setRelatedQuestions(data.relatedQuestions);
      } else {
        showError(t("common.error"), data.error || t("math.related.failed"));
      }
    } catch (e: any) {
      showError(t("common.error"), e.message);
    } finally {
      setLoadingRelated(false);
    }
  };

  // — Kavrama feedback'i DB'ye kaydet —
  const handleComprehension = async (value: 'understood' | 'not_understood') => {
    setComprehension(value);
    if (!solutionId || !user?.id) return;
    const { error } = await supabase
      .from('math_solutions')
      .update({ comprehension_feedback: value })
      .eq('id', solutionId)
      .eq('user_id', user.id);
    if (error) console.warn('comprehension update failed:', error.message);
  };

  // — Konuyu Açıkla (explain mode — Haiku, ucuz) —
  const handleExplainAuto = async () => {
    if (!solution || !user?.id || loadingExplanation) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const problemDesc = problem.trim() || `Topic: ${topic || "general"}. Answer: ${solution.answer}`;
    setLoadingExplanation(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ problemText: problemDesc, userId: user.id, userLanguage: i18n.language || "en", mode: "explain" }),
      });
      const data = await res.json();
      if (data.explanation) setTopicExplanation(data.explanation);
    } catch {}
    finally { setLoadingExplanation(false); }
  };

  const handleExplain = async () => {
    if (topicExplanation) { setTopicExplanation(null); return; }
    handleExplainAuto();
  };

  const canSolve = appMode === "verify"
    ? (inputMethod === "text" ? !!problem.trim() : !!selectedImage) &&
      (solutionMethod === "text" ? !!userSolutionText.trim() : !!solutionImage)
    : (inputMethod === "text" ? !!problem.trim() : !!selectedImage);

  // Primary match: fixed English values from AI (Correct/Wrong/Partial).
  // Secondary: legacy TR + a few other languages in case the model translates anyway.
  const verifyColor = verifyResult
    ? /wrong|incorrect|yanlış|hatalı|incorrecto|خطأ|गलत/i.test(verifyResult.result) ? "#ef4444"
    : /partial|kısmen|parcial|جزئي|आंशिक/i.test(verifyResult.result) ? "#f59e0b"
    : /correct|doğru|correcto|صحيح|सही/i.test(verifyResult.result) ? "#22c55e"
    : "#f59e0b"
    : "#22c55e";

  // Localize the verify result label for display. AI returns fixed English tokens; map them to i18n.
  const localizedVerifyResult = verifyResult ? (
    /wrong|incorrect|yanlış|hatalı|incorrecto|خطأ|गलत/i.test(verifyResult.result) ? t("math.verify.result.wrong")
    : /partial|kısmen|parcial|جزئي|आंशिक/i.test(verifyResult.result) ? t("math.verify.result.partial")
    : /correct|doğru|correcto|صحيح|सही/i.test(verifyResult.result) ? t("math.verify.result.correct")
    : verifyResult.result
  ) : "";

  // ─── Yardımcı bileşenler ─────────────────────────────────────────────────

  const SectionLabel = ({ label, icon }: { label: string; icon: string }) => (
    <View style={styles.sectionLabelRow}>
      <Ionicons name={icon as any} size={13} color={colors.textTertiary} />
      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{label}</Text>
    </View>
  );

  // Animated step row — fades and slides in; tap to reveal an inline "why?" explanation.
  const AnimatedStep = React.memo(({
    step, index, modulePrimary, moduleLight, textColor,
    expanded, explanation, explanationLoading, onToggle,
  }: {
    step: string; index: number;
    modulePrimary: string; moduleLight: string; textColor: string;
    expanded: boolean; explanation?: string; explanationLoading?: boolean;
    onToggle: () => void;
  }) => {
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(18)).current;

    useEffect(() => {
      const delay = index * 90;
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 320, delay, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 9, delay, useNativeDriver: true }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <TouchableOpacity
          onPress={onToggle}
          activeOpacity={0.75}
          style={[styles.stepRow, { backgroundColor: colors.backgroundSecondary }]}
        >
          <View style={[styles.stepNum, { backgroundColor: moduleLight }]}>
            <Text style={[styles.stepNumText, { color: modulePrimary }]}>{index + 1}</Text>
          </View>
          <MathText
            text={step}
            style={[styles.stepText, { color: textColor }]}
          />
          <Ionicons
            name={expanded ? "chevron-up-outline" : "help-circle-outline"}
            size={16}
            color={modulePrimary}
            style={styles.stepWhyIcon}
          />
        </TouchableOpacity>
        {expanded && (
          <View style={[styles.stepWhyBox, { backgroundColor: moduleLight }]}>
            {explanationLoading ? (
              <View style={styles.stepWhyLoadingRow}>
                <ActivityIndicator size="small" color={modulePrimary} />
                <Text style={[styles.stepWhyLoadingText, { color: modulePrimary }]}>
                  {t("math.explaining")}
                </Text>
              </View>
            ) : (
              <Text style={[styles.stepWhyText, { color: colors.textPrimary }]}>
                {explanation}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    );
  });

  const ImageInputArea = ({
    imageSource: src,
    selectedImage: img,
    onGallery,
    onCamera,
    onClear,
  }: {
    imageSource: "gallery" | "camera" | null;
    selectedImage: string | null;
    onGallery: () => void;
    onCamera: () => void;
    onClear: () => void;
  }) => (
    <View style={styles.imageArea}>
      {img ? (
        <>
          <Image source={{ uri: img }} style={styles.image} />
          <TouchableOpacity onPress={onClear} style={[styles.imageClearBtn, { backgroundColor: colors.error }]}>
            <Ionicons name="close" size={14} color="#fff" />
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.imagePlaceholder}
          onPress={(src ?? "gallery") === "camera" ? onCamera : onGallery}
          activeOpacity={0.7}
        >
          <View style={[styles.imagePlaceholderIcon, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name={(src ?? "gallery") === "camera" ? "camera-outline" : "image-outline"} size={28} color={colors.textTertiary} />
          </View>
          <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
            {(src ?? "gallery") === "camera" ? t("math.tapToOpenCamera") : t("math.tapToLoadImage")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ModuleHeader
        title={t("modules.math.title")}
        modulePrimary={colors.moduleMathPrimary}
        moduleLight={colors.moduleMathLight}
        onBackPress={() => router.canDismiss() ? router.dismiss() : router.replace("/(main)")}
        rightAction={isLoggedIn && !isPremium && usageInfo ? (
          <MinimalUsageBadge used={usageInfo.used} limit={usageInfo.limit} modulePrimary={colors.moduleMathPrimary} />
        ) : undefined}
      />

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── History + Konu Analizi butonları ── */}
        {isLoggedIn && (
          <View style={styles.navBtnRow}>
            <TouchableOpacity
              style={[styles.navBtnHalf, { backgroundColor: colors.moduleMathLight, borderColor: colors.moduleMathPrimary + "30" }]}
              onPress={() => router.push("/(main)/math-history")}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={16} color={colors.moduleMathPrimary} />
              <Text style={[styles.topicsNavText, { color: colors.moduleMathPrimary }]} numberOfLines={1}>
                {t("mathHistory.title")}
              </Text>
              <Ionicons
                name="chevron-forward-outline"
                size={14}
                color={colors.moduleMathPrimary}
                style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtnHalf, { backgroundColor: colors.moduleMathLight, borderColor: colors.moduleMathPrimary + "30" }]}
              onPress={() => isPremium ? router.push("/(main)/math-topics") : openProGate()}
              activeOpacity={0.7}
            >
              <Ionicons name="analytics-outline" size={16} color={colors.moduleMathPrimary} />
              <Text style={[styles.topicsNavText, { color: colors.moduleMathPrimary }]} numberOfLines={1}>
                {t("math.topicAnalysis")}
              </Text>
              {!isPremium && <View style={styles.proTagStandalone}><Text style={styles.proTagStandaloneText}>PRO</Text></View>}
              <Ionicons
                name={isPremium ? "chevron-forward-outline" : "lock-closed-outline"}
                size={14}
                color={colors.moduleMathPrimary}
                style={isPremium && I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Mod Seçici ── */}
        <View style={[styles.segment, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderSubtle }]}>
          {(["solve", "verify"] as AppMode[]).map((m) => {
            const active = appMode === m;
            const isVerify = m === "verify";
            const verifyLocked = isVerify && !isPremium;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.segmentBtn, active && { backgroundColor: colors.moduleMathPrimary }]}
                onPress={() => verifyLocked ? openProGate() : switchMode(m)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={verifyLocked ? "lock-closed-outline" : m === "solve" ? "calculator-outline" : "checkmark-done-outline"}
                  size={14}
                  color={active ? "#fff" : colors.textSecondary}
                />
                <Text style={[styles.segmentText, { color: active ? "#fff" : colors.textSecondary }]}>
                  {t(m === "solve" ? "math.modeSolve" : "math.modeVerify")}
                </Text>
                {verifyLocked && (
                  <View style={styles.proTagSegment}>
                    <Text style={styles.proTagStandaloneText}>PRO</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Problem Kartı ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          <SectionLabel
            label={appMode === "verify" ? t("math.verify.result.stepCheck").replace("Adım ", "") || "Problem" : t("math.solve")}
            icon="help-circle-outline"
          />

          {/* Giriş yöntemi seçici */}
          <View style={styles.methodRow}>
            <Chip label={t("math.input.text")} icon="create-outline" selected={inputMethod === "text"} flex
              modulePrimary={colors.moduleMathPrimary} moduleLight={colors.moduleMathLight}
              onPress={() => { setInputMethod("text"); setSelectedImage(null); setImageSource(null); }}
            />
            <Chip label={t("math.input.gallery")} icon="image-outline" selected={imageSource === "gallery"} flex
              modulePrimary={colors.moduleMathPrimary} moduleLight={colors.moduleMathLight}
              onPress={() => { setInputMethod("image"); setImageSource("gallery"); setSelectedImage(null); }}
            />
            <Chip label={t("math.input.camera")} icon="camera-outline" selected={imageSource === "camera"} flex
              modulePrimary={colors.moduleMathPrimary} moduleLight={colors.moduleMathLight}
              onPress={() => { setInputMethod("image"); setImageSource("camera"); setSelectedImage(null); }}
            />
          </View>

          {/* El yazısı desteklenir hint — kamera veya galeri seçilince göster */}
          {inputMethod === "image" && (
            <View style={[styles.handwritingHint, { backgroundColor: colors.moduleMathLight }]}>
              <Ionicons name="pencil-outline" size={12} color={colors.moduleMathPrimary} />
              <Text style={[styles.handwritingHintText, { color: colors.moduleMathPrimary }]}>
                {t("math.handwritingSupported")}
              </Text>
            </View>
          )}

          {/* Symbol bar — text mode only, so users can enter ^, √, π, fractions, etc. */}
          {inputMethod === "text" && (
            <MathSymbolBar
              value={problem}
              selection={problemSelection}
              onChange={(next, caret) => {
                setProblem(next);
                setSolution(null); setTopic(null); setRelatedQuestions([]);
                // Defer caret positioning until after the value update is applied.
                setProblemSelection({ start: caret, end: caret });
                requestAnimationFrame(() => {
                  problemInputRef.current?.setNativeProps({ selection: { start: caret, end: caret } });
                  problemInputRef.current?.focus();
                });
              }}
              accentColor={colors.moduleMathPrimary}
              backgroundColor={colors.backgroundSecondary}
              keyColor={colors.card}
              textColor={colors.textPrimary}
            />
          )}

          {/* Giriş alanı */}
          <View style={[styles.inputBox, { borderColor: colors.borderSubtle, backgroundColor: colors.backgroundSecondary }]}>
            {inputMethod === "text" ? (
              <>
                <TextInput
                  ref={problemInputRef}
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder={appMode === "verify" ? "2x + 4 = 10" : t("math.placeholder")}
                  placeholderTextColor={colors.textTertiary}
                  value={problem}
                  onChangeText={(v) => { setProblem(v); setSolution(null); setTopic(null); setRelatedQuestions([]); }}
                  onSelectionChange={(e) => setProblemSelection(e.nativeEvent.selection)}
                  multiline
                  textAlignVertical="top"
                />
                {problem.length > 0 && (
                  <TouchableOpacity onPress={() => { setProblem(""); clearAll(); }}
                    style={[styles.inlineClear, { backgroundColor: colors.backgroundSecondary }]}>
                    <Ionicons name="close-circle-outline" size={17} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <ImageInputArea
                imageSource={imageSource}
                selectedImage={selectedImage}
                onGallery={handleImagePicker}
                onCamera={handleCamera}
                onClear={() => setSelectedImage(null)}
              />
            )}
          </View>

          {imageLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.moduleMathPrimary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t("common.loading")}</Text>
            </View>
          )}
        </View>

        {/* ── Çözüm Kartı (yalnızca Doğrula modunda) ── */}
        {appMode === "verify" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            <SectionLabel label={t("math.verify.sectionLabel")} icon="pencil-outline" />

            {/* Çözüm yöntemi */}
            <View style={styles.methodRow}>
              <Chip label={t("math.verify.inputMethod.text")} icon="create-outline" selected={solutionMethod === "text"} flex
                modulePrimary={colors.moduleMathPrimary} moduleLight={colors.moduleMathLight}
                onPress={() => { setSolutionMethod("text"); setSolutionImage(null); setSolutionImageSource(null); }}
              />
              <Chip label={t("math.verify.inputMethod.gallery")} icon="image-outline" selected={solutionImageSource === "gallery"} flex
                modulePrimary={colors.moduleMathPrimary} moduleLight={colors.moduleMathLight}
                onPress={() => { setSolutionMethod("image"); setSolutionImageSource("gallery"); setSolutionImage(null); }}
              />
              <Chip label={t("math.verify.inputMethod.camera")} icon="camera-outline" selected={solutionImageSource === "camera"} flex
                modulePrimary={colors.moduleMathPrimary} moduleLight={colors.moduleMathLight}
                onPress={() => { setSolutionMethod("image"); setSolutionImageSource("camera"); setSolutionImage(null); }}
              />
            </View>

            {/* Çözüm alanı */}
            <View style={[styles.inputBox, { borderColor: colors.borderSubtle, backgroundColor: colors.backgroundSecondary }]}>
              {solutionMethod === "text" ? (
                <>
                  <TextInput
                    style={[styles.textInput, styles.solutionInput, { color: colors.textPrimary }]}
                    placeholder={t("math.verify.placeholder")}
                    placeholderTextColor={colors.textTertiary}
                    value={userSolutionText}
                    onChangeText={setUserSolutionText}
                    multiline
                    textAlignVertical="top"
                  />
                  {userSolutionText.length > 0 && (
                    <TouchableOpacity onPress={() => setUserSolutionText("")}
                      style={[styles.inlineClear, { backgroundColor: colors.backgroundSecondary }]}>
                      <Ionicons name="close-circle-outline" size={17} color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <ImageInputArea
                  imageSource={solutionImageSource}
                  selectedImage={solutionImage}
                  onGallery={handleSolutionGallery}
                  onCamera={handleSolutionCamera}
                  onClear={() => setSolutionImage(null)}
                />
              )}
            </View>
          </View>
        )}

        {/* ── Buton ── */}
        <Animated.View style={{ transform: [{ scale: solveButtonScale }] }}>
          <Button
            title={appMode === "verify" ? t("math.verify.checkButton") : t("math.solve")}
            onPress={() => {
              if (!isPremium && usageInfo?.allowed === false) { openLimitModal(); return; }
              showAdBeforeAction(appMode === "verify" ? handleVerify : handleSolve, "math");
            }}
            disabled={!canSolve || solving}
            loading={solving}
            icon={appMode === "verify" ? "checkmark-done" : "checkmark-circle"}
            iconPosition="left"
            fullWidth
            variant="primary"
            size="large"
            modulePrimary={colors.moduleMathPrimary}
          />
        </Animated.View>

        {/* ── Hata ── */}
        {lastError && !solution && !verifyResult && (
          <View style={[styles.card, styles.errorCard, { borderColor: colors.error || "#ef4444" }]}>
            <View style={styles.row}>
              <Ionicons name="alert-circle" size={20} color={colors.error || "#ef4444"} />
              <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>{t("common.error")}</Text>
            </View>
            <Text style={[styles.errorBody, { color: colors.textSecondary }]}>{lastError}</Text>
            <Button title={t("math.retry")} onPress={() => {
              if (!isPremium && usageInfo?.allowed === false) { openLimitModal(); return; }
              showAdBeforeAction(appMode === "verify" ? handleVerify : handleSolve, "math");
            }} loading={solving} disabled={!canSolve || solving} modulePrimary={colors.moduleMathPrimary} />
          </View>
        )}

        {/* ── Doğrulama Sonucu ── */}
        {verifyResult && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            {/* Sonuç başlığı */}
            <View style={[styles.verifyHeader, { backgroundColor: verifyColor + "18", borderRadius: BORDER_RADIUS.md, padding: SPACING.md }]}>
              <View style={[styles.verifyIconBox, { backgroundColor: verifyColor + "28" }]}>
                <Ionicons
                  name={verifyColor === "#22c55e" ? "checkmark-circle" : verifyColor === "#f59e0b" ? "warning" : "close-circle"}
                  size={24} color={verifyColor}
                />
              </View>
              <Text style={[styles.verifyResultLabel, { color: verifyColor }]}>{localizedVerifyResult}</Text>
              <TouchableOpacity onPress={() => setVerifyResult(null)}
                style={[styles.closeBtn, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="close-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Adım kontrol listesi */}
            {verifyResult.steps.length > 0 && (
              <View style={styles.gap8}>
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>{t("math.verify.result.stepCheck")}</Text>
                {verifyResult.steps.map((s, i) => (
                  <View key={i} style={[styles.verifyStepRow, { backgroundColor: colors.backgroundSecondary }]}>
                    <Ionicons name={s.isCorrect ? "checkmark-circle" : "close-circle"} size={15}
                      color={s.isCorrect ? "#22c55e" : "#ef4444"} />
                    <Text style={[styles.verifyStepText, { color: colors.textSecondary }]}>{s.text}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Hata */}
            {verifyResult.error && verifyResult.error !== "-" && (
              <View style={[styles.metaRow, { backgroundColor: "#ef444412" }]}>
                <Text style={[styles.metaLabel, { color: "#ef4444" }]}>{t("math.verify.result.error")}:</Text>
                <Text style={[styles.metaValue, { color: colors.textSecondary }]}>{verifyResult.error}</Text>
              </View>
            )}

            {/* İpucu */}
            {verifyResult.tip && (
              <View style={[styles.metaRow, { backgroundColor: colors.moduleMathLight }]}>
                <Ionicons name="bulb-outline" size={14} color={colors.moduleMathPrimary} />
                <Text style={[styles.metaValue, { color: colors.moduleMathPrimary }]}>{verifyResult.tip}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Çözüm ── */}
        {solution && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
            {/* Başlık */}
            <View style={styles.row}>
              <Ionicons name="checkmark-circle" size={20} color={colors.moduleMathPrimary} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t("math.solution")}</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={clearAll} style={[styles.closeBtn, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="close-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Konu etiketi */}
            {topic && (
              <View style={[styles.topicPill, { backgroundColor: colors.moduleMathLight }]}>
                <Ionicons name="bookmark-outline" size={11} color={colors.moduleMathPrimary} />
                <Text style={[styles.topicText, { color: colors.moduleMathPrimary }]}>{formatTopicDisplay(topic, t)}</Text>
              </View>
            )}

            {/* Cevap */}
            <View style={[styles.answerBox, { backgroundColor: colors.moduleMathLight }]}>
              <MathText
                text={solution.answer}
                style={[styles.answerText, { color: colors.moduleMathPrimary }]}
              />
            </View>

            {/* f(x) grafiği — sadece fonksiyon ifadesi varsa göster */}
            {(() => {
              const expr = containsFunctionExpression(problem || solution.answer || '');
              if (!expr) return null;
              return (
                <View style={[styles.graphBox, { backgroundColor: colors.backgroundSecondary }]}>
                  <View style={styles.row}>
                    <Ionicons name="stats-chart-outline" size={13} color={colors.moduleMathPrimary} />
                    <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>{t("math.graph")}</Text>
                  </View>
                  <FunctionGraph
                    expression={expr}
                    width={320}
                    height={180}
                    modulePrimary={colors.moduleMathPrimary}
                    textColor={colors.textTertiary}
                  />
                </View>
              );
            })()}

            {/* Adımlar */}
            {solution.steps.length > 0 && (
              <View style={styles.gap8}>
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>{t("math.steps")}</Text>

                {solution.steps.map((step, i) => {
                  const stepState = stepExplanations[i] || {};
                  return (
                    <AnimatedStep
                      key={`${solutionKey}-${i}`}
                      step={step}
                      index={i}
                      modulePrimary={colors.moduleMathPrimary}
                      moduleLight={colors.moduleMathLight}
                      textColor={colors.textSecondary}
                      expanded={expandedSteps.has(i)}
                      explanation={stepState.text}
                      explanationLoading={stepState.loading}
                      onToggle={() => handleStepToggle(i, step)}
                    />
                  );
                })}

              </View>
            )}

            {/* Açıklama */}
            {solution.explanation?.trim() && (
              isPremium ? (
                <View style={[styles.explanationBox, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{solution.explanation.trim()}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.explanationBox, styles.explanationLocked, { backgroundColor: colors.backgroundSecondary, borderColor: '#8B5CF6' }]}
                  onPress={() => openProGate()}
                  activeOpacity={0.8}
                >
                  <View style={styles.explanationLockedRow}>
                    <Ionicons name="lock-closed" size={14} color="#8B5CF6" />
                    <Text style={[styles.explanationText, { color: colors.textTertiary, flex: 1 }]} numberOfLines={2}>
                      {solution.explanation.trim()}
                    </Text>
                  </View>
                  <View style={styles.proTagStandalone}>
                    <Text style={styles.proTagStandaloneText}>PRO</Text>
                  </View>
                </TouchableOpacity>
              )
            )}

            {/* ── Kavrama feedback ── */}
            {comprehension === null ? (
              <View style={styles.comprehensionRow}>
                <View style={styles.comprehensionLabelRow}>
                  <Text style={[styles.comprehensionLabel, { color: colors.textTertiary }]}>
                    {t("math.comprehension.question")}
                  </Text>
                  {!isPremium && <View style={styles.proTagStandalone}><Text style={styles.proTagStandaloneText}>PRO</Text></View>}
                </View>
                <View style={styles.comprehensionBtns}>
                  <TouchableOpacity
                    style={[styles.comprehensionBtn, { backgroundColor: "#D1FAE5", borderColor: "#10B98130", opacity: isPremium ? 1 : 0.5 }]}
                    onPress={() => isPremium ? handleComprehension('understood') : openProGate()}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={isPremium ? "checkmark-circle-outline" : "lock-closed-outline"} size={15} color="#059669" />
                    <Text style={[styles.comprehensionBtnText, { color: "#059669" }]}>{t("math.comprehension.understood")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.comprehensionBtn, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B30", opacity: isPremium ? 1 : 0.5 }]}
                    onPress={() => isPremium ? handleComprehension('not_understood') : openProGate()}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={isPremium ? "help-circle-outline" : "lock-closed-outline"} size={15} color="#D97706" />
                    <Text style={[styles.comprehensionBtnText, { color: "#D97706" }]}>{t("math.comprehension.notUnderstood")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.comprehensionResult, {
                backgroundColor: comprehension === 'understood' ? "#D1FAE5" : "#FEF3C7",
              }]}>
                <Ionicons
                  name={comprehension === 'understood' ? "checkmark-circle" : "bulb-outline"}
                  size={14}
                  color={comprehension === 'understood' ? "#059669" : "#D97706"}
                />
                <Text style={[styles.comprehensionResultText, {
                  color: comprehension === 'understood' ? "#059669" : "#D97706",
                }]}>
                  {comprehension === 'understood'
                    ? t("math.comprehension.strongArea")
                    : t("math.comprehension.weakArea")}
                </Text>
              </View>
            )}

            {/* Konuyu Açıkla butonu — sadece anlamadıysa göster */}
            {comprehension === 'not_understood' && <TouchableOpacity
              style={[styles.explainBtn, {
                backgroundColor: topicExplanation ? colors.moduleMathLight : colors.backgroundSecondary,
                borderColor: colors.moduleMathPrimary + "30",
              }]}
              onPress={isPremium ? handleExplain : () => openProGate()}
              disabled={loadingExplanation}
              activeOpacity={0.7}
            >
              {loadingExplanation ? (
                <ActivityIndicator size="small" color={colors.moduleMathPrimary} />
              ) : (
                <Ionicons
                  name={!isPremium ? "lock-closed-outline" : topicExplanation ? "chevron-up-outline" : "bulb-outline"}
                  size={16}
                  color={colors.moduleMathPrimary}
                />
              )}
              <Text style={[styles.explainBtnText, { color: colors.moduleMathPrimary }]}>
                {loadingExplanation ? t("math.explaining") : topicExplanation ? t("math.hideExplanation") : t("math.explainTopic")}
              </Text>
              {!isPremium && <View style={styles.proTagStandalone}><Text style={styles.proTagStandaloneText}>PRO</Text></View>}
            </TouchableOpacity>}

            {/* Açıklama metni */}
            {topicExplanation && (
              <View style={[styles.explainBox, { backgroundColor: colors.moduleMathLight }]}>
                <View style={styles.explainHeader}>
                  <Ionicons name="bulb" size={14} color={colors.moduleMathPrimary} />
                  <Text style={[styles.explainTitle, { color: colors.moduleMathPrimary }]}>
                    {topic ? `${formatTopicDisplay(topic, t)} — ${t("math.topicExplanation")}` : t("math.topicExplanation")}
                  </Text>
                </View>
                <Text style={[styles.explainText, { color: colors.textPrimary }]}>{topicExplanation}</Text>
              </View>
            )}
          </View>
        )}


        {/* ── Verify mode teaser — shown after solve to surface the unique "check my work" feature ── */}
        {solution && appMode === "solve" && (
          <TouchableOpacity
            style={[styles.verifyTeaser, { borderColor: colors.moduleMathPrimary + "40", backgroundColor: colors.moduleMathLight }]}
            onPress={() => {
              if (!isPremium) { openProGate(); return; }
              switchMode("verify");
              // Keep the problem in place so the user only needs to add their own solution.
              setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 50);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.verifyTeaserIcon, { backgroundColor: colors.moduleMathPrimary + "22" }]}>
              <Ionicons name="checkmark-done-outline" size={18} color={colors.moduleMathPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.verifyTeaserTitleRow}>
                <Text style={[styles.verifyTeaserTitle, { color: colors.moduleMathPrimary }]}>
                  {t("math.verifyTeaser.title")}
                </Text>
                {!isPremium && (
                  <View style={styles.proTagStandalone}>
                    <Text style={styles.proTagStandaloneText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.verifyTeaserSubtitle, { color: colors.textSecondary }]}>
                {t("math.verifyTeaser.subtitle")}
              </Text>
            </View>
            <Ionicons
              name={isPremium ? "arrow-forward-outline" : "lock-closed-outline"}
              size={16}
              color={colors.moduleMathPrimary}
              style={isPremium && I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
            />
          </TouchableOpacity>
        )}

        {/* ── Benzer Sorular ── */}
        {solution && (
          <View style={styles.relatedWrap}>
            {relatedQuestions.length === 0 ? (
              <TouchableOpacity
                style={[styles.relatedBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderSubtle }]}
                onPress={() => handleFetchRelated()}
                disabled={loadingRelated}
                activeOpacity={0.7}
              >
                {loadingRelated
                  ? <ActivityIndicator size="small" color={colors.moduleMathPrimary} />
                  : <Ionicons name="sync-outline" size={16} color={colors.textSecondary} />
                }
                <Text style={[styles.relatedBtnText, { color: colors.textSecondary }]}>
                  {loadingRelated ? t("math.related.loading") : t("math.related.button")}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
                <View style={styles.relatedHeaderRow}>
                  <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>{t("math.related.title")}</Text>
                </View>

                {/* Difficulty pills — user-visible knob for related question difficulty. */}
                <View style={styles.difficultyRow}>
                  {(["easier", "same", "harder"] as const).map((d) => {
                    const active = relatedDifficulty === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        onPress={() => handleFetchRelated(d)}
                        disabled={loadingRelated}
                        style={[
                          styles.difficultyPill,
                          {
                            backgroundColor: active ? colors.moduleMathPrimary : colors.backgroundSecondary,
                            borderColor: active ? colors.moduleMathPrimary : colors.borderSubtle,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.difficultyPillText,
                            { color: active ? "#fff" : colors.textSecondary },
                          ]}
                        >
                          {t(`math.related.difficulty.${d}`)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {relatedQuestions.map((q, i) => (
                  <View
                    key={i}
                    style={[styles.relatedItem, { backgroundColor: colors.backgroundSecondary }]}
                  >
                    <View style={[styles.relatedNum, { backgroundColor: colors.moduleMathLight }]}>
                      <Text style={[styles.relatedNumText, { color: colors.moduleMathPrimary }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.relatedText, { color: colors.textSecondary }]}>{q}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        // "Solve this" — prefill + auto-solve immediately, skipping the extra tap.
                        setProblem(q); setInputMethod("text"); clearAll();
                        setAppMode("solve");
                        setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 50);
                        setTimeout(() => {
                          if (!isPremium && usageInfo?.allowed === false) { openLimitModal(); return; }
                          showAdBeforeAction(() => handleSolve(q), "math");
                        }, 200);
                      }}
                      style={[styles.relatedSolveBtn, { backgroundColor: colors.moduleMathPrimary }]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="flash-outline" size={13} color="#fff" />
                      <Text style={styles.relatedSolveBtnText}>{t("math.related.solveThis")}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: SPACING.xl * 2 }} />
      </ScrollView>

      <AILoadingModal visible={solving} type="math" />
      <PremiumModal visible={showPremiumModal} onClose={() => { setShowPremiumModal(false); setPremiumModalIsProGate(false); }} moduleType="math" usageInfo={premiumModalIsProGate ? undefined : usageInfo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, gap: SPACING.md },

  // Konu analizi / history nav butonları
  topicsNavBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: SPACING.md, paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  navBtnRow: { flexDirection: "row", gap: SPACING.sm },
  navBtnHalf: {
    flex: 1,
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: SPACING.sm + 2, paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  topicsNavText: { fontSize: 12, fontWeight: "600", flex: 1 },

  // Mod seçici (segmented control)
  segment: {
    flexDirection: "row",
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: 3,
    gap: 3,
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

  // Kart
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
  errorCard: { backgroundColor: "transparent" },

  // Bölüm etiketi
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  sectionLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.6 },

  // Giriş yöntemi
  methodRow: { flexDirection: "row", gap: SPACING.xs },
  handwritingHint: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  handwritingHintText: { fontSize: 11, fontWeight: "600" },

  // Giriş kutusu
  inputBox: { borderRadius: BORDER_RADIUS.lg, borderWidth: 1, overflow: "hidden", minHeight: 130 },
  textInput: { ...TEXT_STYLES.bodyMedium, padding: SPACING.md, minHeight: 130 },
  solutionInput: { minHeight: 110 },
  inlineClear: {
    position: "absolute", top: 8, right: 8,
    width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center",
  },

  // Görsel alan
  imageArea: { width: "100%", minHeight: 150, justifyContent: "center", alignItems: "center", position: "relative" },
  // contain + taller fixed height so tall problem photos (typical SAT/YKS format) aren't cropped.
  // cover was clipping the top/bottom of multi-line math questions. Background color provides
  // letterboxing for portrait photos, while landscape photos fit within 280px.
  image: { width: "100%", height: 280, resizeMode: "contain", backgroundColor: "rgba(0,0,0,0.02)" },
  imagePlaceholder: { width: "100%", minHeight: 150, justifyContent: "center", alignItems: "center", gap: SPACING.sm, padding: SPACING.lg },
  imagePlaceholderIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  placeholderText: { fontSize: 13, textAlign: "center" },
  imageClearBtn: {
    position: "absolute", top: 8, right: 8,
    width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center",
  },

  loadingRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, padding: SPACING.xs },
  loadingText: { fontSize: 13 },

  // Hata
  errorTitle: { ...TEXT_STYLES.titleSmall, fontWeight: "600" },
  errorBody: { fontSize: 14, lineHeight: 20 },

  // Yardımcı
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  gap8: { gap: 8 },
  cardTitle: { ...TEXT_STYLES.titleSmall, fontWeight: "700" },
  subSectionTitle: { fontSize: 13, fontWeight: "600" },
  closeBtn: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },

  // Doğrulama sonucu
  verifyHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  verifyIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  verifyResultLabel: { fontSize: 17, fontWeight: "700", flex: 1 },
  verifyStepRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  verifyStepText: { fontSize: 14, lineHeight: 20, flex: 1 },
  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  metaLabel: { fontSize: 13, fontWeight: "600" },
  metaValue: { fontSize: 14, lineHeight: 20, flex: 1 },

  // Çözüm
  topicPill: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  topicText: { fontSize: 11, fontWeight: "600" },
  answerBox: { padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: "center" },
  graphBox: { padding: SPACING.sm, borderRadius: BORDER_RADIUS.lg, gap: 8, alignItems: "center" },
  answerText: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  stepNum: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  stepNumText: { fontSize: 12, fontWeight: "700" },
  stepText: { fontSize: 14, lineHeight: 21, flex: 1, paddingTop: 2 },
  stepWhyIcon: { marginTop: 2, flexShrink: 0 },
  stepWhyBox: {
    marginTop: 4,
    marginLeft: 32,
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
  },
  stepWhyText: { fontSize: 13, lineHeight: 19 },
  stepWhyLoadingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepWhyLoadingText: { fontSize: 12, fontWeight: "600" },
  lockRow: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    padding: SPACING.sm + 2, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderStyle: "dashed",
  },
  lockText: { fontSize: 13, fontWeight: "600", flex: 1 },
  explanationBox: { padding: SPACING.sm + 2, borderRadius: BORDER_RADIUS.md },
  explanationText: { fontSize: 13, lineHeight: 20 },
  explanationLocked: { borderWidth: 1, opacity: 0.75 },
  explanationLockedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 },
  proTagStandalone: { backgroundColor: '#8B5CF6', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  proTagStandaloneText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  proTagSegment: { backgroundColor: '#8B5CF6', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1, marginLeft: 4 },
  comprehensionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },

  // Kavrama feedback
  comprehensionRow: { gap: 8 },
  comprehensionLabel: { fontSize: 12, fontWeight: "500", textAlign: "center" },
  comprehensionBtns: { flexDirection: "row", gap: 8 },
  comprehensionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 9, borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  comprehensionBtnText: { fontSize: 13, fontWeight: "600" },
  comprehensionResult: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, paddingVertical: 8, borderRadius: BORDER_RADIUS.lg,
  },
  comprehensionResultText: { fontSize: 13, fontWeight: "600" },

  // Konuyu açıkla
  explainBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, paddingVertical: 10, borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  explainBtnText: { fontSize: 13, fontWeight: "600" },
  explainBox: { padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, gap: 8 },
  explainHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  explainTitle: { fontSize: 12, fontWeight: "700" },
  explainText: { fontSize: 14, lineHeight: 22 },

  // Konu istatistikleri

  // Verify mode teaser (appears after solve)
  verifyTeaser: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  verifyTeaserIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: "center", alignItems: "center",
  },
  verifyTeaserTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  verifyTeaserTitle: { fontSize: 14, fontWeight: "700" },
  verifyTeaserSubtitle: { fontSize: 12, marginTop: 2, lineHeight: 17 },

  // Benzer sorular
  relatedWrap: { gap: SPACING.sm },
  relatedBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  relatedBtnText: { fontSize: 14, fontWeight: "500" },
  relatedHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  difficultyRow: { flexDirection: "row", gap: 6 },
  difficultyPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
  },
  difficultyPillText: { fontSize: 11, fontWeight: "700" },
  relatedSolveBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
  },
  relatedSolveBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  relatedItem: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  relatedNum: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  relatedNumText: { fontSize: 12, fontWeight: "700" },
  relatedText: { fontSize: 14, lineHeight: 20, flex: 1 },
});
