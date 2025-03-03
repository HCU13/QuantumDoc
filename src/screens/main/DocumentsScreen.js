import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { showToast } from "../../utils/toast";
import * as DocumentPicker from "expo-document-picker";
import { ScanGuides } from "../../components/ScanGuides";

// Camera imports with fallback handling
let Camera;
let CameraType;
let FlashMode;
try {
  const ExpoCamera = require("expo-camera/legacy");
  Camera = ExpoCamera.Camera;
  CameraType = ExpoCamera.CameraType;
  FlashMode = ExpoCamera.FlashMode;
} catch (error) {
  console.log("Camera module import error:", error);
}

// Haptics import with fallback
let Haptics;
try {
  Haptics = require("expo-haptics");
} catch (error) {
  console.log("Haptics module import error:", error);
}

const { width, height } = Dimensions.get("window");

export const DocumentsScreen = ({ navigation }) => {
  const { theme } = useTheme();

  // Camera state
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraType, setCameraType] = useState(
    CameraType ? CameraType.back : "back"
  );
  const [flash, setFlash] = useState(FlashMode ? FlashMode.off : "off");
  const cameraRef = useRef(null);

  // Processing states
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processingState, setProcessingState] = useState(null); // null, 'scanning', 'uploading', 'analyzing', 'completed'
  const [processingProgress, setProcessingProgress] = useState(0);

  // Animation states
  const scanButtonScale = useRef(new Animated.Value(1)).current;
  const uploadButtonScale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Modal states
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  // Result document data
  const [processedDocument, setProcessedDocument] = useState(null);

  // Tokens (simplified for this implementation)
  const [tokenCount, setTokenCount] = useState(5);

  // Animation when component mounts
  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Check camera permissions on mount
  useEffect(() => {
    if (Camera) {
      (async () => {
        try {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasCameraPermission(status === "granted");
        } catch (err) {
          console.error("Camera permission error:", err);
          setHasCameraPermission(false);
        }
      })();
    }
  }, []);

  // Button animation handlers
  const animateButtonPress = (button) => {
    Animated.sequence([
      Animated.timing(button, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(button, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start();
  };

  // Handle scan button press
  const handleScan = async () => {
    animateButtonPress(scanButtonScale);

    // Provide haptic feedback
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Check token availability
    if (tokenCount <= 0) {
      Alert.alert(
        "No Tokens Available",
        "You need tokens to scan documents. Would you like to purchase tokens?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Get Tokens", onPress: () => navigation.navigate("Premium") },
        ]
      );
      return;
    }

    // If Camera is not available or not permitted, show fallback
    if (!Camera || !hasCameraPermission) {
      Alert.alert(
        "Camera Required",
        "This feature requires camera access. Please enable camera permissions in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Settings",
            onPress: () => {
              // This would ideally open the app settings, but we'll just simulate for now
              simulateScanProcess();
            },
          },
        ]
      );
      return;
    }

    // Show camera modal
    setScanModalVisible(true);
  };

  // Handle upload button press
  const handleUpload = async () => {
    animateButtonPress(uploadButtonScale);

    // Provide haptic feedback
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Check token availability
    if (tokenCount <= 0) {
      Alert.alert(
        "No Tokens Available",
        "You need tokens to upload documents. Would you like to purchase tokens?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Get Tokens", onPress: () => navigation.navigate("Premium") },
        ]
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/*",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // Process the selected document
      startDocumentProcessing("uploading", result.assets[0]);
    } catch (error) {
      console.error("Document picker error:", error);
      showToast.error("Error", "Failed to select document");
    }
  };

  // Handle camera capture
  const takePicture = async () => {
    if (cameraRef.current && !isScanning) {
      setIsScanning(true);

      // Provide haptic feedback if available
      if (Haptics?.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
        });

        // Close camera modal
        setScanModalVisible(false);

        // Process the captured image
        startDocumentProcessing("scanning", {
          uri: photo.uri,
          name: `scan_${new Date().toISOString()}.jpg`,
          type: "image/jpeg",
        });
      } catch (error) {
        console.error("Camera capture error:", error);
        showToast.error("Error", "Failed to capture image");
        setIsScanning(false);
      }
    }
  };

  // Fallback for when camera is not available
  const simulateScanProcess = () => {
    setScanModalVisible(false);

    // Simulate a capture
    startDocumentProcessing("scanning", {
      uri: "https://example.com/placeholder.jpg",
      name: `scan_${new Date().toISOString()}.jpg`,
      type: "image/jpeg",
    });
  };

  // Start document processing
  const startDocumentProcessing = (type, documentData) => {
    // Set the processing state and show result modal
    setProcessingState(type);
    setResultModalVisible(true);
    setProcessingProgress(0);

    // Use token
    setTokenCount((prevCount) => prevCount - 1);

    // Avoid state closure issues with progress tracking
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      setProcessingProgress(Math.min(progress, 1));

      // Use a function form to ensure we get the latest state
      if (progress >= 0.5) {
        setProcessingState((prevState) =>
          prevState !== "analyzing" ? "analyzing" : prevState
        );
      }

      if (progress >= 1) {
        clearInterval(interval);

        // Complete processing
        setProcessingState("completed");

        // Set processed document data
        setProcessedDocument({
          id: `doc-${Date.now()}`,
          title:
            documentData.name || `Document ${new Date().toLocaleTimeString()}`,
          type: type === "scanning" ? "Scanned Document" : "Uploaded Document",
          date: new Date().toISOString(),
          preview: documentData.uri,
        });

        // Provide haptic success feedback
        if (Haptics?.notificationAsync) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
        }
      }
    }, 300);
  };

  // Navigate to document detail
  const viewDocumentDetail = () => {
    setResultModalVisible(false);

    // Small delay to ensure modal is closed before navigation
    setTimeout(() => {
      navigation.navigate("DocumentDetail", {
        documentId: processedDocument?.id || `doc-${Date.now()}`,
      });
    }, 300);
  };

  // Toggle flash for camera
  const toggleFlash = () => {
    if (FlashMode) {
      setFlash(flash === FlashMode.off ? FlashMode.on : FlashMode.off);
    }
  };

  // Render header with tokens
  const renderHeader = () => (
    <Animated.View style={{ opacity: headerOpacity }}>
      <LinearGradient
        colors={["#f7f7f7", "#ffffff"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text
              variant="h1"
              style={[styles.headerTitle, { color: theme.colors.text }]}
            >
              DocAI
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Scan & analyze your documents
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.tokenButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => navigation.navigate("Premium")}
          >
            <Ionicons name="flash" size={20} color={theme.colors.warning} />
            <Text style={[styles.tokenCount, { color: theme.colors.text }]}>
              {tokenCount}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  // Render scan modal
  const renderScanModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={scanModalVisible}
      onRequestClose={() => setScanModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <StatusBar barStyle="light-content" />

        {Camera && hasCameraPermission ? (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            flashMode={flash}
          >
            <SafeAreaView style={styles.cameraControls}>
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setScanModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.flashButton}
                  onPress={toggleFlash}
                >
                  <Ionicons
                    name={
                      flash === (FlashMode?.off || "off")
                        ? "flash-off"
                        : "flash"
                    }
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              <ScanGuides />

              <View style={styles.cameraFooter}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                  disabled={isScanning}
                >
                  <View style={styles.captureOuter}>
                    {isScanning ? (
                      <ActivityIndicator size="large" color="white" />
                    ) : (
                      <View style={styles.captureInner} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Camera>
        ) : (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>Camera Preview</Text>
            <Text style={[styles.fallbackSubtext, { color: "#aaa" }]}>
              {isScanning
                ? "Processing document..."
                : "Camera will be available in the compiled app"}
            </Text>

            {isScanning ? (
              <ActivityIndicator
                size="large"
                color="white"
                style={{ marginTop: 20 }}
              />
            ) : (
              <>
                <Button
                  title="Simulate Scan"
                  onPress={simulateScanProcess}
                  theme={theme}
                  style={{ marginTop: 20 }}
                />
                <Button
                  title="Cancel"
                  onPress={() => setScanModalVisible(false)}
                  theme={theme}
                  type="secondary"
                  style={{ marginTop: 12 }}
                />
              </>
            )}
          </View>
        )}
      </View>
    </Modal>
  );

  // Render result modal (processing and completion)
  const renderResultModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={resultModalVisible}
      onRequestClose={() => {
        if (processingState === "completed") {
          setResultModalVisible(false);
        }
      }}
    >
      <View style={styles.resultModalOverlay}>
        <View
          style={[
            styles.resultModalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {processingState !== "completed" ? (
            // Processing state
            <>
              <View style={styles.processingIconContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>

              <Text
                style={[styles.processingTitle, { color: theme.colors.text }]}
              >
                {processingState === "analyzing"
                  ? "Analyzing Document"
                  : processingState === "scanning"
                  ? "Processing Scan"
                  : "Processing Upload"}
              </Text>

              <Text
                style={[
                  styles.processingSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {processingState === "analyzing"
                  ? "AI is extracting information..."
                  : "Preparing document for analysis..."}
              </Text>

              <View
                style={[
                  styles.progressBarContainer,
                  { backgroundColor: theme.colors.border },
                ]}
              >
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${processingProgress * 100}%`,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.progressText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {Math.round(processingProgress * 100)}% Complete
              </Text>
            </>
          ) : (
            // Completed state
            <>
              <View
                style={[
                  styles.completedIconContainer,
                  { backgroundColor: theme.colors.success + "15" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color={theme.colors.success}
                />
              </View>

              <Text
                style={[styles.completedTitle, { color: theme.colors.text }]}
              >
                Document Ready
              </Text>

              <Text
                style={[
                  styles.completedSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Your document has been successfully processed and is ready to
                view
              </Text>

              <Button
                title="View Document"
                onPress={viewDocumentDetail}
                theme={theme}
                style={styles.viewDocumentButton}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // Main content view - two big buttons
  const renderMainContent = () => (
    <Animated.View
      style={[styles.mainContentContainer, { opacity: contentOpacity }]}
    >
      <View style={styles.welcomeContainer}>
        <View
          style={[
            styles.welcomeBadge,
            { backgroundColor: theme.colors.primary + "10" },
          ]}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={[styles.welcomeText, { color: theme.colors.primary }]}>
            AI Document Analysis
          </Text>
        </View>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={[styles.instructionText, { color: theme.colors.text }]}>
          Get started by scanning or uploading a document
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* Scan button */}
        <Animated.View style={{ transform: [{ scale: scanButtonScale }] }}>
          <TouchableOpacity
            style={[
              styles.mainButton,
              styles.scanButton,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
              },
            ]}
            onPress={handleScan}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={
                theme.colors.gradient?.primary || [
                  theme.colors.primary,
                  `${theme.colors.primary}DD`,
                ]
              }
              style={styles.gradientBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.buttonIconContainer}>
                <Ionicons name="scan" size={44} color="white" />
              </View>
              <Text style={styles.buttonTitle} color="white">
                Scan Document
              </Text>
              <Text style={styles.buttonSubtitle} color="white">
                Take a photo of any document
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Upload button */}
        <Animated.View style={{ transform: [{ scale: uploadButtonScale }] }}>
          <TouchableOpacity
            style={[
              styles.mainButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleUpload}
            activeOpacity={0.95}
          >
            <View style={styles.buttonContent}>
              <View
                style={[
                  styles.buttonIconContainer,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Ionicons
                  name="cloud-upload"
                  size={44}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.buttonTitle, { color: theme.colors.text }]}>
                Upload File
              </Text>
              <Text
                style={[
                  styles.buttonSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Select PDF, Word, or image files
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.tokenInfoContainer}>
        <View
          style={[
            styles.tokenInfoBubble,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.tokenInfoText,
              { color: theme.colors.textSecondary },
            ]}
          >
            {tokenCount > 0
              ? `You have ${tokenCount} tokens remaining`
              : "You need tokens to process documents"}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      {renderHeader()}
      {renderMainContent()}
      {renderScanModal()}
      {renderResultModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header styles
  headerGradient: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  tokenButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tokenCount: {
    fontSize: 16,
    fontWeight: "700",
  },

  // Main content
  mainContentContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    bottom: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  welcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: "600",
  },
  instructionContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  // Button styles
  buttonContainer: {
    gap: 20,
  },
  mainButton: {
    height: 170,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButton: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientBg: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  buttonSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },

  // Token info
  tokenInfoContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  tokenInfoBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    gap: 8,
  },
  tokenInfoText: {
    fontSize: 14,
  },

  // Camera modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: "transparent",
  },
  cameraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  captureOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "white",
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "black",
  },
  fallbackText: {
    color: "white",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  fallbackSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    color: "white",
  },

  // Result modal styles
  resultModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultModalContent: {
    width: "90%",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  processingIconContainer: {
    marginBottom: 20,
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  processingSubtitle: {
    fontSize: 15,
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 20,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
  },
  progressText: {
    fontSize: 13,
    fontWeight: "500",
  },
  completedIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  completedSubtitle: {
    fontSize: 15,
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 22,
  },
  viewDocumentButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
  },
});
