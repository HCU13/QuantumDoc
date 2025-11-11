import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  Clipboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useImagePicker } from "../../hooks/useImagePicker";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import ModuleIntroCard from "../../components/common/ModuleIntroCard";
import TabSwitch from "../../components/common/TabSwitch";
import ResultText from "../../components/common/ResultText";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useTokenContext } from "../../contexts/TokenContext";
import { useImageAnalyzer } from "../../hooks/useImageAnalyzer";
import { useAuth } from "../../contexts/AuthContext";
import { showError, showSuccess } from "../../utils/toast";
import {
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { COLORS } from "../../constants/colors";

const ImageAnalyzerScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { tokens, getTokenCostLabel, getTokenCost } = useTokenContext();
  const { user } = useAuth();
  const { analyzeImage, loading: hookLoading } = useImageAnalyzer();
  
  // Modül rengini al
  const moduleColor = colors.imageAnalyzerPrimary || COLORS.light.imageAnalyzerPrimary;
  const moduleColorLight = colors.imageAnalyzerPrimaryLight || COLORS.light.imageAnalyzerPrimaryLight;

  const [inputMethod, setInputMethod] = useState("gallery"); // "gallery" or "camera"
  const [selectedImage, setSelectedImage] = useState(null);
  const [tokenLabel, setTokenLabel] = useState('6 token/analiz');
  const [analysisResult, setAnalysisResult] = useState("");
  // loading state hook'tan geliyor (hookLoading), ekstra state'e gerek yok

  // Token maliyetini database'den yükle (sadece bir kez - Math modülündeki gibi)
  useEffect(() => {
    const loadTokenLabel = async () => {
      const label = await getTokenCostLabel('imageAnalyzer');
      if (label) {
        setTokenLabel(label);
      }
    };
    loadTokenLabel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sadece mount'ta çalış - Math modülündeki gibi

  // ImagePicker hook'unu kullan
  const { pickFromGallery, takePhoto: takePhotoFromHook, loading: imagePickerLoading } = useImagePicker();

  const handleGallerySelect = async () => {
    setInputMethod("gallery");
    const uri = await pickFromGallery();
    if (uri) {
      setSelectedImage(uri);
      setAnalysisResult("");
    }
  };

  const handleCameraSelect = async () => {
    setInputMethod("camera");
    const uri = await takePhotoFromHook();
    if (uri) {
      setSelectedImage(uri);
      setAnalysisResult("");
    }
  };

  // Button çift tıklamayı önlemek için kontrol
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnalyze = async () => {
    // Eğer zaten işlem yapılıyorsa yeni istek gönderme (çift istek önleme)
    if (hookLoading || isProcessing) {
      return;
    }

    if (!selectedImage) {
      showError(
        t("common.warning"),
        t("imageAnalyzer.errors.noImage")
      );
      return;
    }

    // Token kontrolü
    const tokenCost = getTokenCost("imageAnalyzer") || 6;
    if (tokens < tokenCost) {
      showError(
        t("common.tokenInsufficient"),
        t("common.tokenInsufficientMessage", { cost: tokenCost, tokens })
      );
      return;
    }

    setIsProcessing(true);
    try {
      // selectedImage zaten string bir URI, .uri kullanmaya gerek yok
      const resultData = await analyzeImage(selectedImage, inputMethod);

      if (resultData.success) {
        setAnalysisResult(resultData.result);
      }
    } catch (err) {
      if (err.message === "INSUFFICIENT_TOKENS") {
        showError(
          t("common.tokenInsufficient"),
          t("common.tokenInsufficientMessage", { cost: tokenCost, tokens })
        );
      } else {
        showError(
          t("common.error"),
          err.message || t("imageAnalyzer.errors.analysisFailed")
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setAnalysisResult("");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
    },
    content: {
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm,
      flex: 1,
    },
    imagePickerContainer: {
      marginBottom: 0,
    },
    imageContainer: {
      width: "100%",
      height: 250,
      borderRadius: BORDER_RADIUS.md,
      overflow: "hidden",
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 0,
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    placeholderContainer: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    placeholderText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textTertiary,
      marginTop: SPACING.xs,
    },
    actionButtons: {
      flexDirection: "row",
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    actionButton: {
      flex: 1,
    },
    clearButton: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultContainer: {
      marginBottom: SPACING.md,
    },
    resultLabel: {
      ...TEXT_STYLES.labelMedium,
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
    },
    resultText: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.lg,
      minHeight: 100,
      borderWidth: 1,
      borderColor: colors.border,
    },
    imageMethodButtons: {
      flexDirection: "row",
      marginTop: SPACING.md,
      gap: SPACING.sm,
    },
    imageMethodButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: moduleColor + "15",
      borderRadius: BORDER_RADIUS.md,
      paddingVertical: SPACING.sm,
      borderWidth: 1,
      borderColor: moduleColor + "30",
      gap: SPACING.xs,
    },
    imageMethodButtonDisabled: {
      opacity: 0.6,
    },
    imageMethodButtonText: {
      ...TEXT_STYLES.labelMedium,
      color: colors.textPrimary,
      fontWeight: "600",
    },
  });

  return (
    <GradientBackground mode="default">
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />

        <Header
          title={t("modules.imageAnalyzer.title")}
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
                  backgroundColor: moduleColor + "15",
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
                    color: moduleColor,
                  }}
                >
                  {tokenLabel}
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

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro Card */}
          <ModuleIntroCard moduleId="imageAnalyzer" moduleColor={moduleColor} />

          {/* Image Preview */}
          <View style={styles.imagePickerContainer}>
            <View style={styles.imageContainer}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.image} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons
                    name="image-outline"
                    size={64}
                    color={colors.textTertiary}
                  />
                  <Text style={styles.placeholderText}>
                    {t("imageAnalyzer.noImageSelected")}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Giriş Yöntemi Butonları */}
          {!selectedImage && (
            <View style={styles.imageMethodButtons}>
              <TouchableOpacity
                style={[
                  styles.imageMethodButton,
                  imagePickerLoading && styles.imageMethodButtonDisabled,
                ]}
                onPress={handleGallerySelect}
                disabled={imagePickerLoading}
                activeOpacity={0.8}
              >
                {imagePickerLoading ? (
                  <ActivityIndicator size="small" color={moduleColor} />
                ) : (
                  <Ionicons name="images" size={18} color={moduleColor} />
                )}
                <Text style={styles.imageMethodButtonText}>
                  {imagePickerLoading
                    ? t("common.loading")
                    : t("imageAnalyzer.tabGallery")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.imageMethodButton,
                  imagePickerLoading && styles.imageMethodButtonDisabled,
                ]}
                onPress={handleCameraSelect}
                disabled={imagePickerLoading}
                activeOpacity={0.8}
              >
                {imagePickerLoading ? (
                  <ActivityIndicator size="small" color={moduleColor} />
                ) : (
                  <Ionicons name="camera" size={18} color={moduleColor} />
                )}
                <Text style={styles.imageMethodButtonText}>
                  {imagePickerLoading
                    ? t("common.loading")
                    : t("imageAnalyzer.tabCamera")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <View style={styles.actionButton}>
                <Button
                  title={t("imageAnalyzer.analyze")}
                  onPress={handleAnalyze}
                  loading={hookLoading}
                  module="imageAnalyzer"
                />
            </View>
            {selectedImage && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={colors.error}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Result Area */}
          {analysisResult ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>
                {t("imageAnalyzer.resultLabel")}
              </Text>
              <View style={styles.resultText}>
                <ResultText
                  text={analysisResult}
                  moduleColor={moduleColor}
                />
              </View>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ImageAnalyzerScreen;

