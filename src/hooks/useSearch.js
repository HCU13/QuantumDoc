import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { get } = useApi();
  const { token, loading: authLoading } = useAuth();

  const globalSearch = useCallback(async (query, type = null, limit = 20) => {
    if (!token || authLoading || !query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = `${API_ENDPOINTS.GLOBAL_SEARCH}?q=${encodeURIComponent(query.trim())}`;
      if (type) {
        endpoint += `&type=${type}`;
      }
      if (limit) {
        endpoint += `&limit=${limit}`;
      }
      
      const response = await get(endpoint, token);
      setSearchResults(response.results || response);
      return response;
    } catch (err) {
      setError(err.message || 'Arama yapılırken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [get, token, authLoading]);

  const searchNotes = useCallback(async (query) => {
    if (!token || authLoading || !query.trim()) return [];
    
    try {
      const response = await globalSearch(query.trim(), 'notes');
      return response.notes || response || [];
    } catch (err) {
      console.error('Not arama hatası:', err);
      return [];
    }
  }, [globalSearch, token, authLoading]);

  const searchTasks = useCallback(async (query) => {
    if (!token || authLoading || !query.trim()) return [];
    
    try {
      const response = await globalSearch(query.trim(), 'tasks');
      return response.tasks || response || [];
    } catch (err) {
      console.error('Görev arama hatası:', err);
      return [];
    }
  }, [globalSearch, token, authLoading]);

  const searchChats = useCallback(async (query) => {
    if (!token || authLoading || !query.trim()) return [];
    
    try {
      const response = await globalSearch(query.trim(), 'chat');
      return response.chats || response || [];
    } catch (err) {
      console.error('Sohbet arama hatası:', err);
      return [];
    }
  }, [globalSearch, token, authLoading]);

  const searchMath = useCallback(async (query) => {
    if (!token || authLoading || !query.trim()) return [];
    
    try {
      const response = await globalSearch(query.trim(), 'math');
      return response.math || response || [];
    } catch (err) {
      console.error('Matematik arama hatası:', err);
      return [];
    }
  }, [globalSearch, token, authLoading]);

  const searchTranslations = useCallback(async (query) => {
    if (!token || authLoading || !query.trim()) return [];
    
    try {
      const response = await globalSearch(query.trim(), 'translate');
      return response.translations || response || [];
    } catch (err) {
      console.error('Çeviri arama hatası:', err);
      return [];
    }
  }, [globalSearch, token, authLoading]);

  const searchWrites = useCallback(async (query) => {
    if (!token || authLoading || !query.trim()) return [];
    
    try {
      const response = await globalSearch(query.trim(), 'write');
      return response.writes || response || [];
    } catch (err) {
      console.error('Yazı arama hatası:', err);
      return [];
    }
  }, [globalSearch, token, authLoading]);

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    loading,
    error,
    globalSearch,
    searchNotes,
    searchTasks,
    searchChats,
    searchMath,
    searchTranslations,
    searchWrites,
    clearSearchResults
  };
}; 