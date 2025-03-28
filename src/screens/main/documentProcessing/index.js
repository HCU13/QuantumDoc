import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useTokens } from "../../../context/TokenContext";
import { Text, Card, Button, Badge } from "../../../components";
import ProcessingHeader from "./components/ProcessingHeader";
import FileInfoCard from "./components/FileInfoCard";
import ProcessingProgress from "./components/ProcessingProgress";
import AnalysisResultCard from "./components/AnalysisResultCard";
import DocumentService from "../../../services/documentService";
import * as FileSystem from "expo-file-system";

const DocumentProcessingScreen = ({ route, navigation }) => {
  const { theme, isDark } = useTheme();
  const { TOKEN_COSTS, hasEnoughTokens, useToken, freeTrialUsed } = useTokens();

  // Get file data from route params
  const { file } = route.params || {};

  // States
  const [processingStage, setProcessingStage] = useState("ready"); // ready, uploading, analyzing, complete, error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [fileData, setFileData] = useState(null); // Değişiklik: textContent yerine fileData

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Initialize file info
  useEffect(() => {
    if (file) {
      // Generate file info
      const fileInfoData = {
        name: file.name,
        type: file.mimeType || file.type,
        size: formatFileSize(file.size),
        pages: estimatePageCount(file.size, file.mimeType || file.type),
        lastModified: new Date().toLocaleDateString(),
      };

      setFileInfo(fileInfoData);
    }

    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [file]);

  // Estimate page count based on file size and type
  const estimatePageCount = (size, mimeType) => {
    if (!size) return 1;

    // Very rough estimate: PDF pages are ~50KB each, images are 1 page
    if (mimeType?.includes("pdf")) {
      return Math.max(1, Math.ceil(size / 50000));
    } else if (mimeType?.includes("image")) {
      return 1;
    } else {
      // Text or other documents
      return Math.max(1, Math.ceil(size / 30000));
    }
  };

  // Handle processing stage changes
  useEffect(() => {
    if (processingStage === "uploading" || processingStage === "analyzing") {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, processingStage]);

  // Get file type icon name
  const getFileTypeIcon = () => {
    if (!file) return "document-outline";

    const type = (file.mimeType || file.type || "").toLowerCase();

    if (type.includes("pdf")) return "document-text";
    if (type.includes("image")) return "image";
    if (type.includes("word") || type.includes("doc")) return "document";

    return "document-outline";
  };

  // Get file type color
  const getFileTypeColor = () => {
    if (!file) return theme.colors.primary;

    const type = (file.mimeType || file.type || "").toLowerCase();

    if (type.includes("pdf")) return theme.colors.error;
    if (type.includes("image")) return theme.colors.info;
    if (type.includes("word") || type.includes("doc"))
      return theme.colors.primary;

    return theme.colors.secondary;
  };

  // Read file content
  const readFileContent = async (fileUri) => {
    try {
      const type = (file.mimeType || file.type || "").toLowerCase();

      // PDF dosyaları için
      if (type.includes("pdf")) {
        // PDF dosyasını base64 olarak oku
        const base64Content = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // PDF içeriğini Firebase'e gönderirken kullanabiliriz
        return {
          content: "PDF document content that would be analyzed by Claude",
          rawData: base64Content,
          fileType: "pdf",
        };
      }
      // Görüntü dosyaları için
      else if (type.includes("image")) {
        // Görüntüleri de base64 olarak oku (OCR için gerekebilir)
        const base64Image = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        return {
          content: "Image content that would be extracted using OCR",
          rawData: base64Image,
          fileType: "image",
        };
      }
      // Metin dosyaları için
      else {
        // Text dosyalarını normal stringler olarak oku
        const content = await FileSystem.readAsStringAsync(fileUri);
        return {
          content: content || "File content could not be read",
          rawData: content,
          fileType: "text",
        };
      }
    } catch (error) {
      console.error("Error reading file:", error);
      return {
        content: `Error reading file: ${error.message}`,
        error: true,
      };
    }
  };

  // Start document processing
  const startProcessing = async () => {
    try {
      const processingCost = TOKEN_COSTS.DOCUMENT_ANALYSIS;

      // Check if user has enough tokens
      if (!hasEnoughTokens(processingCost) && freeTrialUsed) {
        Alert.alert(
          "Not Enough Tokens",
          "You need at least 1 token to analyze this document.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Buy Tokens",
              onPress: () => navigation.navigate("TokenStore"),
            },
          ]
        );
        return;
      }

      // Start upload process
      setProcessingStage("uploading");
      setProgress(0);

      // Simulate progress updates
      const uploadInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 95) {
            clearInterval(uploadInterval);
            return 100;
          }
          return newProgress;
        });
      }, 100);

      try {
        // Upload file to Firebase
        const uploadedDoc = await DocumentService.uploadDocument(
          file.uri,
          file.name
        );
        setDocumentId(uploadedDoc.id);
        clearInterval(uploadInterval);
        setProgress(100);

        // Short delay before moving to analysis
        setTimeout(async () => {
          setProcessingStage("analyzing");
          setProgress(0);

          // Read the file content for analysis
          const fileDataResult = await readFileContent(file.uri);
          setFileData(fileDataResult); // Değişiklik: fileData'yı ayarla

          // Dosya okuma hatası varsa işlemi durdur
          if (fileDataResult.error) {
            setProcessingStage("error");
            setError(`Failed to read file: ${fileDataResult.content}`);
            return;
          }

          // Start analysis progress simulation
          const analysisInterval = setInterval(() => {
            setProgress((prev) => {
              const newProgress = prev + 2;
              if (newProgress >= 95) {
                clearInterval(analysisInterval);
                return 95;
              }
              return newProgress;
            });
          }, 100);

          try {
            // Use token if free trial is used
            if (!freeTrialUsed) {
              // Just mark free trial as used
              await useToken(0, "analysis", uploadedDoc.id);
            } else {
              // Use actual token
              await useToken(processingCost, "analysis", uploadedDoc.id);
            }

            // Analyze document with Claude - fileDataResult nesnesini gönder
            const analysis = await DocumentService.analyzeDocument(
              uploadedDoc.id,
              fileDataResult // Değişiklik: Nesne olarak gönder
            );
            setAnalysisResult(analysis);

            // Complete the progress
            clearInterval(analysisInterval);
            setProgress(100);
            setProcessingStage("complete");
          } catch (analysisError) {
            console.error("Analysis error:", analysisError);
            clearInterval(analysisInterval);
            setProcessingStage("error");
            setError("Failed to analyze document. Please try again.");
          }
        }, 800);
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        clearInterval(uploadInterval);
        setProcessingStage("error");
        setError("Failed to upload document. Please try again.");
      }
    } catch (error) {
      console.error("Processing error:", error);
      setProcessingStage("error");
      setError("An error occurred. Please try again.");
    }
  };

  // View document details after processing
  const viewDocument = () => {
    navigation.navigate("DocumentDetail", {
      documentId: documentId,
      newDocument: true,
      fileType: fileData?.fileType, // Değişiklik: Dosya tipini ilet
    });
  };

  // Render processing content based on current stage
  const renderProcessingContent = () => {
    switch (processingStage) {
      case "ready":
        return (
          <View style={styles.readyContainer}>
            <Text variant="subtitle1" style={styles.readyTitle}>
              Ready to Process
            </Text>
            <Text
              variant="body2"
              color={theme.colors.textSecondary}
              style={styles.readyDescription}
            >
              Your document will be uploaded and analyzed using AI. This helps
              extract key information automatically.
            </Text>
            <Button
              label={
                freeTrialUsed
                  ? `Process Document (${TOKEN_COSTS.DOCUMENT_ANALYSIS} Token)`
                  : "Process Document (Free Trial)"
              }
              onPress={startProcessing}
              gradient={true}
              style={styles.processButton}
              leftIcon={<Ionicons name="flash" size={20} color="#FFFFFF" />}
            />

            {!freeTrialUsed && (
              <View style={styles.freeTrialNotice}>
                <Ionicons
                  name="information-circle"
                  size={16}
                  color={theme.colors.info}
                />
                <Text
                  variant="caption"
                  color={theme.colors.info}
                  style={styles.freeTrialText}
                >
                  Your first document analysis is free!
                </Text>
              </View>
            )}
          </View>
        );

      case "uploading":
      case "analyzing":
        return (
          <ProcessingProgress
            stage={processingStage}
            progress={progress}
            progressAnim={progressAnim}
          />
        );

      case "complete":
        return (
          <AnalysisResultCard
            result={analysisResult}
            onViewDocument={viewDocument}
            fileType={fileData?.fileType} // Değişiklik: Dosya tipini ilet
          />
        );

      case "error":
        return (
          <View style={styles.errorContainer}>
            <View
              style={[
                styles.errorIcon,
                { backgroundColor: theme.colors.error + "15" },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={32}
                color={theme.colors.error}
              />
            </View>
            <Text
              variant="subtitle1"
              color={theme.colors.error}
              style={styles.errorTitle}
            >
              Processing Failed
            </Text>
            <Text
              variant="body2"
              color={theme.colors.textSecondary}
              style={styles.errorMessage}
            >
              {error || "Something went wrong. Please try again."}
            </Text>
            <Button
              label="Try Again"
              onPress={() => {
                setProcessingStage("ready");
                setError(null);
              }}
              variant="outline"
              style={styles.tryAgainButton}
            />
          </View>
        );
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <ProcessingHeader
        title={
          processingStage === "complete"
            ? "Analysis Complete"
            : "Document Processing"
        }
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            },
          ]}
        >
          {fileInfo && (
            <FileInfoCard
              file={file}
              fileInfo={fileInfo}
              getFileTypeIcon={getFileTypeIcon}
              getFileTypeColor={getFileTypeColor}
            />
          )}

          <Card style={styles.processingCard}>{renderProcessingContent()}</Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  mainContent: {
    padding: 20,
  },
  processingCard: {
    borderRadius: 16,
    marginTop: 16,
    padding: 20,
  },
  readyContainer: {
    alignItems: "center",
  },
  readyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  readyDescription: {
    textAlign: "center",
    marginBottom: 24,
  },
  processButton: {
    minWidth: 240,
    marginBottom: 16,
  },
  freeTrialNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  freeTrialText: {
    marginLeft: 6,
  },
  errorContainer: {
    alignItems: "center",
    padding: 16,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: "center",
    marginBottom: 24,
  },
  tryAgainButton: {
    minWidth: 160,
  },
});

export default DocumentProcessingScreen;
