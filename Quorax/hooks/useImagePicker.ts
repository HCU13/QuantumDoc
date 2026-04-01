import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { showWarning, showError } from '@/utils/toast';

/**
 * ImagePicker için profesyonel hook
 * Galeri ve kamera erişimi için izin yönetimi ve görsel seçimi
 * 
 * @returns {Object} pickFromGallery, takePhoto, loading
 */
export const useImagePicker = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  /**
   * Galeri izinlerini kontrol et ve iste
   */
  const requestGalleryPermissions = async (): Promise<boolean> => {
    // Önce mevcut izni kontrol et
    const { status: currentStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    if (currentStatus === 'granted') {
      return true;
    }
    
    // İzin yoksa iste
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showWarning(
        t('common.warning') || 'Uyarı',
        t('math.permissions.galleryDeniedMessage') || 'Galeri erişimi için izin vermeniz gerekiyor.'
      );
      return false;
    }
    return true;
  };

  /**
   * Kamera izinlerini kontrol et ve iste
   */
  const requestCameraPermissions = async (): Promise<boolean> => {
    // Önce mevcut izni kontrol et
    const { status: currentStatus } = await ImagePicker.getCameraPermissionsAsync();
    
    if (currentStatus === 'granted') {
      return true;
    }
    
    // İzin yoksa iste
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showWarning(
        t('common.warning') || 'Uyarı',
        t('math.permissions.cameraDeniedMessage') || 'Kamera erişimi için izin vermeniz gerekiyor. Emülatörde kamera kullanılamaz, lütfen galeriden fotoğraf seçin.'
      );
      return false;
    }
    return true;
  };

  /**
   * Galeriden görsel seç
   * @returns {Promise<string|null>} Seçilen görsel URI'si veya null
   */
  const pickFromGallery = async (): Promise<string | null> => {
    try {
      setLoading(true);
      
      const hasPermission = await requestGalleryPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      showError(
        t('common.error') || 'Hata',
        t('math.errors.noImageMessage') || 'Görsel seçilemedi'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Kameradan fotoğraf çek
   * @returns {Promise<string|null>} Çekilen fotoğraf URI'si veya null
   */
  const takePhoto = async (): Promise<string | null> => {
    try {
      setLoading(true);

      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error: any) {
      // Emülatör kontrolü
      if (
        error.message?.includes('camera') ||
        error.message?.includes('Camera')
      ) {
        showError(
          t('common.error') || 'Hata',
          'Emülatörde kamera kullanılamaz. Lütfen "Galeriden Seç" seçeneğini kullanın.'
        );
      } else {
        showError(
          t('common.error') || 'Hata',
          'Kamera hatası'
        );
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    pickFromGallery,
    takePhoto,
    loading,
  };
};

