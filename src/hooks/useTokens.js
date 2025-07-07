import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useTokens = () => {
  const [tokens, setTokens] = useState(0);
  const [tokenHistory, setTokenHistory] = useState([]);
  const { loading, error, get, post } = useApi();
  const { token, loading: authLoading } = useAuth();

  // Token sayısını getir
  const fetchTokens = useCallback(async () => {
    // Token yoksa veya auth loading ise API çağrısı yapma
    if (!token || authLoading) {
      setTokens(0);
      setTokenHistory([]);
      return;
    }

    try {
      const data = await get(API_ENDPOINTS.GET_TOKENS, token);
      setTokens(data.tokens || 0);
      setTokenHistory(data.history || []);
    } catch (error) {
      // 401 hatası normal, sessizce geç
      if (error.message && error.message.includes('401')) {
        setTokens(0);
        setTokenHistory([]);
        return;
      }
      // Sadece gerçek hata varsa logla
      console.error('Token bilgileri getirilemedi:', error);
      setTokens(0);
      setTokenHistory([]);
    }
  }, [get, token, authLoading]);

  // Token kullan
  const useTokens = useCallback(async (amount) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const response = await post(API_ENDPOINTS.USE_TOKENS, { amount }, token);
      setTokens(response.tokens);
      setTokenHistory(prev => [response.log, ...prev]);
      return response;
    } catch (error) {
      console.error('Token kullanılamadı:', error);
      throw error;
    }
  }, [post, token]);

  // Token ekle (ödül, satın alma vb.)
  const addTokens = useCallback(async (amount, type = 'reward', description = '') => {
    if (!token) throw new Error('Token gerekli');
    try {
      const response = await post(API_ENDPOINTS.ADD_TOKENS, {
        amount,
        type,
        description
      }, token);
      setTokens(response.tokens);
      setTokenHistory(prev => [response.log, ...prev]);
      return response;
    } catch (error) {
      console.error('Token eklenemedi:', error);
      throw error;
    }
  }, [post, token]);

  // Video izleme ödülü
  const watchVideoReward = useCallback(async () => {
    if (!token) throw new Error('Token gerekli');
    try {
      const response = await post(API_ENDPOINTS.WATCH_VIDEO_FOR_TOKENS, {}, token);
      setTokens(response.tokens);
      setTokenHistory(prev => [response.log, ...prev]);
      return response;
    } catch (error) {
      console.error('Video ödülü alınamadı:', error);
      throw error;
    }
  }, [post, token]);

  // Günlük ödül
  const claimDailyReward = useCallback(async () => {
    if (!token) throw new Error('Token gerekli');
    try {
      const response = await post(API_ENDPOINTS.CLAIM_DAILY_REWARD, {}, token);
      setTokens(response.tokens);
      setTokenHistory(prev => [response.log, ...prev]);
      return response;
    } catch (error) {
      console.error('Günlük ödül alınamadı:', error);
      throw error;
    }
  }, [post, token]);

  // Token satın alma
  const purchaseTokens = useCallback(async (packageId, paymentMethod) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const response = await post(API_ENDPOINTS.PURCHASE_TOKENS, {
        packageId,
        paymentMethod
      }, token);
      setTokens(response.tokens);
      setTokenHistory(prev => [response.log, ...prev]);
      return response;
    } catch (error) {
      console.error('Token satın alınamadı:', error);
      throw error;
    }
  }, [post, token]);

  // Token geçmişini getir
  const fetchTokenHistory = useCallback(async () => {
    if (!token) return;
    try {
      const response = await get(API_ENDPOINTS.GET_TOKEN_HISTORY, token);
      setTokenHistory(response);
    } catch (error) {
      console.error('Token geçmişi getirilemedi:', error);
    }
  }, [get, token]);

  // Auth durumu değiştiğinde token bilgilerini güncelle
  useEffect(() => {
    if (token && !authLoading) {
      fetchTokens();
    } else {
      setTokens(0);
      setTokenHistory([]);
    }
  }, [fetchTokens, token, authLoading]);

  // Video izleme kontrolü
  const canWatchVideoForTokens = useCallback(() => {
    // Şimdilik her zaman true döndür, gerçek implementasyonda günlük limit kontrolü yapılabilir
    return true;
  }, []);

  // Video izleme sayısı (şimdilik sabit)
  const watchedVideosToday = 0;

  return {
    tokens,
    tokenHistory,
    loading,
    error,
    watchedVideosToday,
    canWatchVideoForTokens,
    fetchTokens,
    fetchTokenHistory,
    useTokens,
    addTokens,
    watchVideoReward,
    claimDailyReward,
    purchaseTokens,
  };
}; 