// src/utils/storage.js
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { FIREBASE_STORAGE } from "../../firebase/FirebaseConfig";
import * as FileSystem from "expo-file-system";

// Belge yükleme fonksiyonu
export const uploadDocument = async (file, userId, onProgress = () => {}) => {
  try {
    // Dosya adını oluştur
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const fileName = `document_${timestamp}.${fileExtension}`;
    const storagePath = `documents/${userId}/${fileName}`;

    // Expo'nun file sistemini kullanarak dosya verisini oku
    const fileData = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Base64 verisini blob'a dönüştür
    const blob = await fetch(`data:${file.mimeType};base64,${fileData}`).then(
      (r) => r.blob()
    );

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

            // Başarılı sonucu döndür
            resolve({
              name: file.name,
              type: file.type || file.mimeType,
              size: file.size,
              downloadUrl,
              storagePath,
            });
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error in uploadDocument:", error);
    throw error;
  }
};

// Belge silme fonksiyonu
export const deleteDocument = async (storagePath) => {
  try {
    const storageRef = ref(FIREBASE_STORAGE, storagePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error("Error deleting document from storage:", error);
    throw error;
  }
};
