import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useWrite = () => {
  const [writeHistory, setWriteHistory] = useState([]);
  const [currentGeneration, setCurrentGeneration] = useState(null);
  const { loading, error, post, get } = useApi();
  const { token, loading: authLoading } = useAuth();

  // Metin üret
  const generateText = useCallback(async (prompt, type = 'general') => {
    if (!token) throw new Error('Token gerekli');
    try {
      const generation = await post(API_ENDPOINTS.GENERATE_TEXT, {
        prompt,
        type
      }, token);

      setCurrentGeneration(generation);
      
      // Geçmişe ekle
      const historyItem = {
        id: Date.now(),
        prompt,
        result: generation.result,
        type,
        timestamp: new Date().toISOString()
      };
      
      setWriteHistory(prev => [historyItem, ...prev]);
      
      return generation;
    } catch (error) {
      console.error('Metin üretilemedi:', error);
      throw error;
    }
  }, [post, token]);

  // Yazma geçmişini getir
  const fetchWriteHistory = useCallback(async () => {
    if (!token || authLoading) return;
    try {
      const data = await get(API_ENDPOINTS.GET_WRITE_HISTORY, token);
      setWriteHistory(data);
    } catch (error) {
      console.error('Yazma geçmişi getirilemedi:', error);
    }
  }, [get, token, authLoading]);

  // Geçmişten bir üretimi tekrar kullan
  const reuseGeneration = useCallback((historyItem) => {
    setCurrentGeneration({
      prompt: historyItem.prompt,
      result: historyItem.result,
      type: historyItem.type
    });
  }, []);

  // Geçmişi temizle
  const clearHistory = useCallback(() => {
    setWriteHistory([]);
  }, []);

  // Üretimi paylaş
  const shareGeneration = useCallback(async (generation) => {
    try {
      const shareData = {
        title: 'AI Metin Üretimi',
        message: `İstek: ${generation.prompt}\n\nSonuç: ${generation.result}`,
        url: 'https://quantumdoc.app'
      };
      
      return shareData;
    } catch (error) {
      console.error('Üretim paylaşılamadı:', error);
      throw error;
    }
  }, []);

  // Üretimi kaydet
  const saveGeneration = useCallback(async (generation) => {
    try {
      // Notlar modülüne kaydet
      const noteData = {
        title: `AI Metin - ${new Date().toLocaleDateString()}`,
        content: `İstek: ${generation.prompt}\n\nSonuç: ${generation.result}`,
        category: 'ai-generated'
      };
      
      return noteData;
    } catch (error) {
      console.error('Üretim kaydedilemedi:', error);
      throw error;
    }
  }, []);

  // Metin türleri
  const textTypes = [
    { id: 'general', name: 'Genel', icon: '📝' },
    { id: 'creative', name: 'Yaratıcı', icon: '🎨' },
    { id: 'professional', name: 'Profesyonel', icon: '💼' },
    { id: 'academic', name: 'Akademik', icon: '📚' },
    { id: 'story', name: 'Hikaye', icon: '📖' },
    { id: 'poem', name: 'Şiir', icon: '✍️' },
    { id: 'email', name: 'E-posta', icon: '📧' },
    { id: 'social', name: 'Sosyal Medya', icon: '📱' },
  ];

  // Hızlı şablonlar
  const quickTemplates = [
    {
      id: 'email',
      title: 'E-posta Yaz',
      prompt: 'Profesyonel bir e-posta yaz:',
      type: 'email'
    },
    {
      id: 'story',
      title: 'Hikaye Yaz',
      prompt: 'Yaratıcı bir hikaye yaz:',
      type: 'story'
    },
    {
      id: 'poem',
      title: 'Şiir Yaz',
      prompt: 'Duygusal bir şiir yaz:',
      type: 'poem'
    },
    {
      id: 'social',
      title: 'Sosyal Medya',
      prompt: 'Etkileyici bir sosyal medya paylaşımı yaz:',
      type: 'social'
    },
  ];

  return {
    writeHistory,
    currentGeneration,
    loading,
    error,
    generateText,
    fetchWriteHistory,
    reuseGeneration,
    clearHistory,
    shareGeneration,
    saveGeneration,
    textTypes,
    quickTemplates,
  };
}; 