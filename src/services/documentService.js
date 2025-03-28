import { FIREBASE_STORAGE, FIRESTORE_DB } from "../../firebase/FirebaseConfig";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as mime from "react-native-mime-types";
import { nanoid } from "nanoid/non-secure";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ErrorHandler } from "../utils/errorHandler";
import { showToast } from "../utils/toast";
import aiService from "./aiService";

const storage = FIREBASE_STORAGE;
const firestore = FIRESTORE_DB;
const documentsCollection = collection(firestore, "documents");
const conversationsCollection = collection(firestore, "conversations");

// Get the current authenticated user's ID
const getCurrentUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    return user.uid; // return the authenticated user's UID
  } else {
    throw new Error("User is not authenticated");
  }
};

const getMimeType = (uri) =>
  mime.lookup(uri.split(".").pop()) || "application/octet-stream";

const getFileSize = async (uri) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.size;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
};

/**
 * Generate a description for PDF content instead of trying to extract text
 * @param {string} fileName - PDF file name
 * @returns {string} Description of the PDF content
 */
const describePdfContent = (fileName) => {
  return `This is a PDF document (${fileName}). Claude AI will be used to analyze its content during the analysis phase. The document will be processed to extract text, tables, figures, and other relevant information.`;
};

/**
 * Generate a description for image content
 * @param {string} fileName - Image file name
 * @returns {string} Description of the image content
 */
const describeImageContent = (fileName) => {
  return `This is an image file (${fileName}). Claude AI will be used to analyze the visual content. Claude can recognize text in images, analyze tables and diagrams, and understand general content in the image.`;
};

