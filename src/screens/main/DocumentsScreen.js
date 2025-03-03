// DocumentsScreen.js - legacy camera kullanımı ile düzeltilmiş versiyon
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Modal,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { showToast } from "../../utils/toast";
import * as DocumentPicker from "expo-document-picker";

// Camera ve Haptics modüllerini güvenli bir şekilde import etme
let Camera;
let CameraType;
let FlashMode;
let Haptics;

try {
  const ExpoCamera = require('expo-camera/legacy');
  Camera = ExpoCamera.Camera;
  CameraType = ExpoCamera.CameraType;
  FlashMode = ExpoCamera.FlashMode;
  Haptics = require('expo-haptics');
} catch (error) {
  console.log("Module import error:", error);
  Camera = null;
  CameraType = null;
  FlashMode = null;
  Haptics = null;
}

const { width } = Dimensions.get("window");

export const DocumentsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraType, setCameraType] = useState(CameraType ? CameraType.back : 'back');
  const [flash, setFlash] = useState(FlashMode ? FlashMode.off : 'off');
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);

  // Token durumu
  const [tokenCount, setTokenCount] = useState(5);
  const [freeTrialUsed, setFreeTrialUsed] = useState(false);

  // İlk yükleme
  useEffect(() => {
    loadDocuments();
    
    // Camera izni kontrolü (sadece Camera varsa)
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

  const filters = [
    {
      id: "all",
      label: "All Files",
      icon: "documents-outline",
    },
    {
      id: "recent",
      label: "Recent",
      icon: "time-outline",
    },
    {
      id: "scanned",
      label: "Scanned",
      icon: "scan-outline",
    },
    {
      id: "uploaded",
      label: "Uploaded",
      icon: "cloud-upload-outline",
    },
  ];

  const loadDocuments = async () => {
    setLoading(true);
    try {
      // API'den dokümanları çek
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockDocuments = [
        {
          id: "1",
          title: "Financial Report",
          type: "PDF",
          date: "Just now",
          size: "2.4 MB",
          source: "scan",
          icon: "document-text-outline",
        },
        {
          id: "2",
          title: "Meeting Notes",
          type: "DOCX",
          date: "2h ago",
          size: "1.8 MB",
          source: "upload",
          icon: "document-text-outline",
        },
        {
          id: "3",
          title: "Presentation",
          type: "PPTX",
          date: "Yesterday",
          size: "5.1 MB",
          source: "upload",
          icon: "document-text-outline",
        },
        {
          id: "4",
          title: "Invoice",
          type: "PDF",
          date: "2 days ago",
          size: "1.2 MB",
          source: "scan",
          icon: "receipt-outline",
        },
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      if (showToast) {
        showToast.error("Error", "Failed to load documents");
      } else {
        console.error("Failed to load documents:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDocuments().finally(() => setRefreshing(false));
  }, []);

  const handleUpload = async () => {
    if (tokenCount === 0 && freeTrialUsed) {
      if (showToast) {
        showToast.info(
          "Tokens Required",
          "Please purchase tokens to analyze more documents"
        );
      }
      navigation.navigate("Premium");
      return;
    }

    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/*",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        // Simüle edilmiş yükleme
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (!freeTrialUsed) {
          setFreeTrialUsed(true);
        } else {
          setTokenCount((prev) => prev - 1);
        }

        if (showToast) {
          showToast.success("Success", "Document uploaded successfully");
        }

        // Add new document to list
        const newDoc = {
          id: String(documents.length + 1),
          title: result.name,
          type: result.name.split(".").pop().toUpperCase(),
          date: "Just now",
          size: `${(result.size / (1024 * 1024)).toFixed(1)} MB`,
          source: "upload",
          icon: "document-text-outline",
        };

        setDocuments([newDoc, ...documents]);
        navigation.navigate("DocumentDetail", { documentId: newDoc.id });
      }
    } catch (error) {
      if (showToast) {
        showToast.error("Error", "Failed to upload document");
      } else {
        console.error("Failed to upload document:", error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleScan = async () => {
    // Camera modülü yoksa veya Expo Go'daysa doğrudan modal göster
    if (!Camera || !CameraType) {
      setScanModalVisible(true);
      return;
    }
    
    // Camera varsa normal akış
    if (!hasCameraPermission) {
      if (showToast) {
        showToast.error("Permission Required", "Camera permission is needed");
      }
      return;
    }

    if (tokenCount === 0 && freeTrialUsed) {
      if (showToast) {
        showToast.info(
          "Tokens Required",
          "Please purchase tokens to scan more documents"
        );
      }
      navigation.navigate("Premium");
      return;
    }

    setScanModalVisible(true);
  };

  const toggleFlash = () => {
    if (FlashMode) {
      setFlash(flash === FlashMode.off ? FlashMode.on : FlashMode.off);
    }
  }

  const simulateScan = () => {
    setScanModalVisible(false);
    
    // Yükleme simülasyonu
    setCapturing(true);
    setTimeout(() => {
      if (!freeTrialUsed) {
        setFreeTrialUsed(true);
      } else {
        setTokenCount((prev) => prev - 1);
      }

      // Add new document to list
      const newDoc = {
        id: String(documents.length + 1),
        title: `Scanned Document ${new Date().toLocaleTimeString()}`,
        type: "PDF",
        date: "Just now",
        size: "1.2 MB",
        source: "scan",
        icon: "document-text-outline",
      };

      setDocuments([newDoc, ...documents]);
      setCapturing(false);
      
      if (showToast) {
        showToast.success("Success", "Document scanned successfully");
      }
      
      navigation.navigate("DocumentDetail", { documentId: newDoc.id });
    }, 1000);
  };

  const takePicture = async () => {
    if (cameraRef.current && !capturing) {
      try {
        setCapturing(true);
        
        // Haptics feedback
        if (Haptics && Haptics.notificationAsync) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
        });

        // Close modal
        setScanModalVisible(false);

        // Process document (simulate)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!freeTrialUsed) {
          setFreeTrialUsed(true);
        } else {
          setTokenCount((prev) => prev - 1);
        }

        // Add new document to list
        const newDoc = {
          id: String(documents.length + 1),
          title: `Scanned Document ${new Date().toLocaleTimeString()}`,
          type: "PDF",
          date: "Just now",
          size: "1.2 MB",
          source: "scan",
          icon: "document-text-outline",
        };

        setDocuments([newDoc, ...documents]);

        if (showToast) {
          showToast.success("Success", "Document scanned successfully");
        }
        
        navigation.navigate("DocumentDetail", { documentId: newDoc.id });
      } catch (error) {
        if (showToast) {
          showToast.error("Error", "Failed to scan document");
        } else {
          console.error("Failed to scan document:", error);
        }
      } finally {
        setCapturing(false);
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text
        variant="h1"
        style={[styles.headerTitle, { color: theme.colors.text }]}
      >
        Documents
      </Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={[
            styles.tokenButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => navigation.navigate("Premium")}
        >
          <Ionicons name="flash" size={18} color={theme.colors.warning} />
          <Text style={[styles.tokenCount, { color: theme.colors.text }]}>
            {tokenCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="search" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleScan}
      >
        <Ionicons name="scan-outline" size={22} color="white" />
        <Text style={styles.scanButtonText} color="white">
          Scan Document
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.uploadButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={handleUpload}
      >
        <Ionicons
          name="cloud-upload-outline"
          size={22}
          color={theme.colors.primary}
        />
        <Text
          style={[styles.uploadButtonText, { color: theme.colors.primary }]}
        >
          Upload File
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterChip,
            {
              backgroundColor:
                selectedFilter === filter.id
                  ? theme.colors.primary
                  : theme.colors.surface,
            },
          ]}
          onPress={() => setSelectedFilter(filter.id)}
        >
          <Ionicons
            name={filter.icon}
            size={18}
            color={selectedFilter === filter.id ? "white" : theme.colors.text}
          />
          <Text
            style={[
              styles.filterLabel,
              {
                color:
                  selectedFilter === filter.id ? "white" : theme.colors.text,
              },
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDocumentItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.documentCard, { backgroundColor: theme.colors.surface }]}
      onPress={() =>
        navigation.navigate("DocumentDetail", { documentId: item.id })
      }
    >
      <View
        style={[
          styles.documentIcon,
          { backgroundColor: theme.colors.primary + "15" },
        ]}
      >
        <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
      </View>

      <View style={styles.documentInfo}>
        <Text style={[styles.documentTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text
          style={[styles.documentMeta, { color: theme.colors.textSecondary }]}
        >
          {item.type} • {item.size} • {item.date}
        </Text>
      </View>

      <TouchableOpacity style={styles.documentMenu}>
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View
      style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}
    >
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: theme.colors.primary + "15" },
        ]}
      >
        <Ionicons
          name="documents-outline"
          size={40}
          color={theme.colors.primary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Documents Yet
      </Text>
      <Text
        style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}
      >
        Start by scanning or uploading your first document
      </Text>
      <View style={styles.emptyActions}>
        <Button
          title="Scan Document"
          onPress={handleScan}
          theme={theme}
          style={styles.emptyActionButton}
        />
        <Button
          title="Upload File"
          onPress={handleUpload}
          type="secondary"
          theme={theme}
          style={styles.emptyActionButton}
        />
      </View>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Loading documents...
      </Text>
    </View>
  );

  const renderScanModal = () => {
    // Camera modülü mevcut değilse veya Expo Go içindeyiz
    if (!Camera || !CameraType) {
      return (
        <Modal
          animationType="slide"
          transparent={false}
          visible={scanModalVisible}
          onRequestClose={() => setScanModalVisible(false)}
        >
          <View style={styles.scanModalContainer}>
            <StatusBar barStyle="light-content" />
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>Camera Preview</Text>
              <Text style={[styles.permissionText, {fontSize: 14, marginTop: 10, color: '#aaa'}]}>
                {capturing ? 'Processing document...' : 'Camera will be available in the compiled app'}
              </Text>
              
              {capturing ? (
                <ActivityIndicator size="large" color="white" style={{marginTop: 20}} />
              ) : (
                <>
                  <Button 
                    title="Simulate Scan" 
                    onPress={simulateScan}
                    theme={theme}
                    style={{marginTop: 20}}
                  />
                  <Button 
                    title="Cancel" 
                    onPress={() => setScanModalVisible(false)}
                    theme={theme}
                    type="secondary"
                    style={{marginTop: 12}}
                  />
                </>
              )}
            </View>
          </View>
        </Modal>
      );
    }
    
    // Camera modülü varsa ve izni varsa
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={scanModalVisible}
        onRequestClose={() => setScanModalVisible(false)}
      >
        <View style={styles.scanModalContainer}>
          <StatusBar barStyle="light-content" />
          
          {hasCameraPermission ? (
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
                      name={flash === (FlashMode?.off || 'off') ? "flash-off" : "flash"}
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
    
                {/* Scan frame guides */}
                <View style={styles.scanFrame}>
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />
                </View>
    
                <View style={styles.cameraFooter}>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePicture}
                    disabled={capturing}
                  >
                    <View style={styles.captureOuter}>
                      {capturing ? (
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
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>Camera permission required</Text>
              <Button 
                title="Grant Permission" 
                onPress={async () => {
                  if (Camera && Camera.requestCameraPermissionsAsync) {
                    const { status } = await Camera.requestCameraPermissionsAsync();
                    setHasCameraPermission(status === "granted");
                  }
                }}
                theme={theme}
                style={{marginTop: 20}}
              />
              <Button 
                title="Cancel" 
                onPress={() => setScanModalVisible(false)}
                theme={theme}
                type="secondary"
                style={{marginTop: 12}}
              />
            </View>
          )}
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {renderHeader()}

      <View style={styles.content}>
        {renderActionButtons()}
        {renderFilters()}

        {loading ? (
          renderLoading()
        ) : documents.length > 0 ? (
          <FlatList
            data={documents}
            renderItem={renderDocumentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.documentsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      {renderScanModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  tokenButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    gap: 6,
  },
  tokenCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  scanButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingBottom: 16,
    gap: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  documentsList: {
    paddingBottom: 20,
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  documentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 13,
  },
  documentMenu: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    margin: 16,
    borderRadius: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyActions: {
    flexDirection: "row",
    gap: 12,
  },
  emptyActionButton: {
    minWidth: 140,
  },
  scanModalContainer: {
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
  scanFrame: {
    flex: 1,
    position: "relative",
  },
  cornerTL: {
    position: "absolute",
    top: "15%",
    left: "10%",
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: "absolute",
    top: "15%",
    right: "10%",
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: "absolute",
    bottom: "25%",
    left: "10%",
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: "absolute",
    bottom: "25%",
    right: "10%",
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
    borderBottomRightRadius: 8,
  },
  cameraFooter: {
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
    borderWidth: 5,
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'black',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});