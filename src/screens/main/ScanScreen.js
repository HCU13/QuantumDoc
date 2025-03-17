import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { Camera } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text, Button, Card } from "../../components";

const { width, height } = Dimensions.get("window");
const SCAN_AREA_PADDING = 40;
const SCAN_AREA_ASPECT_RATIO = 1.414; // A4 aspect ratio
const scanAreaWidth = width - SCAN_AREA_PADDING * 2;
const scanAreaHeight = scanAreaWidth * SCAN_AREA_ASPECT_RATIO;

const ScanScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const cameraRef = useRef(null);

  // State
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanStage, setScanStage] = useState("initial"); // initial, preview, processing

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      // Start entrance animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    })();
  }, []);

  // Start scan line animation when camera is ready
  useEffect(() => {
    if (cameraReady && scanStage === "initial") {
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
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setCapturedImage(photo);
      setScanStage("preview");
    } catch (error) {
      console.error("Error taking picture:", error);
      alert(t("errors.somethingWentWrong"));
    }
  };

  // Process and use image
  const useImage = () => {
    setScanStage("processing");

    // Simulate processing with a delay
    setTimeout(() => {
      navigation.replace("DocumentDetail", {
        documentId: "simulatedDocumentId",
        newDocument: true,
      });
    }, 2000);
  };

  // Retake picture
  const retakePicture = () => {
    setCapturedImage(null);
    setScanStage("initial");
    startScanLineAnimation();
  };

  // Render permission error
  if (hasPermission === null) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text variant="body1">{t("general.loading")}</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <Card style={styles.errorCard} elevated>
            <Ionicons name="camera-off" size={60} color={theme.colors.error} />
            <Text variant="h3" style={{ marginVertical: 16 }}>
              {t("errors.cameraAccessNeeded")}
            </Text>
            <Text
              variant="body1"
              color={theme.colors.textSecondary}
              style={{ textAlign: "center" }}
            >
              {t("errors.cameraPermission")}
            </Text>
            <Button
              title={t("general.goBack")}
              onPress={() => navigation.goBack()}
              style={{ marginTop: 24 }}
              icon="arrow-back"
              gradient
            />
          </Card>
        </Animated.View>
      </View>
    );
  }

  // Render preview screen
  if (scanStage === "preview" && capturedImage) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={retakePicture} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text variant="h3">{t("document.preview")}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.previewContainer}>
          <Image
            source={{ uri: capturedImage.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />

          <View style={styles.qualityBadge}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.success}
            />
            <Text
              variant="caption"
              color={theme.colors.success}
              style={{ marginLeft: 6 }}
            >
              {t("document.goodQuality")}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title={t("document.retake")}
            onPress={retakePicture}
            type="outline"
            style={styles.actionButton}
            icon="camera"
          />
          <Button
            title={t("document.useDocument")}
            onPress={useImage}
            style={styles.actionButton}
            gradient
            icon="document-text"
          />
        </View>
      </View>
    );
  }

  // Render processing screen
  if (scanStage === "processing") {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Card style={styles.processingCard} elevated>
          <Text variant="h3" style={styles.processingTitle}>
            {t("document.processing")}
          </Text>

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
                  width: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>

          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={styles.processingNote}
          >
            {t("document.processingNote")}
          </Text>
        </Card>
      </View>
    );
  }

  // Render camera screen
  return (
    <View style={styles.cameraContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Camera
        ref={cameraRef}
        style={styles.camera}
        type="back"
        onCameraReady={() => setCameraReady(true)}
      >
        <View style={styles.cameraContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <View style={styles.blurButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Scan Area */}
          <View style={styles.scanAreaContainer}>
            <View
              style={[
                styles.scanTarget,
                { borderColor: theme.colors.primary + "80" },
              ]}
            />

            {/* Scanning line animation */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  backgroundColor: theme.colors.primary + "60",
                  transform: [
                    {
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, scanAreaHeight - 2],
                      }),
                    },
                  ],
                },
              ]}
            />

            {/* Corner marks */}
            <View style={[styles.cornerTL, styles.corner]} />
            <View style={[styles.cornerTR, styles.corner]} />
            <View style={[styles.cornerBL, styles.corner]} />
            <View style={[styles.cornerBR, styles.corner]} />

            {/* Status indicator */}
            <View style={styles.statusContainer}>
              <View style={styles.statusBlur}>
                <View style={styles.statusContent}>
                  <View
                    style={[
                      styles.statusIcon,
                      { backgroundColor: theme.colors.info + "30" },
                    ]}
                  >
                    <Ionicons name="scan" size={16} color={theme.colors.info} />
                  </View>
                  <Text
                    variant="caption"
                    color="#FFFFFF"
                    style={styles.statusText}
                  >
                    {t("document.positionDocument")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Capture Button */}
          <View style={styles.captureArea}>
            <View style={styles.captureContainer}>
              <View
                style={[
                  styles.captureOuterRing,
                  { borderColor: theme.colors.primary + "50" },
                ]}
              />
              <TouchableOpacity
                onPress={takePicture}
                disabled={!cameraReady}
                style={styles.captureButton}
              >
                <LinearGradient
                  colors={[
                    theme.colors.primary,
                    theme.colors.secondary || theme.colors.primary,
                  ]}
                  style={styles.captureGradient}
                >
                  <View style={styles.captureInner} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text variant="body2" color="white" style={styles.captureHelpText}>
              {t("document.tapToCapture")}
            </Text>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorCard: {
    padding: 24,
    alignItems: "center",
    borderRadius: 16,
    width: 320,
    maxWidth: "90%",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 40,
  },
  backButton: {
    padding: 8,
  },
  iconButton: {
    borderRadius: 23,
    overflow: "hidden",
  },
  blurButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanAreaContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanTarget: {
    width: scanAreaWidth,
    height: scanAreaHeight,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
  },
  scanLine: {
    position: "absolute",
    width: scanAreaWidth - 20,
    height: 2,
    borderRadius: 1,
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "white",
  },
  cornerTL: {
    top: SCAN_AREA_PADDING,
    left: SCAN_AREA_PADDING,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: SCAN_AREA_PADDING,
    right: SCAN_AREA_PADDING,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: height - (SCAN_AREA_PADDING + scanAreaHeight),
    left: SCAN_AREA_PADDING,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: height - (SCAN_AREA_PADDING + scanAreaHeight),
    right: SCAN_AREA_PADDING,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  statusContainer: {
    position: "absolute",
    bottom: 24,
    borderRadius: 20,
    overflow: "hidden",
  },
  statusBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  statusText: {
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  captureArea: {
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
  },
  captureContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  captureOuterRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    position: "absolute",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
  },
  captureGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "white",
  },
  captureHelpText: {
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  previewContainer: {
    flex: 1,
    width: "100%",
    padding: 20,
    position: "relative",
  },
  previewImage: {
    flex: 1,
    borderRadius: 16,
  },
  qualityBadge: {
    position: "absolute",
    bottom: 30,
    right: 30,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  processingCard: {
    padding: 24,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
  },
  processingTitle: {
    textAlign: "center",
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  processingNote: {
    textAlign: "center",
    marginTop: 16,
  },
});

export default ScanScreen;
