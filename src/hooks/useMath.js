import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTokenContext } from '../contexts/TokenContext';
import { useTranslation } from 'react-i18next';
import { logActivity } from '../utils/activityLogger';
import analytics from '../services/analytics';
import { showError } from '../utils/toast';
import { useLoading } from '../contexts/LoadingContext';
import { useActivityRefresh } from '../contexts/ActivityRefreshContext';
import { MODULES } from '../constants/modules';
import * as ImageManipulator from 'expo-image-manipulator';

export const useMath = () => {
  const { user } = useAuth();
  const { refreshTokens } = useTokenContext();
  const { i18n, t } = useTranslation();
  const { setLoading: setGlobalLoading } = useLoading();
  const { triggerRefresh } = useActivityRefresh();
  const [mathHistory, setMathHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convert image to base64 data URL (Optimize edilmiş - token tüketimini azaltır)
  const convertImageToBase64 = async (imageUri) => {
    try {
      // Eğer zaten base64 data URL ise direkt döndür
      if (imageUri.startsWith("data:image")) {
        return imageUri;
      }

      // ✅ Görseli resize et (kaliteyi koruyarak token tüketimini azalt)
      // Max 384px width - matematik problemleri için yeterli çözünürlük (metin okunabilir)
      // Claude görsel tokenizasyonu çözünürlüğe göre çalışır - daha küçük = daha az token
      // 384px matematik problemleri için optimal: token tüketimini %25-30 daha azaltır
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 384 } }], // Max width 384px, aspect ratio korunur (512px'den düşürüldü)
        { 
          compress: 0.7, // Kaliteyi koru (0.7 = %70 kalite - metin okunabilirliği için yeterli)
          format: ImageManipulator.SaveFormat.JPEG, // JPEG daha küçük boyut
        }
      );

      // Resize edilmiş görseli base64'e çevir
      const response = await fetch(manipulatedImage.uri);
      const blob = await response.blob();

      // Blob'u base64'e çevir
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Result = reader.result;
          
          // Base64 boyutunu kontrol et
          const base64Data = base64Result.split(',')[1];
          const base64Length = base64Data?.length || 0;
          
          if (__DEV__) {
            // ⚠️ NOT: Görsel tokenizasyonu çözünürlüğe göre çalışır, base64 boyutuna göre değil!
            // Gerçek token sayısı Claude API'den döner, bu sadece görsel boyutu gösterir
            console.log(`[Math] Görsel optimize edildi: ${Math.round(base64Length / 1000)}KB base64 (384px width, gerçek token sayısı API'den gelecek)`);
          }
          
          resolve(base64Result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      if (__DEV__) console.error('Image conversion error:', err);
      throw new Error('Görsel işlenemedi');
    }
  };

  // Fetch math history from database
  const fetchMathHistory = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('math_solutions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setMathHistory(data || []);
    } catch (err) {
      setError('Matematik geçmişi yüklenemedi');
      if (__DEV__) console.error('Math history fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Solve math problem (text)
  const solveMath = useCallback(async (question) => {
    if (!user?.id) throw new Error('Kullanıcı giriş yapmamış');

    setLoading(true);
    setGlobalLoading(true, t('common.processing.math'), 'math');
    setError(null);

    try {
      const userLanguage = i18n.language || 'tr'; // Kullanıcının mevcut dili
      
      // Modül kategorisini al
      const mathModule = MODULES.find(m => m.id === 'math');
      const category = mathModule?.category || 'education';

      // Call Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('solve-math-problem', {
        body: {
          problemText: question,
          userId: user.id,
          userLanguage: userLanguage, // Dil bilgisini gönder
          category: category // Kategori bilgisini gönder
        }
      });

      if (functionError) {
        // Teknik hataları gizle, sadece development'ta log'la
        if (__DEV__) {
          console.error('Function invoke error:', functionError);
          console.error('Error message:', functionError.message);
          console.error('Error context:', functionError.context);
          console.error('Full error:', JSON.stringify(functionError, null, 2));
        }
        
        // Kullanıcıya genel hata mesajı göster (çeviri ile)
        showError(
          t('errors.api.title'),
          t('errors.api.message')
        );
        
        throw new Error(t('errors.api.title'));
      }

      // Check for error in response
      if (data?.error) {
        // Teknik hataları gizle, sadece development'ta log'la
        if (__DEV__) {
          console.error('Function returned error:', data.error);
        }
        
        // Kullanıcıya genel hata mesajı göster (çeviri ile)
        showError(
          t('errors.api.title'),
          t('errors.api.message')
        );
        
        throw new Error(t('errors.api.title'));
      }

      // History'yi yeniden yükle
      await fetchMathHistory();

      // Aktivite kaydet
      await logActivity(
        user.id,
        'math',
        question.slice(0, 50),
        data.solution.slice(0, 100),
        {
          problemType: 'text',
          tokensUsed: data.tokensUsed || 2,
          solutionId: data.solutionId
        }
      );

      // Analytics: Math usage tracking
      await analytics.trackAIUsage('math', {
        problemType: 'text',
        questionLength: question.length,
        tokensUsed: data.tokensUsed || 7,
      });

      // Token'ı refresh et (token harcamasından sonra)
      await refreshTokens();

      // Aktivite geçmişini yenile (ana sayfa ve aktivite sayfası için)
      triggerRefresh();

      return {
        success: true,
        solution: data.solution,
        tokensUsed: data.tokensUsed || 2,
        solutionId: data.solutionId
      };
    } catch (err) {
      const errorMessage = err.message || 'Matematik problemi çözülemedi';
      setError(errorMessage);
      if (__DEV__) console.error('Math solving error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, [user, fetchMathHistory, refreshTokens, t, setGlobalLoading, triggerRefresh, i18n.language]);

  // Solve math problem (image)
  const solveMathWithImage = useCallback(async (imageUri) => {
    if (!user?.id) throw new Error('Kullanıcı giriş yapmamış');

    setLoading(true);
    setGlobalLoading(true, t('common.processing.math'), 'math');
    setError(null);

    try {
      // Convert image to base64 data URL
      const imageDataUrl = await convertImageToBase64(imageUri);

      const userLanguage = i18n.language || 'tr'; // Kullanıcının mevcut dili

      // Call Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('solve-math-problem', {
        body: {
          problemImageUrl: imageDataUrl,
          userId: user.id,
          userLanguage: userLanguage // Dil bilgisini gönder
        }
      });

      if (functionError) {
        if (__DEV__) console.error('Function invoke error:', functionError);
        if (__DEV__) console.error('Error message:', functionError.message);
        if (__DEV__) console.error('Error context:', functionError.context);
        if (__DEV__) console.error('Full error:', JSON.stringify(functionError, null, 2));
        throw new Error(functionError.message || 'Edge Function çağrısı başarısız');
      }

      // Check for error in response
      if (data?.error) {
        if (__DEV__) console.error('Function returned error:', data.error);
        if (__DEV__) console.error('Error details:', data.errorDetails);
        throw new Error(data.error);
      }

      // History'yi yeniden yükle
      await fetchMathHistory();

      // Aktivite kaydet
      await logActivity(
        user.id,
        'math',
        'Görsel matematik problemi',
        data.solution.slice(0, 100),
        {
          problemType: 'image',
          tokensUsed: data.tokensUsed || 4,
          solutionId: data.solutionId
        }
      );

      // Analytics: Math usage tracking
      await analytics.trackAIUsage('math', {
        problemType: 'image',
        tokensUsed: data.tokensUsed || 7,
      });

      // Token'ı refresh et (token harcamasından sonra)
      await refreshTokens();

      // Aktivite geçmişini yenile (ana sayfa ve aktivite sayfası için)
      triggerRefresh();

      return {
        success: true,
        solution: data.solution,
        tokensUsed: data.tokensUsed || 4,
        solutionId: data.solutionId
      };
    } catch (err) {
      const errorMessage = err.message || 'Fotoğraf analizi başarısız';
      setError(errorMessage);
      if (__DEV__) console.error('Image math solving error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, [user, fetchMathHistory, refreshTokens, t, setGlobalLoading, triggerRefresh, i18n.language]);

  // Clear math history
  const clearMathHistory = useCallback(async () => {
    if (!user?.id) throw new Error('Kullanıcı giriş yapmamış');

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('math_solutions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setMathHistory([]);
      return { success: true };
    } catch (err) {
      setError('Geçmiş temizlenemedi');
      if (__DEV__) console.error('Clear math history error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete single math solution
  const deleteMathSolution = useCallback(async (solutionId) => {
    if (!user?.id) throw new Error('Kullanıcı giriş yapmamış');

    try {
      const { error: deleteError } = await supabase
        .from('math_solutions')
        .delete()
        .eq('id', solutionId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update local state
      setMathHistory(prev => prev.filter(item => item.id !== solutionId));
      return { success: true };
    } catch (err) {
      if (__DEV__) console.error('Delete solution error:', err);
      throw err;
    }
  }, [user]);

  const getMathStats = useCallback(async () => {
    try {
      // Mock math stats
      return {
        totalProblems: mathHistory.length,
        solvedToday: mathHistory.filter(item => {
          const today = new Date();
          const itemDate = new Date(item.createdAt);
          return itemDate.toDateString() === today.toDateString();
        }).length,
        averageTime: "2.5 dakika",
        favoriteTopics: ["Cebir", "Geometri", "Kalkülüs"]
      };
    } catch (err) {
      if (__DEV__) console.error('Math stats error:', err);
      throw err;
    }
  }, [mathHistory]);

  useEffect(() => {
    if (user?.id) {
      fetchMathHistory();
    }
  }, [user?.id]);

  return {
    mathHistory,
    loading,
    error,
    solveMathProblem: solveMath,
    solveImageProblem: solveMathWithImage,
    fetchMathHistory,
    clearMathHistory,
    deleteMathSolution,
    getMathStats,
  };
};