// src/services/documentService.js
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../firebase/FirebaseConfig";
import {
  uploadDocument as uploadToStorage,
  deleteDocument as deleteFromStorage,
} from "../utils/storage";

export const documentService = {
  // Kullanıcının belgelerini getir
  getUserDocuments: async (userId, limitCount = 20) => {
    try {
      // Belgeleri sorgula (en yeni önce)
      const q = query(
        collection(FIRESTORE_DB, "documents"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);

      // Belgeleri dönüştür
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      return documents;
    } catch (error) {
      console.error("Error getting user documents:", error);
      throw error;
    }
  },

  // Belge detayını getir
  getDocumentById: async (documentId) => {
    try {
      const docRef = doc(FIRESTORE_DB, "documents", documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Document not found");
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
      };
    } catch (error) {
      console.error("Error getting document by id:", error);
      throw error;
    }
  },

  // Belge yükle
  uploadDocument: async (file, userId, onProgress = () => {}) => {
    try {
      // Önce Storage'a yükle
      const storageResult = await uploadToStorage(file, userId, onProgress);

      // Sonra Firestore'a meta verileri kaydet
      const docRef = await addDoc(collection(FIRESTORE_DB, "documents"), {
        name: file.name,
        type: file.type || file.mimeType,
        size: file.size,
        storagePath: storageResult.storagePath,
        downloadUrl: storageResult.downloadUrl,
        userId,
        status: "uploaded",
        createdAt: serverTimestamp(),
      });

      // Başarılı sonuç döndür
      return {
        id: docRef.id,
        name: file.name,
        type: file.type || file.mimeType,
        size: file.size,
        downloadUrl: storageResult.downloadUrl,
        storagePath: storageResult.storagePath,
        status: "uploaded",
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  // Belge analizini güncelle
  updateDocumentAnalysis: async (documentId, analysis) => {
    try {
      await updateDoc(doc(FIRESTORE_DB, "documents", documentId), {
        status: "analyzed",
        analysis: {
          ...analysis,
          analyzedAt: serverTimestamp(),
        },
      });

      return true;
    } catch (error) {
      console.error("Error updating document analysis:", error);
      throw error;
    }
  },

  // Belge sil
  deleteDocument: async (documentId) => {
    try {
      // Önce belgeyi getir
      const document = await documentService.getDocumentById(documentId);

      // Storage'dan dosyayı sil
      if (document.storagePath) {
        await deleteFromStorage(document.storagePath);
      }

      // Firestore'dan belgeyi sil
      await deleteDoc(doc(FIRESTORE_DB, "documents", documentId));

      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  // Belge hakkındaki sohbetleri kaydet
  saveDocumentConversation: async (documentId, userId, question, answer) => {
    try {
      const docRef = await addDoc(
        collection(FIRESTORE_DB, "document_conversations"),
        {
          documentId,
          userId,
          question,
          answer,
          createdAt: serverTimestamp(),
        }
      );

      return {
        id: docRef.id,
        documentId,
        question,
        answer,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Error saving document conversation:", error);
      throw error;
    }
  },

  // Belge sohbetlerini getir
  getDocumentConversations: async (documentId) => {
    try {
      const q = query(
        collection(FIRESTORE_DB, "document_conversations"),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const conversations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      return conversations;
    } catch (error) {
      console.error("Error getting document conversations:", error);
      return [];
    }
  },
};
