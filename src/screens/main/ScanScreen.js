// ScanScreen.js
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  Image,
} from "react-native";
import { Camera } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ScanGuides } from "../../components/ScanGuides";
import { showToast } from "../../utils/toast";

export const ScanScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [scanning, setScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [processingStatus, setProcessingStatus] = useState("");
  const cameraRef = useRef(null);

  // Token durumu
  const [tokenCount, setTokenCount] = useState(0);
  const [freeTrialUsed, setFreeTrialUsed] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      if (status !== "granted") {
        showToast.error(
          "Permission Required",
          "Camera permission is needed to scan documents"
        );
      }
    })();
  }, []);

  const checkTokenStatus = () => {
    if (!freeTrialUsed) {
      return { canScan: true, message: "Using free trial" };
    }
    if (tokenCount > 0) {
      return { canScan: true, message: `${tokenCount} tokens remaining` };
    }
    return { canScan: false, message: "No tokens available" };
  };

  const processDocument = async (imageUri) => {
    setProcessingStatus("initializing");
    try {
      // Burada OCR ve AI analizi yapılacak
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProcessingStatus("analyzing");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Token kullanımı
      if (!freeTrialUsed) {
        setFreeTrialUsed(true);
      } else {
        setTokenCount((prev) => prev - 1);
      }

      showToast.success("Success", "Document processed successfully");
      navigation.replace("DocumentDetail", { documentId: "new" });
    } catch (error) {
      showToast.error("Error", "Failed to process document");
      setPreviewImage(null);
    }
  };

  const takePicture = async () => {
    const tokenStatus = checkTokenStatus();

    if (!tokenStatus.canScan) {
      Alert.alert(
        "No Tokens Available",
        "Please purchase tokens to continue scanning documents.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Get Tokens", onPress: () => navigation.navigate("Premium") },
        ]
      );
      return;
    }

    if (cameraRef.current) {
      try {
        setScanning(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
        });

        setPreviewImage(photo.uri);
      } catch (error) {
        showToast.error("Error", "Failed to take picture");
      } finally {
        setScanning(false);
      }
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={["rgba(0,0,0,0.7)", "transparent"]}
      style={styles.topGradient}
    >
      <SafeAreaView edges={["top"]} style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        <View
          style={[styles.tokenStatus, { backgroundColor: "rgba(0,0,0,0.5)" }]}
        >
          <Ionicons
            name="flash"
            size={16}
            color={freeTrialUsed ? theme.colors.warning : theme.colors.success}
          />
          <Text style={styles.tokenText} color="white">
            {checkTokenStatus().message}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            setFlash(
              flash === Camera.Constants.FlashMode.off
                ? Camera.Constants.FlashMode.on
                : Camera.Constants.FlashMode.off
            )
          }
        >
          <Ionicons
            name={
              flash === Camera.Constants.FlashMode.off ? "flash-off" : "flash"
            }
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderProcessingOverlay = () => (
    <View style={styles.processingOverlay}>
      <View style={styles.processingContent}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.processingText} color="white">
          {processingStatus === "initializing"
            ? "Preparing document..."
            : "Analyzing content..."}
        </Text>
      </View>
    </View>
  );

  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        flashMode={flash}
      >
        <ScanGuides />
        {renderHeader()}

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.bottomGradient}
        >
          <SafeAreaView edges={["bottom"]} style={styles.controls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={scanning}
            >
              <View
                style={[
                  styles.captureOuter,
                  { borderColor: theme.colors.primary },
                ]}
              >
                <View
                  style={[
                    styles.captureInner,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>
      </Camera>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <Image source={{ uri: previewImage }} style={styles.previewImage} />
      {processingStatus ? (
        renderProcessingOverlay()
      ) : (
        <>
          {renderHeader()}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.bottomGradient}
          >
            <SafeAreaView edges={["bottom"]} style={styles.previewControls}>
              <Button
                title="Retake"
                onPress={() => setPreviewImage(null)}
                type="secondary"
                theme={theme}
                style={styles.previewButton}
              />
              <Button
                title={`Process Document ${
                  !freeTrialUsed ? "(Free Trial)" : "(1 Token)"
                }`}
                onPress={() => processDocument(previewImage)}
                theme={theme}
                style={styles.previewButton}
              />
            </SafeAreaView>
          </LinearGradient>
        </>
      )}
    </View>
  );

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.text }}>No access to camera</Text>
        <Button
          title="Grant Permission"
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
          theme={theme}
          style={styles.permissionButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {previewImage ? renderPreview() : renderCamera()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  topGradient: {
    height: 120,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tokenStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tokenText: {
    fontSize: 14,
  },
  controls: {
    width: "100%",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 0 : 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 0 : 20,
    gap: 16,
  },
  previewButton: {
    flex: 1,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingContent: {
    alignItems: "center",
    gap: 16,
  },
  processingText: {
    fontSize: 16,
  },
  permissionButton: {
    marginTop: 16,
    minWidth: 200,
  },
});
