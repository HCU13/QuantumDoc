// services/DocumentManager.js
import { firebaseStorage } from "./FirebaseStorage";
import { claudeService } from "./ClaudeService";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";

export const documentManager = {
  /**
   * Pick a document from device storage
   * @returns {Promise<Object>} - Selected document info
   */
  pickDocument: async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      // Return the file information
      return result.assets[0];
    } catch (error) {
      console.error("Error picking document:", error);
      throw error;
    }
  },

  /**
   * Scan a document with camera
   * @returns {Promise<Object>} - Captured document info
   */
  scanDocument: async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Camera permission is required");
      }

      // Take a picture
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.canceled) {
        return null;
      }

      // Optimize the image for document processing
      const processedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1600 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      return {
        uri: processedImage.uri,
        name: `scan_${new Date().toISOString()}.jpg`,
        type: "image/jpeg",
        size: await this.getFileSize(processedImage.uri),
      };
    } catch (error) {
      console.error("Error scanning document:", error);
      throw error;
    }
  },

  /**
   * Get file size from URI
   * @param {string} uri - File URI
   * @returns {Promise<number>} - File size in bytes
   */
  getFileSize: async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return fileInfo.size;
    } catch (error) {
      console.error("Error getting file size:", error);
      return 0;
    }
  },

  /**
   * Process a document (upload, analyze with Claude)
   * @param {Object} file - File object with uri, name, type
   * @param {string} userId - User ID
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} - Processed document data
   */
  processDocument: async (file, userId, onProgress = () => {}) => {
    try {
      // Update progress
      onProgress(0, "Preparing document");

      // Generate a unique file name
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split(".").pop();
      const fileName = `${timestamp}.${fileExtension}`;

      // Upload to Firebase Storage
      onProgress(10, "Uploading document");
      const { downloadUrl, storageRef } = await firebaseStorage.uploadDocument(
        file.uri,
        fileName,
        userId,
        file.type,
        (progress) => onProgress(10 + progress * 0.3, "Uploading document")
      );

      // Save document metadata to Firestore
      onProgress(40, "Saving document information");
      const documentData = {
        name: file.name,
        originalName: file.name,
        type: file.type,
        size: file.size,
        userId,
        storageRef,
        downloadUrl,
        status: "uploaded",
      };

      const documentId = await firebaseStorage.saveDocumentMetadata(
        documentData
      );

      // Process with Claude API
      onProgress(50, "Analyzing document content");
      const analysisResult = await claudeService.processDocument({
        id: documentId,
        userId,
        fileUrl: downloadUrl,
        mimeType: file.type,
      });

      // Update document status
      onProgress(90, "Finalizing");
      await firebaseStorage.updateDocumentMetadata(documentId, {
        status: "analyzed",
        analysisId: analysisResult.id || "",
      });

      onProgress(100, "Complete");

      // Return the processed document data
      return {
        id: documentId,
        ...documentData,
        analysisResult,
      };
    } catch (error) {
      console.error("Error processing document:", error);
      throw error;
    }
  },

  /**
   * Get user's documents
   * @param {string} userId - User ID
   * @param {number} limitCount - Number of documents to retrieve
   * @returns {Promise<Array>} - User documents
   */
  getUserDocuments: async (userId, limitCount = 20) => {
    try {
      const q = query(
        collection(FIRESTORE_DB, "documents"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting user documents:", error);
      throw error;
    }
  },

  /**
   * Ask a question about a document
   * @param {string} documentId - Document ID
   * @param {string} question - User's question
   * @returns {Promise<Object>} - Answer information
   */
  askDocumentQuestion: async (documentId, question) => {
    try {
      // Get document context
      // This is a simplified approach - in a real app you'd need to handle large documents properly
      const document = await this.getDocumentById(documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      // Get the most recent analysis result for context
      const analysis = await claudeService.getDocumentAnalysis(documentId);
      const documentContext = analysis
        ? analysis.analysisData.content[0].text
        : "";

      // Ask Claude the question
      const answer = await claudeService.askDocumentQuestion(
        documentId,
        question,
        documentContext
      );

      return {
        question,
        answer: answer.content[0].text,
        documentId,
        documentName: document.name,
      };
    } catch (error) {
      console.error("Error asking document question:", error);
      throw error;
    }
  },

  /**
   * Get a document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Document data
   */
  getDocumentById: async (documentId) => {
    try {
      const q = query(
        collection(FIRESTORE_DB, "documents"),
        where("__name__", "==", documentId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length === 0) {
        return null;
      }

      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      };
    } catch (error) {
      console.error("Error getting document by ID:", error);
      throw error;
    }
  },

  /**
   * Get document conversation history
   * @param {string} documentId - Document ID
   * @returns {Promise<Array>} - Conversation history
   */
  getDocumentConversations: async (documentId) => {
    return await claudeService.getDocumentConversations(documentId);
  },

  /**
   * Delete a document
   * @param {string} documentId - Document ID
   * @returns {Promise<void>}
   */
  deleteDocument: async (documentId) => {
    try {
      const document = await this.getDocumentById(documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      await firebaseStorage.deleteDocument(documentId, document.storageRef);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },
};
