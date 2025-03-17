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
      console.log("Başlangıç: uploadDocument", {
        fileName: file.name,
        fileSize: file.size,
      });

      // Token kullanımıyla ilgili bir işlem varsa buraya eklenebilir

      // Önce Storage'a yükle
      console.log("Storage'a yükleme başlıyor...");
      const storageResult = await uploadToStorage(file, userId, onProgress);
      console.log("Storage'a yükleme tamamlandı:", storageResult);

      // Sonra Firestore'a meta verileri kaydet
      const docData = {
        name: file.name,
        type: file.type || file.mimeType,
        size: file.size,
        storagePath: storageResult.storagePath,
        downloadUrl: storageResult.downloadUrl,
        userId,
        status: "uploaded",
        createdAt: serverTimestamp(),
      };

      console.log("Firestore'a kaydediliyor:", docData);
      const docRef = await addDoc(
        collection(FIRESTORE_DB, "documents"),
        docData
      );
      console.log("Firestore'a kaydedildi, document ID:", docRef.id);

      // Başarılı sonuç döndür
      return {
        id: docRef.id,
        ...docData,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error("Error uploading document:", error);
      // Hata türüne göre daha spesifik mesajlar eklenebilir
      if (error.code === "storage/unauthorized") {
        throw new Error("Dosya yükleme yetkiniz yok. Lütfen giriş yapın.");
      } else if (error.code === "storage/canceled") {
        throw new Error("Dosya yükleme iptal edildi.");
      } else if (error.code === "storage/quota-exceeded") {
        throw new Error("Depolama kotanız aşıldı.");
      }
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
