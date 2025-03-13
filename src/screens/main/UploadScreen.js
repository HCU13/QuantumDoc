import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  Animated,
  Modal,
  Dimensions,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useTokens } from "../../context/TokenContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text, Button, Card, Badge, Loading } from "../../components";
import { MotiView } from "moti";

const { width, height } = Dimensions.get("window");

const UploadScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const { useToken, TOKEN_COSTS, freeTrialUsed } = useTokens();

  // State
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("initial"); // initial, selecting, processing, uploading, complete, error
  const [uploadError, setUploadError] = useState(null);
  const [fileAnalysisInfo, setFileAnalysisInfo] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

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
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Modal animation
  const animateModalIn = () => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateModalOut = (callback) => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  // Open upload modal
  const openUploadModal = () => {
    setUploadModalVisible(true);
    modalScaleAnim.setValue(0.9);
    modalOpacityAnim.setValue(0);
    animateModalIn();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Close upload modal
  const closeUploadModal = () => {
    animateModalOut(() => {
      setUploadModalVisible(false);
      if (uploadStage !== "complete" && uploadStage !== "uploading") {
        resetUpload();
      }
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Open scan modal
  const openScanModal = () => {
    setScanModalVisible(true);
    modalScaleAnim.setValue(0.9);
    modalOpacityAnim.setValue(0);
    animateModalIn();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Close scan modal
  const closeScanModal = () => {
    animateModalOut(() => {
      setScanModalVisible(false);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Navigate to scan screen
  const navigateToScan = () => {
    closeScanModal();
    setTimeout(() => {
      navigation.navigate("Scan");
    }, 300);
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

  // Pick document
  const pickDocument = async () => {
    try {
      setUploadStage("selecting");
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Run file analysis animation with simulated delay
        setTimeout(() => {
          // Simulate file analysis
          simulateFileAnalysis(file);
        }, 1500);
      } else {
        setUploadStage("initial");
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Use token
      await useToken(TOKEN_COSTS.DOCUMENT_ANALYSIS, "analysis");

      // Simulate API call with progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);

      // Simulate upload completion after delay
      setTimeout(() => {
        clearInterval(uploadInterval);
        setUploadProgress(100);
        setUploadStage("complete");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Wait before navigating
        setTimeout(() => {
          closeUploadModal();

          // Navigate to document detail screen after modal closes
          setTimeout(() => {
            navigation.navigate("DocumentDetail", {
              documentId: "doc" + Date.now(),
              newDocument: true,
            });
          }, 300);
        }, 1500);
      }, 3000);
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
    setUploadStage("initial");
    setUploadProgress(0);
    setUploadError(null);
    setFileAnalysisInfo(null);
  };

  // Get readability color based on score
  const getReadabilityColor = (score) => {
    if (score <= 3) return theme.colors.error;
    if (score <= 7) return theme.colors.warning;
    return theme.colors.success;
  };

  // Render header
  const renderHeader = () => <></>;

  // Render main content
  const renderMainContent = () => (
    <View style={styles.mainContent}>
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 800, delay: 100 }}
      >
        <Card style={styles.mainCard} elevated={true}>
          <LinearGradient
            colors={
              isDark
                ? [theme.colors.primary + "30", theme.colors.background]
                : [theme.colors.primary + "15", theme.colors.background]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="document-text"
                  size={48}
                  color={theme.colors.primary}
                />
              </View>

              <Text variant="h2" style={styles.cardTitle}>
                Add a New Document
              </Text>

              <Text
                variant="body1"
                color={theme.colors.textSecondary}
                style={styles.cardDescription}
              >
                Upload a document or scan for instant AI analysis
              </Text>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={openUploadModal}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons
                      name="cloud-upload"
                      size={28}
                      color="#FFFFFF"
                      style={styles.actionIcon}
                    />
                    <Text
                      variant="subtitle1"
                      color="#FFFFFF"
                      style={{ textAlign: "center" }}
                    >
                      Upload File
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.secondary },
                  ]}
                  onPress={openScanModal}
                >
                  <LinearGradient
                    colors={[theme.colors.secondary, theme.colors.info]}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons
                      name="scan"
                      size={28}
                      color="#FFFFFF"
                      style={styles.actionIcon}
                    />
                    <Text
                      variant="subtitle1"
                      color="#FFFFFF"
                      style={{ textAlign: "center" }}
                    >
                      Scan Document
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <Text
                variant="caption"
                color={theme.colors.textSecondary}
                style={styles.supportedFormatsText}
              >
                Supported formats: PDF, DOCX, JPG, PNG, TXT (max 10MB)
              </Text>

              {!freeTrialUsed && (
                <View style={styles.freeTrialBadgeContainer}>
                  <Badge
                    label="Free Trial Available"
                    variant="success"
                    leftIcon={
                      <Ionicons
                        name="sparkles"
                        size={14}
                        color={theme.colors.success}
                      />
                    }
                  />
                </View>
              )}
            </View>
          </LinearGradient>
        </Card>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 800, delay: 300 }}
      >
        <LinearGradient
          colors={
            isDark
              ? [theme.colors.primary + "30", theme.colors.background]
              : [theme.colors.primary + "15", theme.colors.background]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.infoCard}
        >
          <View style={styles.infoContent}>
            <View style={styles.infoHeader}>
              <Ionicons
                name="information-circle"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                variant="subtitle1"
                weight="semibold"
                style={styles.infoTitle}
              >
                How AI Document Analysis Works
              </Text>
            </View>

            <View style={styles.infoItems}>
              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.infoItemIcon,
                    { backgroundColor: theme.colors.primary + "20" },
                  ]}
                >
                  <Text style={styles.infoItemNumber}>1</Text>
                </View>
                <Text variant="body2" color={theme.colors.textSecondary}>
                  Upload or scan your document
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.infoItemIcon,
                    { backgroundColor: theme.colors.primary + "20" },
                  ]}
                >
                  <Text style={styles.infoItemNumber}>2</Text>
                </View>
                <Text variant="body2" color={theme.colors.textSecondary}>
                  AI processes and analyzes your content
                </Text>
              </View>

              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.infoItemIcon,
                    { backgroundColor: theme.colors.primary + "20" },
                  ]}
                >
                  <Text style={styles.infoItemNumber}>3</Text>
                </View>
                <Text variant="body2" color={theme.colors.textSecondary}>
                  Get instant summaries and insights
                </Text>
              </View>
            </View>

            <View style={styles.tokenInfo}>
              <Ionicons name="key" size={16} color={theme.colors.primary} />
              <Text variant="caption" color={theme.colors.textSecondary}>
                Cost: {TOKEN_COSTS.DOCUMENT_ANALYSIS} token
                {!freeTrialUsed ? " (free trial available)" : ""}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </MotiView>
    </View>
  );

  // Render upload modal
  const renderUploadModal = () => (
    <Modal
      visible={uploadModalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={closeUploadModal}
    >
      <View style={styles.modalContainer}>
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: modalOpacityAnim,
              transform: [{ scale: modalScaleAnim }],
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text variant="h3">
              {uploadStage === "initial" || uploadStage === "selecting"
                ? "Upload Document"
                : uploadStage === "processing"
                ? "Document Details"
                : uploadStage === "uploading"
                ? "Uploading Document"
                : uploadStage === "complete"
                ? "Upload Complete"
                : "Upload Error"}
            </Text>

            {uploadStage !== "uploading" && uploadStage !== "complete" && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeUploadModal}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.modalBody}>
            {uploadStage === "initial" && (
              <View style={styles.uploadInitialContainer}>
                <View
                  style={[
                    styles.uploadIconContainer,
                    { backgroundColor: theme.colors.primary + "15" },
                  ]}
                >
                  <Ionicons
                    name="cloud-upload"
                    size={40}
                    color={theme.colors.primary}
                  />
                </View>

                <Text variant="subtitle1" style={styles.uploadTitle}>
                  Select a document to upload
                </Text>

                <Text
                  variant="body2"
                  color={theme.colors.textSecondary}
                  style={styles.uploadDescription}
                >
                  Choose a document from your device to analyze with AI
                </Text>

                <View style={styles.fileTypeContainer}>
                  {Object.entries(FILE_TYPE_DISPLAY).map(
                    ([mime, extension]) => (
                      <Badge
                        key={mime}
                        label={extension}
                        variant={
                          mime.includes("image")
                            ? "info"
                            : mime.includes("pdf")
                            ? "error"
                            : "primary"
                        }
                        size="small"
                        style={styles.fileTypeBadge}
                      />
                    )
                  )}
                </View>

                <Button
                  label="Browse Files"
                  onPress={pickDocument}
                  gradient={true}
                  style={styles.browseButton}
                  leftIcon={
                    <Ionicons name="folder-open" size={20} color="#FFFFFF" />
                  }
                />

                <Text
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={styles.fileInfoText}
                >
                  Maximum file size: 10MB
                </Text>
              </View>
            )}

            {uploadStage === "selecting" && (
              <View style={styles.uploadLoadingContainer}>
                <Loading
                  variant="pulse"
                  size="large"
                  style={styles.uploadLoading}
                />
                <Text variant="subtitle1" style={styles.loadingText}>
                  Selecting document...
                </Text>
              </View>
            )}

            {(uploadStage === "processing" ||
              uploadStage === "uploading" ||
              uploadStage === "complete") &&
              selectedFile && (
                <View style={styles.selectedFileContainer}>
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
                          label={
                            FILE_TYPE_DISPLAY[selectedFile.mimeType] || "DOC"
                          }
                          variant="primary"
                          size="small"
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

                    {uploadStage === "processing" && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={resetUpload}
                      >
                        <BlurView
                          intensity={20}
                          tint={isDark ? "dark" : "light"}
                          style={styles.removeButtonBlur}
                        >
                          <Ionicons
                            name="close"
                            size={20}
                            color={theme.colors.error}
                          />
                        </BlurView>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* File analysis info */}
                  {fileAnalysisInfo && uploadStage === "processing" && (
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
                          <Text
                            variant="caption"
                            color={theme.colors.textSecondary}
                          >
                            Pages
                          </Text>
                          <Text variant="body1" weight="medium">
                            {fileAnalysisInfo.pageCount}
                          </Text>
                        </View>

                        <View style={styles.fileAnalysisItem}>
                          <Text
                            variant="caption"
                            color={theme.colors.textSecondary}
                          >
                            Word Count
                          </Text>
                          <Text variant="body1" weight="medium">
                            {fileAnalysisInfo.wordCount.toLocaleString()}
                          </Text>
                        </View>

                        <View style={styles.fileAnalysisItem}>
                          <Text
                            variant="caption"
                            color={theme.colors.textSecondary}
                          >
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
                          <Text
                            variant="caption"
                            color={theme.colors.textSecondary}
                          >
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
                        <Text
                          variant="caption"
                          color={theme.colors.textSecondary}
                        >
                          {formatFileSize(
                            selectedFile.size * (uploadProgress / 100)
                          )}{" "}
                          / {formatFileSize(selectedFile.size)}
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
                      <View
                        style={[
                          styles.successIconContainer,
                          { backgroundColor: theme.colors.success + "20" },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={40}
                          color={theme.colors.success}
                        />
                      </View>
                      <Text
                        variant="subtitle1"
                        color={theme.colors.success}
                        style={styles.successText}
                      >
                        Upload successful!
                      </Text>
                      <Text
                        variant="body2"
                        color={theme.colors.textSecondary}
                        style={styles.successSubtext}
                      >
                        Your document has been uploaded and is ready for
                        analysis.
                      </Text>
                    </View>
                  )}
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
                    size={40}
                    color={theme.colors.error}
                  />
                </View>
                <Text
                  variant="subtitle1"
                  color={theme.colors.error}
                  style={styles.errorText}
                >
                  Upload Failed
                </Text>
                <Text
                  variant="body2"
                  color={theme.colors.textSecondary}
                  style={styles.errorSubtext}
                >
                  {uploadError || t("errors.uploadFailed")}
                </Text>
                <Button
                  label="Try Again"
                  onPress={resetUpload}
                  style={styles.tryAgainButton}
                  variant="outline"
                />
              </View>
            )}
          </ScrollView>

          {uploadStage === "processing" && (
            <View style={styles.modalFooter}>
              <Button
                label="Upload Document"
                onPress={uploadDocument}
                style={styles.uploadButton}
                gradient={true}
                leftIcon={
                  <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                }
              />
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );

  // Render scan modal
  const renderScanModal = () => (
    <Modal
      visible={scanModalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={closeScanModal}
    >
      <View style={styles.modalContainer}>
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: modalOpacityAnim,
              transform: [{ scale: modalScaleAnim }],
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text variant="h3">Scan Document</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeScanModal}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.scanModalBody}>
            <View
              style={[
                styles.scanIconContainer,
                { backgroundColor: theme.colors.secondary + "15" },
              ]}
            >
              <Ionicons name="scan" size={40} color={theme.colors.secondary} />
            </View>

            <Text variant="subtitle1" style={styles.scanTitle}>
              Scan Document with Camera
            </Text>

            <Text
              variant="body2"
              color={theme.colors.textSecondary}
              style={styles.scanDescription}
            >
              Use your camera to scan documents, receipts, business cards, and
              more. The AI will automatically detect edges and enhance the
              quality.
            </Text>

            <View style={styles.scanFeatures}>
              <View style={styles.scanFeatureItem}>
                <Ionicons
                  name="scan-circle"
                  size={20}
                  color={theme.colors.success}
                />
                <Text variant="body2" style={styles.scanFeatureText}>
                  Auto edge detection
                </Text>
              </View>

              <View style={styles.scanFeatureItem}>
                <Ionicons name="image" size={20} color={theme.colors.success} />
                <Text variant="body2" style={styles.scanFeatureText}>
                  Image enhancement
                </Text>
              </View>

              <View style={styles.scanFeatureItem}>
                <Ionicons
                  name="document-text"
                  size={20}
                  color={theme.colors.success}
                />
                <Text variant="body2" style={styles.scanFeatureText}>
                  Text recognition (OCR)
                </Text>
              </View>
            </View>

            <Button
              label="Open Camera"
              onPress={navigateToScan}
              gradient={true}
              style={styles.scanButton}
              leftIcon={<Ionicons name="camera" size={20} color="#FFFFFF" />}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {renderMainContent()}
      </ScrollView>

      {renderUploadModal()}
      {renderScanModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 10 : StatusBar.currentHeight + 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  mainContent: {
    padding: 16,
  },
  mainCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  cardGradient: {
    flex: 1,
  },
  cardContent: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(93, 95, 239, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    textAlign: "center",
    marginBottom: 10,
  },
  cardDescription: {
    textAlign: "center",
    marginBottom: 30,
    maxWidth: "80%",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  actionButton: {
    width: "45%",
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  actionIcon: {
    marginBottom: 10,
  },
  supportedFormatsText: {
    marginTop: 16,
    textAlign: "center",
  },
  freeTrialBadgeContainer: {
    marginTop: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 0,
    overflow: "hidden",
  },
  infoContent: {
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
  infoItems: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoItemIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoItemNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5D5FEF",
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(93, 95, 239, 0.05)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 500,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: height * 0.7,
  },
  uploadInitialContainer: {
    alignItems: "center",
    padding: 20,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  uploadDescription: {
    textAlign: "center",
    marginBottom: 24,
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
    marginBottom: 16,
  },
  fileInfoText: {
    textAlign: "center",
  },
  uploadLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  uploadLoading: {
    marginBottom: 20,
  },
  loadingText: {
    textAlign: "center",
  },
  selectedFileContainer: {
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
    backgroundColor: "rgba(248, 249, 250, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(224, 224, 224, 0.5)",
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
    paddingVertical: 16,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successText: {
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtext: {
    textAlign: "center",
  },
  errorContainer: {
    marginTop: 16,
    alignItems: "center",
    padding: 20,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    textAlign: "center",
    marginBottom: 24,
  },
  tryAgainButton: {
    minWidth: 150,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  uploadButton: {
    width: "100%",
  },
  scanModalBody: {
    alignItems: "center",
    padding: 20,
  },
  scanIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  scanTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  scanDescription: {
    textAlign: "center",
    marginBottom: 24,
  },
  scanFeatures: {
    width: "100%",
    marginBottom: 24,
  },
  scanFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scanFeatureText: {
    marginLeft: 12,
  },
  scanButton: {
    minWidth: 180,
  },
});

export default UploadScreen;
