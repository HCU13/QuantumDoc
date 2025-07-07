import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { get, post } = useApi();
  const { token, loading: authLoading } = useAuth();

  const fetchSubscription = useCallback(async () => {
    if (!token || authLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await get(API_ENDPOINTS.GET_SUBSCRIPTION, token);
      setSubscription(response);
    } catch (err) {
      setError(err.message || 'Abonelik bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [get, token, authLoading]);

  const upgradeSubscription = useCallback(async (plan) => {
    if (!token) throw new Error('Token gerekli');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await post(API_ENDPOINTS.UPGRADE_SUBSCRIPTION, { plan }, token);
      setSubscription(response);
      return response;
    } catch (err) {
      setError(err.message || 'Abonelik yükseltilirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post, token]);

  const cancelSubscription = useCallback(async () => {
    if (!token) throw new Error('Token gerekli');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await post(API_ENDPOINTS.CANCEL_SUBSCRIPTION, {}, token);
      setSubscription(response);
      return response;
    } catch (err) {
      setError(err.message || 'Abonelik iptal edilirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post, token]);

  const fetchSubscriptionHistory = useCallback(async () => {
    if (!token || authLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await get(API_ENDPOINTS.GET_SUBSCRIPTION_HISTORY, token);
      setHistory(response);
    } catch (err) {
      setError(err.message || 'Abonelik geçmişi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [get, token, authLoading]);

  useEffect(() => {
    if (token && !authLoading) {
      fetchSubscription();
      fetchSubscriptionHistory();
    }
  }, [fetchSubscription, fetchSubscriptionHistory, token, authLoading]);

  return {
    subscription,
    history,
    loading,
    error,
    fetchSubscription,
    upgradeSubscription,
    cancelSubscription,
    fetchSubscriptionHistory,
  };
}; 