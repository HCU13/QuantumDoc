import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Alert,
  SafeAreaView,
} from "react-native";
import { Camera } from "expo-camera";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { useApp } from "../../../context/AppContext";
import { Text, Button } from "../../../components";
import ScannerOverlay from "./components/ScannerOverlay";
import CaptureButton from "./components/CaptureButton";
import ScanPreviewModal from "./components/ScanPreviewModal";
import scanService from "../../../services/scanService";

const ScanDocumentScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { isConnected } = useApp();

  // Refs
  const cameraRef = useRef(null);

  // States
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanStage, setScanStage] = useState("scanning"); // scanning, preview, processing
  const [capturedImage, setCapturedImage] = useState(null);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Request camera permission
  useEffect(() => {
    (async () => {
      // Check network connectivity
      if (!isConnected) {
        Alert.alert(
          "Offline Mode",
          "You are currently offline. Document scanning requires an internet connection for analysis.",
          [
            { 
              text: "Continue Anyway", 
              style: "default" 
            },
            { 
              text: "Go Back", 
              onPress: () => navigation.goBack(),
              style: "cancel" 
            }
          ]
        );
      }
      
      // Request camera permission
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      // Start entrance animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    })();
  }, []);

  // Start scan line animation when camera is ready
  useEffect(() => {
    if (cameraReady && scanStage === "scanning") {
      startScanLineAnimation();
    }
  }, [cameraReady, scanStage]);

  // Scan line animation
  const startScanLineAnimation = () => {
    scanLineAnim.setValue(0);
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  // Take picture
  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        exif: true,
      });

      setCapturedImage(photo);
      setScanStage("preview");
      setPreviewVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error taking picture:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  };

  // Toggle flash
  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle retake
  const handleRetake = () => {
    setCapturedImage(null);
    setScanStage("scanning");
    setPreviewVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Process the captured image
  const processImage = async () => {
    // Hide preview modal
    setPreviewVisible(false);
    setProcessingImage(true);
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Process the image
      const processedImage = await scanService.processImage(capturedImage);
      
      // Navigate to processing screen
      navigation.replace("DocumentProcessing", { file: processedImage });
    } catch (error) {
      console.error("Error processing image:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        "Processing Error",
        "Failed to process the scanned image. Please try again.",
        [{ text: "OK" }]
      );
      
      // Go back to scanning
      setScanStage("scanning");
    } finally {
      setProcessingImage(false);
    }
  };

  // Render permission error
  if (hasPermission === null) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text variant="body1">Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.permissionContent}>
          <View
            style={[
              styles.permissionIcon,
              { backgroundColor: theme.colors.error + "15" },
            ]}
          >
            <Ionicons
              name="camera-off"
              size={40}
              color={theme.colors.error}
            />
          </View>

          <Text variant="h3" style={styles.permissionTitle}>
            Camera Access Needed
          </Text>

          <Text
            variant="body1"
            color={theme.colors.textSecondary}
            style={styles.permissionText}
          >
            Please enable camera access in your device settings to scan
            documents.
          </Text>

          <Button
            label="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.permissionButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Camera */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={flashMode}
        onCameraReady={() => setCameraReady(true)}
        ratio="4:3"
      >
        <Animated.View style={[styles.cameraContent, { opacity: fadeAnim }]}>
          {/* Scanner Overlay with animated border */}
          <ScannerOverlay scanLineAnim={scanLineAnim} theme={theme} />

          {/* Header Tools */}
          <SafeAreaView style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <BlurView
                intensity={isDark ? 50 : 70}
                tint="dark"
                style={styles.blurButton}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <BlurView
                intensity={isDark ? 50 : 70}
                tint="dark"
                style={styles.blurButton}
              >
                <Ionicons
                  name={
                    flashMode === Camera.Constants.FlashMode.off
                      ? "flash-off"
                      : "flash"
                  }
                  size={24}
                  color="#FFFFFF"
                />
              </BlurView>
            </TouchableOpacity>
          </SafeAreaView>

          {/* Capture Area */}
          <View style={styles.captureArea}>
            <Text
              variant="body2"
              color="#FFFFFF"
              style={styles.captureHelpText}
            >
              Position document within frame
            </Text>

            <CaptureButton onPress={takePicture} />
            
            {/* Network warning if offline */}
            {!isConnected && (
              <View style={styles.offlineWarning}>
                <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
                <Text variant="caption" color="#FFFFFF" style={styles.offlineText}>
                  You're offline. Document analysis will be limited.
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Camera>

      {/* Preview Modal */}
      <ScanPreviewModal
        visible={previewVisible}
        image={capturedImage}
        onRetake={handleRetake}
        onUse={processImage}
        theme={theme}
        processing={processingImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  permissionTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    minWidth: 140,
  },
  camera: {
    flex: 1,
  },
  cameraContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
  },
  backButton: {
    borderRadius: 23,
    overflow: "hidden",
  },
  flashButton: {
    borderRadius: 23,
    overflow: "hidden",
  },
  blurButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  captureArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  captureHelpText: {
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 159, 10, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  offlineText: {
    marginLeft: 8,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default ScanDocumentScreen;