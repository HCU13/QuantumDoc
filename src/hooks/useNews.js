import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useNews = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Statik news verisi - i18n'den al (dil değişikliğini algılamak için i18n.language'ı da ekledik)
  const allNews = useMemo(() => {
    const news = t('home.newsList', { returnObjects: true });
    return Array.isArray(news) ? news : [];
  }, [t, i18n.language]);

  // Featured news'leri filtrele
  const featuredNews = useMemo(() => {
    return allNews.filter(item => item.featured);
  }, [allNews]);

  const news = allNews;

  // Basit fetch fonksiyonları (artık kullanılmıyor ama uyumluluk için)
  const fetchNews = useCallback(async (category = 'all') => {
    // Statik veri kullanıldığı için hiçbir şey yapma
    return news;
  }, [news]);

  const fetchFeaturedNews = useCallback(async () => {
    // Statik veri kullanıldığı için hiçbir şey yapma
    return featuredNews;
  }, [featuredNews]);

  const fetchNewsDetail = useCallback(async (newsId) => {
    const newsItem = allNews.find(item => item.id === newsId);
    if (!newsItem) {
      throw new Error(t('common.notFound', 'Haber bulunamadı'));
    }
    return newsItem;
  }, [allNews, t]);

  const trackNewsClick = useCallback(async (newsId) => {
    // Analytics tracking yapılabilir
    if (__DEV__) console.log('News clicked:', newsId);
  }, []);

  const searchNews = useCallback(async (query) => {
    const lowercaseQuery = query.toLowerCase();
    return allNews.filter(item => 
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery)
    );
  }, [allNews]);

  return {
    news,
    featuredNews,
    loading,
    error,
    fetchNews,
    fetchFeaturedNews,
    fetchNewsDetail,
    trackNewsClick,
    searchNews,
  };
};