import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";

const { width, height } = Dimensions.get("window");

const MathSolverScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [solution, setSolution] = useState(null);
  const [steps, setSteps] = useState([]);
  const [solutionExpanded, setSolutionExpanded] = useState(true);
  const [isPremium, setIsPremium] = useState(false); // UI-only premium simülasyonu
  const tokenCost = 2; // Cost to solve one math problem
  const [showFeedback, setShowFeedback] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [clarityFeedbackGiven, setClarityFeedbackGiven] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'up' | 'down'
  const [clarity, setClarity] = useState(null); // 'clear' | 'unclear'

  // Request camera and gallery permission when component mounts
  useEffect(() => {
    (async () => {
      try {
        const cameraPermission =
          await ImagePicker.requestCameraPermissionsAsync();
        const galleryPermission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!cameraPermission.granted || !galleryPermission.granted) {
          Alert.alert(
            "İzin Gerekli",
            "Matematik çözücü için kamera ve galeri izinleri gerekiyor.",
            [{ text: "Tamam" }]
          );
        }
      } catch (error) {
        console.log("Permission error:", error);
        // Simülatörde izin sorgusu da hata verebilir, sessizce devam edelim
      }
    })();
  }, []);

  // Take a picture with the camera
  const takePicture = async () => {
    try {
      // Simülatörde gerçek kamera olmadığını kontrol etmek için daha iyi bir hata yönetimi
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images", // String olarak doğrudan belirtiyoruz
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error taking picture:", error);
      Alert.alert(
        "Kamera Kullanılamıyor",
        "Kameraya erişilemiyor. Simülatör/emülatörde çalışıyorsanız, lütfen gerçek bir cihazda deneyin veya galeriden bir resim seçin.",
        [{ text: "Tamam" }]
      );
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images", // String olarak belirtiyoruz
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Hata", "Galeriden resim seçilirken bir hata oluştu.");
    }
  };

  // Handle solving the math problem
  const handleSolve = async () => {
    // Check if user has enough tokens
    if (tokens < tokenCost) {
      Alert.alert(
        "Yetersiz Token",
        `Bu işlem için ${tokenCost} token gerekiyor. Daha fazla token kazanın.`,
        [
          { text: "İptal", style: "cancel" },
          { text: "Token Kazan", onPress: () => navigation.navigate("Tokens") },
        ]
      );
      return;
    }

    setProcessing(true);

    try {
      // Call to useTokens to deduct tokens
      await useTokens(tokenCost);

      // Simulate processing delay
      setTimeout(() => {
        // This is just mock data. In a real app, you'd send the image to a backend or ML model
        const mockSolution = {
          problem: "3x² + 8x - 4 = 0",
          result: "x = -3 veya x = 0.44",
          steps: [
            {
              step: 1,
              description: "Verilen denklemi standart forma getirelim:",
              equation: "3x² + 8x - 4 = 0",
              explanation:
                "Denklem zaten standart formda: ax² + bx + c = 0, burada a=3, b=8, c=-4.",
            },
            {
              step: 2,
              description: "Diskriminantı hesaplayalım:",
              equation: "Δ = b² - 4ac = 8² - 4×3×(-4) = 64 + 48 = 112",
              explanation:
                "Diskriminant (Δ), köklerle ilgili bilgi verir. Δ > 0 olduğu için denklemin iki farklı gerçek kökü vardır.",
            },
            {
              step: 3,
              description: "Quadratic formülünü uygulayalım:",
              equation: "x = (-b ± √Δ) / 2a = (-8 ± √112) / 6",
              explanation:
                "Kökleri bulmak için standart quadratic formülü kullanıyoruz.",
            },
            {
              step: 4,
              description: "√112 değerini hesaplayalım:",
              equation: "√112 ≈ 10.58",
              explanation: "Kare kök içindeki değeri hesaplıyoruz.",
            },
            {
              step: 5,
              description: "İlk kökü hesaplayalım:",
              equation: "x₁ = (-8 + 10.58) / 6 ≈ 0.43",
              explanation: "Artı işareti kullanarak ilk kökü buluyoruz.",
            },
            {
              step: 6,
              description: "İkinci kökü hesaplayalım:",
              equation: "x₂ = (-8 - 10.58) / 6 ≈ -3.1",
              explanation: "Eksi işareti kullanarak ikinci kökü buluyoruz.",
            },
            {
              step: 7,
              description: "Sonucu yuvarlayalım:",
              equation: "x₁ ≈ 0.44 ve x₂ ≈ -3",
              explanation: "Son cevabımız: x = -3 veya x = 0.44",
            },
          ],
        };

        setSolution(mockSolution);
        setSteps(mockSolution.steps);
        setProcessing(false);
      }, 2000);
    } catch (error) {
      console.log("Error processing image:", error);
      Alert.alert("Hata", "Görüntü işlenirken bir hata oluştu.");
      setProcessing(false);
    }
  };

  // Reset everything
  const resetAll = () => {
    setImage(null);
    setSolution(null);
    setSteps([]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    content: {
      flex: 1,
      padding: SIZES.padding,
    },
    // Kamera ile ilgili stil özellikleri kaldırıldı çünkü artık ImagePicker kullanıyoruz
    imageContainer: {
      width: "100%",
      height: width * 0.7, // Maintain aspect ratio
      borderRadius: SIZES.radius,
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 20,
    },
    problemImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 15,
    },
    processingContainer: {
      alignItems: "center",
      marginVertical: 20,
    },
    processingText: {
      ...FONTS.body3,
      color: colors.textPrimary,
      marginTop: 15,
    },
    solutionContainer: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 16,
      marginVertical: 12,
      elevation: 3,
    },
    solutionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: colors.primary,
      borderTopLeftRadius: SIZES.radius,
      borderTopRightRadius: SIZES.radius,
    },
    solutionTitle: {
      ...FONTS.h3,
      color: colors.white,
    },
    solutionContent: {
      padding: 15,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : colors.card,
      borderBottomLeftRadius: SIZES.radius,
      borderBottomRightRadius: SIZES.radius,
    },
    problemText: {
      ...FONTS.h3,
      color: colors.textPrimary,
      marginBottom: 10,
      textAlign: "center",
    },
    resultText: {
      ...FONTS.h3,
      color: colors.primary,
      marginTop: 10,
      marginBottom: 15,
      textAlign: "center",
    },
    stepsTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      marginTop: 15,
      marginBottom: 10,
    },
    stepCard: {
      marginBottom: 12,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : colors.white,
      borderRadius: SIZES.radius,
      elevation: 2,
    },
    stepHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : colors.lightGray,
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    stepNumberText: {
      ...FONTS.body4,
      color: colors.white,
      fontWeight: "bold",
    },
    stepDescription: {
      ...FONTS.body3,
      color: colors.textPrimary,
      flex: 1,
    },
    stepContent: {
      padding: 15,
    },
    equationText: {
      ...FONTS.body3,
      color: colors.primary,
      marginBottom: 10,
      textAlign: "center",
      fontWeight: "bold",
    },
    explanationText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    placeholderText: {
      ...FONTS.body3,
      color: colors.textSecondary,
      textAlign: "center",
    },
    card: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 16,
      padding: 15,
      marginBottom: 15,
      elevation: 3,
    },
    button: {
      borderRadius: 12,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 4,
          backgroundColor: colors.primary,
        },
      }),
    },
    input: {
      backgroundColor: isDark
        ? "rgba(0, 0, 0, 0.2)"
        : "rgba(255, 255, 255, 0.7)",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.08)",
      color: colors.textPrimary,
      ...Platform.select({
        android: {
          elevation: 0,
          overflow: "hidden",
        },
      }),
    },
    optionButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 16,
      marginRight: 8,
      borderWidth: 1,
      borderColor: "transparent",
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    optionButtonSelected: {
      backgroundColor: colors.primary + "22",
      borderColor: colors.primary,
      ...Platform.select({
        android: {
          borderWidth: 1.5,
        },
      }),
    },
    // İzin uyarıları artık kullanılmıyor
  });

  // Kamera ve galeri izinleriyle ilgili ekran kaldırıldı, ImagePicker kendi izin diyaloglarını gösterecek

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title="Matematik Çözücü" showBackButton />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image container */}
          <View style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.problemImage} />
            ) : (
              <Text style={styles.placeholderText}>
                Matematik sorusunun fotoğrafını çekin veya galeriden bir resim
                seçin
              </Text>
            )}
          </View>

          {/* Action buttons - sadece image ve solution yoksa göster */}
          {!image && !solution && !processing && (
            <View style={styles.buttonsContainer}>
              <Button
                title="Fotoğraf Çek"
                icon={
                  <Ionicons
                    name="camera-outline"
                    size={20}
                    color={colors.white}
                  />
                }
                onPress={takePicture}
                containerStyle={{ flex: 1, marginRight: 8 }}
                disabled={processing}
              />
              <Button
                title="Galeriden Seç"
                icon={
                  <Ionicons
                    name="images-outline"
                    size={20}
                    color={colors.textOnGradient}
                  />
                }
                onPress={pickImage}
                containerStyle={{ flex: 1, marginLeft: 8 }}
                outlined
                disabled={processing}
              />
            </View>
          )}

          {/* Çöz butonu - sadece image varsa ve çözüm yoksa göster */}
          {image && !solution && !processing && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <Button
                title="Çöz"
                gradient
                icon={
                  <Ionicons
                    name="calculator-outline"
                    size={20}
                    color={colors.white}
                  />
                }
                onPress={handleSolve}
                fluid
                containerStyle={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Yeniden Seç"
                icon={
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={colors.primary}
                  />
                }
                outlined
                onPress={() => setImage(null)}
                fluid
                containerStyle={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          )}

          {/* Processing indicator */}
          {processing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>
                Matematik problemi çözülüyor...
              </Text>
            </View>
          )}

          {/* Solution */}
          {solution && (
            <View style={styles.solutionContainer}>
              <TouchableOpacity
                style={styles.solutionHeader}
                onPress={() => setSolutionExpanded(!solutionExpanded)}
              >
                <Text style={styles.solutionTitle}>Çözüm</Text>
                <Ionicons
                  name={solutionExpanded ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={colors.white}
                />
              </TouchableOpacity>

              {solutionExpanded && (
                <View style={styles.solutionContent}>
                  <Text style={styles.problemText}>{solution.problem}</Text>
                  <Text style={styles.resultText}>{solution.result}</Text>

                  {/* Premium olmayanlar için adım adım çözüm blur/kapalı ve CTA */}
                  {isPremium ? (
                    <>
                      <Text style={styles.stepsTitle}>Adım adım çözüm:</Text>
                      {steps.map((step) => (
                        <View key={step.step} style={styles.stepCard}>
                          <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                              <Text style={styles.stepNumberText}>{step.step}</Text>
                            </View>
                            <Text style={styles.stepDescription}>
                              {step.description}
                            </Text>
                          </View>
                          <View style={styles.stepContent}>
                            <Text style={styles.equationText}>{step.equation}</Text>
                            <Text style={styles.explanationText}>
                              {step.explanation}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </>
                  ) : (
                    <View style={{ alignItems: "center", marginTop: 24, marginBottom: 12 }}>
                      <View style={{
                        width: "100%",
                        minHeight: 120,
                        borderRadius: 16,
                        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F0F5",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                        opacity: 0.5,
                      }}>
                        <Ionicons name="lock-closed-outline" size={36} color={colors.primary} style={{ marginBottom: 8 }} />
                        <Text style={{ ...FONTS.body3, color: colors.textSecondary, textAlign: "center" }}>
                          Adım adım çözüm sadece premium üyeler için açıktır.
                        </Text>
                      </View>
                      <Button
                        title="Premium'a Geç"
                        icon={<Ionicons name="star" size={18} color={colors.white} />}
                        onPress={() => setIsPremium(true)}
                        gradient
                        containerStyle={{ width: 200 }}
                      />
                    </View>
                  )}

                  {/* Feedback alanı her zaman çözümde gözüksün */}
                  <View style={{ marginTop: 24, alignItems: "center" }}>
                    <Text style={{ ...FONTS.body3, color: colors.textPrimary, marginBottom: 10 }}>
                      Bu çözüm işine yaradı mı?
                    </Text>
                    <View style={{ flexDirection: "row", marginBottom: 8 }}>
                      <TouchableOpacity
                        onPress={() => { setFeedback("up"); setFeedbackGiven(true); }}
                        disabled={feedbackGiven}
                        style={{ marginHorizontal: 16, opacity: feedbackGiven && feedback !== "up" ? 0.5 : 1 }}
                      >
                        <Ionicons name="thumbs-up" size={32} color={feedback === "up" ? colors.primary : colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => { setFeedback("down"); setFeedbackGiven(true); }}
                        disabled={feedbackGiven}
                        style={{ marginHorizontal: 16, opacity: feedbackGiven && feedback !== "down" ? 0.5 : 1 }}
                      >
                        <Ionicons name="thumbs-down" size={32} color={feedback === "down" ? colors.primary : colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                    {feedbackGiven && (
                      <Text style={{ ...FONTS.body4, color: colors.textSecondary, marginBottom: 8 }}>Teşekkürler!</Text>
                    )}

                    {/* İkinci feedback: Anlaşılırlık */}
                    <Text style={{ ...FONTS.body4, color: colors.textPrimary, marginBottom: 6, marginTop: 8 }}>
                      Çözüm yeterince anlaşılır mıydı?
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Button
                        title="Anlaşılır"
                        onPress={() => { setClarity("clear"); setClarityFeedbackGiven(true); }}
                        disabled={clarityFeedbackGiven}
                        gradient={clarity === "clear"}
                        outlined={clarity !== "clear"}
                        containerStyle={{ marginRight: 8, minWidth: 110 }}
                      />
                      <Button
                        title="Yetersiz"
                        onPress={() => { setClarity("unclear"); setClarityFeedbackGiven(true); }}
                        disabled={clarityFeedbackGiven}
                        gradient={clarity === "unclear"}
                        outlined={clarity !== "unclear"}
                        containerStyle={{ minWidth: 110 }}
                      />
                    </View>
                    {clarityFeedbackGiven && (
                      <Text style={{ ...FONTS.body4, color: colors.textSecondary, marginTop: 6 }}>Geri bildiriminiz için teşekkürler!</Text>
                    )}
                  </View>

                  <Button
                    title="Yeni Soru Çöz"
                    icon={
                      <Ionicons
                        name="refresh-outline"
                        size={20}
                        color={colors.white}
                      />
                    }
                    onPress={resetAll}
                    containerStyle={{ marginTop: 20 }}
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default MathSolverScreen;
