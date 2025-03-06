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
  doc,
  getDoc,
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
      console.log("Opening document picker");
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("Document picker canceled");
        return null;
      }

      console.log("Document selected:", result.assets[0].name);
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

      console.log("Opening camera");
      // Take a picture
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.canceled) {
        console.log("Camera capture canceled");
        return null;
      }

      console.log("Image captured");
      // Optimize the image for document processing
      const processedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1600 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log("Image processed");
      const fileSize = await this.getFileSize(processedImage.uri);

      return {
        uri: processedImage.uri,
        name: `scan_${new Date().toISOString()}.jpg`,
        type: "image/jpeg",
        size: fileSize,
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
      onProgress(0, "preparing");
      console.log("Starting document processing", {
        fileName: file.name,
        fileType: file.type,
      });

      // Generate a unique file name
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const safeFileName = `doc_${timestamp}.${fileExtension}`;

      // Upload to Firebase Storage
      onProgress(10, "uploading");
      console.log("Uploading document to Firebase Storage");

      const { downloadUrl, storageRef, size } =
        await firebaseStorage.uploadDocument(
          file.uri,
          safeFileName,
          userId,
          file.type,
          (progress) => onProgress(10 + progress * 0.3, "uploading")
        );

      // Save document metadata to Firestore
      onProgress(40, "saving");
      console.log("Saving document metadata to Firestore");

      const documentData = {
        name: file.name || "Unnamed Document",
        originalName: file.name || "Unnamed Document",
        fileName: safeFileName,
        type: file.type || "application/octet-stream", // default type if undefined
        size: file.size || size || 0,
        userId,
        storageRef,
        downloadUrl,
        status: "uploaded",
        fileExtension: fileExtension || "unknown",
        createdAt: new Date().toISOString(),
      };

      const documentId = await firebaseStorage.saveDocumentMetadata(
        documentData
      );

      console.log("Document saved with ID:", documentId);

      // Only proceed with Claude API if it's a text document we can analyze
      if (
        ["pdf", "docx", "doc", "txt"].includes(fileExtension) ||
        file.type.startsWith("application/pdf") ||
        file.type.includes("document")
      ) {
        // Process with Claude API
        onProgress(50, "analyzing");
        console.log("Sending document to Claude API for analysis");

        try {
          const analysisResult = await claudeService.processDocument({
            id: documentId,
            userId,
            fileUrl: downloadUrl,
            mimeType: file.type,
          });

          // Update document status
          onProgress(90, "finalizing");
          await firebaseStorage.updateDocumentMetadata(documentId, {
            status: "analyzed",
            analysisId: analysisResult?.id || "",
          });

          documentData.analysisResult = analysisResult;
        } catch (analysisError) {
          console.error("Error during document analysis:", analysisError);
          // Still continue - we'll just mark it as uploaded without analysis
          await firebaseStorage.updateDocumentMetadata(documentId, {
            status: "upload_only",
            analysisError: analysisError.message,
          });
        }
      } else {
        // Skip analysis for non-document files
        console.log("Skipping analysis for non-document file");
        await firebaseStorage.updateDocumentMetadata(documentId, {
          status: "upload_only",
        });
      }

      onProgress(100, "complete");

      // Return the processed document data
      return {
        id: documentId,
        ...documentData,
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
      console.log("Getting user documents", { userId });
      const q = query(
        collection(FIRESTORE_DB, "documents"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`Retrieved ${documents.length} documents`);
      return documents;
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
      console.log("Asking question about document", { documentId, question });

      // Get document
      const document = await this.getDocumentById(documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      // Send question to Claude API
      const answer = await claudeService.askDocumentQuestion(
        documentId,
        question
      );

      return {
        question,
        answer: answer.answer,
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
      console.log("Getting document by ID", { documentId });
      const docRef = doc(FIRESTORE_DB, "documents", documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log("Document not found");
        return null;
      }

      console.log("Document found");
      return {
        id: docSnap.id,
        ...docSnap.data(),
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
      console.log("Deleting document", { documentId });
      const document = await this.getDocumentById(documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      await firebaseStorage.deleteDocument(documentId, document.storageRef);
      console.log("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },
};
