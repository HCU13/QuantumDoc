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
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import * as FileSystem from "expo-file-system";
import { FIRESTORE_DB, FIREBASE_STORAGE } from "../../firebase/FirebaseConfig";
import { claudeApi } from "./claudeApi";
import { ocrApi } from "./ocrApi";
import { getAuth } from "firebase/auth";

/**
 * Belge işlemleri için API
 * Belgeler için CRUD işlemleri ve AI analizleri
 */
export const documentApi = {
  /**
   * Kullanıcının belgelerini getirir
   * @param {number} limitCount - Getirilecek maksimum belge sayısı
   * @returns {Promise<Array>} - Belge listesi
   */
  getUserDocuments: async (limitCount = 20) => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      const userId = auth.currentUser.uid;

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

  /**
   * Belge detaylarını getirir
   * @param {string} documentId - Belge ID'si
   * @returns {Promise<Object>} - Belge detayları
   */
  getDocumentById: async (documentId) => {
    try {
      // Belge referansını al
      const docRef = doc(FIRESTORE_DB, "documents", documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Document not found");
      }

      // Belge verilerini dönüştür
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

  /**
   * Belge yükler
   * @param {Object} file - Dosya nesnesi (uri, name, type)
   * @param {function} onProgress - İlerleme için geri çağırma
   * @returns {Promise<Object>} - Yüklenen belge bilgileri
   */
  uploadDocument: async (file, onProgress = () => {}) => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      const userId = auth.currentUser.uid;

      // Dosya adını oluştur
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileName = `doc_${timestamp}.${fileExtension}`;
      const storagePath = `documents/${userId}/${fileName}`;

      // Dosyayı blob'a dönüştür
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Storage referansı oluştur
      const storageRef = ref(FIREBASE_STORAGE, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Upload işlemini bekle
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // İlerleme güncelleme
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            // Hata durumu
            console.error("Upload error:", error);
            reject(error);
          },
          async () => {
            // Başarılı durum
            try {
              // İndirme URL'sini al
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

              // Belge meta verisini Firestore'a kaydet
              const docRef = await addDoc(
                collection(FIRESTORE_DB, "documents"),
                {
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  storagePath,
                  downloadUrl,
                  userId,
                  status: "uploaded",
                  createdAt: serverTimestamp(),
                }
              );

              // Başarılı sonuç döndür
              resolve({
                id: docRef.id,
                name: file.name,
                type: file.type,
                size: file.size,
                downloadUrl,
                storagePath,
                status: "uploaded",
              });
            } catch (error) {
              reject(error);
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
   * Taranmış belgeyi yükler ve işler
   * @param {string} imageUri - Taranan görüntünün URI'si
   * @param {Object} documentData - Belge meta verileri
   * @returns {Promise<Object>} - İşlenen belge bilgileri
   */
  uploadScannedDocument: async (imageUri, documentData) => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      const userId = auth.currentUser.uid;

      // Dosya adını oluştur
      const timestamp = new Date().getTime();
      const fileName = `scan_${timestamp}.jpg`;
      const storagePath = `documents/${userId}/${fileName}`;

      // Görüntüyü blob'a dönüştür
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Storage referansı oluştur
      const storageRef = ref(FIREBASE_STORAGE, storagePath);
      await uploadBytesResumable(storageRef, blob);

      // İndirme URL'sini al
      const downloadUrl = await getDownloadURL(storageRef);

      // Belge meta verisini Firestore'a kaydet
      const docRef = await addDoc(collection(FIRESTORE_DB, "documents"), {
        name: documentData.name,
        type: "image/jpeg",
        content: documentData.content,
        storagePath,
        downloadUrl,
        userId,
        status: "uploaded",
        source: "scan",
        createdAt: serverTimestamp(),
      });

      // Başarılı sonuç döndür
      return {
        id: docRef.id,
        ...documentData,
        downloadUrl,
        storagePath,
        status: "uploaded",
      };
    } catch (error) {
      console.error("Error uploading scanned document:", error);
      throw error;
    }
  },

  /**
   * Belgeyi analiz eder
   * @param {string} documentId - Belge ID'si
   * @returns {Promise<Object>} - Analiz sonuçları ile güncellenmiş belge
   */
  analyzeDocument: async (documentId) => {
    try {
      // Belgeyi al
      const document = await documentApi.getDocumentById(documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Belgenin durumunu güncelle
      await updateDoc(doc(FIRESTORE_DB, "documents", documentId), {
        status: "analyzing",
      });

      let analysisText = "";

      // Belge türüne göre analiz et
      if (document.content) {
        // Metin içeriği zaten varsa, doğrudan Claude'a gönder
        analysisText = await claudeApi.analyzeText(document.content);
      } else if (document.downloadUrl) {
        if (document.type?.includes("image")) {
          // Görüntü belgesi, önce OCR yap
          const extractedText = await ocrApi.recognizeText(
            document.downloadUrl
          );
          analysisText = await claudeApi.analyzeText(extractedText);
        } else {
          // PDF veya diğer belgeler, doğrudan URL ile Claude'a gönder
          analysisText = await claudeApi.analyzeDocument(
            document.downloadUrl,
            document.type
          );
        }
      } else {
        throw new Error("No content or URL available for analysis");
      }

      // Analiz sonuçlarını yapılandır
      const analysis = parseAnalysisContent(analysisText);

      // Belgeyi güncelle
      await updateDoc(doc(FIRESTORE_DB, "documents", documentId), {
        status: "analyzed",
        analysis: {
          fullText: analysisText,
          ...analysis,
          analyzedAt: serverTimestamp(),
        },
      });

      // Güncellenmiş belgeyi döndür
      return {
        ...document,
        status: "analyzed",
        analysis: {
          fullText: analysisText,
          ...analysis,
        },
      };
    } catch (error) {
      console.error("Error analyzing document:", error);

      // Hata durumunda belgeyi güncelle
      try {
        await updateDoc(doc(FIRESTORE_DB, "documents", documentId), {
          status: "analysis_failed",
        });
      } catch (updateError) {
        console.error("Error updating document status:", updateError);
      }

      throw error;
    }
  },

  /**
   * Belge hakkında bir soru sorar
   * @param {string} documentId - Belge ID'si
   * @param {string} question - Soru metni
   * @returns {Promise<Object>} - Soru ve yanıt
   */
  askDocumentQuestion: async (documentId, question) => {
    try {
      // Belgeyi al
      const document = await documentApi.getDocumentById(documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Belge içeriğini al
      let context = "";

      if (document.analysis?.fullText) {
        context = document.analysis.fullText;
      } else if (document.content) {
        context = document.content;
      } else {
        throw new Error("No content available to answer questions");
      }

      // Claude API'ye soruyu gönder
      const answer = await claudeApi.askQuestion(question, context);

      // Konuşma geçmişini kaydet
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      await addDoc(collection(FIRESTORE_DB, "document_conversations"), {
        documentId,
        userId,
        question,
        answer,
        createdAt: serverTimestamp(),
      });

      return { question, answer };
    } catch (error) {
      console.error("Error asking question:", error);
      throw error;
    }
  },

  /**
   * Belge sohbet geçmişini getirir
   * @param {string} documentId - Belge ID'si
   * @returns {Promise<Array>} - Sohbet geçmişi
   */
  getDocumentConversations: async (documentId) => {
    try {
      // Sohbetleri sorgula (en yeni önce)
      const q = query(
        collection(FIRESTORE_DB, "document_conversations"),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      // Sohbetleri dönüştür
      const conversations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      return conversations;
    } catch (error) {
      console.error("Error getting conversations:", error);
      return [];
    }
  },

  /**
   * Belgeyi siler
   * @param {string} documentId - Belge ID'si
   * @returns {Promise<void>}
   */
  deleteDocument: async (documentId) => {
    try {
      // Belgeyi al
      const document = await documentApi.getDocumentById(documentId);

      if (!document) {
        throw new Error("Document not found");
      }

      // Önce Storage'dan dosyayı sil
      if (document.storagePath) {
        const storageRef = ref(FIREBASE_STORAGE, document.storagePath);
        await deleteObject(storageRef);
      }

      // Firestore'dan belgeyi sil
      await deleteDoc(doc(FIRESTORE_DB, "documents", documentId));

      // İlgili konuşmaları da sil
      const conversationsQuery = query(
        collection(FIRESTORE_DB, "document_conversations"),
        where("documentId", "==", documentId)
      );

      const conversationsSnapshot = await getDocs(conversationsQuery);

      const deletePromises = conversationsSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },
};

/**
 * Claude AI'ın döndürdüğü analiz metnini yapılandırılmış formata dönüştürür
 * @param {string} text - Analiz metni
 * @returns {Object} - Yapılandırılmış analiz
 */
function parseAnalysisContent(text) {
  const result = {
    summary: "",
    keyPoints: [],
    details: "",
    recommendations: [],
  };

  // Özet bölümünü çıkar
  const summaryMatch = text.match(
    /(?:Summary|SUMMARY|Özet|ÖZET):(.*?)(?:\n\n|\n#|\n(?:Key Points|KEY POINTS|Main Points|MAIN POINTS|Ana Noktalar|ANA NOKTALAR))/s
  );

  if (summaryMatch && summaryMatch[1]) {
    result.summary = summaryMatch[1].trim();
  } else {
    // Yedek: ilk paragrafı al
    const firstPara = text.split(/\n\n/)[0];
    result.summary = firstPara.trim();
  }

  // Ana noktaları çıkar
  const keyPointsMatch = text.match(
    /(?:Key Points|KEY POINTS|Main Points|MAIN POINTS|Ana Noktalar|ANA NOKTALAR):(.*?)(?:\n\n|\n#|\n(?:Details|DETAILS|Detaylar|DETAYLAR|Recommendations|RECOMMENDATIONS|Öneriler|ÖNERİLER))/s
  );

  if (keyPointsMatch && keyPointsMatch[1]) {
    const keyPointsText = keyPointsMatch[1].trim();
    result.keyPoints = keyPointsText
      .split(/\n(?:[-•*]|\d+\.)\s*/)
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());
  }

  // Detayları çıkar
  const detailsMatch = text.match(
    /(?:Details|DETAILS|Detaylar|DETAYLAR):(.*?)(?:\n\n|\n#|\n(?:Recommendations|RECOMMENDATIONS|Öneriler|ÖNERİLER))/s
  );

  if (detailsMatch && detailsMatch[1]) {
    result.details = detailsMatch[1].trim();
  }

  // Önerileri çıkar
  const recommendationsMatch = text.match(
    /(?:Recommendations|RECOMMENDATIONS|Öneriler|ÖNERİLER):(.*?)(?:\n\n|\n#|\n(?:Conclusion|CONCLUSION|Sonuç|SONUÇ|$))/s
  );

  if (recommendationsMatch && recommendationsMatch[1]) {
    const recommendationsText = recommendationsMatch[1].trim();
    result.recommendations = recommendationsText
      .split(/\n(?:[-•*]|\d+\.)\s*/)
      .filter((line) => line.trim().length > 0)
      .map((line) => line.trim());
  }

  return result;
}
