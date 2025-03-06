// services/FirebaseStorage.js
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { FIREBASE_APP, FIRESTORE_DB } from "../../FirebaseConfig";
import * as FileSystem from "expo-file-system";
import { getAuth } from "firebase/auth";
// Initialize Firebase Storage
const storage = getStorage(FIREBASE_APP);

export const firebaseStorage = {
  /**
   * Upload a document file to Firebase Storage
   * @param {string} uri - Local file URI
   * @param {string} fileName - Name of the file
   * @param {string} userId - User ID for organization in storage
   * @param {string} mimeType - MIME type of the file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<{downloadUrl: string, storageRef: string}>}
   */
  uploadDocument: async (uri, fileName, mimeType, onProgress = () => {}) => {
    try {
      // Firebase Authentication'dan kullanıcı ID'sini al
      const auth = getAuth();
      const userId = auth.currentUser ? auth.currentUser.uid : null;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Read the file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("File not found");
      }

      console.log(`Uploading file: ${fileName}, size: ${fileInfo.size} bytes`);

      // Create a blob from the file
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create storage reference with user folder
      const storagePath = `documents/${userId}/${fileName}`;
      const storageRef = ref(storage, storagePath);
      console.log(`Storage reference created: ${storagePath}`);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress.toFixed(1)}%`);
            onProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          async () => {
            // Upload completed successfully, get the download URL
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              console.log(`Upload successful. Download URL: ${downloadUrl}`);
              resolve({
                downloadUrl,
                storageRef: storagePath,
                size: fileInfo.size,
              });
            } catch (urlError) {
              console.error("Error getting download URL:", urlError);
              reject(urlError);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  /**
   * Save document metadata to Firestore
   * @param {Object} documentData - Document metadata
   * @returns {Promise<string>} - Document ID
   */
  saveDocumentMetadata: async (documentData) => {
    try {
      console.log("Saving document metadata to Firestore:", documentData);

      // Firestore'a kaydetmeden önce undefined değerleri temizleyelim
      const sanitizedData = {};
      Object.keys(documentData).forEach((key) => {
        // undefined değerleri null olarak değiştir
        sanitizedData[key] =
          documentData[key] === undefined ? null : documentData[key];
      });

      const docRef = await addDoc(collection(FIRESTORE_DB, "documents"), {
        ...sanitizedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("Document metadata saved with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving document metadata:", error);
      throw error;
    }
  },

  /**
   * Update document metadata
   * @param {string} docId - Document ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  updateDocumentMetadata: async (docId, updateData) => {
    try {
      console.log("Updating document metadata:", { docId, updateData });
      const docRef = doc(FIRESTORE_DB, "documents", docId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      console.log("Document metadata updated successfully");
    } catch (error) {
      console.error("Error updating document metadata:", error);
      throw error;
    }
  },

  /**
   * Delete a document and its metadata
   * @param {string} docId - Document ID
   * @param {string} storagePath - Storage path to the file
   * @returns {Promise<void>}
   */
  deleteDocument: async (docId, storagePath) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(FIRESTORE_DB, "documents", docId));

      // Delete from Storage
      if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  /**
   * Get document download URL
   * @param {string} storagePath - Storage path to the file
   * @returns {Promise<string>} - Download URL
   */
  getDocumentUrl: async (storagePath) => {
    try {
      const storageRef = ref(storage, storagePath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error getting document URL:", error);
      throw error;
    }
  },
};
