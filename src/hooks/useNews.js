import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useNews = () => {
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { get } = useApi();
  const { token, loading: authLoading } = useAuth();

  // Haberleri getir
  const fetchNews = useCallback(async (category = 'all') => {
    if (!token || authLoading) return;
    setLoading(true);
    try {
      const params = category !== 'all' ? `?category=${category}` : '';
      const data = await get(`${API_ENDPOINTS.GET_NEWS}${params}`, token);
      setNews(data);
    } catch (error) {
      console.error('Haberler getirilemedi:', error);
    } finally {
      setLoading(false);
    }
  }, [get, token, authLoading]);

  // Öne çıkan haberleri getir
  const fetchFeaturedNews = useCallback(async () => {
    if (!token || authLoading) return;
    try {
      const data = await get(`${API_ENDPOINTS.GET_NEWS}?featured=true`, token);
      setFeaturedNews(data);
    } catch (error) {
      console.error('Öne çıkan haberler getirilemedi:', error);
    }
  }, [get, token, authLoading]);

  // Haber detayını getir
  const getNewsDetail = useCallback(async (newsId) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const data = await get(API_ENDPOINTS.GET_NEWS_DETAIL.replace(':id', newsId), token);
      return data;
    } catch (error) {
      console.error('Haber detayı getirilemedi:', error);
      throw error;
    }
  }, [get, token]);

  // Haberleri kategorilere göre filtrele
  const filterNewsByCategory = useCallback((category) => {
    if (category === 'all') {
      return news;
    }
    return news.filter(item => item.category === category);
  }, [news]);

  // Haberleri arama
  const searchNews = useCallback((query) => {
    if (!query) {
      return news;
    }
    const searchTerm = query.toLowerCase();
    return news.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm)
    );
  }, [news]);

  // Haber tıklama istatistiği
  const trackNewsClick = useCallback(async (newsId) => {
    try {
      // Backend'e tıklama istatistiği gönder
      await fetch(`${API_ENDPOINTS.GET_NEWS}/${newsId}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Haber tıklama takip edilemedi:', error);
    }
  }, []);

  // Haber paylaş
  const shareNews = useCallback(async (newsItem) => {
    try {
      const shareData = {
        title: newsItem.title,
        message: `${newsItem.title}\n\n${newsItem.description}\n\nDaha fazla bilgi için: ${newsItem.actionUrl || 'https://quantumdoc.app'}`,
        url: newsItem.actionUrl || 'https://quantumdoc.app'
      };
      
      return shareData;
    } catch (error) {
      console.error('Haber paylaşılamadı:', error);
      throw error;
    }
  }, []);

  // Haber kategorileri
  const newsCategories = [
    { id: 'all', name: 'Tümü', icon: '📰' },
    { id: 'general', name: 'Genel', icon: '📋' },
    { id: 'update', name: 'Güncellemeler', icon: '🔄' },
    { id: 'feature', name: 'Özellikler', icon: '⭐' },
    { id: 'campaign', name: 'Kampanyalar', icon: '🎯' },
  ];

  // İlk yükleme - sadece token varsa
  useEffect(() => {
    if (token && !authLoading) {
      fetchNews();
      fetchFeaturedNews();
    }
  }, [fetchNews, fetchFeaturedNews, token, authLoading]);

  return {
    news,
    featuredNews,
    loading,
    fetchNews,
    fetchFeaturedNews,
    getNewsDetail,
    filterNewsByCategory,
    searchNews,
    trackNewsClick,
    shareNews,
    newsCategories,
  };
}; 