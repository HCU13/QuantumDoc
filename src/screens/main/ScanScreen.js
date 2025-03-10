// src/screens/main/ScanScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  Easing,
  ImageBackground,
} from "react-native";
import { Camera } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTheme } from "../../context/ThemeContext";
import { useTokens } from "../../context/TokenContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text } from "../../components/Text";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Loading } from "../../components/Loading";
import { documentApi } from "../../api/documentApi";
import { ocrApi } from "../../api/ocrApi";
import { MotiView } from "moti";
import LottieView from "lottie-react-native";
import Svg, {
  Path,
  Rect,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";

const { width, height } = Dimensions.get("window");
const SCAN_AREA_PADDING = 40;
const SCAN_AREA_ASPECT_RATIO = 1.414; // A4 aspect ratio

const ScanScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { useTokens, TOKEN_COSTS } = useTokens();
  const { t } = useLocalization();

  // Refs
  const cameraRef = useRef(null);
  const lottieRef = useRef(null);
  const scanAnimation = useRef(null);

  // State
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [scanStage, setScanStage] = useState("initial"); // initial, detecting, captured, preview, processing
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [documentEdges, setDocumentEdges] = useState(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingSteps, setProcessingSteps] = useState([
    { title: "Enhancing image", progress: 0 },
    { title: "Detecting text", progress: 0 },
    { title: "Uploading document", progress: 0 },
    { title: "Finalizing", progress: 0 },
  ]);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const edgeDetectionAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const captureScale = useRef(new Animated.Value(1)).current;
  const previewFade = useRef(new Animated.Value(0)).current;
  const enhancementAnim = useRef(new Animated.Value(0)).current;

  // Calculate scan area dimensions
  const scanAreaWidth = width - SCAN_AREA_PADDING * 2;
  const scanAreaHeight = scanAreaWidth * SCAN_AREA_ASPECT_RATIO;

  // Get camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Start scan line animation when camera is ready
  useEffect(() => {
    if (cameraReady && scanStage === "initial") {
      startScanLineAnimation();
      startPulseAnimation();
    }
  }, [cameraReady, scanStage]);

  // Start processing steps animations when processing
  useEffect(() => {
    if (scanStage === "processing") {
      animateProcessingSteps();
    }
  }, [scanStage]);

  // Camera entrance animation
  useEffect(() => {
    if (scanStage === "initial" && hasPermission) {
      setTimeout(() => {
        if (lottieRef.current) {
          lottieRef.current.play();
        }
      }, 500);
    }
  }, [scanStage, hasPermission]);

  // Scan line animation
  const startScanLineAnimation = () => {
    scanLineAnim.setValue(0);
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  };

  // Pulse animation for capture button
  const startPulseAnimation = () => {
    pulseAnim.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Flash animation when taking picture
  const triggerFlashAnimation = () => {
    flashAnim.setValue(0);
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Capture button press animation
  const animateCaptureButton = () => {
    captureScale.setValue(1);
    Animated.sequence([
      Animated.timing(captureScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(captureScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Preview fade in animation
  const animatePreviewFadeIn = () => {
    previewFade.setValue(0);
    Animated.timing(previewFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // Enhancement animation
  const animateEnhancement = () => {
    enhancementAnim.setValue(0);
    Animated.timing(enhancementAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  };

  // Simulate document edge detection
  const simulateDocumentDetection = () => {
    setScanStage("detecting");
    // Randomly simulate finding edges after a delay
    setTimeout(() => {
      const randomOffset = () => Math.random() * 20 - 10; // Random offset between -10 and 10

      // Simulate detected edges with some randomness
      setDocumentEdges({
        topLeft: {
          x: SCAN_AREA_PADDING + randomOffset(),
          y: 100 + randomOffset(),
        },
        topRight: {
          x: width - SCAN_AREA_PADDING + randomOffset(),
          y: 100 + randomOffset(),
        },
        bottomLeft: {
          x: SCAN_AREA_PADDING + randomOffset(),
          y: 100 + scanAreaHeight + randomOffset(),
        },
        bottomRight: {
          x: width - SCAN_AREA_PADDING + randomOffset(),
          y: 100 + scanAreaHeight + randomOffset(),
        },
      });

      // Animate edge detection
      edgeDetectionAnim.setValue(0);
      Animated.timing(edgeDetectionAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1500);
  };

  // Animate processing steps
  const animateProcessingSteps = () => {
    // Define durations for each step
    const stepDurations = [1500, 2500, 1800, 1000];

    // Create a copy of processing steps to update
    let updatedSteps = [...processingSteps];

    // Function to animate a specific step
    const animateStep = (stepIndex, duration) => {
      return new Promise((resolve) => {
        setProcessingStep(stepIndex);

        // Animate progress from 0 to 100 for current step
        const interval = setInterval(() => {
          updatedSteps = [...updatedSteps];
          updatedSteps[stepIndex].progress = Math.min(
            updatedSteps[stepIndex].progress + 2,
            100
          );
          setProcessingSteps(updatedSteps);

          if (updatedSteps[stepIndex].progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, duration / 50);
      });
    };

    // Animate each step sequentially
    const runAnimations = async () => {
      for (let i = 0; i < processingSteps.length; i++) {
        await animateStep(i, stepDurations[i]);
      }

      // All steps completed, go to document detail
      navigation.replace("DocumentDetail", {
        documentId: "simulatedDocumentId", // In a real app, this would be the actual document ID
        newDocument: true,
      });
    };

    runAnimations();
  };

  // Take picture
  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady || scanStage !== "initial") return;

    try {
      animateCaptureButton();
      triggerFlashAnimation();

      // First simulate edge detection
      simulateDocumentDetection();

      // Then actually take the picture after some delay
      setTimeout(async () => {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });

        // Process image (resize and rotation)
        const processedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1200 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        setCapturedImage(processedImage);
        setScanStage("captured");

        // Show preview after a delay
        setTimeout(() => {
          setScanStage("preview");
          animatePreviewFadeIn();
          animateEnhancement();
        }, 1000);
      }, 2500);
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert(t("errors.somethingWentWrong"));
      setScanStage("initial");
    }
  };

  // Process and use image
  const useImage = async () => {
    try {
      setScanStage("processing");

      // In a real app, you would process the image and upload the document
      // For this demo, we're simulating the process with animations

      // The animation will automatically navigate to the document detail screen when complete
    } catch (error) {
      console.error("Error processing document:", error);
      Alert.alert(t("errors.somethingWentWrong"));
      setScanStage("preview");
    }
  };

  // Retake picture
  const retakePicture = () => {
    setCapturedImage(null);
    setDocumentEdges(null);
    setScanStage("initial");
    startScanLineAnimation();
    startPulseAnimation();
  };

  // Render permission error
  const renderPermissionError = () => {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.permissionErrorContainer}>
          {/* <LottieView
            source={require("../../assets/animations/camera-permission.json")}
            style={styles.permissionLottie}
            autoPlay
            loop
          /> */}
          <Text variant="h3" style={styles.permissionErrorTitle}>
            Camera Access Needed
          </Text>
          <Text
            variant="body1"
            color={theme.colors.textSecondary}
            style={styles.permissionErrorText}
          >
            {t("errors.cameraPermission")}
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.permissionBackButton}
            icon="arrow-back"
            gradient={true}
          />
        </View>
      </View>
    );
  };

  // Render camera screen
  const renderCameraScreen = () => {
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants.Type.back}
          flashMode={flashMode}
          onCameraReady={() => setCameraReady(true)}
          ratio="4:3"
        >
          {/* Flash overlay animation */}
          <Animated.View
            style={[styles.flashOverlay, { opacity: flashAnim }]}
          />

          {/* Camera content */}
          <View style={styles.cameraContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <BlurView intensity={80} tint="dark" style={styles.blurButton}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </BlurView>
              </TouchableOpacity>

              <View style={styles.headerControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => {
                    setFlashMode(
                      flashMode === Camera.Constants.FlashMode.off
                        ? Camera.Constants.FlashMode.on
                        : Camera.Constants.FlashMode.off
                    );
                  }}
                >
                  <BlurView
                    intensity={80}
                    tint="dark"
                    style={styles.blurButton}
                  >
                    <Ionicons
                      name={
                        flashMode === Camera.Constants.FlashMode.off
                          ? "flash-off"
                          : "flash"
                      }
                      size={22}
                      color="white"
                    />
                  </BlurView>
                </TouchableOpacity>
              </View>
            </View>

            {/* Document scanner frame */}
            <View style={styles.scanAreaContainer}>
              {/* Scan target area with rounded corners */}
              <View
                style={[
                  styles.scanTarget,
                  {
                    width: scanAreaWidth,
                    height: scanAreaHeight,
                    borderColor: theme.colors.primary + "80",
                  },
                ]}
              />

              {/* Scanning line animation */}
              {scanStage === "initial" && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      width: scanAreaWidth - 20,
                      backgroundColor: theme.colors.primary + "30",
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
              )}

              {/* Document edges overlay when detected */}
              {documentEdges && (
                <Animated.View
                  style={[
                    styles.edgesOverlay,
                    {
                      opacity: edgeDetectionAnim,
                    },
                  ]}
                >
                  <Svg height="100%" width="100%">
                    <Defs>
                      <SvgGradient
                        id="edgeGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <Stop
                          offset="0"
                          stopColor={theme.colors.primary}
                          stopOpacity="0.8"
                        />
                        <Stop
                          offset="1"
                          stopColor={theme.colors.secondary}
                          stopOpacity="0.8"
                        />
                      </SvgGradient>
                    </Defs>
                    <Path
                      d={`
                        M ${documentEdges.topLeft.x} ${documentEdges.topLeft.y}
                        L ${documentEdges.topRight.x} ${documentEdges.topRight.y}
                        L ${documentEdges.bottomRight.x} ${documentEdges.bottomRight.y}
                        L ${documentEdges.bottomLeft.x} ${documentEdges.bottomLeft.y}
                        Z
                      `}
                      stroke="url(#edgeGradient)"
                      strokeWidth="3"
                      fill="transparent"
                    />
                  </Svg>
                </Animated.View>
              )}

              {/* Corner marks */}
              <View style={[styles.cornerTL, styles.corner]} />
              <View style={[styles.cornerTR, styles.corner]} />
              <View style={[styles.cornerBL, styles.corner]} />
              <View style={[styles.cornerBR, styles.corner]} />

              {/* Status indicator */}
              <View style={styles.statusContainer}>
                <BlurView intensity={80} tint="dark" style={styles.statusBlur}>
                  {scanStage === "initial" && (
                    <View style={styles.statusContent}>
                      <MotiView
                        from={{ opacity: 0.5, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "timing",
                          duration: 1000,
                          loop: true,
                        }}
                        style={[
                          styles.statusIcon,
                          { backgroundColor: theme.colors.info + "30" },
                        ]}
                      >
                        <Ionicons
                          name="scan"
                          size={16}
                          color={theme.colors.info}
                        />
                      </MotiView>
                      <Text
                        variant="caption"
                        color="#FFFFFF"
                        style={styles.statusText}
                      >
                        Position document in frame
                      </Text>
                    </View>
                  )}
                  {scanStage === "detecting" && (
                    <View style={styles.statusContent}>
                      <MotiView
                        from={{ opacity: 0.5, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "timing",
                          duration: 500,
                          loop: true,
                        }}
                        style={[
                          styles.statusIcon,
                          { backgroundColor: theme.colors.primary + "30" },
                        ]}
                      >
                        <Ionicons
                          name="scan-outline"
                          size={16}
                          color={theme.colors.primary}
                        />
                      </MotiView>
                      <Text
                        variant="caption"
                        color="#FFFFFF"
                        style={styles.statusText}
                      >
                        Detecting document edges...
                      </Text>
                    </View>
                  )}
                  {scanStage === "captured" && (
                    <View style={styles.statusContent}>
                      <View
                        style={[
                          styles.statusIcon,
                          { backgroundColor: theme.colors.success + "30" },
                        ]}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={theme.colors.success}
                        />
                      </View>
                      <Text
                        variant="caption"
                        color="#FFFFFF"
                        style={styles.statusText}
                      >
                        Document captured!
                      </Text>
                    </View>
                  )}
                </BlurView>
              </View>
            </View>

            {/* Capture button area */}
            <View style={styles.captureArea}>
              <View style={styles.captureContainer}>
                <MotiView
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "timing", duration: 800 }}
                >
                  <Animated.View
                    style={[
                      styles.captureOuterRing,
                      {
                        borderColor: theme.colors.primary + "50",
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  />
                </MotiView>

                <Animated.View
                  style={[
                    styles.captureButton,
                    {
                      transform: [{ scale: captureScale }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={takePicture}
                    disabled={!cameraReady || scanStage !== "initial"}
                    style={styles.captureTouchable}
                  >
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.secondary]}
                      style={styles.captureGradient}
                    >
                      <View style={styles.captureInner} />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <Text
                variant="body2"
                color="white"
                style={styles.captureHelpText}
              >
                {scanStage === "initial"
                  ? "Tap to capture"
                  : scanStage === "detecting"
                  ? "Finding document edges..."
                  : "Processing document..."}
              </Text>
            </View>
          </View>
        </Camera>
      </View>
    );
  };

  // Render preview screen
  const renderPreviewScreen = () => {
    if (!capturedImage) return null;

    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.previewHeader}>
          <TouchableOpacity
            style={styles.previewBackButton}
            onPress={retakePicture}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Text variant="h3" style={styles.previewTitle}>
            {t("document.scanDocument")}
          </Text>

          <View style={styles.previewHeaderRight} />
        </View>

        <View style={styles.previewContainer}>
          <Animated.View
            style={[
              styles.previewImageContainer,
              {
                opacity: previewFade,
                transform: [
                  {
                    scale: previewFade.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: capturedImage.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />

            {/* Quality badge */}
            <View style={styles.qualityBadgeContainer}>
              <BlurView
                intensity={50}
                tint={isDark ? "dark" : "light"}
                style={styles.qualityBadge}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={theme.colors.success}
                />
                <Text
                  variant="caption"
                  color={theme.colors.success}
                  style={styles.qualityText}
                >
                  Good scan quality
                </Text>
              </BlurView>
            </View>

            {/* Enhancement overlay */}
            <Animated.View
              style={[
                styles.enhancementOverlay,
                {
                  opacity: enhancementAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.3, 0],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(67, 97, 238, 0.3)", "rgba(76, 201, 240, 0.3)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.enhancementGradient}
              />
            </Animated.View>
          </Animated.View>

          {/* Image adjustments */}
          <Animated.View
            style={[
              styles.adjustmentsContainer,
              {
                opacity: previewFade,
              },
            ]}
          >
            <View style={styles.adjustmentsContent}>
              <Badge
                label="Auto Enhanced"
                type="primary"
                icon="wand"
                size="sm"
              />

              <View style={styles.adjustmentsTip}>
                <View style={styles.tipIcon}>
                  <Ionicons
                    name="bulb"
                    size={14}
                    color={theme.colors.warning}
                  />
                </View>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  Document has been optimized for better readability
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <View style={styles.previewActions}>
          <Button
            title="Retake"
            onPress={retakePicture}
            type="outline"
            style={styles.previewButton}
            icon="camera"
          />
          <Button
            title="Use Document"
            onPress={useImage}
            style={styles.previewButton}
            gradient={true}
            icon="document-text"
          />
        </View>
      </View>
    );
  };

  // Render processing screen
  const renderProcessingScreen = () => {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.processingContainer}>
          <Card style={styles.processingCard}>
            {/* <LottieView
              source={require("../../assets/animations/document-scanning.json")}
              style={styles.processingLottie}
              autoPlay
              loop
            /> */}

            <Text variant="h3" style={styles.processingTitle}>
              Processing Document
            </Text>

            <View style={styles.processingSteps}>
              {processingSteps.map((step, index) => (
                <View
                  key={index}
                  style={[
                    styles.processingStep,
                    index === processingStep && styles.processingStepActive,
                  ]}
                >
                  <View style={styles.processingStepHeader}>
                    <View style={styles.processingStepNumber}>
                      {index < processingStep ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : (
                        <Text variant="caption" color="#FFFFFF">
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    <Text
                      variant="body2"
                      weight={index === processingStep ? "semibold" : "regular"}
                      color={
                        index <= processingStep
                          ? theme.colors.text
                          : theme.colors.textSecondary
                      }
                    >
                      {step.title}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: theme.colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${step.progress}%`,
                          backgroundColor:
                            index < processingStep
                              ? theme.colors.success
                              : theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.processingNote}
            >
              This may take a few seconds, please wait...
            </Text>
          </Card>
        </View>
      </View>
    );
  };

  // Main render
  if (hasPermission === null) {
    return <Loading fullScreen type="logo" iconName="camera" />;
  }

  if (hasPermission === false) {
    return renderPermissionError();
  }

  if (scanStage === "preview") {
    return renderPreviewScreen();
  }

  if (scanStage === "processing") {
    return renderProcessingScreen();
  }

  return renderCameraScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginTop: StatusBar.currentHeight || 40,
    zIndex: 10,
  },
  backButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  blurButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  headerControls: {
    flexDirection: "row",
  },
  controlButton: {
    marginLeft: 10,
    borderRadius: 25,
    overflow: "hidden",
  },
  scanAreaContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  scanTarget: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    position: "relative",
  },
  scanLine: {
    position: "absolute",
    height: 2,
    borderRadius: 1,
  },
  edgesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    bottom:
      height - (SCAN_AREA_PADDING + scanAreaWidth * SCAN_AREA_ASPECT_RATIO),
    left: SCAN_AREA_PADDING,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom:
      height - (SCAN_AREA_PADDING + scanAreaWidth * SCAN_AREA_ASPECT_RATIO),
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
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  captureOuterRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    position: "absolute",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureTouchable: {
    width: "100%",
    height: "100%",
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
  },
  captureHelpText: {
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === "ios" ? 50 : 20 + (StatusBar.currentHeight || 0),
    paddingBottom: 20,
  },
  previewBackButton: {
    padding: 8,
  },
  previewTitle: {
    flex: 1,
    textAlign: "center",
  },
  previewHeaderRight: {
    width: 40,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  previewImageContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    flex: 1,
    borderRadius: 16,
  },
  qualityBadgeContainer: {
    position: "absolute",
    bottom: 16,
    right: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  qualityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qualityText: {
    marginLeft: 6,
  },
  enhancementOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  enhancementGradient: {
    flex: 1,
  },
  adjustmentsContainer: {
    marginTop: 16,
  },
  adjustmentsContent: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  adjustmentsTip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  tipIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  processingCard: {
    padding: 24,
    width: "100%",
    maxWidth: 500,
  },
  processingLottie: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 16,
  },
  processingTitle: {
    textAlign: "center",
    marginBottom: 24,
  },
  processingSteps: {
    marginBottom: 20,
  },
  processingStep: {
    marginBottom: 16,
  },
  processingStepActive: {},
  processingStepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  processingStepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#6C7280",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginLeft: 32,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  processingNote: {
    textAlign: "center",
    marginTop: 16,
  },
  permissionErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#000",
  },
  permissionLottie: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  permissionErrorTitle: {
    color: "white",
    marginBottom: 12,
  },
  permissionErrorText: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 32,
  },
  permissionBackButton: {
    minWidth: 180,
  },
});

export default ScanScreen;
