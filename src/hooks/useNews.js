import { useState, useCallback, useEffect } from 'react';

export const useNews = () => {
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // useAuth importu kaldırıldı

  // Mock news data
  const mockNews = [
    {
      id: 1,
      title: "Yeni AI Modeli",
      description: "Daha hızlı ve akıllı yanıtlar için güncellenmiş AI modeli kullanıma sunuldu",
      content: "QuantumDoc'un yeni AI modeli ile artık daha hızlı ve doğru yanıtlar alabilirsiniz. Bu güncelleme ile birlikte çeviri kalitesi %40 artırıldı ve matematik çözümleri %60 daha hızlı hale geldi.",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
      icon: "sparkles",
      category: "update",
      featured: true,
      isActive: true,
      priority: 1,
      actionUrl: null,
      actionText: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Premium Kampanya",
      description: "Sınırlı süre için %50 indirim! Premium özellikleri keşfedin",
      content: "Premium üyeliğe geçerek sınırsız token kullanımı, öncelikli destek ve özel özelliklere erişim sağlayın. Bu kampanya sadece bu hafta geçerli!",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop",
      icon: "star",
      category: "campaign",
      featured: true,
      isActive: true,
      priority: 2,
      actionUrl: "/subscription",
      actionText: "Premium'a Geç",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      title: "Çoklu Dil Desteği",
      description: "Artık 10 farklı dilde çeviri yapabilirsiniz",
      content: "Yeni eklenen dil desteği ile artık 10 farklı dilde çeviri yapabilirsiniz. Desteklenen diller: Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca, Portekizce, Rusça, Japonca ve Korece.",
      imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=200&fit=crop",
      icon: "language",
      category: "feature",
      featured: false,
      isActive: true,
      priority: 3,
      actionUrl: null,
      actionText: null,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 4,
      title: "Matematik Çözücü",
      description: "Karmaşık matematik problemlerini fotoğrafla çözün",
      content: "Yeni matematik çözücü özelliği ile karmaşık matematik problemlerini fotoğraf çekerek çözebilirsiniz. Bu özellik ile cebir, geometri ve calculus problemlerini kolayca çözebilirsiniz.",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
      icon: "calculator",
      category: "feature",
      featured: false,
      isActive: true,
      priority: 4,
      actionUrl: "/math",
      actionText: "Dene",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString()
    }
  ];

  const fetchNews = useCallback(async (category = 'all') => {
    // useAuth importu kaldırıldı
    // if (!token || authLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock news fetch
      let filteredNews = mockNews;
      
      if (category !== 'all') {
        filteredNews = mockNews.filter(item => item.category === category);
      }
      
      setNews(filteredNews);
    } catch (err) {
      setError('Haberler yüklenemedi');
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedNews = useCallback(async () => {
    // useAuth importu kaldırıldı
    // if (!token || authLoading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock featured news fetch
      const featured = mockNews.filter(item => item.featured);
      setFeaturedNews(featured);
    } catch (err) {
      setError('Öne çıkan haberler yüklenemedi');
      console.error('Featured news fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNewsDetail = useCallback(async (newsId) => {
    // useAuth importu kaldırıldı
    // if (!token || authLoading) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock news detail fetch
      const newsItem = mockNews.find(item => item.id === parseInt(newsId));
      
      if (!newsItem) {
        throw new Error('Haber bulunamadı');
      }
      
      return newsItem;
    } catch (err) {
      setError('Haber detayı yüklenemedi');
      console.error('News detail fetch error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackNewsClick = useCallback(async (newsId) => {
    // useAuth importu kaldırıldı
    // if (!token) return;
    
    try {
      // Mock news click tracking
      console.log(`News click tracked: ${newsId}`);
    } catch (err) {
      console.error('News click tracking error:', err);
    }
  }, []);

  const searchNews = useCallback(async (query) => {
    // useAuth importu kaldırıldı
    // if (!token || authLoading) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock news search
      const searchResults = mockNews.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
      
      return searchResults;
    } catch (err) {
      setError('Haber arama başarısız');
      console.error('News search error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // useAuth importu kaldırıldı
    // if (token && !authLoading) {
    fetchNews();
    fetchFeaturedNews();
    // }
  }, [fetchNews, fetchFeaturedNews]);

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