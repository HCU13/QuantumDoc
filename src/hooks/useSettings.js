import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { get, put, post } = useApi();
  const { token, loading: authLoading } = useAuth();

  const fetchSettings = useCallback(async () => {
    if (!token || authLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await get(API_ENDPOINTS.GET_SETTINGS, token);
      setSettings(response);
    } catch (err) {
      setError(err.message || 'Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [get, token, authLoading]);

  const updateSettings = useCallback(async (newSettings) => {
    if (!token) throw new Error('Token gerekli');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await put(API_ENDPOINTS.UPDATE_SETTINGS, newSettings, token);
      setSettings(response);
      return response;
    } catch (err) {
      setError(err.message || 'Ayarlar güncellenirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [put, token]);

  const updateLanguage = useCallback(async (language) => {
    if (!token) throw new Error('Token gerekli');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await post(API_ENDPOINTS.UPDATE_LANGUAGE, { language }, token);
      setSettings(prev => ({ ...prev, language }));
      return response;
    } catch (err) {
      setError(err.message || 'Dil ayarı güncellenirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post, token]);

  const updateTheme = useCallback(async (theme) => {
    if (!token) throw new Error('Token gerekli');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await post(API_ENDPOINTS.UPDATE_THEME, { theme }, token);
      setSettings(prev => ({ ...prev, theme }));
      return response;
    } catch (err) {
      setError(err.message || 'Tema ayarı güncellenirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [post, token]);

  const updateNotificationSettings = useCallback(async (notifications) => {
    if (!token) throw new Error('Token gerekli');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await updateSettings({ notifications });
      return response;
    } catch (err) {
      setError(err.message || 'Bildirim ayarları güncellenirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateSettings, token]);

  const updateAutoSaveSettings = useCallback(async (autoSave) => {
    if (!token) throw new Error('Token gerekli');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await updateSettings({ autoSave });
      return response;
    } catch (err) {
      setError(err.message || 'Otomatik kaydetme ayarları güncellenirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateSettings, token]);

  useEffect(() => {
    if (token && !authLoading) {
      fetchSettings();
    }
  }, [fetchSettings, token, authLoading]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateLanguage,
    updateTheme,
    updateNotificationSettings,
    updateAutoSaveSettings,
  };
}; 