import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useActivity = () => {
  const [activities, setActivities] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activityStats, setActivityStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { get, post, delete: del } = useApi();
  const { token, loading: authLoading } = useAuth();

  const fetchActivities = useCallback(async (type = null, limit = 20) => {
    if (!token || authLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = API_ENDPOINTS.GET_ACTIVITY;
      if (type) {
        endpoint += `?type=${type}`;
      }
      if (limit) {
        endpoint += `${type ? '&' : '?'}limit=${limit}`;
      }
      
      const response = await get(endpoint, token);
      setActivities(response);
    } catch (err) {
      setError(err.message || 'Aktivite geçmişi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [get, token, authLoading]);

  const fetchRecentActivities = useCallback(async () => {
    if (!token || authLoading) return;
    
    try {
      const response = await get(API_ENDPOINTS.GET_RECENT_ACTIVITIES, token);
      setRecentActivities(response);
    } catch (err) {
      console.error('Son aktiviteler yüklenirken hata:', err);
    }
  }, [get, token, authLoading]);

  const fetchActivityStats = useCallback(async () => {
    if (!token || authLoading) return;
    
    try {
      const response = await get(API_ENDPOINTS.GET_ACTIVITY_STATS, token);
      setActivityStats(response);
    } catch (err) {
      console.error('Aktivite istatistikleri yüklenirken hata:', err);
    }
  }, [get, token, authLoading]);

  const logActivity = useCallback(async (activityData) => {
    if (!token) throw new Error('Token gerekli');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await post(API_ENDPOINTS.LOG_ACTIVITY, activityData, token);
      setActivities(prev => [response, ...prev]);
      setRecentActivities(prev => [response, ...prev.slice(0, 3)]);
      return response;
    } catch (err) {
      setError(err.message || 'Aktivite kaydedilirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post, token]);

  const clearActivities = useCallback(async () => {
    if (!token) throw new Error('Token gerekli');
    
    setLoading(true);
    setError(null);
    
    try {
      await del(API_ENDPOINTS.CLEAR_ACTIVITY, null, token);
      setActivities([]);
      setRecentActivities([]);
    } catch (err) {
      setError(err.message || 'Aktivite geçmişi temizlenirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [del, token]);

  useEffect(() => {
    if (token && !authLoading) {
      fetchActivities();
      fetchRecentActivities();
      fetchActivityStats();
    }
  }, [fetchActivities, fetchRecentActivities, fetchActivityStats, token, authLoading]);

  return {
    activities,
    recentActivities,
    activityStats,
    loading,
    error,
    fetchActivities,
    fetchRecentActivities,
    fetchActivityStats,
    logActivity,
    clearActivities
  };
}; 