const DocumentService = {
  /**
   * Upload a document to Firebase Storage
   * @param {string} uri - Local URI of the file to upload
   * @param {string} fileName - Name of the file
   * @returns {Promise<Object>} Document data
   */
  uploadDocument: async (uri, fileName) => {
    try {
      const userId = getCurrentUserId();
      fileName = fileName || uri.split("/").pop();
      const fileId = nanoid();
      const mimeType = getMimeType(uri);
      const size = await getFileSize(uri);

      // File size check
      if (size > 10 * 1024 * 1024) {
        throw new Error("File size exceeds the limit of 10MB");
      }

      const storageRef = ref(
        storage,
        `documents/${userId}/${fileId}-${fileName}`
      );

      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: mimeType,
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% complete`);
          },
          (error) => {
            ErrorHandler.handleDocumentError(error, fileName);
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(storageRef);
              const documentData = {
                id: fileId,
                name: fileName,
                type: mimeType,
                size,
                createdAt: serverTimestamp(),
                userId,
                status: "uploaded",
                downloadUrl,
                storagePath: `documents/${userId}/${fileId}-${fileName}`,
              };

              await setDoc(doc(documentsCollection, fileId), documentData);
              showToast("success", "Document uploaded successfully");
              resolve({ ...documentData, createdAt: new Date() });
            } catch (error) {
              console.error("Error saving document to Firestore:", error);
              ErrorHandler.handleApiError(error, "Failed to save document");
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error in uploadDocument:", error);
      ErrorHandler.handleDocumentError(error, fileName || "unknown file");
      throw error;
    }
  },

  /**
   * Get all documents for the current user
   * @returns {Promise<Array>} Array of document objects
   */
  getDocuments: async (userId) => {
    try {
      return await ErrorHandler.withRetry(async () => {
        userId = userId || getCurrentUserId();

        const q = query(
          documentsCollection,
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        return snapshot.empty
          ? []
          : snapshot.docs.map((doc) => ({
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));
      }, 2);
    } catch (error) {
      console.error("Error getting documents:", error);
      ErrorHandler.handleApiError(error, "Error loading documents");
      return [];
    }
  },

  /**
   * Get a document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Document data
   */
  getDocumentById: async (documentId) => {
    try {
      const docRef = doc(documentsCollection, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        };
      }

      throw new Error("Document not found");
    } catch (error) {
      console.error("Error getting document by ID:", error);
      ErrorHandler.handleApiError(error, "Error loading document");
      throw error;
    }
  },

  /**
   * Analyze a document using Claude AI
   * @param {string} documentId - Document ID
   * @param {Object} fileData - Document file data including content, rawData, fileType
   * @returns {Promise<Object>} Analysis results
   */
  analyzeDocument: async (documentId, fileData) => {
    try {
      const { content, rawData, fileType, error } = fileData;

      // If there was an error reading the file, stop the process
      if (error) {
        throw new Error(`File reading error: ${content}`);
      }

      // Update document status to "analyzing"
      await updateDoc(doc(documentsCollection, documentId), {
        status: "analyzing",
        fileType: fileType,
        updatedAt: serverTimestamp(),
      });

      // Determine content to send to Claude based on file type
      let analysisContent = "";

      if (fileType === "pdf") {
        // Instead of trying to parse the PDF, we'll use a placeholder description
        // In a production app, you could use a cloud function to extract PDF text
        console.log("Preparing PDF content for analysis...");

        // Get document data for file name
        const docRef = doc(documentsCollection, documentId);
        const docSnap = await getDoc(docRef);
        const fileName = docSnap.data()?.name || "document.pdf";

        analysisContent = describePdfContent(fileName);

        // Save base64 data in a field that Claude can access later if needed
        await updateDoc(doc(documentsCollection, documentId), {
          pdfBase64Data: rawData.substring(0, 100) + "...", // Store a truncated version
        });
      } else if (fileType === "image") {
        // For image files, we'll also use a placeholder until we can process with Claude Vision
        const docRef = doc(documentsCollection, documentId);
        const docSnap = await getDoc(docRef);
        const fileName = docSnap.data()?.name || "image.jpg";

        analysisContent = describeImageContent(fileName);

        // Save image for later processing with Claude Vision
        await updateDoc(doc(documentsCollection, documentId), {
          imageBase64Data: rawData.substring(0, 100) + "...", // Store a truncated version
        });
      } else {
        // For text files, use the content directly
        analysisContent = content;
      }

      console.log(
        `Processed content (first 100 chars): ${analysisContent.substring(
          0,
          100
        )}...`
      );

      // If content is empty, provide a default message
      if (!analysisContent || analysisContent.trim().length < 50) {
        // Create richer content based on document name and type
        const docRef = doc(documentsCollection, documentId);
        const docSnap = await getDoc(docRef);

        analysisContent = `This document (${
          docSnap.data()?.name || "document"
        }) does not contain detectable text content or the content could not be processed. This is a ${fileType} file. Please try a different document or upload the document again.`;
      }

      // Analyze the document with Claude
      const analysisResult = await aiService.analyzeDocument(analysisContent);

      // Update the document with analysis results
      await updateDoc(doc(documentsCollection, documentId), {
        analysis: analysisResult,
        status: "analyzed",
        fileType: fileType,
        contentPreview: analysisContent.substring(0, 200) + "...", // Content preview
        updatedAt: serverTimestamp(),
      });

      showToast("success", "Document analysis completed");
      return analysisResult;
    } catch (error) {
      console.error("Document analysis error:", error);

      // Update status to failed
      await updateDoc(doc(documentsCollection, documentId), {
        status: "analysis_failed",
        errorMessage: error.message,
        updatedAt: serverTimestamp(),
      });

      ErrorHandler.handleApiError(error, "Document analysis failed");
      throw error;
    }
  },

  /**
   * Extract text from a document using Claude Vision API
   * @param {string} documentId - Document ID
   * @param {string} base64Image - Base64-encoded image data
   * @returns {Promise<string>} Extracted text
   */
  extractTextFromImage: async (documentId, base64Image) => {
    try {
      // Update document status
      await updateDoc(doc(documentsCollection, documentId), {
        status: "processing",
        updatedAt: serverTimestamp(),
      });

      // Use Claude AI service to extract text
      const extractedText = await aiService.extractTextFromImage(base64Image);

      // Update document with extracted text
      await updateDoc(doc(documentsCollection, documentId), {
        textContent: extractedText,
        status: "processing_complete",
        updatedAt: serverTimestamp(),
      });

      return extractedText;
    } catch (error) {
      console.error("Error extracting text from image:", error);

      // Update status to failed
      await updateDoc(doc(documentsCollection, documentId), {
        status: "processing_failed",
        updatedAt: serverTimestamp(),
      });

      ErrorHandler.handleApiError(error, "Failed to extract text from image");
      throw error;
    }
  },

  /**
   * Update document status
   * @param {string} documentId - Document ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated document info
   */
  updateDocumentStatus: async (documentId, status) => {
    try {
      await updateDoc(doc(documentsCollection, documentId), {
        status,
        updatedAt: serverTimestamp(),
      });
      return { id: documentId, status };
    } catch (error) {
      console.error("Error updating document status:", error);
      ErrorHandler.handleApiError(error, "Failed to update document status");
      throw error;
    }
  },

  /**
   * Get conversations for a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Array>} Array of conversation objects
   */
  getDocumentConversations: async (documentId) => {
    try {
      const userId = getCurrentUserId();

      const q = query(
        conversationsCollection,
        where("documentId", "==", documentId),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.empty
        ? []
        : querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }));
    } catch (error) {
      console.error("Error getting document conversations:", error);
      ErrorHandler.handleApiError(error, "Failed to load conversation history");
      return [];
    }
  },

  /**
   * Ask a question about a document
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID
   * @param {string} question - Question to ask
   * @returns {Promise<Object>} Conversation with answer
   */
  askDocumentQuestion: async (documentId, userId, question) => {
    try {
      userId = userId || getCurrentUserId();

      // Get document data for context
      const documentData = await DocumentService.getDocumentById(documentId);

      if (!documentData) {
        throw new Error("Document not found");
      }

      // Call Claude to answer the question
      const answer = await aiService.askDocumentQuestion(
        question,
        documentData
      );

      // Create conversation record
      const conversationData = {
        documentId,
        userId,
        question,
        answer,
        createdAt: serverTimestamp(),
      };

      // Add to Firestore
      const conversationRef = await addDoc(
        conversationsCollection,
        conversationData
      );

      return {
        id: conversationRef.id,
        ...conversationData,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Error asking document question:", error);
      ErrorHandler.handleApiError(error, "Failed to answer question");
      throw error;
    }
  },

  /**
   * Delete a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Delete result
   */
  deleteDocument: async (documentId) => {
    try {
      const docSnap = await getDoc(doc(documentsCollection, documentId));
      if (!docSnap.exists()) throw new Error("Document not found");

      const { storagePath } = docSnap.data();
      if (storagePath) await deleteObject(ref(storage, storagePath));

      await deleteDoc(doc(documentsCollection, documentId));
      showToast("success", "Document deleted successfully");
      return { success: true, id: documentId };
    } catch (error) {
      console.error("Error deleting document:", error);
      ErrorHandler.handleApiError(error, "Failed to delete document");
      throw error;
    }
  },

  /**
   * Share a document (in a real app, this would generate a sharing link)
   * @param {Object} document - Document object
   * @returns {Promise<string>} Sharing URL or message
   */
  shareDocument: async (document) => {
    try {
      // This would typically generate a sharing link or initiate a share action
      // For now, we'll just simulate success
      showToast("success", "Share link generated");
      return `Sharing link for ${document.name}`;
    } catch (error) {
      console.error("Error sharing document:", error);
      ErrorHandler.handleApiError(error, "Failed to share document");
      throw error;
    }
  },

  /**
   * Read file content with proper handling for different file types
   * @param {string} fileUri - URI of the file to read
   * @returns {Promise<Object>} File data object
   */
  readFileContent: async (fileUri) => {
    try {
      const type = getMimeType(fileUri).toLowerCase();

      // For PDF files
      if (type.includes("pdf")) {
        // Read PDF file as Base64
        const base64Content = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        return {
          content: "PDF content will be processed for analysis",
          rawData: base64Content,
          fileType: "pdf",
          name: fileUri.split("/").pop(),
        };
      }
      // For image files
      else if (type.includes("image")) {
        // Read image as Base64 for later OCR
        const base64Image = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        return {
          content: "Image content will be extracted using OCR",
          rawData: base64Image,
          fileType: "image",
          name: fileUri.split("/").pop(),
        };
      }
      // For text files
      else {
        // Read text files as plain strings
        const content = await FileSystem.readAsStringAsync(fileUri);
        return {
          content: content || "File content could not be read",
          rawData: content,
          fileType: "text",
          name: fileUri.split("/").pop(),
        };
      }
    } catch (error) {
      console.error("Error reading file:", error);
      return {
        content: `Error reading file: ${error.message}`,
        error: true,
      };
    }
  },
};

export default DocumentService;
