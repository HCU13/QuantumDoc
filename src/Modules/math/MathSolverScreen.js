import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useImagePicker } from "../../hooks/useImagePicker";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import TabSwitch from "../../components/common/TabSwitch";
import ModuleIntroCard from "../../components/common/ModuleIntroCard";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useMath } from "../../hooks/useMath";
import { useAuth } from "../../contexts/AuthContext";
import { useTokenContext } from "../../contexts/TokenContext";
import { supabase } from "../../services/supabase";
import {
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { COLORS } from "../../constants/colors";

const MathSolverScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tokens, getTokenCost, getTokenCostLabel } = useTokenContext();
  const { solveMathProblem, solveImageProblem, loading, error } = useMath();
  
  // Modül rengini al
  const moduleColor = colors.mathPrimary || COLORS.light.mathPrimary;

  // Route params'tan gelen önceden doldurulmuş veri
  const {
    question = "",
    imageUri = null,
    problemType = "text",
  } = route?.params || {};

  const [problem, setProblem] = useState(question); // Önceden doldurulmuş soru
  const [selectedImage, setSelectedImage] = useState(
    imageUri ? { uri: imageUri } : null
  ); // Önceden seçilmiş görsel
  const [inputMethod, setInputMethod] = useState(problemType); // "text" or "image"
  const [solution, setSolution] = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  const [mathTokenLabel, setMathTokenLabel] = useState('7 token/soru');

  // Token maliyetini database'den yükle
  useEffect(() => {
    const loadTokenLabel = async () => {
      const label = await getTokenCostLabel('math');
      if (label) {
        setMathTokenLabel(label);
      }
    };
    loadTokenLabel();
  }, [getTokenCostLabel]);

  // Örnek problemler
  const exampleProblems = ["x² + 5x + 6 = 0", "∫ x² dx", "F = ma hesaplama"];

  // Mock çözümler
  const mockSolutions = {
    "x² + 5x + 6 = 0": {
      answer: "x = -2 veya x = -3",
      steps: [
        "Kuadratik denklemi analiz et: ax² + bx + c = 0",
        "Faktörize et: (x + 2)(x + 3) = 0",
        "Her faktörü sıfıra eşitle",
        "x + 2 = 0 → x = -2",
        "x + 3 = 0 → x = -3",
      ],
      explanation:
        "Bu ikinci derece bir denklemdir ve faktörizasyon yöntemiyle çözülmüştür.",
    },
  };

  const styles = {
    container: {
      flex: 1,
      paddingTop: 0,
    },
    content: {
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm,
    },
    inputSection: {
      marginBottom: SPACING.md,
    },
    inputCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.small,
    },
    textInput: {
      backgroundColor: colors.background,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      minHeight: 120,
      borderWidth: 1,
      borderColor: colors.border,
      ...TEXT_STYLES.bodyMedium,
      color: colors.textPrimary,
      textAlignVertical: "top",
    },
    imagePreview: {
      width: "100%",
      height: 200,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    imagePreviewWithImage: {
      padding: 0,
    },
    previewImage: {
      width: "100%",
      height: "100%",
      borderRadius: BORDER_RADIUS.md,
    },
    imageOverlay: {
      position: "absolute",
      top: SPACING.xs,
      right: SPACING.xs,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    imagePlaceholder: {
      alignItems: "center",
    },
    imagePlaceholderText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      marginTop: SPACING.sm,
      textAlign: "center",
    },
    imageButtons: {
      flexDirection: "row",
      marginTop: SPACING.md,
      gap: SPACING.sm,
    },
    imageButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.math + "15",
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.sm,
      borderWidth: 1,
      borderColor: COLORS.math + "30",
      gap: SPACING.xs,
    },
    imageButtonDisabled: {
      opacity: 0.6,
    },
    imageButtonText: {
      ...TEXT_STYLES.labelMedium,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    methodSelectorContainer: {
      marginBottom: SPACING.sm,
    },
    examplesSection: {
      marginTop: SPACING.md,
    },
    examplesTitle: {
      ...TEXT_STYLES.labelMedium,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    exampleChip: {
      backgroundColor: COLORS.math + "15",
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      marginRight: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    exampleText: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    examplesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    solveButton: {
      marginBottom: SPACING.md,
    },
    solutionCard: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: COLORS.math + "30",
      ...SHADOWS.medium,
      marginBottom: SPACING.md,
    },
    solutionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: SPACING.md,
    },
    solutionTitle: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: "600",
      letterSpacing: 0.1,
    },
    answerCard: {
      backgroundColor: COLORS.math + "08",
      borderRadius: BORDER_RADIUS.sm,
      padding: SPACING.sm,
      marginBottom: SPACING.sm,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.math,
    },
    answerText: {
      fontSize: 16,
      color: COLORS.math,
      fontWeight: "600",
      textAlign: "center",
      letterSpacing: 0.2,
    },
    stepsContainer: {
      marginTop: SPACING.sm,
    },
    simpleStepContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: SPACING.xs,
      paddingBottom: SPACING.xs,
    },
    simpleStepNumber: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: COLORS.math,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
      marginTop: 2,
    },
    simpleStepNumberText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "600",
    },
    simpleStepText: {
      flex: 1,
      color: colors.textPrimary,
      lineHeight: 18,
      fontSize: 12,
      fontWeight: "400",
    },
    stepItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: SPACING.sm,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: COLORS.math,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    stepNumberText: {
      ...TEXT_STYLES.labelSmall,
      color: "#fff",
      fontWeight: "bold",
    },
    stepText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 18,
    },
    // Profesyonel Timeline Format - Minimal ve temiz
    stepContainer: {
      flexDirection: "row",
      marginBottom: SPACING.sm,
      minHeight: 30,
      paddingBottom: SPACING.sm,
    },
    timelineWrapper: {
      width: 20,
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    timelineDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: COLORS.math,
      borderWidth: 1.5,
      borderColor: colors.card,
      zIndex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    timelineDotText: {
      color: "#fff",
      fontSize: 9,
      fontWeight: "600",
    },
    timelineLine: {
      width: 1.5,
      flex: 1,
      backgroundColor: COLORS.math + "25",
      marginTop: 2,
      minHeight: 30,
    },
    stepContentWrapper: {
      flex: 1,
      paddingTop: 0,
    },
    stepRow: {
      marginBottom: SPACING.xs,
    },
    stepLabel: {
      color: COLORS.math,
      fontWeight: "600",
      fontSize: 10,
      marginBottom: 4,
      letterSpacing: 0.2,
      textTransform: "uppercase",
    },
    stepValue: {
      color: colors.textPrimary,
      lineHeight: 18,
      fontSize: 12,
      fontWeight: "400",
    },
    howContainer: {
      backgroundColor: colors.background,
      padding: SPACING.xs,
      borderRadius: BORDER_RADIUS.sm,
      marginTop: 4,
      borderWidth: 1,
      borderColor: colors.border + "30",
    },
    stepValueHow: {
      fontFamily: "monospace",
      fontSize: 11,
      color: colors.textPrimary,
      lineHeight: 16,
      fontWeight: "400",
    },
    stepResultRow: {
      marginTop: SPACING.xs,
      paddingTop: SPACING.xs,
      paddingBottom: 2,
      paddingHorizontal: SPACING.xs,
      borderTopWidth: 1,
      borderTopColor: COLORS.math + "20",
      backgroundColor: COLORS.math + "06",
      borderRadius: BORDER_RADIUS.sm,
    },
    stepResultText: {
      color: COLORS.math,
      fontWeight: "600",
      fontSize: 12,
      letterSpacing: 0.1,
    },
    explanationContainer: {
      marginTop: SPACING.sm,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.sm,
      paddingHorizontal: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      borderRadius: BORDER_RADIUS.sm,
      borderLeftWidth: 2,
      borderLeftColor: COLORS.math,
    },
    explanationText: {
      color: colors.textSecondary,
      lineHeight: 18,
      fontSize: 12,
      fontWeight: "400",
      letterSpacing: 0,
    },
  };

  // ImagePicker hook'unu kullan
  const { pickFromGallery, takePhoto: takePhotoFromHook, loading: imagePickerLoading } = useImagePicker();

  const handleMethodSelect = (method) => {
    setInputMethod(method);
    setSolution(null);
    setShowSteps(false);
    if (method === "text") {
      setSelectedImage(null);
    }
  };

  const handleImagePicker = async () => {
    setInputMethod("image");
    const uri = await pickFromGallery();
    if (uri) {
      setSelectedImage({ uri });
      setProblem("");
      setSolution(null);
      setShowSteps(false);
    }
  };

  const handleCamera = async () => {
    setInputMethod("image");
    const uri = await takePhotoFromHook();
    if (uri) {
      setSelectedImage({ uri });
      setProblem("");
      setSolution(null);
      setShowSteps(false);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setInputMethod("text");
  };

  const handleSolve = async () => {
    if (inputMethod === "text" && !problem.trim()) {
      Alert.alert("Hata", "Lütfen çözülecek problemi yazın.");
      return;
    }

    if (inputMethod === "image" && !selectedImage) {
      Alert.alert("Hata", "Lütfen bir görsel seçin veya fotoğraf çekin.");
      return;
    }

    // Token kontrolü - Database'den token maliyetini al
    const tokenCost = getTokenCost('math') || 7;
    if (tokens < tokenCost) {
      Alert.alert(
        "⚠️ Token Yetersiz",
        `Bu işlem ${tokenCost} token gerektirir. Mevcut bakiyeniz: ${tokens} token.\n\nToken satın almak ister misiniz?`,
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Token Al",
            onPress: () =>
              navigation.navigate("Profile", {
                screen: "Subscription",
                params: { tab: "token" },
              }),
          },
        ]
      );
      return;
    }

    try {
      let result;

      if (inputMethod === "text") {
        // Text-based problem solving
        result = await solveMathProblem(problem.trim());
      } else {
        // Image-based problem solving
        result = await solveImageProblem(selectedImage.uri);
      }

      // Parse solution from AI response
      const solutionData = parseSolution(result.solution);

      setSolution(solutionData);
      setShowSteps(true); // Direkt adımları göster (7 token)

      // Çözüm hazır - 7 token kullanıldı
    } catch (err) {
      // Hata zaten useMath hook'unda toast olarak gösterildi
      // Sadece development'ta log'la
      if (__DEV__) console.error("Solve error:", err);
    }
  };

  // Parse AI solution into structured format
  const parseSolution = (aiResponse) => {
    // AI'dan gelen yanıtı parse et
    const lines = aiResponse.split("\n").filter((line) => line.trim());

    // İlk satır cevaptır (temiz format - başlık yok)
    let answer = "";
    let answerFound = false;
    
    // İlk anlamlı satırı bul (boşluk veya başlık değilse)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Markdown başlıkları (**Çözüm:**, ## gibi) veya gereksiz başlıkları atla
      if (
        !line.startsWith("**") &&
        !line.startsWith("##") &&
        !line.toLowerCase().includes("çözüm:") &&
        !line.toLowerCase().includes("adım") &&
        !line.toLowerCase().includes("açıklama:") &&
        line.length > 0 &&
        (line.includes("=") || line.match(/^[x\d\s\-\+\(\)]+$/))
      ) {
        answer = line;
        answerFound = true;
        break;
      }
    }

    // Eğer cevap bulunamazsa, ilk satırı al
    if (!answerFound && lines.length > 0) {
      answer = lines[0]
        .replace(/\*\*/g, "")
        .replace(/^Çözüm:\s*/i, "")
        .replace(/açıklama:\s*/gi, "")
        .trim();
    }
    
    // Cevaptan "**Açıklama:**" ve benzeri ifadeleri temizle
    answer = answer
      .replace(/\*\*Açıklama:\*\*/gi, "")
      .replace(/Açıklama:\s*/gi, "")
      .replace(/\*\*Açıklama\*\*/gi, "")
      .trim();

    // Basit numaralı adımları parse et (1. [açıklama] formatı)
    const structuredSteps = [];
    let currentStep = null;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Açıklama bölümü başladı mı? (son adımdan sonra)
      if (trimmedLine.toLowerCase().startsWith("açıklama:")) {
        if (currentStep) {
          structuredSteps.push(currentStep);
          currentStep = null;
        }
        return;
      }

      // Numaralandırılmış adım başladı mı? (1., 2., 3. veya 1 ->, 2 -> gibi)
      const stepMatch = trimmedLine.match(/^(\d+)\.?\s*(->)?\s*(.*)/);
      if (stepMatch) {
        // Önceki adımı kaydet
        if (currentStep) {
          structuredSteps.push(currentStep);
        }
        // Yeni adımı başlat
        const stepNumber = parseInt(stepMatch[1]);
        const stepText = stepMatch[3].trim();
        
        currentStep = {
          number: stepNumber,
          description: stepText, // Tüm açıklama buraya
        };
      } else if (currentStep && trimmedLine) {
        // Çok satırlı açıklama - devamını ekle
        currentStep.description += " " + trimmedLine;
      }
    });

    // Son adımı kaydet
    if (currentStep) {
      structuredSteps.push(currentStep);
    }

    // Açıklama bölümünü bul (son adımdan sonra, "Açıklama:" başlığı olmadan)
    let explanation = "";
    let inExplanation = false;
    let foundLastStep = false;

    // Önce son adımı bul
    if (structuredSteps.length > 0) {
      const lastStepNumber = structuredSteps[structuredSteps.length - 1].number;
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Son adımın sonuç satırını bul
        if (trimmedLine.match(new RegExp(`^${lastStepNumber}\\.`))) {
          foundLastStep = true;
          return;
        }
        
        // "Açıklama:" başlığını atla ama içeriği al
        if (trimmedLine.toLowerCase().startsWith("açıklama:")) {
          inExplanation = true;
          const explanationText = trimmedLine.replace(/^açıklama:\s*/i, "");
          if (explanationText) {
            explanation = explanationText;
          }
          return;
        }
        
        // Son adımdan sonraki içerik açıklama olabilir
        if (foundLastStep && !trimmedLine.match(/^\d+\./) && trimmedLine.length > 10) {
          // Markdown işaretlerini temizle
          const cleanLine = trimmedLine.replace(/\*\*/g, "").replace(/^açıklama:\s*/i, "");
          if (cleanLine && !cleanLine.toLowerCase().includes("ne yapıyoruz") && 
              !cleanLine.toLowerCase().includes("neden") && 
              !cleanLine.toLowerCase().includes("nasıl") &&
              !cleanLine.toLowerCase().startsWith("sonuç:")) {
            explanation += (explanation ? " " : "") + cleanLine;
          }
        }
      });
    }

    // Eski format (string adımlar) için fallback
    const stepsAsStrings = structuredSteps.length > 0 
      ? structuredSteps.map(step => `${step.number}. ${step.description}`)
      : [];

    return {
      answer: answer || "Çözüm hazır",
      steps: stepsAsStrings,
      structuredSteps: structuredSteps,
      explanation: explanation || "",
    };
  };

  const handleShowSteps = () => {
    setShowSteps(true);
  };

  // Detaylı çözüm butonu kaldırıldı - direkt detaylı çözüm geliyor (7 token)

  return (
    <GradientBackground module="math">
      <SafeAreaView style={styles.container}>
        <Header
          title={t("modules.math.title")}
          showBackButton={true}
          alignLeft={true}
          rightComponent={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: 160,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.primary + "15",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                  marginRight: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: colors.primary,
                  }}
                >
                  {mathTokenLabel}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginRight: 8,
                }}
              >
                <Image
                  source={require("../../assets/images/token.png")}
                  style={{ width: 12, height: 12, marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: colors.textPrimary,
                  }}
                >
                  {tokens}
                </Text>
              </View>
            </View>
          }
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Intro Card */}
          <ModuleIntroCard moduleId="math" moduleColor={moduleColor} />

          {/* Giriş Yöntemi Seçici - Text/Image için TabSwitch, Image seçildiğinde butonlar */}
          <View style={styles.methodSelectorContainer}>
            <TabSwitch
              options={[
                {
                  value: "text",
                  label: t("math.tabText"),
                  icon: "create-outline",
                },
                {
                  value: "image",
                  label: t("math.tabImage"),
                  icon: "camera-outline",
                },
              ]}
              selectedValue={inputMethod}
              onValueChange={handleMethodSelect}
              containerStyle={{
                marginVertical: SPACING.md,
                marginHorizontal: SPACING.lg,
              }}
            />
          </View>

          {/* Problem Girişi */}
          <View style={styles.inputSection}>
            <View style={styles.inputCard}>
              {inputMethod === "text" ? (
                <>
                  <TextInput
                    style={styles.textInput}
                    value={problem}
                    onChangeText={setProblem}
                    placeholder={t("math.questionPlaceholder")}
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    textAlignVertical="top"
                  />

                  {/* Örnek Problemler */}
                  <View style={styles.examplesSection}>
                    <Text style={styles.examplesTitle}>
                      {t("math.exampleProblems")}
                    </Text>
                    <View style={styles.examplesRow}>
                      {exampleProblems.map((example, index) => (
                        <View key={index} style={styles.exampleChip}>
                          <Text style={styles.exampleText}>{example}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              ) : (
                <>
                  {/* Görsel Önizleme */}
                  <View
                    style={[
                      styles.imagePreview,
                      selectedImage && styles.imagePreviewWithImage,
                    ]}
                  >
                    {selectedImage ? (
                      <>
                        <Image
                          source={{ uri: selectedImage.uri }}
                          style={styles.previewImage}
                        />
                        <TouchableOpacity
                          style={styles.imageOverlay}
                          onPress={handleClearImage}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons
                          name="camera-outline"
                          size={48}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.imagePlaceholderText}>
                          Problem fotoğrafını buraya ekleyin
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Görsel Butonları */}
                  {!selectedImage && (
                    <View style={styles.imageButtons}>
                      <TouchableOpacity
                        style={[
                          styles.imageButton,
                          imagePickerLoading && styles.imageButtonDisabled,
                        ]}
                        onPress={handleCamera}
                        disabled={imagePickerLoading}
                        activeOpacity={0.8}
                      >
                        {imagePickerLoading ? (
                          <ActivityIndicator size="small" color={COLORS.math} />
                        ) : (
                          <Ionicons name="camera" size={18} color={COLORS.math} />
                        )}
                        <Text style={styles.imageButtonText}>
                          {imagePickerLoading
                            ? t("common.loading")
                            : t("math.takePhoto")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.imageButton,
                          imagePickerLoading && styles.imageButtonDisabled,
                        ]}
                        onPress={handleImagePicker}
                        disabled={imagePickerLoading}
                        activeOpacity={0.8}
                      >
                        {imagePickerLoading ? (
                          <ActivityIndicator size="small" color={COLORS.math} />
                        ) : (
                          <Ionicons name="images" size={18} color={COLORS.math} />
                        )}
                        <Text style={styles.imageButtonText}>
                          {imagePickerLoading
                            ? t("common.loading")
                            : t("math.chooseFromGallery")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>

          {/* Çöz Butonu */}
          <Button
            title={loading ? t("math.solving") : t("math.solve")}
            gradient
            onPress={handleSolve}
            loading={loading}
            disabled={
              (inputMethod === "text" && !problem.trim()) ||
              (inputMethod === "image" && !selectedImage) ||
              loading
            }
            containerStyle={styles.solveButton}
            icon={!loading && <Ionicons name="flash" size={18} color="#fff" />}
          />

          {/* Çözüm */}
          {solution && (
            <View style={styles.solutionCard}>
              <View style={styles.solutionHeader}>
                <Text style={styles.solutionTitle}>{t("math.solution")}</Text>
                <TouchableOpacity
                  onPress={() => setSolution(null)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.border,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.answerCard}>
                <Text style={styles.answerText}>{solution.answer}</Text>
              </View>

              {/* Adım Adım Çözüm - Basit numaralı format */}
              {solution.structuredSteps && solution.structuredSteps.length > 0 ? (
                <View style={styles.stepsContainer}>
                  {solution.structuredSteps.map((step, index) => (
                    <View key={index} style={styles.simpleStepContainer}>
                      {/* Adım numarası */}
                      <View style={styles.simpleStepNumber}>
                        <Text style={styles.simpleStepNumberText}>{step.number || index + 1}</Text>
                      </View>
                      {/* Adım açıklaması */}
                      <Text style={styles.simpleStepText}>{step.description}</Text>
                    </View>
                  ))}

                  {/* Açıklama - En sonda, ayrı bölüm */}
                  {solution.explanation && solution.explanation.trim() && (
                    <View style={styles.explanationContainer}>
                      <Text style={styles.explanationText}>{solution.explanation}</Text>
                    </View>
                  )}
                </View>
              ) : solution.steps && solution.steps.length > 0 ? (
                // Fallback: Eski format
                <View style={styles.stepsContainer}>
                  {solution.steps.map((step, index) => (
                    <View key={index} style={styles.stepItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          )}

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default MathSolverScreen;
