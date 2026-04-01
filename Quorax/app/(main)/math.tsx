import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { InfoCard } from "@/components/common/InfoCard";
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
import { useImagePicker } from "@/hooks/useImagePicker";
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
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const router = useRouter();
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
  const [usageInfo, setUsageInfo] = useState<any>(null);

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

  useEffect(() => {
    if (isLoggedIn && !isPremium && user?.id) {
      checkUsageLimit("math").then((data) => { if (data) setUsageInfo(data); });
    } else {
      setUsageInfo(null);
    }
  }, [isLoggedIn, isPremium, user?.id]);

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
    const res = await fetch(uri);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  const parseSolution = useCallback((raw: string) => {
    if (!raw?.trim()) return { answer: raw || "", steps: [], explanation: "" };
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return { answer: raw, steps: [], explanation: "" };

    let answer = lines[0].replace(/^(Cevap|Answer|Sonuç|Result):\s*/i, "").trim();
    const steps: string[] = [];
    let explanation = "";
    let inExp = false;
    let finalAns = "";
    let lastAns = "";

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) { if (steps.length && !inExp) inExp = true; continue; }
      const sm = line.match(/^(\d+)[\.\->\s]+(.+)$/);
      if (sm && !inExp) {
        const st = sm[2].trim();
        const pats = [
          /(?:dolayısıyla|therefore|sonuç|result|cevap|answer|böylece|thus)[^=:]*[=:]\s*([^\s,\.]+)/i,
          /(?:sonuç|result|cevap|answer)\s*(?:x|y|z)?\s*[=:]\s*([^\s,\.]+)/i,
          /(?:^|\s)(x|y|z|sonuç|result)\s*=\s*([^\s,\.]+)/i,
          /=\s*([^\s,\.]+)/i,
        ];
        for (const p of pats) {
          if (st.match(p)) {
            const fm = st.match(/(?:x|y|z|sonuç|result)\s*=\s*[^\s,\.]+(?:'dir|'dır|'tir|'tır|dır|dir|tır|tir)?/i);
            if (fm) {
              let ext = fm[0].replace(/[''](dir|dır|tir|tır)$/i, "").trim();
              lastAns = ext;
              if (st.match(/(?:dolayısıyla|therefore|sonuç|result|böylece|thus)/i)) finalAns = ext;
            } else {
              const val = st.match(/=\s*([^\s,\.]+)/)?.[1];
              if (val) {
                const vm = st.match(/(x|y|z|sonuç|result)/i);
                lastAns = vm ? `${vm[1]} = ${val}` : val;
                if (st.match(/(?:dolayısıyla|therefore|sonuç|result|böylece|thus)/i)) finalAns = lastAns;
              }
            }
            break;
          }
        }
        if (st) steps.push(st);
      } else {
        if (steps.length) inExp = true;
        if (inExp) explanation = explanation ? `${explanation}\n\n${line}` : line;
        else if (!line.match(/^[A-ZÇĞİÖŞÜ][a-zçğıöşü\s]+:/)) steps.push(line);
        else { explanation = line; inExp = true; }
      }
    }

    if (finalAns) answer = finalAns;
    else if (lastAns) answer = lastAns;

    if (explanation) {
      explanation = explanation.replace(/^(Açıklama|Explanation|Genel|General):\s*/i, "").trim();
      [
        /bu şekilde[^.]*adım adım çözerek[^.]*sonuca ulaştık[^.]*/i,
        /bu şekilde[^.]*verilen matematik problemini[^.]*çözerek[^.]*/i,
        /eğer herhangi bir adımda sorun varsa[^.]*lütfen sormaktan çekinme[^.]*/i,
      ].forEach((p) => { explanation = explanation.replace(p, "").trim(); });
      if (explanation.length < 20 || explanation.match(/^(bu şekilde|dolayısıyla|therefore)/i)) explanation = "";
    }

    return { answer, steps, explanation };
  }, []);

  const parseVerifyResult = useCallback((text: string): VerifyResult => {
    const result = text.match(/SONUÇ:\s*(.+)/)?.[1]?.trim() || t("math.verify.result.partial");
    const stepsSection = text.match(/ADIM ADIM:([\s\S]*?)(?:HATA:|İPUCU:|$)/)?.[1] || "";
    const steps: Array<{ text: string; isCorrect: boolean }> = [];
    stepsSection.split("\n").forEach((line) => {
      const m = line.match(/^\d+\.\s*(.+?):\s*(Doğru|Yanlış|Correct|Wrong)/i);
      if (m) steps.push({ text: m[1].trim(), isCorrect: /doğru|correct/i.test(m[2]) });
    });
    return {
      result,
      steps,
      error: text.match(/HATA:\s*(.+)/)?.[1]?.trim() || "",
      tip: text.match(/İPUCU:\s*(.+)/)?.[1]?.trim() || "",
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
  };

  // — Çöz —
  const handleSolve = async () => {
    if (!isLoggedIn || !user?.id) {
      Alert.alert(t("modules.locked"), t("profile.loginToContinue"), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.login"), onPress: () => router.push("/(main)/login") },
      ]);
      return;
    }
    if (inputMethod === "text" && !problem.trim()) { showWarning(t("math.errors.emptyProblem"), t("math.errors.emptyProblemMessage")); return; }
    if (inputMethod === "image" && !selectedImage) { showWarning(t("math.errors.noImage"), t("math.errors.noImageMessage")); return; }

    try {
      setSolving(true); clearAll();
      if (!isPremium) {
        const usage = await checkUsageLimit("math");
        if (usage && !usage.allowed) { setUsageInfo(usage); setShowPremiumModal(true); return; }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session not found");

      const body: any = { userId: user.id, userLanguage: i18n.language || "tr", mode: "solve" };
      if (inputMethod === "image" && selectedImage) body.problemImageUrl = await convertImageToBase64(selectedImage);
      else body.problemText = problem.trim();

      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || t("math.errors.solveFailed"));

      setSolution(parseSolution(data.solution));
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
        if (usage && !usage.allowed) { setUsageInfo(usage); setShowPremiumModal(true); return; }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session not found");

      const body: any = { userId: user.id, userLanguage: i18n.language || "tr", mode: "verify" };
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
  const handleFetchRelated = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !user?.id) return;

    // problem metni yoksa (fotoğrafla girildi) solution'dan anlamlı bir açıklama oluştur
    let desc = problem.trim();
    if (!desc && solution) {
      const stepsSnippet = solution.steps.slice(0, 2).join(" | ");
      desc = topic
        ? `${topic} konusunda: cevabı ${solution.answer} olan problem. ${stepsSnippet}`
        : `Cevabı ${solution.answer} olan matematik problemi. ${stepsSnippet}`;
    }
    if (!desc) desc = topic ? `${topic} konusunda örnek problem` : "Temel cebir problemi";

    setLoadingRelated(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/solve-math-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ problemText: desc, userId: user.id, userLanguage: i18n.language || "tr", mode: "related" }),
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

  const canSolve = appMode === "verify"
    ? (inputMethod === "text" ? !!problem.trim() : !!selectedImage) &&
      (solutionMethod === "text" ? !!userSolutionText.trim() : !!solutionImage)
    : (inputMethod === "text" ? !!problem.trim() : !!selectedImage);

  const verifyColor = verifyResult
    ? verifyResult.result.match(/yanlış|wrong/i) ? "#ef4444"
    : verifyResult.result.match(/kısmen|partial/i) ? "#f59e0b"
    : "#22c55e"
    : "#22c55e";

  // ─── Yardımcı bileşenler ─────────────────────────────────────────────────

  const SectionLabel = ({ label, icon }: { label: string; icon: string }) => (
    <View style={styles.sectionLabelRow}>
      <Ionicons name={icon as any} size={13} color={colors.textTertiary} />
      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{label}</Text>
    </View>
  );

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
        rightAction={isLoggedIn && !isPremium && usageInfo ? (
          <MinimalUsageBadge used={usageInfo.used} limit={usageInfo.limit} modulePrimary={colors.moduleMathPrimary} />
        ) : undefined}
      />

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <InfoCard title={t("math.info.title")} content={t("math.info.content")} modulePrimary={colors.moduleMathPrimary} />

        {/* ── Mod Seçici ── */}
        <View style={[styles.segment, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderSubtle }]}>
          {(["solve", "verify"] as AppMode[]).map((m) => {
            const active = appMode === m;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.segmentBtn, active && { backgroundColor: colors.moduleMathPrimary }]}
                onPress={() => switchMode(m)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={m === "solve" ? "calculator-outline" : "checkmark-done-outline"}
                  size={14}
                  color={active ? "#fff" : colors.textSecondary}
                />
                <Text style={[styles.segmentText, { color: active ? "#fff" : colors.textSecondary }]}>
                  {t(m === "solve" ? "math.modeSolve" : "math.modeVerify")}
                </Text>
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

          {/* Giriş alanı */}
          <View style={[styles.inputBox, { borderColor: colors.borderSubtle, backgroundColor: colors.backgroundSecondary }]}>
            {inputMethod === "text" ? (
              <>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder={appMode === "verify" ? "2x + 4 = 10" : t("math.placeholder")}
                  placeholderTextColor={colors.textTertiary}
                  value={problem}
                  onChangeText={(v) => { setProblem(v); setSolution(null); setTopic(null); setRelatedQuestions([]); }}
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
            onPress={() => showAdBeforeAction(appMode === "verify" ? handleVerify : handleSolve, "math")}
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
            <Button title={t("math.retry")} onPress={() => showAdBeforeAction(appMode === "verify" ? handleVerify : handleSolve, "math")}
              loading={solving} disabled={!canSolve || solving} modulePrimary={colors.moduleMathPrimary} />
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
              <Text style={[styles.verifyResultLabel, { color: verifyColor }]}>{verifyResult.result}</Text>
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
                <Text style={[styles.topicText, { color: colors.moduleMathPrimary }]}>{topic}</Text>
              </View>
            )}

            {/* Cevap */}
            <View style={[styles.answerBox, { backgroundColor: colors.moduleMathLight }]}>
              <Text style={[styles.answerText, { color: colors.moduleMathPrimary }]}>{solution.answer}</Text>
            </View>

            {/* Adımlar */}
            {solution.steps.length > 0 && (
              <View style={styles.gap8}>
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>{t("math.steps")}</Text>

                {(isPremium ? solution.steps : solution.steps.slice(0, 2)).map((step, i) => (
                  <View key={i} style={[styles.stepRow, { backgroundColor: colors.backgroundSecondary }]}>
                    <View style={[styles.stepNum, { backgroundColor: colors.moduleMathLight }]}>
                      <Text style={[styles.stepNumText, { color: colors.moduleMathPrimary }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.textSecondary }]}>{step}</Text>
                  </View>
                ))}

                {!isPremium && solution.steps.length > 2 && (
                  <TouchableOpacity
                    style={[styles.lockRow, { backgroundColor: colors.moduleMathLight, borderColor: colors.moduleMathPrimary }]}
                    onPress={() => setShowPremiumModal(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="lock-closed" size={15} color={colors.moduleMathPrimary} />
                    <Text style={[styles.lockText, { color: colors.moduleMathPrimary }]}>
                      {t("math.stepsLocked", { count: solution.steps.length - 2 })}
                    </Text>
                    <Ionicons name="chevron-forward" size={15} color={colors.moduleMathPrimary} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Açıklama (sadece premium) */}
            {isPremium && solution.explanation?.trim() && (
              <View style={[styles.explanationBox, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{solution.explanation.trim()}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Benzer Sorular ── */}
        {solution && (
          <View style={styles.relatedWrap}>
            {relatedQuestions.length === 0 ? (
              <TouchableOpacity
                style={[styles.relatedBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderSubtle }]}
                onPress={handleFetchRelated}
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
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>{t("math.related.title")}</Text>
                {relatedQuestions.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.relatedItem, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => {
                      setProblem(q); setInputMethod("text"); clearAll();
                      setAppMode("solve");
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                      // Buton pulse: kullanıcıya "artık çöz'e bas" sinyali ver
                      setTimeout(() => {
                        Animated.sequence([
                          Animated.timing(solveButtonScale, { toValue: 1.06, duration: 150, useNativeDriver: true }),
                          Animated.timing(solveButtonScale, { toValue: 0.97, duration: 100, useNativeDriver: true }),
                          Animated.timing(solveButtonScale, { toValue: 1.06, duration: 150, useNativeDriver: true }),
                          Animated.timing(solveButtonScale, { toValue: 1, duration: 120, useNativeDriver: true }),
                        ]).start();
                      }, 350); // scroll bittikten sonra
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.relatedNum, { backgroundColor: colors.moduleMathLight }]}>
                      <Text style={[styles.relatedNumText, { color: colors.moduleMathPrimary }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.relatedText, { color: colors.textSecondary }]} numberOfLines={2}>{q}</Text>
                    <Ionicons name="arrow-forward-outline" size={14} color={colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: SPACING.xl * 2 }} />
      </ScrollView>

      <AILoadingModal visible={solving} type="math" />
      <PremiumModal visible={showPremiumModal} onClose={() => setShowPremiumModal(false)} moduleType="math" usageInfo={usageInfo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, gap: SPACING.md },

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
  image: { width: "100%", height: 200, resizeMode: "cover" },
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
  answerText: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  stepNum: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  stepNumText: { fontSize: 12, fontWeight: "700" },
  stepText: { fontSize: 14, lineHeight: 21, flex: 1, paddingTop: 2 },
  lockRow: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    padding: SPACING.sm + 2, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderStyle: "dashed",
  },
  lockText: { fontSize: 13, fontWeight: "600", flex: 1 },
  explanationBox: { padding: SPACING.sm + 2, borderRadius: BORDER_RADIUS.md },
  explanationText: { fontSize: 13, lineHeight: 20 },

  // Benzer sorular
  relatedWrap: { gap: SPACING.sm },
  relatedBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  relatedBtnText: { fontSize: 14, fontWeight: "500" },
  relatedItem: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  relatedNum: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  relatedNumText: { fontSize: 12, fontWeight: "700" },
  relatedText: { fontSize: 14, lineHeight: 20, flex: 1 },
});
