// services/FirebaseStorage.js
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { FIREBASE_APP } from "../FirebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import * as FileSystem from "expo-file-system";

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
  uploadDocument: async (
    uri,
    fileName,
    userId,
    mimeType,
    onProgress = () => {}
  ) => {
    try {
      // Read the file as base64
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("File not found");
      }

      // Create a blob from the file
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create storage reference
      const storageRef = ref(storage, `documents/${userId}/${fileName}`);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Return a promise that resolves when the upload is complete
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          async () => {
            // Upload completed successfully, get the download URL
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadUrl,
              storageRef: `documents/${userId}/${fileName}`,
            });
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
      const docRef = await addDoc(collection(FIRESTORE_DB, "documents"), {
        ...documentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

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
      const docRef = doc(FIRESTORE_DB, "documents", docId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
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
