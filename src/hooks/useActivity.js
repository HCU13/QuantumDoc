import { useState, useEffect, useCallback } from 'react';
import { supabase, createRealtimeSubscription } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { realtimeManager } from '../services/realtime';
import { useTranslation } from 'react-i18next';
import { useActivityRefresh } from '../contexts/ActivityRefreshContext';

export const useActivity = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { refreshKey } = useActivityRefresh(); // Refresh trigger'ı dinle
  const [activities, setActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]); // Tüm aktiviteler (cache)
  const [filteredActivities, setFilteredActivities] = useState([]); // Filtrelenmiş aktiviteler
  const [currentFilter, setCurrentFilter] = useState('all'); // Aktif filtre
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // Aktivite başlığından prefix'leri temizle
  const cleanActivityTitle = useCallback((title) => {
    if (!title) return title;
    // "quick - ", "fix - ", "grammarCheck - " gibi prefix'leri kaldır
    return title.replace(/^(quick|fix|grammarCheck|summarize|emailWriting|toneAdjustment|lengthOptimization)\s*-\s*/i, '').trim();
  }, []);

  // Zaman formatla helper function
  const formatTime = useCallback((dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Geçersiz tarih kontrolü
      if (isNaN(date.getTime())) {
        return '';
      }
      
      // Negatif fark kontrolü (yarın gibi görünen tarihleri düzelt)
      const diff = Math.floor((now - date) / 1000); // saniye cinsinden fark
      
      // Eğer tarih gelecekteyse (negatif diff), geçersiz kabul et
      if (diff < 0) {
        // Gelecekteki tarihler için basit bir format göster
        const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
        return date.toLocaleDateString(locale, {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      
      const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

      if (diff < 60) return t('common.timeAgo.seconds', { count: diff });
      if (diff < 3600) return t('common.timeAgo.minutes', { count: Math.floor(diff / 60) });
      if (diff < 86400) return t('common.timeAgo.hours', { count: Math.floor(diff / 3600) });
      if (diff < 604800) return t('common.timeAgo.days', { count: Math.floor(diff / 86400) });

      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (e) {
      if (__DEV__) console.warn('Date formatting error:', e);
      return '';
    }
  }, [t, i18n.language]);

  // Tüm geçmişi çek (chat + math + user_activities)
  const fetchActivities = useCallback(async (pageNumber = 0, refresh = false) => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // 1. Chat aktiviteleri (user_activities tablosundan - sadece chat odası oluşturulduğunda kaydedilenler)
      // NOT: Her mesaj değil, sadece chat odası oluşturulduğunda kaydedilen aktiviteler gösteriliyor
      const { data: chatActivities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', 'chat')
        .order('created_at', { ascending: false })
        .limit(100);

      // 2. Matematik geçmişi
      const { data: mathData } = await supabase
        .from('math_solutions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100); // Son 100 matematik çözümü

      // 3. Diğer aktiviteler (chat ve math dışındaki aktiviteler)
      // NOT: math aktiviteleri zaten math_solutions tablosundan çekildiği için user_activities'den çekmiyoruz
      const { data: otherActivities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .neq('activity_type', 'chat') // Chat aktiviteleri zaten yukarıda çekildi
        .neq('activity_type', 'math') // Math aktiviteleri math_solutions tablosundan çekildi
        .order('created_at', { ascending: false })
        .limit(100);

      // 4. Aktif chat'lerin listesini al (silinen chat'leri kontrol etmek için)
      const { data: activeChats } = await supabase
        .from('chats')
        .select('id')
        .eq('user_id', user.id);

      const activeChatIds = new Set((activeChats || []).map(chat => chat.id));

      // Math solution ID'lerini bir Set'e koy (duplicate kontrolü için)
      const mathSolutionIds = new Set((mathData || []).map(math => math.id));

      // Hepsini birleştir ve formatlı
      const allActivities = [
        // Chat aktiviteleri (sadece aktif chat'lerden - silinen chat'lerin aktivitelerini filtrele)
        ...(chatActivities || [])
          .filter(activity => {
            // metadata içindeki chatId'yi kontrol et
            const chatId = activity.metadata?.chatId || activity.metadata?.['chat_id'];
            return chatId && activeChatIds.has(chatId);
          })
          .map(activity => ({
            ...activity,
            type: 'chat', // ActivityItem için gerekli
            time: formatTime(activity.created_at), // time field eklendi
          })),
        // Math aktiviteleri
        ...(mathData || []).map(math => ({
          id: `math-${math.id}`,
          activity_type: 'math',
          type: 'math', // ActivityItem için gerekli
          title: cleanActivityTitle(math.problem_text?.slice(0, 50) || t('activity.details.mathProblem')),
          description: math.solution_text || '', // TAM ÇÖZÜM
          time: formatTime(math.created_at), // time field eklendi
          created_at: math.created_at,
          metadata: {
            solutionId: math.id,
            hasImage: !!math.problem_image_url,
            tokensUsed: math.tokens_used
          }
        })),
        // Diğer aktiviteler (duplicate kontrolü: metadata içinde solutionId varsa ve math_solutions'ta yoksa filtreleme)
        ...(otherActivities || [])
          .filter(activity => {
            // Eğer metadata içinde solutionId varsa ve bu ID math_solutions'ta yoksa, duplicate olabilir, filtrele
            if (activity.metadata?.solutionId) {
              return !mathSolutionIds.has(activity.metadata.solutionId);
            }
            return true;
          })
          .map(activity => ({
            ...activity,
            type: activity.activity_type || activity.type, // ActivityItem için gerekli
            title: cleanActivityTitle(activity.title || ''),
            time: formatTime(activity.created_at), // time field eklendi
          }))
      ];

      // Duplicate kayıtları temizle (aynı created_at ve activity_type'a sahip olanlar)
      const seen = new Map();
      const uniqueActivities = allActivities.filter(activity => {
        const key = `${activity.activity_type || activity.type}-${activity.created_at}`;
        if (seen.has(key)) {
          return false; // Duplicate, atla
        }
        seen.set(key, true);
        return true;
      });

      // Tarihe göre sırala
      uniqueActivities.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        // Geçersiz tarihleri en sona al
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB - dateA;
      });

      // Cache'e kaydet (filtreler için)
      setAllActivities(uniqueActivities);
      setFilteredActivities(uniqueActivities); // İlk başta hepsi gösteriliyor

      // Pagination uygula
      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      const paginatedData = uniqueActivities.slice(from, to);

      if (refresh || pageNumber === 0) {
        setActivities(paginatedData);
        setCurrentFilter('all'); // İlk yüklemede 'all' filtresi
      } else {
        setActivities(prev => [...prev, ...paginatedData]);
      }

      setHasMore(allActivities.length > to);
      setPage(pageNumber);
    } catch (error) {
      if (__DEV__) console.error('Aktivite yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [user, formatTime]);

  // Sadece son 3 aktiviteyi çek (Ana sayfa için)
  const fetchRecentActivities = useCallback(async () => {
    if (!user?.id) return [];

    try {
      // 1. Chat aktiviteleri (user_activities tablosundan - sadece chat odası oluşturulduğunda kaydedilenler)
      const { data: chatActivities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', 'chat')
        .order('created_at', { ascending: false })
        .limit(10);

      // 2. Matematik geçmişi (son 10)
      const { data: mathData } = await supabase
        .from('math_solutions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // 3. Diğer aktiviteler (son 10)
      const { data: otherActivities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .neq('activity_type', 'chat') // Chat aktiviteleri zaten yukarıda çekildi
        .order('created_at', { ascending: false })
        .limit(10);

      // 4. Aktif chat'lerin listesini al (silinen chat'leri kontrol etmek için)
      const { data: activeChats } = await supabase
        .from('chats')
        .select('id')
        .eq('user_id', user.id);

      const activeChatIds = new Set((activeChats || []).map(chat => chat.id));

      // Hepsini birleştir ve formatlı
      const allActivities = [
        // Chat aktiviteleri (sadece aktif chat'lerden - silinen chat'lerin aktivitelerini filtrele)
        ...(chatActivities || [])
          .filter(activity => {
            // metadata içindeki chatId'yi kontrol et
            const chatId = activity.metadata?.chatId || activity.metadata?.['chat_id'];
            return chatId && activeChatIds.has(chatId);
          })
          .map(activity => ({
            ...activity,
            type: 'chat', // ActivityItem için gerekli
            time: formatTime(activity.created_at),
          })),
        // Math aktiviteleri
        ...(mathData || []).map(math => ({
          id: `math-${math.id}`,
          type: 'math', // activity_type yerine type
          activity_type: 'math',
          title: math.problem_text?.slice(0, 50) || t('activity.details.mathProblem'),
          description: math.solution_text || '', // TAM ÇÖZÜM
          time: formatTime(math.created_at), // time field eklendi
          created_at: math.created_at,
          metadata: {
            solutionId: math.id,
            hasImage: !!math.problem_image_url,
            tokensUsed: math.tokens_used
          }
        })),
        // Diğer aktiviteler
        ...(otherActivities || []).map(activity => ({
          ...activity,
          type: activity.activity_type,
          time: formatTime(activity.created_at)
        }))
      ];

      // Tarihe göre sırala ve ilk 3'ünü al
      allActivities.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );

      return allActivities.slice(0, 3); // Son 3 aktivite
    } catch (error) {
      if (__DEV__) console.error('Son aktiviteler yükleme hatası:', error);
      return [];
    }
  }, [user, formatTime]);

  // Yeni aktivite kaydet
  const logActivity = useCallback(async (activityType, title, description = '', metadata = {}) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          title,
          description,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Yeni aktiviteyi listenin başına ekle
      setActivities(prev => [data, ...prev]);

      return data;
    } catch (error) {
      if (__DEV__) console.error('Aktivite kaydetme hatası:', error);
      return null;
    }
  }, [user]);

  // Aktivite tipine göre filtrele (FRONTEND - API'ye istek YOK!)
  const filterByCategory = useCallback((activityType) => {
    setCurrentFilter(activityType);
    
    if (activityType === 'all') {
      // Tümü göster
      setFilteredActivities(allActivities);
      setActivities(allActivities.slice(0, PAGE_SIZE));
      setPage(0);
      setHasMore(allActivities.length > PAGE_SIZE);
    } else {
      // Belirli tipe göre filtrele
      const filtered = allActivities.filter(
        activity => activity.activity_type === activityType
      );
      setFilteredActivities(filtered);
      setActivities(filtered.slice(0, PAGE_SIZE));
      setPage(0);
      setHasMore(filtered.length > PAGE_SIZE);
    }
  }, [allActivities]);

  // Sayfa yüklendiğinde aktiviteleri getir
  useEffect(() => {
    if (user?.id) {
      fetchActivities(0, true);
    }
  }, [user?.id]);

  // RefreshKey değiştiğinde (AI işlemi tamamlandığında) aktiviteleri yenile
  useEffect(() => {
    if (user?.id && refreshKey > 0) {
      fetchActivities(0, true);
    }
  }, [refreshKey, user?.id, fetchActivities]);

  // Sonraki sayfayı yükle (filtrelenmiş sonuçlardan)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      const dataSource = currentFilter === 'all' ? allActivities : filteredActivities;
      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      const nextPageData = dataSource.slice(from, to);
      
      setActivities(prev => [...prev, ...nextPageData]);
      setPage(nextPage);
      setHasMore(dataSource.length > to);
    }
  }, [loading, hasMore, page, currentFilter, allActivities, filteredActivities]);

  // Yenile (aktif filtreyi koru)
  const refresh = useCallback(async () => {
    await fetchActivities(0, true);
    // Filtreyi yeniden uygula
    if (currentFilter !== 'all') {
      filterByCategory(currentFilter);
    }
  }, [fetchActivities, currentFilter, filterByCategory]);

  // 🔄 REAL-TIME SUBSCRIPTIONS
  // refresh'i dependency'den çıkar - sadece user.id değiştiğinde yeniden oluştur
  // refresh fonksiyonu her render'da değişebilir, bu subscription'ları sürekli yeniden oluşturur
  useEffect(() => {
    if (!user?.id) return;

    // Subscription referanslarını sakla (closure için let kullan)
    const subscriptions = {
      chat: null,
      math: null,
      activity: null,
    };
    let subscriptionTimeout = null;

    // App tamamen yüklendikten sonra subscription'ları başlat (gecikme ile)
    subscriptionTimeout = setTimeout(() => {
      try {
        // Chat mesajları dinle (yeni mesaj geldiğinde aktivite listesini güncelle)
        subscriptions.chat = createRealtimeSubscription(
          'messages',
          'INSERT',
          (payload) => {
            if (payload.new?.user_id === user.id) {
              // Yeni mesaj geldiğinde aktiviteleri yenile - async olarak
              setTimeout(() => {
                try {
                  fetchActivities(0, true);
                } catch (e) {
                  if (__DEV__) console.warn('Activity refresh error:', e);
                }
              }, 0);
            }
          },
          { filter: `user_id=eq.${user.id}` }
        );

        // Matematik çözümleri dinle
        subscriptions.math = createRealtimeSubscription(
          'math_solutions',
          'INSERT',
          (payload) => {
            if (payload.new?.user_id === user.id) {
              // Yeni matematik çözümü geldiğinde aktiviteleri yenile - async olarak
              setTimeout(() => {
                try {
                  fetchActivities(0, true);
                } catch (e) {
                  if (__DEV__) console.warn('Activity refresh error:', e);
                }
              }, 0);
            }
          },
          { filter: `user_id=eq.${user.id}` }
        );

        // User activities dinle
        subscriptions.activity = realtimeManager.subscribeToUserActivities(user.id, (activity) => {
          // Yeni aktivite geldiğinde listeyi güncelle - async olarak
          setTimeout(() => {
            try {
              fetchActivities(0, true);
            } catch (e) {
              if (__DEV__) console.warn('Activity refresh error:', e);
            }
          }, 0);
        });
      } catch (e) {
        if (__DEV__) console.error('Real-time subscription setup error:', e);
      }
    }, 500); // 500ms gecikme - app tamamen yüklendikten sonra

    // Cleanup function
    return () => {
      // Timeout'u iptal et
      if (subscriptionTimeout) {
        clearTimeout(subscriptionTimeout);
      }
      
      // Subscription'ları temizle
      try {
        if (subscriptions.chat) {
          subscriptions.chat.unsubscribe();
        }
        if (subscriptions.math) {
          subscriptions.math.unsubscribe();
        }
        if (subscriptions.activity) {
          subscriptions.activity.unsubscribe();
        }
        // realtimeManager'dan da temizle
        realtimeManager.unsubscribe(`user_activities_${user.id}`);
      } catch (e) {
        if (__DEV__) console.warn('Subscription cleanup error:', e);
      }
    };
  }, [user?.id, fetchActivities]); // fetchActivities useCallback ile sarılmış, daha stabil

  // Aktivite geçmişini temizle
  const clearAllActivities = useCallback(async () => {
    if (!user?.id) return false;

    try {
      setLoading(true);

      // 1. Kullanıcının tüm mesajlarını sil
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('user_id', user.id);

      if (messagesError) {
        if (__DEV__) console.error('❌ Clear messages error:', messagesError);
        throw messagesError;
      }

      // 2. Kullanıcının tüm matematik çözümlerini sil
      const { error: mathError } = await supabase
        .from('math_solutions')
        .delete()
        .eq('user_id', user.id);

      if (mathError) {
        if (__DEV__) console.error('❌ Clear math solutions error:', mathError);
        throw mathError;
      }

      // 3. Kullanıcının tüm aktivitelerini sil
      const { error: activitiesError } = await supabase
        .from('user_activities')
        .delete()
        .eq('user_id', user.id);

      if (activitiesError) {
        if (__DEV__) console.error('❌ Clear user activities error:', activitiesError);
        throw activitiesError;
      }

      // 4. Local state'i temizle
      setActivities([]);
      setAllActivities([]);
      setFilteredActivities([]);
      setPage(0);
      setHasMore(false);

      if (__DEV__) console.log('✅ All activities cleared successfully');
      return true;

    } catch (error) {
      if (__DEV__) console.error('❌ Clear activities failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Tek aktivite silme
  const deleteActivity = useCallback(async (activityId, activityType) => {
    if (!user?.id) return false;

    try {
      // Aktivite tipine göre doğru tablodan sil
      if (activityType === 'math' || activityId.startsWith('math-')) {
        // Math solution ID'si formatından çıkar (math-{id})
        const solutionId = activityId.startsWith('math-') 
          ? activityId.replace('math-', '')
          : activityId;
        const { error } = await supabase
          .from('math_solutions')
          .delete()
          .eq('id', solutionId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // user_activities'den sil
        // ID formatını temizle (chat- prefix'i varsa kaldır)
        const cleanId = activityId.startsWith('chat-') 
          ? activityId.replace('chat-', '')
          : activityId;
        
        const { error } = await supabase
          .from('user_activities')
          .delete()
          .eq('id', cleanId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }

      // Local state'den sil
      setActivities(prev => prev.filter(act => act.id !== activityId));
      setAllActivities(prev => prev.filter(act => act.id !== activityId));
      setFilteredActivities(prev => prev.filter(act => act.id !== activityId));

      if (__DEV__) console.log('✅ Activity deleted:', activityId);
      return true;
    } catch (error) {
      if (__DEV__) console.error('❌ Delete activity failed:', error);
      return false;
    }
  }, [user?.id]);

  // Toplu aktivite silme
  const deleteMultipleActivities = useCallback(async (activityIds) => {
    if (!user?.id || !activityIds || activityIds.length === 0) return false;

    try {
      // Her aktivite tipini grupla
      const mathIds = [];
      const activityIds_clean = [];

      activityIds.forEach(id => {
        if (id.startsWith('math-')) {
          mathIds.push(id.replace('math-', ''));
        } else {
          const cleanId = id.startsWith('chat-') ? id.replace('chat-', '') : id;
          activityIds_clean.push(cleanId);
        }
      });

      // Math solutions sil
      if (mathIds.length > 0) {
        const { error: mathError } = await supabase
          .from('math_solutions')
          .delete()
          .in('id', mathIds)
          .eq('user_id', user.id);
        
        if (mathError) throw mathError;
      }

      // User activities sil
      if (activityIds_clean.length > 0) {
        const { error: activityError } = await supabase
          .from('user_activities')
          .delete()
          .in('id', activityIds_clean)
          .eq('user_id', user.id);
        
        if (activityError) throw activityError;
      }

      // Local state'den sil
      setActivities(prev => prev.filter(act => !activityIds.includes(act.id)));
      setAllActivities(prev => prev.filter(act => !activityIds.includes(act.id)));
      setFilteredActivities(prev => prev.filter(act => !activityIds.includes(act.id)));

      if (__DEV__) console.log('✅ Multiple activities deleted:', activityIds.length);
      return true;
    } catch (error) {
      if (__DEV__) console.error('❌ Delete multiple activities failed:', error);
      return false;
    }
  }, [user?.id]);

  return {
    activities,
    loading,
    hasMore,
    logActivity,
    fetchRecentActivities,
    filterByCategory,
    loadMore,
    refresh,
    clearAllActivities,
    deleteActivity,
    deleteMultipleActivities,
  };
};

export default useActivity;

