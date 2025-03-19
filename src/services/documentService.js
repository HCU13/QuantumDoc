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
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const storage = FIREBASE_STORAGE;
const firestore = FIRESTORE_DB;
const documentsCollection = collection(firestore, "documents");

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

const DocumentService = {
  uploadDocument: async (uri, fileName) => {
    try {
      const userId = getCurrentUserId(); // Get user ID from Firebase Auth
      fileName = fileName || uri.split("/").pop();
      const fileId = nanoid();
      const mimeType = getMimeType(uri);
      const size = await getFileSize(uri);
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
          reject,
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
              resolve({ ...documentData, createdAt: new Date() });
            } catch (error) {
              console.error("Error saving document to Firestore:", error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error in uploadDocument:", error);
      throw error;
    }
  },

  getDocuments: async () => {
    try {
      const userId = getCurrentUserId(); // Get user ID from Firebase Auth

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
    } catch (error) {
      console.error("Error getting documents:", error);
      throw new Error(error.message);
    }
  },

  getDocumentById: async (documentId) => {
    try {
      const docSnap = await getDoc(doc(documentsCollection, documentId));
      if (!docSnap.exists()) throw new Error("Document not found");
      return {
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting document by ID:", error);
      throw new Error(error.message);
    }
  },

  updateDocumentStatus: async (documentId, status) => {
    try {
      await updateDoc(doc(documentsCollection, documentId), {
        status,
        updatedAt: serverTimestamp(),
      });
      return { id: documentId, status };
    } catch (error) {
      console.error("Error updating document status:", error);
      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const docSnap = await getDoc(doc(documentsCollection, documentId));
      if (!docSnap.exists()) throw new Error("Document not found");

      const { storagePath } = docSnap.data();
      if (storagePath) await deleteObject(ref(storage, storagePath));

      await deleteDoc(doc(documentsCollection, documentId));
      return { success: true, id: documentId };
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },
};

export default DocumentService;
