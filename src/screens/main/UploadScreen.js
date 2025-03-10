// src/screens/main/UploadScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
  PanResponder,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useTokens } from "../../context/TokenContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text } from "../../components/Text";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Loading } from "../../components/Loading";
import { documentApi } from "../../api/documentApi";
import LottieView from "lottie-react-native";
import { MotiView } from "moti";

const { width, height } = Dimensions.get("window");

const UploadScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const { useTokens, TOKEN_COSTS, freeTrialUsed } = useTokens();

  // State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("selecting"); // selecting, processing, uploading, complete, error
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileAnalysisInfo, setFileAnalysisInfo] = useState(null);

  // Refs
  const lottieRef = useRef(null);
  const uploadZoneRef = useRef(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Upload progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: uploadProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [uploadProgress]);

  // Start entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Start bounce animation for drop zone
    startBounceAnimation();
  }, []);

  // Start bounce animation
  const startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Accepted file types
  const ACCEPTED_DOCUMENT_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  // Max file size (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // File type extensions display
  const FILE_TYPE_DISPLAY = {
    "application/pdf": "PDF",
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "DOCX",
    "text/plain": "TXT",
  };

  // Drag and drop pan responder - simulated for mobile
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDragActive(true);
        // Vibration feedback when dragging starts
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderRelease: (evt, gestureState) => {
        setDragActive(false);

        // Check if released over drop zone
        if (uploadZoneRef.current) {
          uploadZoneRef.current.measure((x, y, width, height, pageX, pageY) => {
            const dropX = evt.nativeEvent.pageX;
            const dropY = evt.nativeEvent.pageY;

            if (
              dropX >= pageX &&
              dropX <= pageX + width &&
              dropY >= pageY &&
              dropY <= pageY + height
            ) {
              // Dropped on target
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              pickDocument();
            } else {
              // Dropped outside target
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          });
        }
      },
    })
  ).current;

  // Pick document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_DOCUMENT_TYPES,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          setUploadError("File size exceeds the 10MB limit");
          setUploadStage("error");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }

        setSelectedFile(file);
        setUploadStage("processing");

        // Run file analysis animation with simulated delay
        setTimeout(() => {
          // Simulate file analysis
          simulateFileAnalysis(file);
        }, 1500);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      setUploadError(t("errors.somethingWentWrong"));
      setUploadStage("error");
    }
  };

  // Simulate file analysis
  const simulateFileAnalysis = (file) => {
    // Randomly generate page count based on file size
    const estimatedPages = Math.max(1, Math.floor(file.size / 50000));

    // Generate readability score (1-10)
    const readabilityScore = Math.floor(Math.random() * 10) + 1;

    // Fake word count
    const wordCount = Math.floor(file.size / 10);

    setFileAnalysisInfo({
      pageCount: estimatedPages,
      wordCount: wordCount,
      readabilityScore: readabilityScore,
      encryptionStatus: false,
    });
  };

  // Get file type icon
  const getFileTypeIcon = () => {
    if (!selectedFile) return "document-outline";

    const type = selectedFile.mimeType?.toLowerCase() || "";

    if (type.includes("pdf")) return "document-text";
    if (type.includes("image")) return "image";
    if (type.includes("word") || type.includes("doc")) return "document";
    return "document-outline";
  };

  // Get file type color
  const getFileTypeColor = () => {
    if (!selectedFile) return theme.colors.primary;

    const type = selectedFile.mimeType?.toLowerCase() || "";

    if (type.includes("pdf")) return theme.colors.error;
    if (type.includes("image")) return theme.colors.info;
    if (type.includes("word") || type.includes("doc"))
      return theme.colors.primary;
    if (type.includes("text")) return theme.colors.textSecondary;
    return theme.colors.primary;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "";

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Upload document
  const uploadDocument = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadStage("uploading");
      setUploadProgress(0);

      // Use token
      await useTokens(TOKEN_COSTS.DOCUMENT_ANALYSIS, "analysis");

      // Upload file with progress tracking
      const uploadedDocument = await documentApi.uploadDocument(
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Simulate a small delay at 100% to show completion
      setUploadProgress(100);
      setTimeout(() => {
        setUploadStage("complete");

        // Wait a moment to show success, then navigate
        setTimeout(() => {
          navigation.replace("DocumentDetail", {
            documentId: uploadedDocument.id,
            newDocument: true,
          });
        }, 1500);
      }, 500);
    } catch (error) {
      console.error("Error uploading document:", error);
      setUploadError(t("errors.uploadFailed"));
      setUploadStage("error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Reset upload process
  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStage("selecting");
    setUploadProgress(0);
    setUploadError(null);
    setFileAnalysisInfo(null);
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <Text variant="h3">{t("home.uploadDocument")}</Text>

      <View style={{ width: 40 }} />
    </View>
  );

  // Render upload zone (initial)
  const renderUploadZone = () => (
    <Animated.View
      style={[
        styles.uploadAreaContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Card style={styles.uploadArea} variant={isDark ? "default" : "bordered"}>
        <Animated.View
          ref={uploadZoneRef}
          style={[
            styles.dropZone,
            dragActive && {
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.primary + "10",
            },
            {
              borderColor: theme.colors.border,
              transform: [
                {
                  scale: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.02],
                  }),
                },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 800 }}
          >
            {/* <LottieView
              ref={lottieRef}
              source={require("../../assets/animations/file-upload.json")}
              style={styles.uploadLottie}
              autoPlay
              loop
            /> */}
          </MotiView>

          <Text variant="h3" style={styles.dropZoneTitle}>
            Select a document
          </Text>

          <Text
            variant="body2"
            color={theme.colors.textSecondary}
            style={styles.dropZoneText}
          >
            Tap to browse or drag and drop a file here
          </Text>

          <View style={styles.fileTypeContainer}>
            {Object.entries(FILE_TYPE_DISPLAY).map(([mime, extension]) => (
              <Badge
                key={mime}
                label={extension}
                type={
                  mime.includes("image")
                    ? "info"
                    : mime.includes("pdf")
                    ? "error"
                    : "primary"
                }
                size="sm"
                style={styles.fileTypeBadge}
              />
            ))}
          </View>

          <Button
            title="Browse Files"
            onPress={pickDocument}
            style={styles.browseButton}
            gradient={true}
            icon="folder-open"
          />
        </Animated.View>
      </Card>
    </Animated.View>
  );

  // Render selected file
  const renderSelectedFile = () => {
    if (!selectedFile) return null;

    return (
      <Animated.View
        style={[
          styles.selectedFileContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Card
          style={styles.selectedFileCard}
          variant={isDark ? "default" : "bordered"}
        >
          <View style={styles.selectedFileContent}>
            {selectedFile.mimeType?.includes("image") ? (
              <Image
                source={{ uri: selectedFile.uri }}
                style={styles.filePreview}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.fileIconContainer,
                  { backgroundColor: getFileTypeColor() + "15" },
                ]}
              >
                <Ionicons
                  name={getFileTypeIcon()}
                  size={30}
                  color={getFileTypeColor()}
                />
              </View>
            )}

            <View style={styles.fileInfo}>
              <Text
                variant="subtitle1"
                weight="medium"
                style={styles.fileName}
                numberOfLines={1}
              >
                {selectedFile.name}
              </Text>
              <View style={styles.fileMetaContainer}>
                <Badge
                  label={FILE_TYPE_DISPLAY[selectedFile.mimeType] || "DOC"}
                  type="primary"
                  size="sm"
                  style={styles.fileTypeBadgeSmall}
                />
                <Text
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={styles.fileDetails}
                >
                  {formatFileSize(selectedFile.size)}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.removeButton} onPress={resetUpload}>
              <BlurView
                intensity={20}
                tint={isDark ? "dark" : "light"}
                style={styles.removeButtonBlur}
              >
                <Ionicons name="close" size={20} color={theme.colors.error} />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* File analysis info */}
          {fileAnalysisInfo && (
            <View style={styles.fileAnalysisContainer}>
              <View style={styles.fileAnalysisHeader}>
                <Ionicons
                  name="analytics"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  variant="body2"
                  weight="medium"
                  style={styles.fileAnalysisTitle}
                >
                  Document Analysis
                </Text>
              </View>

              <View style={styles.fileAnalysisGrid}>
                <View style={styles.fileAnalysisItem}>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    Pages
                  </Text>
                  <Text variant="body1" weight="medium">
                    {fileAnalysisInfo.pageCount}
                  </Text>
                </View>

                <View style={styles.fileAnalysisItem}>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    Word Count
                  </Text>
                  <Text variant="body1" weight="medium">
                    {fileAnalysisInfo.wordCount.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.fileAnalysisItem}>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    Readability
                  </Text>
                  <View style={styles.readabilityScore}>
                    {[...Array(10)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.readabilityBar,
                          {
                            backgroundColor:
                              i < fileAnalysisInfo.readabilityScore
                                ? getReadabilityColor(
                                    fileAnalysisInfo.readabilityScore
                                  )
                                : theme.colors.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.fileAnalysisItem}>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    Security
                  </Text>
                  <Text
                    variant="body1"
                    weight="medium"
                    color={
                      fileAnalysisInfo.encryptionStatus
                        ? theme.colors.error
                        : theme.colors.success
                    }
                  >
                    {fileAnalysisInfo.encryptionStatus
                      ? "Encrypted"
                      : "Unprotected"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Upload progress */}
          {uploadStage === "uploading" && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text variant="body2" weight="medium">
                  {uploadProgress < 100
                    ? `Uploading... ${Math.round(uploadProgress)}%`
                    : "Upload complete"}
                </Text>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  {formatFileSize(selectedFile.size * (uploadProgress / 100))} /{" "}
                  {formatFileSize(selectedFile.size)}
                </Text>
              </View>

              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.border },
                ]}
              >
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Success message */}
          {uploadStage === "complete" && (
            <View style={styles.successContainer}>
              {/* <LottieView
                source={require("../../assets/animations/success-check.json")}
                style={styles.successAnimation}
                autoPlay
                loop={false}
              /> */}
              <Text
                variant="body1"
                color={theme.colors.success}
                style={styles.successText}
              >
                Upload successful! Redirecting...
              </Text>
            </View>
          )}

          {/* Error message */}
          {uploadStage === "error" && (
            <View style={styles.errorContainer}>
              <View
                style={[
                  styles.errorIcon,
                  { backgroundColor: theme.colors.error + "20" },
                ]}
              >
                <Ionicons
                  name="alert-circle"
                  size={30}
                  color={theme.colors.error}
                />
              </View>
              <Text
                variant="body1"
                color={theme.colors.error}
                style={styles.errorText}
              >
                {uploadError || t("errors.uploadFailed")}
              </Text>
              <Button
                title="Try Again"
                onPress={resetUpload}
                style={styles.tryAgainButton}
                type="outline"
              />
            </View>
          )}
        </Card>
      </Animated.View>
    );
  };

  // Render support info
  const renderSupportInfo = () => (
    <Animated.View
      style={[
        styles.infoContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Card style={styles.infoCard} variant={isDark ? "default" : "bordered"}>
        <View style={styles.infoHeader}>
          <Ionicons
            name="information-circle"
            size={24}
            color={theme.colors.primary}
          />
          <Text variant="subtitle1" weight="semibold" style={styles.infoTitle}>
            Document Upload Information
          </Text>
        </View>

        <View style={styles.infoContent}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="scan"
                size={20}
                color={theme.colors.primary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                Your document will be analyzed with AI
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="key"
                size={20}
                color={theme.colors.primary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                Cost: {TOKEN_COSTS.DOCUMENT_ANALYSIS} token
                {!freeTrialUsed ? " (free trial available)" : ""}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={theme.colors.primary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                Your document is private and secure
              </Text>
            </View>
          </View>

          <View style={styles.supportedFormats}>
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.supportedFormatsText}
            >
              Supported formats: PDF, DOCX, JPG, PNG, TXT (max 10MB)
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  // Render upload button
  const renderUploadButton = () => {
    if (uploadStage !== "processing" || !selectedFile) return null;

    return (
      <View style={styles.uploadButtonContainer}>
        <Button
          title="Upload Document"
          onPress={uploadDocument}
          style={styles.uploadButton}
          gradient={true}
          icon="cloud-upload"
        />
      </View>
    );
  };

  // Get readability color based on score
  const getReadabilityColor = (score) => {
    if (score <= 3) return theme.colors.error;
    if (score <= 7) return theme.colors.warning;
    return theme.colors.success;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {renderHeader()}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {uploadStage === "selecting"
          ? renderUploadZone()
          : renderSelectedFile()}

        {renderSupportInfo()}
      </ScrollView>

      {renderUploadButton()}

      {uploading && uploadProgress < 100 && (
        <View style={styles.uploadingOverlay}>
          <Text variant="caption" color="#FFFFFF" style={styles.uploadingText}>
            {Math.round(uploadProgress)}%
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  uploadAreaContainer: {
    margin: 16,
  },
  uploadArea: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dropZone: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    width: "100%",
  },
  uploadLottie: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  dropZoneTitle: {
    marginBottom: 12,
  },
  dropZoneText: {
    textAlign: "center",
    marginBottom: 20,
  },
  fileTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 24,
  },
  fileTypeBadge: {
    margin: 4,
  },
  browseButton: {
    minWidth: 180,
  },
  selectedFileContainer: {
    margin: 16,
  },
  selectedFileCard: {
    padding: 16,
  },
  selectedFileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  filePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  fileIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  fileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  fileName: {
    marginBottom: 4,
  },
  fileMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileTypeBadgeSmall: {
    marginRight: 8,
  },
  fileDetails: {
    fontSize: 12,
  },
  removeButton: {
    borderRadius: 15,
    overflow: "hidden",
  },
  removeButtonBlur: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  fileAnalysisContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F8F9FA10",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E080",
  },
  fileAnalysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  fileAnalysisTitle: {
    marginLeft: 8,
  },
  fileAnalysisGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  fileAnalysisItem: {
    width: "50%",
    paddingVertical: 8,
    paddingRight: 16,
  },
  readabilityScore: {
    flexDirection: "row",
    marginTop: 4,
  },
  readabilityBar: {
    width: 5,
    height: 14,
    marginRight: 2,
    borderRadius: 2,
  },
  progressContainer: {
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  successContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  successAnimation: {
    width: 60,
    height: 60,
  },
  successText: {
    marginTop: 12,
    textAlign: "center",
  },
  errorContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
  },
  tryAgainButton: {
    minWidth: 120,
  },
  infoContainer: {
    margin: 16,
    marginTop: 0,
  },
  infoCard: {
    padding: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoTitle: {
    marginLeft: 8,
  },
  infoContent: {
    marginBottom: 8,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    width: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
  supportedFormats: {
    alignItems: "center",
  },
  supportedFormatsText: {
    textAlign: "center",
  },
  uploadButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  uploadButton: {
    width: "100%",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    textAlign: "center",
  },
});

export default UploadScreen;
