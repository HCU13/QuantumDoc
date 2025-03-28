// src/utils/errorHandler.js
import { showToast } from "./toast";

export const ErrorHandler = {
  // API ve ağ hatalarını işle
  handleApiError: (error, customMessage = null) => {
    console.error("API Error:", error);

    // Network hatası kontrolü
    if (!navigator.onLine || error.message === "Network Error") {
      showToast("error", "İnternet bağlantınızı kontrol edin");
      return;
    }

    // Firebase/Firestore özel hataları
    if (error.code) {
      switch (error.code) {
        case "permission-denied":
          showToast("error", "Bu işlem için yetkiniz bulunmuyor");
          break;
        case "unavailable":
          showToast("error", "Servis şu anda kullanılamıyor");
          break;
        case "resource-exhausted":
          showToast("error", "Servis kotanız doldu");
          break;
        default:
          showToast("error", customMessage || "Bir hata oluştu");
      }
      return;
    }

    // HTTP durum kodlarını kontrol et
    if (error.response) {
      switch (error.response.status) {
        case 401:
          showToast("error", "Oturum süresi dolmuş olabilir");
          // Kullanıcıyı yeniden giriş sayfasına yönlendir
          break;
        case 403:
          showToast("error", "Bu işlem için yetkiniz bulunmuyor");
          break;
        case 404:
          showToast("error", "İstenen kaynak bulunamadı");
          break;
        case 429:
          showToast("error", "Çok fazla istek gönderildi, lütfen bekleyin");
          break;
        case 500:
        case 502:
        case 503:
          showToast("error", "Sunucuda bir hata oluştu");
          break;
        default:
          showToast("error", customMessage || "Beklenmeyen bir hata oluştu");
      }
      return;
    }

    // Genel hata mesajı
    showToast(
      "error",
      customMessage || "Bir hata oluştu, lütfen tekrar deneyin"
    );
  },

  // Belge işleme hatalarını yönet
  handleDocumentError: (error, fileName) => {
    console.error(`Document Error (${fileName}):`, error);

    if (error.message.includes("size")) {
      showToast("error", "Dosya boyutu çok büyük (max: 10MB)");
    } else if (
      error.message.includes("format") ||
      error.message.includes("type")
    ) {
      showToast("error", "Desteklenmeyen dosya formatı");
    } else {
      showToast("error", `Dosya işlenirken hata: ${fileName}`);
    }
  },

  // Yeniden deneme mantığı
  withRetry: async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        lastError = error;

        // Sunucu hatalarını yeniden dene, ama istemci hatalarını deneme
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          break;
        }

        // Son deneme değilse bekle
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          // Üstel geri çekilme - her denemede gecikmeyi artır
          delay *= 1.5;
        }
      }
    }

    throw lastError;
  },
};
