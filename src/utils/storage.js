// src/utils/storage.js
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { FIREBASE_STORAGE } from "../../firebase/FirebaseConfig";

// Belge yükleme fonksiyonu
export const uploadDocument = async (file, userId, onProgress = () => {}) => {
  try {
    // Dosya adını oluştur
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const fileName = `document_${timestamp}.${fileExtension}`;
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
          reject(error);
        },
        async () => {
          // Başarılı durum
          try {
            // İndirme URL'sini al
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              downloadUrl,
              storagePath,
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
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
    throw error;
  }
};
