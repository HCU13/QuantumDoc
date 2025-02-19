// ScanScreen.js
import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { Camera } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

export const ScanScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [scanning, setScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const cameraRef = useRef(null);

  // Token durumu (gerçek uygulamada redux/context'ten gelecek)
  const [tokenCount, setTokenCount] = useState(0);
  const [freeTrialUsed, setFreeTrialUsed] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const checkTokenStatus = () => {
    if (!freeTrialUsed) {
      // Ücretsiz deneme hakkı var
      return { canScan: true, message: "Using free trial" };
    }
    if (tokenCount > 0) {
      // Yeterli token var
      return { canScan: true, message: `${tokenCount} tokens remaining` };
    }
    // Token yetersiz
    return { canScan: false, message: "No tokens available" };
  };

  const takePicture = async () => {
    const tokenStatus = checkTokenStatus();

    if (!tokenStatus.canScan) {
      Alert.alert(
        "No Tokens Available",
        "Please purchase tokens to continue scanning documents.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Get Tokens",
            onPress: () => navigation.navigate("Premium"),
          },
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
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture. Please try again.");
      } finally {
        setScanning(false);
      }
    }
  };

  const handleScan = async () => {
    // Token kullanımı
    if (!freeTrialUsed) {
      setFreeTrialUsed(true);
    } else {
      setTokenCount((prev) => prev - 1);
    }

    // Burada tarama işlemi yapılacak
    navigation.replace("DocumentDetail", { documentId: "new" });
  };

  const renderTokenStatus = () => (
    <View
      style={[styles.tokenStatus, { backgroundColor: theme.colors.surface }]}
    >
      <Ionicons
        name="flash"
        size={16}
        color={freeTrialUsed ? theme.colors.warning : theme.colors.success}
      />
      <Text style={{ color: theme.colors.text }}>
        {checkTokenStatus().message}
      </Text>
    </View>
  );

  const renderCameraOverlay = () => (
    <View style={styles.overlay}>
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

          {renderTokenStatus()}

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

      <View style={styles.scanArea}>
        <View
          style={[styles.cornerTL, { borderColor: theme.colors.primary }]}
        />
        <View
          style={[styles.cornerTR, { borderColor: theme.colors.primary }]}
        />
        <View
          style={[styles.cornerBL, { borderColor: theme.colors.primary }]}
        />
        <View
          style={[styles.cornerBR, { borderColor: theme.colors.primary }]}
        />
      </View>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.bottomGradient}
      >
        <SafeAreaView edges={["bottom"]} style={styles.controls}>
          <View style={styles.controlsContainer}>
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
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <Image source={{ uri: previewImage }} style={styles.previewImage} />
      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "transparent"]}
        style={styles.topGradient}
      >
        <SafeAreaView edges={["top"]} style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setPreviewImage(null)}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text color="white" style={styles.headerTitle}>
            Preview
          </Text>
          <View style={styles.headerButton} />
        </SafeAreaView>
      </LinearGradient>

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
            title={`Scan Document (${
              !freeTrialUsed ? "Free Trial" : "1 Token"
            })`}
            onPress={handleScan}
            theme={theme}
            style={styles.previewButton}
          />
        </SafeAreaView>
      </LinearGradient>
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
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {previewImage ? (
        renderPreview()
      ) : (
        <>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={type}
            flashMode={flash}
          />
          {renderCameraOverlay()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  tokenStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  scanArea: {
    position: "absolute",
    top: "20%",
    left: "10%",
    right: "10%",
    height: "45%",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 16,
  },
  controls: {
    width: "100%",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 0 : 20,
  },
  previewButton: {
    flex: 1,
  },
});
