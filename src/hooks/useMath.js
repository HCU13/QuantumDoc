import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useMath = () => {
  const [mathHistory, setMathHistory] = useState([]);
  const [currentSolution, setCurrentSolution] = useState(null);
  const { loading, error, post, get } = useApi();
  const { token, loading: authLoading } = useAuth();

  // Matematik problemi çöz
  const solveMath = useCallback(async (question, imageUri = null) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const formData = new FormData();
      formData.append('question', question);
      
      if (imageUri) {
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'math_problem.jpg'
        });
      }

      const solution = await post(API_ENDPOINTS.SOLVE_MATH, formData, token, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setCurrentSolution(solution);
      
      // Geçmişe ekle
      const historyItem = {
        id: Date.now(),
        question,
        solution,
        imageUri,
        timestamp: new Date().toISOString()
      };
      
      setMathHistory(prev => [historyItem, ...prev]);
      
      return solution;
    } catch (error) {
      console.error('Matematik problemi çözülemedi:', error);
      throw error;
    }
  }, [post, token]);

  // Matematik geçmişini getir
  const fetchMathHistory = useCallback(async () => {
    if (!token || authLoading) return;
    try {
      const data = await get(API_ENDPOINTS.GET_MATH_HISTORY, token);
      setMathHistory(data);
    } catch (error) {
      console.error('Matematik geçmişi getirilemedi:', error);
    }
  }, [get, token, authLoading]);

  // Geçmişten bir çözümü tekrar kullan
  const reuseSolution = useCallback((historyItem) => {
    setCurrentSolution(historyItem.solution);
  }, []);

  // Geçmişi temizle
  const clearHistory = useCallback(() => {
    setMathHistory([]);
  }, []);

  // Çözümü paylaş
  const shareSolution = useCallback(async (solution) => {
    try {
      const shareData = {
        title: 'Matematik Çözümü',
        message: `Soru: ${solution.question}\n\nÇözüm: ${solution.result}\n\nAdımlar:\n${solution.steps.map(step => `${step.step}. ${step.description}`).join('\n')}`,
        url: 'https://quantumdoc.app'
      };
      
      // React Native Share API kullanılabilir
      return shareData;
    } catch (error) {
      console.error('Çözüm paylaşılamadı:', error);
      throw error;
    }
  }, []);

  // Çözümü kaydet
  const saveSolution = useCallback(async (solution) => {
    try {
      // Notlar modülüne kaydet
      const noteData = {
        title: `Matematik Çözümü - ${new Date().toLocaleDateString()}`,
        content: `Soru: ${solution.question}\n\nÇözüm: ${solution.result}\n\nAdımlar:\n${solution.steps.map(step => `${step.step}. ${step.description}`).join('\n')}`,
        category: 'math'
      };
      
      return noteData;
    } catch (error) {
      console.error('Çözüm kaydedilemedi:', error);
      throw error;
    }
  }, []);

  // Matematik resmi yükle
  const uploadMathImage = useCallback(async (imageUri) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'math_problem.jpg'
      });

      const response = await post(API_ENDPOINTS.UPLOAD_MATH_IMAGE, formData, token, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return response;
    } catch (error) {
      console.error('Matematik resmi yüklenemedi:', error);
      throw error;
    }
  }, [post, token]);

  return {
    mathHistory,
    currentSolution,
    loading,
    error,
    solveMath,
    fetchMathHistory,
    reuseSolution,
    clearHistory,
    shareSolution,
    saveSolution,
    uploadMathImage,
  };
}; 