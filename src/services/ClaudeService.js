// services/ClaudeService.js
import axios from "axios";
import * as FileSystem from "expo-file-system";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { getAuth } from "firebase/auth";

// Claude API yapılandırması
const CLAUDE_API_BASE = "https://api.anthropic.com/v1";
const CLAUDE_API_KEY =
  "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";

// Claude modelleri
const CLAUDE_MODELS = {
  CLAUDE_3_HAIKU: "claude-3-haiku-20240307", // En hızlı model, maliyet-etkin
  CLAUDE_3_SONNET: "claude-3-sonnet-20240229", // Daha dengeli model
  CLAUDE_3_OPUS: "claude-3-opus-20240229", // En kapsamlı model, en pahalı
  CLAUDE_3_7_SONNET: "claude-3-7-sonnet-20250219", // En yeni model (varsa)
};

// API versiyonu
const CLAUDE_API_VERSION = "2023-06-01";

/**
 * Dosya uzantısına göre MIME türünü belirler
 * @param {string} filename - Dosya adı
 * @returns {string} - MIME türü
 */
function getMimeType(filename) {
  const extension = filename.toLowerCase().split(".").pop();

  const mimeTypes = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    txt: "text/plain",
    csv: "text/csv",
    html: "text/html",
    htm: "text/html",
    json: "application/json",
    xml: "application/xml",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

export const claudeService = {
  /**
   * Dosyayı Claude'un Files API'sine yükler
   * @param {string} fileUri - Expo FileSystem dosya URI'si
   * @param {string} fileName - Dosya adı
   * @param {string} fileType - MIME türü
   * @returns {Promise<string>} - Claude file_id
   */
  uploadFileToClaude: async (fileUri, fileName, fileType) => {
    try {
      console.log(`Dosya Claude'a yükleniyor: ${fileName}`);

      // Dosyanın var olup olmadığını kontrol et
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error(`Dosya bulunamadı: ${fileUri}`);
      }

      // Dosya türünü belirle
      const mimeType = fileType || getMimeType(fileName);
      console.log(`Dosya türü: ${mimeType}`);

      // Dosya boyutunu kontrol et (Claude'un sınırları var)
      if (fileInfo.size > 100 * 1024 * 1024) {
        // 100MB (Claude sınırı 100MB)
        throw new Error("Dosya boyutu çok büyük (100MB üst sınırı)");
      }

      // FormData oluştur (multipart/form-data için)
      const formData = new FormData();

      // Dosya nesnesini oluştur
      const fileBlob = {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      };

      // FormData'ya ekle
      formData.append("file", fileBlob);
      formData.append("purpose", "file-analysis");

      console.log("Claude Files API'ye istek gönderiliyor...");

      // Files API'ye istek
      const response = await axios.post(`${CLAUDE_API_BASE}/files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Api-Key": CLAUDE_API_KEY,
          "anthropic-version": CLAUDE_API_VERSION,
        },
      });

      if (!response.data || !response.data.id) {
        throw new Error("Claude API geçersiz yanıt döndürdü");
      }

      console.log(
        "Dosya başarıyla yüklendi. Claude File ID:",
        response.data.id
      );
      return response.data.id; // Claude file_id
    } catch (error) {
      console.error("Claude dosya yükleme hatası:", error);

      // Detaylı hata bilgisi
      if (error.response) {
        console.error("API Yanıt Detayları:", error.response.data);
      }

      throw new Error(`Dosya Claude'a yüklenemedi: ${error.message}`);
    }
  },

  /**
   * Dokümanı Claude API ile işleme (Files API kullanarak)
   * @param {Object} documentData - Doküman bilgileri
   * @returns {Promise<Object>} - Claude analiz sonucu
   */
  processDocument: async (documentData) => {
    let tempFileUri = null;

    try {
      console.log("Claude API ile doküman işleniyor:", documentData.id);

      // Kullanıcı bilgisini kontrol et
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        throw new Error("Kullanıcı oturum açmamış");
      }

      if (!documentData.fileUrl) {
        throw new Error("Doküman URL'si gerekli");
      }

      // Benzersiz geçici dosya adı oluştur
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExt = documentData.name
        ? `.${documentData.name.split(".").pop()}`
        : "";
      const tempFileName = `claude_temp_${timestamp}_${randomString}${fileExt}`;
      tempFileUri = `${FileSystem.cacheDirectory}${tempFileName}`;

      // Dosyayı geçici olarak indir
      console.log("Dosya indiriliyor:", documentData.fileUrl);
      console.log("Geçici konum:", tempFileUri);

      const downloadResult = await FileSystem.downloadAsync(
        documentData.fileUrl,
        tempFileUri
      );

      if (downloadResult.status !== 200) {
        throw new Error(`Dosya indirme hatası: ${downloadResult.status}`);
      }

      console.log("Dosya başarıyla indirildi:", downloadResult.uri);

      // Dosyayı Claude Files API'ye yükle
      const fileId = await claudeService.uploadFileToClaude(
        tempFileUri,
        documentData.name || "document",
        documentData.type
      );

      // Yapılandırılmış prompt
      const prompt = `
        Bu dokümanı ayrıntılı olarak analiz et ve aşağıdaki başlıklar altında yapılandırılmış bir yanıt ver:

        # Özet
        Dokümanın kısa bir özeti (2-3 paragraf)

        # Ana Noktalar
        Dokümandaki en önemli bilgi, bulgu veya temaları maddeler halinde listele (4-6 madde)

        # Detaylar
        Dokümandan çıkarılan önemli detaylar veya bilgiler. Bu bölümde aşağıdakileri içerebilirsin:
        - Tarihler
        - Sayısal veriler
        - Adlar ve kuruluşlar
        - Önemli alıntılar
        - Temel argümanlar

        # Öneriler
        Doküman içeriğine dayanarak varsa öneriler veya yapılacak işlemleri maddeler halinde belirt.

        Her bölümü birer başlık olarak kullan ve bilgileri düzenli bir biçimde sun. Tüm yanıt bölümleri dokümanın içeriğine dayanmalıdır.
      `;

      // Claude Messages API isteği
      const requestData = {
        model: CLAUDE_MODELS.CLAUDE_3_HAIKU, // Hızlı ve maliyet-etkin model
        max_tokens: 1500,
        temperature: 0.2, // Daha az yaratıcı, daha doğru
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "file",
                file_id: fileId,
              },
            ],
          },
        ],
      };

      // API başlıkları
      const headers = {
        "Content-Type": "application/json",
        "X-Api-Key": CLAUDE_API_KEY,
        "anthropic-version": CLAUDE_API_VERSION,
      };

      // Claude Messages API'ye istek gönder
      console.log("Claude Messages API'ye istek gönderiliyor...");
      const response = await axios.post(
        `${CLAUDE_API_BASE}/messages`,
        requestData,
        { headers, timeout: 60000 } // 60 saniye timeout
      );

      console.log("Claude API'den yanıt alındı");

      // Sonucu hazırla
      const analysisResult = {
        documentId: documentData.id,
        userId: userId,
        content: response.data.content || [],
        model: requestData.model,
        promptUsed: prompt,
        createdAt: new Date().toISOString(),
      };

      // Firestore'a kaydet
      try {
        const docRef = await addDoc(
          collection(FIRESTORE_DB, "analysis_results"),
          {
            ...analysisResult,
            createdAt: serverTimestamp(),
          }
        );
        console.log("Analiz sonucu Firestore'a kaydedildi, ID:", docRef.id);
        analysisResult.id = docRef.id;
      } catch (saveError) {
        console.error(
          "Firestore'a kaydederken hata (devam ediliyor):",
          saveError
        );
      }

      return analysisResult;
    } catch (error) {
      console.error("Claude doküman işleme hatası:", error);

      // API hatası ise detayları logla
      if (error.response) {
        console.error("API Yanıt Detayları:", error.response.data);
      }

      throw new Error(`Doküman analiz edilemedi: ${error.message}`);
    } finally {
      // Geçici dosyayı temizle
      if (tempFileUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
            console.log("Geçici dosya silindi:", tempFileUri);
          }
        } catch (cleanupError) {
          console.warn("Geçici dosya temizlenirken hata:", cleanupError);
        }
      }
    }
  },

  /**
   * Claude API'ye doküman hakkında soru sorma
   * @param {string} documentId - Doküman ID'si
   * @param {string} question - Soru metni
   * @returns {Promise<Object>} - Claude'un yanıtı
   */
  askDocumentQuestion: async (documentId, question) => {
    try {
      console.log(
        `Doküman hakkında soru soruluyor. ID: ${documentId}, Soru: ${question}`
      );

      if (!documentId) {
        throw new Error("Doküman ID'si gerekli");
      }

      if (!question || question.trim().length === 0) {
        throw new Error("Soru metni gerekli");
      }

      // Doküman analizini bul
      const analysisRef = query(
        collection(FIRESTORE_DB, "analysis_results"),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const analysisSnapshot = await getDocs(analysisRef);

      if (analysisSnapshot.empty) {
        throw new Error("Bu doküman için analiz bulunamadı");
      }

      const analysisDoc = analysisSnapshot.docs[0].data();

      // Analiz içeriğini metin olarak birleştir
      let analysisText = "";
      if (analysisDoc.content && Array.isArray(analysisDoc.content)) {
        analysisText = analysisDoc.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("\n\n");
      }

      // Soruyu ve içerik bağlamını içeren bir istek oluştur
      const requestData = {
        model: CLAUDE_MODELS.CLAUDE_3_HAIKU,
        max_tokens: 1000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Bu doküman hakkında bir sorum var. Lütfen sadece doküman içeriğine dayalı olarak yanıt ver.

Önce doküman bilgileri:
${analysisText}

Sorum şu:
${question}

Lütfen sadece doküman içeriğine dayanarak yanıt ver. Eğer doküman içeriğinde bu soruya yanıt verecek bilgi yoksa, bunu açıkça belirt.`,
              },
            ],
          },
        ],
      };

      // API başlıkları
      const headers = {
        "Content-Type": "application/json",
        "X-Api-Key": CLAUDE_API_KEY,
        "anthropic-version": CLAUDE_API_VERSION,
      };

      // Claude API'ye istek gönder
      console.log("Soru için Claude API'ye istek gönderiliyor...");
      const response = await axios.post(
        `${CLAUDE_API_BASE}/messages`,
        requestData,
        { headers, timeout: 30000 }
      );

      console.log("Soru yanıtı alındı");

      // Yanıt metnini çıkar
      let answerText = "";
      if (response.data && response.data.content) {
        answerText = response.data.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("\n\n");
      }

      if (!answerText) {
        answerText = "Üzgünüm, sorunuza yanıt oluşturamadım.";
      }

      // Firestore'a kaydet
      try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;

        const conversationRef = await addDoc(
          collection(FIRESTORE_DB, "document_conversations"),
          {
            documentId,
            userId: userId || "anonymous",
            question,
            answer: answerText,
            createdAt: serverTimestamp(),
          }
        );

        console.log("Konuşma Firestore'a kaydedildi, ID:", conversationRef.id);
      } catch (saveError) {
        console.error("Konuşma kaydedilirken hata:", saveError);
      }

      return {
        documentId,
        question,
        answer: answerText,
      };
    } catch (error) {
      console.error("Soru-cevap hatası:", error);
      throw new Error(`Sorunuz yanıtlanamadı: ${error.message}`);
    }
  },

  /**
   * Doküman sohbet geçmişini getir
   * @param {string} documentId - Doküman ID'si
   * @param {number} limit - Maksimum konuşma sayısı
   * @returns {Promise<Array>} - Konuşmalar dizisi
   */
  getDocumentConversations: async (documentId, maxLimit = 10) => {
    try {
      console.log(`Doküman konuşmaları getiriliyor. ID: ${documentId}`);

      if (!documentId) {
        throw new Error("Doküman ID'si gerekli");
      }

      const conversationsRef = query(
        collection(FIRESTORE_DB, "document_conversations"),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc"),
        limit(maxLimit)
      );

      const conversationsSnapshot = await getDocs(conversationsRef);

      if (conversationsSnapshot.empty) {
        return [];
      }

      // Konuşmaları döndür
      return conversationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
    } catch (error) {
      console.error("Konuşma geçmişi getirme hatası:", error);
      throw new Error(`Konuşma geçmişi alınamadı: ${error.message}`);
    }
  },
};

// Claude modellerini dışa aktar
export { CLAUDE_MODELS };
