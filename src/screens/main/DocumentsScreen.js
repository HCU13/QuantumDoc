// screens/main/DocumentsScreen.js
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { documentManager } from "../../services/DocumentManager";
import { showToast } from "../../utils/toast";
import { LinearGradient } from "expo-linear-gradient";

export const DocumentsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [processingModalVisible, setProcessingModalVisible] = useState(false);
  const [processedDoc, setProcessedDoc] = useState(null);

  // Function to handle document upload
  const handleUpload = async () => {
    try {
      // Open document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/*",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // Show processing modal and start loading
      setLoading(true);
      setProgress(0);
      setStatus("preparing");
      setProcessingModalVisible(true);
      setProcessedDoc(null);

      // Process the document
      const file = result.assets[0];
      const processedDocument = await documentManager.processDocument(
        file,
        (progressValue, statusText) => {
          setProgress(progressValue);
          setStatus(statusText);
        }
      );

      // Save the processed document for display
      setProcessedDoc(processedDocument);

      // Success toast
      showToast.success(
        "Success",
        processedDocument.analysis
          ? "Document analyzed successfully"
          : "Document uploaded successfully"
      );

      // Short delay to see 100%
      setTimeout(() => {
        // Navigate to document detail if successful
        if (processedDocument && processedDocument.id) {
          navigation.navigate("DocumentDetail", {
            documentId: processedDocument.id,
          });

          // Reset and close modal after navigation
          setProcessingModalVisible(false);
          setLoading(false);
        }
      }, 500);
    } catch (error) {
      console.error("Error uploading document:", error);
      setLoading(false);
      setProcessingModalVisible(false);
      showToast.error("Error", `Failed to process document: ${error.message}`);
    }
  };

  // Function to render the upload button
  const renderUploadButton = () => (
    <TouchableOpacity
      style={[styles.uploadCard, { backgroundColor: theme.colors.surface }]}
      onPress={handleUpload}
      disabled={loading}
    >
      <LinearGradient
        colors={[theme.colors.primary + "20", theme.colors.background]}
        style={styles.cardGradient}
      >
        <View style={styles.uploadIconContainer}>
          <View
            style={[
              styles.uploadIcon,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
          >
            <Ionicons
              name="cloud-upload"
              size={50}
              color={theme.colors.primary}
            />
          </View>
        </View>

        <Text style={[styles.uploadTitle, { color: theme.colors.text }]}>
          Upload Document
        </Text>

        <Text
          style={[
            styles.uploadDescription,
            { color: theme.colors.textSecondary },
          ]}
        >
          Upload PDF, Word, images, or text files for AI analysis
        </Text>

        <Button
          title="Select Document"
          onPress={handleUpload}
          theme={theme}
          style={styles.selectButton}
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  // Function to render supported formats
  const renderSupportedFormats = () => (
    <View style={styles.formatsContainer}>
      <Text style={[styles.formatsTitle, { color: theme.colors.text }]}>
        Supported Formats
      </Text>

      <View style={styles.formatsList}>
        <View style={styles.formatItem}>
          <Ionicons
            name="document-text"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={{ color: theme.colors.text }}>PDF</Text>
        </View>

        <View style={styles.formatItem}>
          <Ionicons name="document" size={24} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text }}>Word</Text>
        </View>

        <View style={styles.formatItem}>
          <Ionicons name="image" size={24} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text }}>Images</Text>
        </View>

        <View style={styles.formatItem}>
          <Ionicons name="text" size={24} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text }}>Text</Text>
        </View>
      </View>
    </View>
  );

  // Function to render recent history button
  const renderHistoryButton = () => (
    <TouchableOpacity
      style={[styles.historyButton, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate("History")}
    >
      <Ionicons name="time" size={22} color={theme.colors.primary} />
      <Text style={{ color: theme.colors.primary }}>View Document History</Text>
    </TouchableOpacity>
  );

  // Function to render the processing modal
  const renderProcessingModal = () => (
    <Modal
      visible={processingModalVisible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {processedDoc ? "Processing Complete" : "Processing Document"}
            </Text>

            {/* Show close button only when complete or on error */}
            {(processedDoc || progress === 100) && (
              <TouchableOpacity
                onPress={() => setProcessingModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>

          {processedDoc ? (
            // Show success state
            <View style={styles.successContent}>
              <View
                style={[
                  styles.successIcon,
                  { backgroundColor: theme.colors.success + "20" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={44}
                  color={theme.colors.success}
                />
              </View>

              <Text style={[styles.successText, { color: theme.colors.text }]}>
                Document Processed Successfully
              </Text>

              <Button
                title="View Document"
                onPress={() => {
                  setProcessingModalVisible(false);
                  navigation.navigate("DocumentDetail", {
                    documentId: processedDoc.id,
                  });
                }}
                theme={theme}
                style={styles.viewButton}
              />
            </View>
          ) : (
            // Show loading state
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} />

              <Text style={[styles.statusText, { color: theme.colors.text }]}>
                {status === "preparing" && "Preparing document..."}
                {status === "uploading" && "Uploading to secure storage..."}
                {status === "saving" && "Saving document information..."}
                {status === "analyzing" && "AI is analyzing document..."}
                {status === "finalizing" && "Finalizing results..."}
              </Text>

              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${progress}%`,
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
                {Math.round(progress)}% Complete
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Upload Document
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderUploadButton()}
        {renderSupportedFormats()}
        {renderHistoryButton()}
      </ScrollView>

      {renderProcessingModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "700",
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  uploadCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardGradient: {
    padding: 24,
    alignItems: "center",
  },
  uploadIconContainer: {
    marginVertical: 20,
  },
  uploadIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  uploadDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  selectButton: {
    paddingHorizontal: 30,
    marginTop: 8,
  },
  formatsContainer: {
    marginVertical: 16,
  },
  formatsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  formatsList: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    marginTop: 8,
  },
  formatItem: {
    alignItems: "center",
    padding: 10,
    width: "25%",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContent: {
    alignItems: "center",
    padding: 20,
  },
  statusText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontSize: 14,
  },
  successContent: {
    alignItems: "center",
    padding: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  viewButton: {
    minWidth: 180,
  },
});
