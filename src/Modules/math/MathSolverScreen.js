import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";
import { useMath } from "../../hooks/useMath";
import { useTranslation } from "react-i18next";

const MathSolverScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const { t } = useTranslation();
  const { 
    solveMathProblem, 
    solveImageProblem, 
    loading, 
    error,
    result 
  } = useMath();

  const [problem, setProblem] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [inputMethod, setInputMethod] = useState("text"); // "text" or "image"

  const tokenCost = 2; // Matematik problemi çözme maliyeti
  const remainingTokens = tokens - tokenCost;

  // Resim seçme
  const pickImage = async () => {
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
      }
    } catch (error) {
      Alert.alert("Hata", "Resim seçilirken bir hata oluştu");
    }
  };

  // Kamera ile fotoğraf çekme
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("İzin Gerekli", "Kamera izni gereklidir");
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
      }
    } catch (error) {
      Alert.alert("Hata", "Fotoğraf çekilirken bir hata oluştu");
    }
  };

  // Problem çözme
  const handleSolveProblem = async () => {
    if (inputMethod === "text" && !problem.trim()) {
      Alert.alert("Hata", "Lütfen bir matematik problemi girin");
      return;
    }

    if (inputMethod === "image" && !selectedImage) {
      Alert.alert("Hata", "Lütfen bir resim seçin");
      return;
    }

    if (remainingTokens < 0) {
      Alert.alert(
        "Yetersiz Token",
        `Bu işlem için ${tokenCost} token gerekiyor. Daha fazla token kazanmak için token sayfanıza gidin.`,
        [
          { text: "İptal", style: "cancel" },
          { text: "Token Al", onPress: () => navigation.navigate("Tokens") },
        ]
      );
      return;
    }

    try {
      if (inputMethod === "text") {
        await solveMathProblem(problem);
      } else {
        await solveImageProblem(selectedImage);
      }
      
      // Token kullan
      await useTokens(tokenCost);
    } catch (error) {
      Alert.alert("Hata", error.message || "Problem çözülürken bir hata oluştu");
    }
  };

  // Resmi temizle
  const clearImage = () => {
    setSelectedImage(null);
    setInputMethod("text");
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
    header: {
      marginBottom: 30,
    },
    title: {
      ...FONTS.h2,
      color: colors.textPrimary,
      marginBottom: 10,
    },
    subtitle: {
      ...FONTS.body4,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    inputMethodContainer: {
      marginBottom: 20,
    },
    methodTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      marginBottom: 15,
    },
    methodButtons: {
      flexDirection: "row",
      marginBottom: 20,
    },
    methodButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: SIZES.radius,
      marginHorizontal: 5,
      borderWidth: 2,
      borderColor: colors.border,
    },
    methodButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    methodButtonText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      marginLeft: 8,
    },
    methodButtonTextActive: {
      color: colors.white,
    },
    textInputContainer: {
      marginBottom: 20,
    },
    textInput: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 16,
      minHeight: 120,
      textAlignVertical: "top",
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      ...FONTS.body4,
    },
    imageInputContainer: {
      marginBottom: 20,
    },
    imagePreview: {
      width: "100%",
      height: 200,
      borderRadius: SIZES.radius,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    imagePreviewImage: {
      width: "100%",
      height: "100%",
      borderRadius: SIZES.radius,
    },
    imageActions: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 15,
    },
    imageActionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: SIZES.radius,
      backgroundColor: colors.primary,
    },
    imageActionButtonText: {
      ...FONTS.body4,
      color: colors.white,
      marginLeft: 8,
    },
    solveButton: {
      marginBottom: 20,
    },
    resultContainer: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 20,
      marginTop: 20,
    },
    resultTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      marginBottom: 10,
    },
    resultText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    tokenInfo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    tokenText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    examplesContainer: {
      marginTop: 20,
    },
    examplesTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      marginBottom: 15,
    },
    exampleItem: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 12,
      marginBottom: 8,
    },
    exampleText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />

        <Header title={t("modules.math.title")} showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("modules.math.title")}</Text>
            <Text style={styles.subtitle}>
              {t("modules.math.subtitle")}
            </Text>
          </View>

          <View style={styles.tokenInfo}>
            <Ionicons name="diamond-outline" size={20} color={colors.primary} />
            <Text style={styles.tokenText}>
              {t("modules.math.tokenCost", { cost: tokenCost })}
            </Text>
          </View>

          <View style={styles.inputMethodContainer}>
            <Text style={styles.methodTitle}>
              {t("modules.math.inputMethod")}
            </Text>
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  inputMethod === "text" && styles.methodButtonActive,
                ]}
                onPress={() => setInputMethod("text")}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={inputMethod === "text" ? colors.white : colors.textPrimary}
                />
                <Text
                  style={[
                    styles.methodButtonText,
                    inputMethod === "text" && styles.methodButtonTextActive,
                  ]}
                >
                  {t("modules.math.textInput")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  inputMethod === "image" && styles.methodButtonActive,
                ]}
                onPress={() => setInputMethod("image")}
              >
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={inputMethod === "image" ? colors.white : colors.textPrimary}
                />
                <Text
                  style={[
                    styles.methodButtonText,
                    inputMethod === "image" && styles.methodButtonTextActive,
                  ]}
                >
                  {t("modules.math.imageInput")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {inputMethod === "text" ? (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={problem}
                onChangeText={setProblem}
                placeholder={t("modules.math.textPlaceholder")}
                placeholderTextColor={colors.textTertiary}
                multiline
                textAlignVertical="top"
              />
            </View>
          ) : (
            <View style={styles.imageInputContainer}>
              {selectedImage ? (
                <View>
                  <View style={styles.imagePreview}>
                    <Image
                      source={{ uri: selectedImage.uri }}
                      style={styles.imagePreviewImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={takePhoto}
                    >
                      <Ionicons name="camera" size={20} color={colors.white} />
                      <Text style={styles.imageActionButtonText}>
                        {t("modules.math.retake")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.imageActionButton, { backgroundColor: colors.error }]}
                      onPress={clearImage}
                    >
                      <Ionicons name="trash" size={20} color={colors.white} />
                      <Text style={styles.imageActionButtonText}>
                        {t("modules.math.clear")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.imagePreview}>
                    <Ionicons name="camera-outline" size={48} color={colors.textTertiary} />
                    <Text style={[styles.subtitle, { marginTop: 10 }]}>
                      {t("modules.math.selectImage")}
                    </Text>
                  </View>
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={takePhoto}
                    >
                      <Ionicons name="camera" size={20} color={colors.white} />
                      <Text style={styles.imageActionButtonText}>
                        {t("modules.math.takePhoto")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={pickImage}
                    >
                      <Ionicons name="images-outline" size={20} color={colors.white} />
                      <Text style={styles.imageActionButtonText}>
                        {t("modules.math.choosePhoto")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          <Button
            title={t("modules.math.solve")}
            gradient
            onPress={handleSolveProblem}
            loading={loading}
            disabled={
              (inputMethod === "text" && !problem.trim()) ||
              (inputMethod === "image" && !selectedImage) ||
              remainingTokens < 0
            }
            containerStyle={styles.solveButton}
          />

          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>
                {t("modules.math.result")}
              </Text>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          )}

          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>
              {t("modules.math.examples")}
            </Text>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleText}>2x + 5 = 13</Text>
            </View>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleText}>∫ x² dx</Text>
            </View>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleText}>sin(30°) + cos(60°)</Text>
            </View>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleText}>x² + 3x + 2 = 0</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default MathSolverScreen;
