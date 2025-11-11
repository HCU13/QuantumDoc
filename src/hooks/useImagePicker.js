import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { showError } from '../utils/toast';
import { Alert } from 'react-native';

/**
 * ImagePicker için ortak hook
 * Hem Math hem Image Analyzer modüllerinde kullanılır
 * 
 * @returns {Object} pickFromGallery, takePhoto, loading
 */
export const useImagePicker = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  /**
   * Galeri izinlerini kontrol et ve iste
   */
  const requestGalleryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError(
        t('common.warning'),
        t('imageAnalyzer.permissions.required') || 'Galeri izni gerekli'
      );
      return false;
    }
    return true;
  };

  /**
   * Kamera izinlerini kontrol et ve iste
   */
  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('common.error'),
        t('imageAnalyzer.permissions.cameraRequired') || 
        'Kamera izni gerekli. Emülatörde kamera kullanılamaz, lütfen galeriden fotoğraf seçin.'
      );
      return false;
    }
    return true;
  };

  /**
   * Galeriden görsel seç
   * @returns {Promise<string|null>} Seçilen görsel URI'si veya null
   */
  const pickFromGallery = async () => {
    try {
      setLoading(true);
      
      const hasPermission = await requestGalleryPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7, // Kaliteyi koruyarak token tüketimini azalt (Math ve Image Analyzer ile aynı)
        // Max boyut: ImagePicker otomatik optimize eder, sonra expo-image-manipulator ile 384px'e resize edilir
        // Not: Metin okunabilirliği için kalite korunur - 384px + 0.7 compress optimal
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      if (__DEV__) console.error('ImagePicker gallery error:', error);
      showError(
        t('common.error'),
        t('math.errors.imagePickError') || 'Görsel seçilemedi'
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
  const takePhoto = async () => {
    try {
      setLoading(true);

      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7, // Kaliteyi koruyarak token tüketimini azalt (Math ve Image Analyzer ile aynı)
        // Max boyut: ImagePicker otomatik optimize eder, sonra expo-image-manipulator ile 384px'e resize edilir
        // Not: Metin okunabilirliği için kalite korunur - 384px + 0.7 compress optimal
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      if (__DEV__) console.error('ImagePicker camera error:', error);
      
      // Emülatör kontrolü
      if (
        error.message?.includes('camera') ||
        error.message?.includes('Camera')
      ) {
        Alert.alert(
          t('common.error'),
          'Emülatörde kamera kullanılamaz. Lütfen "Galeriden Seç" seçeneğini kullanın.'
        );
      } else {
        Alert.alert(
          t('common.error'),
          t('math.errors.cameraError') || 'Kamera hatası'
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

