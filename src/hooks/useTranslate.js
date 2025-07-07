import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useTranslate = () => {
  const [translationHistory, setTranslationHistory] = useState([]);
  const [currentTranslation, setCurrentTranslation] = useState(null);
  const { loading, error, post, get } = useApi();
  const { token, loading: authLoading } = useAuth();

  // Metin çevir
  const translateText = useCallback(async (text, sourceLang, targetLang) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const translation = await post(API_ENDPOINTS.TRANSLATE, {
        sourceText: text,
        sourceLang,
        targetLang
      }, token);

      setCurrentTranslation(translation);
      
      // Geçmişe ekle
      const historyItem = {
        id: Date.now(),
        sourceText: text,
        translatedText: translation.translatedText,
        sourceLang,
        targetLang,
        timestamp: new Date().toISOString()
      };
      
      setTranslationHistory(prev => [historyItem, ...prev]);
      
      return translation;
    } catch (error) {
      console.error('Çeviri yapılamadı:', error);
      throw error;
    }
  }, [post, token]);

  // Çeviri geçmişini getir
  const fetchTranslationHistory = useCallback(async () => {
    if (!token || authLoading) return;
    try {
      const data = await get(API_ENDPOINTS.GET_TRANSLATION_HISTORY, token);
      setTranslationHistory(data);
    } catch (error) {
      console.error('Çeviri geçmişi getirilemedi:', error);
    }
  }, [get, token, authLoading]);

  // Geçmişten bir çeviriyi tekrar kullan
  const reuseTranslation = useCallback((historyItem) => {
    setCurrentTranslation({
      sourceText: historyItem.sourceText,
      translatedText: historyItem.translatedText,
      sourceLang: historyItem.sourceLang,
      targetLang: historyItem.targetLang
    });
  }, []);

  // Geçmişi temizle
  const clearHistory = useCallback(() => {
    setTranslationHistory([]);
  }, []);

  // Çeviriyi paylaş
  const shareTranslation = useCallback(async (translation) => {
    try {
      const shareData = {
        title: 'Çeviri Sonucu',
        message: `Orijinal: ${translation.sourceText}\n\nÇeviri: ${translation.translatedText}`,
        url: 'https://quantumdoc.app'
      };
      
      return shareData;
    } catch (error) {
      console.error('Çeviri paylaşılamadı:', error);
      throw error;
    }
  }, []);

  // Çeviriyi kaydet
  const saveTranslation = useCallback(async (translation) => {
    try {
      // Notlar modülüne kaydet
      const noteData = {
        title: `Çeviri - ${new Date().toLocaleDateString()}`,
        content: `Orijinal (${translation.sourceLang}): ${translation.sourceText}\n\nÇeviri (${translation.targetLang}): ${translation.translatedText}`,
        category: 'translation'
      };
      
      return noteData;
    } catch (error) {
      console.error('Çeviri kaydedilemedi:', error);
      throw error;
    }
  }, []);

  // Desteklenen diller
  const supportedLanguages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'İngilizce', flag: '🇬🇧' },
    { code: 'es', name: 'İspanyolca', flag: '🇪🇸' },
    { code: 'fr', name: 'Fransızca', flag: '🇫🇷' },
    { code: 'de', name: 'Almanca', flag: '🇩🇪' },
    { code: 'it', name: 'İtalyanca', flag: '🇮🇹' },
    { code: 'ru', name: 'Rusça', flag: '🇷🇺' },
    { code: 'pt', name: 'Portekizce', flag: '🇵🇹' },
    { code: 'zh', name: 'Çince', flag: '🇨🇳' },
    { code: 'ja', name: 'Japonca', flag: '🇯🇵' },
    { code: 'ko', name: 'Korece', flag: '🇰🇷' },
    { code: 'ar', name: 'Arapça', flag: '🇸🇦' },
  ];

  return {
    translationHistory,
    currentTranslation,
    loading,
    error,
    translateText,
    fetchTranslationHistory,
    reuseTranslation,
    clearHistory,
    shareTranslation,
    saveTranslation,
    supportedLanguages,
  };
}; 