import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useTheme from "../../hooks/useTheme";
import { useMath } from "../../hooks/useMath";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { showError, showSuccess, showInfo } from '../../utils/toast';
import { SIZES, FONTS } from "../../constants/theme";
import TokenCostBadge from '../../components/common/TokenCostBadge';
import TokenInfo from '../../components/common/TokenInfo';

const MathSolverScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { solveMathProblem, solveImageProblem, loading, result } = useMath();

  const [problem, setProblem] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [inputMethod, setInputMethod] = useState("text");
  const [solution, setSolution] = useState(null);
  const [showDetailedSolution, setShowDetailedSolution] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);

  // Mock kullanıcı bilgileri - Bu değerler gerçek uygulamada API'den gelecek
  const tokenCost = 2;
  const extraTokenCost = 1; // Adımları görmek için extra token
  const tokens = 100;
  const remainingTokens = tokens - tokenCost;
  const isPremium = false; // Premium kullanıcı - false yaparak test edebilirsiniz
  const hasExtraTokens = remainingTokens >= tokenCost;
  const hasExtraTokensForSteps = remainingTokens >= (tokenCost + extraTokenCost);

  // Mock matematik çözümleri
  const mockSolutions = {
    "2x + 5 = 13": {
      answer: "x = 4",
      steps: [
        "1. Denklemi analiz edin: 2x + 5 = 13",
        "2. Sabit terimi çıkarın: 2x = 13 - 5",
        "3. Hesaplayın: 2x = 8", 
        "4. x'i izole edin: x = 8 ÷ 2",
        "5. Sonuç: x = 4"
      ],
      explanation: "Bu bir lineer denklemdir. Bilinmeyen terimi (x) bir tarafa, sabitleri diğer tarafa toplayarak çözülür."
    },
    "∫ x² dx": {
      answer: "∫ x² dx = (x³/3) + C",
      steps: [
        "1. İntegral kuralını uygulayın: ∫ x^n dx = x^(n+1)/(n+1) + C",
        "2. n = 2 için: ∫ x² dx = x^(2+1)/(2+1) + C",
        "3. Hesaplayın: ∫ x² dx = x³/3 + C",
        "4. Sonuç: (x³/3) + C"
      ],
      explanation: "Bu bir belirsiz integraldir. Güç kuralı kullanılarak çözülür."
    },
    "sin(30°) + cos(60°)": {
      answer: "sin(30°) + cos(60°) = 1",
      steps: [
        "1. Trigonometrik değerleri hesaplayın: sin(30°) = 1/2",
        "2. cos(60°) = 1/2",
        "3. Toplama yapın: 1/2 + 1/2 = 1",
        "4. Sonuç: 1"
      ],
      explanation: "Bu bir trigonometrik ifadedir. Temel trigonometrik değerler kullanılarak çözülür."
    },
    "x² + 3x + 2 = 0": {
      answer: "x = -1 veya x = -2",
      steps: [
        "1. Kuadratik formülü uygulayın: x = (-b ± √(b² - 4ac)) / 2a",
        "2. a = 1, b = 3, c = 2 değerlerini yerleştirin",
        "3. Diskriminantı hesaplayın: Δ = 3² - 4(1)(2) = 9 - 8 = 1",
        "4. x = (-3 ± √1) / 2 = (-3 ± 1) / 2",
        "5. x₁ = (-3 + 1) / 2 = -1, x₂ = (-3 - 1) / 2 = -2"
      ],
      explanation: "Bu bir ikinci derece denklemdir. Kuadratik formül kullanılarak çözülür."
    }
  };

  // --- Image Handlers ---
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        setInputMethod("image");
        setSolution(null);
        setShowDetailedSolution(false);
      }
    } catch {
      showError(t("messages.error"), t("modules.math.imagePickError"));
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showInfo(t("messages.info"), t("modules.math.cameraPermission"));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        setInputMethod("image");
        setSolution(null);
        setShowDetailedSolution(false);
      }
    } catch {
      showError(t("messages.error"), t("modules.math.cameraError"));
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setInputMethod("text");
    setSolution(null);
    setShowDetailedSolution(false);
  };

  // --- Solve Handler ---
  const handleSolve = async () => {
    if (inputMethod === "text" && !problem.trim()) {
      showError(t("messages.error"), t("modules.math.enterProblem"));
      return;
    }
    if (inputMethod === "image" && !selectedImage) {
      showError(t("messages.error"), t("modules.math.selectImageError"));
      return;
    }

    // Premium olmayan kullanıcılar için token kontrolü
    if (!isPremium && !hasExtraTokens) {
      // Toast yerine buton disabled olacak, kullanıcı zaten görebilir
      return;
    }

    try {
      let response;
      if (inputMethod === "text") {
        response = await solveMathProblem(problem);
      } else {
        response = await solveImageProblem(selectedImage.uri);
      }
      
      if (response && response.answer) {
        // Mock çözümü bul veya varsayılan çözüm kullan
        const mockSolution = mockSolutions[problem.trim()] || {
          answer: response.answer,
          steps: [
            "1. Problemi analiz edin",
            "2. Uygun formülü seçin", 
            "3. Değerleri yerleştirin",
            "4. Hesaplamayı yapın",
            "5. Sonucu kontrol edin"
          ],
          explanation: "Bu problem adım adım çözülmüştür. Her adımda ne yapıldığı açıklanmıştır."
        };

        setSolution(mockSolution);
        setShowDetailedSolution(false); // Yeni çözüm için adımları gizle
        // Toast mesajı kaldırıldı - kullanıcı zaten sonucu görüyor
      }
    } catch (error) {
      // Sadece gerçek hata durumlarında toast göster
      if (error.message && !error.message.includes('mock')) {
      showError(t("messages.error"), error.message || t("modules.math.solveError"));
      }
    }
  };

  // const handleShowSteps = () => {
  //   setShowDetailedSolution(true);
  // };

  // const handleCopyAnswer = () => {
  //   // Clipboard'a kopyalama işlemi burada yapılacak
  //   showSuccess("Kopyalandı!", "Cevap panoya kopyalandı");
  // };

  // const handleShareSolution = () => {
  //   // Paylaşım işlemi burada yapılacak
  //   showInfo("Paylaş", "Çözüm paylaşım özelliği yakında gelecek");
  // };

  const handleShowStepsModal = () => {
    setShowStepsModal(true);
  };

  const handleUnlockSteps = () => {
    if (!hasExtraTokensForSteps) {
      showInfo("Token Yetersiz", `${extraTokenCost} token daha gerekiyor`);
      return;
    }
    setShowDetailedSolution(true);
    setShowStepsModal(false);
    // Toast mesajı kaldırıldı - kullanıcı zaten adımları görüyor
  };


  // --- Styles ---
  const styles = {
    container: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    quickAccessContainer: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginBottom: 20,
      gap: 12,
    },
    quickAccessBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickAccessText: {
      ...FONTS.body5,
      color: colors.textPrimary,
      marginLeft: 8,
      fontWeight: "500",
    },
    scroll: {
      flex: 1,
      paddingHorizontal: 18,
    },
    section: {
      marginBottom: 22,
    },
    inputSelector: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 18,
      gap: 10,
    },
    selectorBtn: (active) => ({
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: SIZES.radius,
      borderWidth: 2,
      borderColor: active ? colors.mathPrimary : colors.border,
      backgroundColor: active ? colors.mathPrimary : colors.card,
    }),
    selectorText: (active) => ({
      ...FONTS.body4,
      color: active ? colors.white : colors.textPrimary,
      marginLeft: 8,
      fontWeight: "bold",
    }),
    inputArea: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      minHeight: 100,
      color: colors.textPrimary,
      ...FONTS.body4,
      marginBottom: 16,
      textAlignVertical: "top",
    },
    imagePreview: {
      width: "100%",
      height: 160,
      borderRadius: SIZES.radius,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: SIZES.radius,
    },
    imageActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      gap: 12,
    },
    imageBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.mathPrimary,
      borderRadius: SIZES.radius,
      paddingVertical: 14,
    },
    imageBtnText: {
      color: colors.white,
      marginLeft: 8,
      fontWeight: "bold",
      fontSize: 14,
    },
    solveBtn: {
      marginVertical: 20,
    },
    solutionCard: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 16,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.mathPrimary,
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    solutionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    solutionTitle: {
      ...FONTS.h5,
      color: colors.textPrimary,
      fontWeight: "bold",
      flex: 1,
    },
    answerText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      lineHeight: 20,
      marginBottom: 12,
      fontWeight: "600",
    },
    actionButtons: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 12,
    },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.mathPrimary,
      borderRadius: SIZES.radius,
      paddingVertical: 10,
    },
    actionBtnText: {
      color: colors.white,
      marginLeft: 6,
      fontWeight: "bold",
      fontSize: 13,
    },
    stepsButton: {
      marginBottom: 16,
    },
    stepsModal: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      elevation: 9999,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 24,
      margin: 20,
      alignItems: 'center',
      shadowColor: colors.mathPrimary,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
    },
    modalTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      fontWeight: "bold",
      marginBottom: 12,
      textAlign: 'center',
    },
    modalText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    modalBtn: {
      flex: 1,
      borderRadius: SIZES.radius,
      paddingVertical: 12,
      alignItems: 'center',
    },
    modalBtnPrimary: {
      backgroundColor: colors.mathPrimary,
    },
    modalBtnSecondary: {
      backgroundColor: colors.border,
    },
    modalBtnText: {
      ...FONTS.body4,
      fontWeight: "bold",
    },
    modalBtnTextPrimary: {
      color: colors.white,
    },
    modalBtnTextSecondary: {
      color: colors.textPrimary,
    },
    stepsContainer: {
      marginTop: 12,
    },
    stepItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    stepNumber: {
      backgroundColor: colors.mathPrimary,
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    stepNumberText: {
      color: colors.white,
      fontSize: 11,
      fontWeight: "bold",
    },
    stepText: {
      ...FONTS.body5,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 18,
    },
    explanationText: {
      ...FONTS.body5,
      color: colors.textSecondary,
      fontStyle: "italic",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    emptyStateIcon: {
      marginBottom: 16,
    },
    emptyStateText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      textAlign: "center",
    },
  };

  // --- Render ---
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
        <Header title={t("modules.math.title")}/>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Token Bilgisi */}
          <TokenInfo
            moduleName="Matematik Çözücü"
            tokenCost={tokenCost}
            remainingTokens={remainingTokens}
            isPremium={isPremium}
            showCost={true}
          />

          {/* Hızlı Erişim Butonları */}
          <View style={styles.quickAccessContainer}>
            <TouchableOpacity
              style={styles.quickAccessBtn}
              onPress={() => navigation.navigate('MathFormulas')}
            >
              <Ionicons name="library-outline" size={20} color={colors.mathPrimary} />
              <Text style={styles.quickAccessText}>Formüller</Text>
            </TouchableOpacity>
          </View>

          {/* Giriş Yöntemi Seçici */}
          <View style={styles.inputSelector}>
            <TouchableOpacity
              style={styles.selectorBtn(inputMethod === "text")}
              onPress={() => setInputMethod("text")}
              accessibilityRole="button"
              accessibilityLabel={t("modules.math.textInput")}
            >
              <Ionicons name="create-outline" size={18} color={inputMethod === "text" ? colors.white : colors.textPrimary} />
              <Text style={styles.selectorText(inputMethod === "text")}>{t("modules.math.textInput")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectorBtn(inputMethod === "image")}
              onPress={() => setInputMethod("image")}
              accessibilityRole="button"
              accessibilityLabel={t("modules.math.imageInput")}
            >
              <Ionicons name="camera-outline" size={18} color={inputMethod === "image" ? colors.white : colors.textPrimary} />
              <Text style={styles.selectorText(inputMethod === "image")}>{t("modules.math.imageInput")}</Text>
            </TouchableOpacity>
          </View>

          {/* Metin veya Görsel Girişi */}
          {inputMethod === "text" ? (
            <TextInput
              style={styles.inputArea}
              value={problem}
              onChangeText={setProblem}
              placeholder={t("modules.math.inputPlaceholder")}
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
              accessibilityLabel={t("modules.math.inputPlaceholder")}
            />
          ) : (
            <View>
              {selectedImage ? (
                <View>
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: selectedImage.uri }} style={styles.image} resizeMode="contain" />
                  </View>
                  <View style={styles.imageActions}>
                    <TouchableOpacity style={styles.imageBtn} onPress={handleTakePhoto} accessibilityRole="button" accessibilityLabel={t("modules.math.retake")}> 
                      <Ionicons name="camera" size={18} color={colors.white} />
                      <Text style={styles.imageBtnText}>{t("modules.math.retake")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.imageBtn, { backgroundColor: colors.error || '#FF6B6B' }]} onPress={handleClearImage} accessibilityRole="button" accessibilityLabel={t("modules.math.clear")}> 
                      <Ionicons name="trash" size={18} color={colors.white} />
                      <Text style={styles.imageBtnText}>{t("modules.math.clear")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.imagePreview}>
                    <Ionicons name="camera-outline" size={40} color={colors.textTertiary} />
                    <Text style={[styles.emptyStateText, { marginTop: 12 }]}>{t("modules.math.selectImage")}</Text>
                  </View>
                  <View style={styles.imageActions}>
                    <TouchableOpacity style={styles.imageBtn} onPress={handleTakePhoto} accessibilityRole="button" accessibilityLabel={t("modules.math.takePhoto")}> 
                      <Ionicons name="camera" size={18} color={colors.white} />
                      <Text style={styles.imageBtnText}>{t("modules.math.takePhoto")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageBtn} onPress={handlePickImage} accessibilityRole="button" accessibilityLabel={t("modules.math.choosePhoto")}> 
                      <Ionicons name="images-outline" size={18} color={colors.white} />
                      <Text style={styles.imageBtnText}>{t("modules.math.choosePhoto")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Çöz Butonu */}
          <Button
            title={loading ? t("common.loading") : t("modules.math.solve")}
            gradient
            onPress={handleSolve}
            loading={loading}
            disabled={
              (inputMethod === "text" && !problem.trim()) ||
              (inputMethod === "image" && !selectedImage) ||
              (!isPremium && !hasExtraTokens)
            }
            containerStyle={styles.solveBtn}
            size="small"
          />

          {/* Sonuç */}
          {solution && (
            <Card style={styles.solutionCard}>
              <View style={styles.solutionHeader}>
                <Text style={styles.solutionTitle}>{t("modules.math.solution")}</Text>
            </View>
              
              <Text style={styles.answerText}>{solution.answer}</Text>
              
              {/* Aksiyon Butonları */}
              {/* <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleCopyAnswer}>
                  <Ionicons name="copy-outline" size={18} color={colors.white} />
                  <Text style={styles.actionBtnText}>Kopyala</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={handleShareSolution}>
                  <Ionicons name="share-outline" size={18} color={colors.white} />
                  <Text style={styles.actionBtnText}>Paylaş</Text>
                </TouchableOpacity>
              </View>
               */}
              {/* Adımları Göster Butonu */}
              {solution.steps && !showDetailedSolution && (
                <Button
                  title={isPremium ? "Adımları Göster" : `${extraTokenCost} Token ile Adımları Aç`}
                  onPress={isPremium ? () => setShowDetailedSolution(true) : handleShowStepsModal}
                  outlined
                  size="small"
                  icon={<Ionicons name="list-outline" size={16} color={colors.mathPrimary} />}
                  containerStyle={styles.stepsButton}
                />
              )}
              
              {/* Premium kullanıcılar için adım adım çözüm */}
              {solution.steps && showDetailedSolution && (
                <View style={styles.stepsContainer}>
                  <Text style={[styles.solutionTitle, { fontSize: 14, marginBottom: 8 }]}>
                    {t("modules.math.steps") || "Adım Adım Çözüm"}
                  </Text>
                  {solution.steps.map((step, index) => (
                    <View key={index} style={styles.stepItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
                  {solution.explanation && (
                    <Text style={styles.explanationText}>{solution.explanation}</Text>
                  )}
          </View>
              )}
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Token ile Adımları Açma Modal - SafeAreaView dışında */}
      {showStepsModal && (
        <View style={styles.stepsModal}>
          <View style={styles.modalContent}>
            <Ionicons name="diamond-outline" size={48} color={colors.mathPrimary} style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Adımları Aç</Text>
            <Text style={styles.modalText}>
              {hasExtraTokensForSteps 
                ? `${extraTokenCost} token kullanarak adım adım çözümü görebilirsiniz.`
                : `Adımları görmek için ${extraTokenCost} token daha gerekiyor.`
              }
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => setShowStepsModal(false)}
              >
                <Text style={[styles.modalBtnText, styles.modalBtnTextSecondary]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleUnlockSteps}
                disabled={!hasExtraTokensForSteps}
              >
                <Text style={[styles.modalBtnText, styles.modalBtnTextPrimary]}>
                  {hasExtraTokensForSteps ? `${extraTokenCost} Token Kullan` : 'Token Yetersiz'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </GradientBackground>
  );
};

export default MathSolverScreen;
