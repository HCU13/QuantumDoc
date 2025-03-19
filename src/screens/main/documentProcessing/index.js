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
        type: file.mimeType,
        size: formatFileSize(file.size),
        pages: Math.max(1, Math.floor(file.size / 50000)), // Estimate pages based on size
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

    const type = file.mimeType?.toLowerCase() || "";

    if (type.includes("pdf")) return "document-text";
    if (type.includes("image")) return "image";
    if (type.includes("word") || type.includes("doc")) return "document";

    return "document-outline";
  };

  // Get file type color
  const getFileTypeColor = () => {
    if (!file) return theme.colors.primary;

    const type = file.mimeType?.toLowerCase() || "";

    if (type.includes("pdf")) return theme.colors.error;
    if (type.includes("image")) return theme.colors.info;
    if (type.includes("word") || type.includes("doc"))
      return theme.colors.primary;

    return theme.colors.secondary;
  };

  // Start upload and analysis process
  const startProcessing = async () => {
    try {
      const processingCost = TOKEN_COSTS.DOCUMENT_ANALYSIS;

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

      // Start upload
      setProcessingStage("uploading");

      // Simulate upload progress using documentService
      let currentProgress = 0;
      const uploadInterval = setInterval(() => {
        currentProgress += 5;
        if (currentProgress > 95) {
          clearInterval(uploadInterval);
          currentProgress = 100;

          // Move to analysis stage
          setTimeout(async () => {
            setProgress(0);
            setProcessingStage("analyzing");

            try {
              // Call DocumentService's uploadDocument function to upload the document
              const result = await DocumentService.uploadDocument(
                file.uri,
                file.name
              );

              if (result.error) {
                throw new Error(result.error);
              }

              // Simulate document analysis result (replace with actual analysis logic)
              setTimeout(() => {
                setAnalysisResult({
                  summary:
                    "This document outlines the financial performance for Q2 2024. Revenue increased by 12% compared to the previous quarter, while operating expenses were reduced by 7% through effective cost management.",
                  keyPoints: [
                    "Revenue increased by 12% quarter-over-quarter to $3.4M",
                    "Operating expenses reduced by 7% through cost optimization",
                    "Gross profit margin improved to 58% from 52%",
                    "Cash reserves at $4.2M, sufficient for planned Q3 investments",
                  ],
                  topics: ["Finance", "Business", "Quarterly Report"],
                });
              }, 500);

              // Use token if free trial is used
              if (!freeTrialUsed) {
                // Free trial used
              } else {
                useToken(processingCost, "analysis");
              }

              // Complete process
              setTimeout(() => {
                setProcessingStage("complete");
              }, 500);
            } catch (error) {
              console.error("Error in processing:", error);
              setProcessingStage("error");
              setError(
                "An error occurred during document processing. Please try again."
              );
            }
          }, 800);
        }
        setProgress(currentProgress);
      }, 80);
    } catch (error) {
      console.error("Processing error:", error);
      setProcessingStage("error");
      setError(
        "An error occurred during document processing. Please try again."
      );
    }
  };

  // View document details after processing
  const viewDocument = () => {
    navigation.navigate("DocumentDetail", {
      documentId: `doc-${Date.now()}`,
      newDocument: true,
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
                  ? "Process Document (1 Token)"
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
          {/* File Info Card */}
          {fileInfo && (
            <FileInfoCard
              file={file}
              fileInfo={fileInfo}
              getFileTypeIcon={getFileTypeIcon}
              getFileTypeColor={getFileTypeColor}
            />
          )}

          {/* Processing Area */}
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
