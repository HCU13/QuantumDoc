import { useState, useCallback, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useTokenContext } from "../contexts/TokenContext";
import { useTranslation } from "react-i18next";
import { logActivity } from "../utils/activityLogger";
import analytics from "../services/analytics";
import { showError } from "../utils/toast";
import { useLoading } from "../contexts/LoadingContext";
import { useActivityRefresh } from "../contexts/ActivityRefreshContext";
import { MODULES } from "../constants/modules";
import * as ImageManipulator from "expo-image-manipulator";

export const useImageAnalyzer = () => {
  const { user } = useAuth();
  const { refreshTokens } = useTokenContext(); // Math modülündeki gibi sadece refreshTokens
  const { i18n, t } = useTranslation();
  const { setLoading: setGlobalLoading } = useLoading();
  const { triggerRefresh } = useActivityRefresh();
  const [history, setHistory] = useState([]);
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
      // Max 384px width - metin okunabilirliği için yeterli çözünürlük
      // Claude görsel tokenizasyonu çözünürlüğe göre çalışır - daha küçük = daha az token
      // 384px belgeler ve görseller için optimal: token tüketimini %25-30 daha azaltır
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
            console.log(`[ImageAnalyzer] Görsel optimize edildi: ${Math.round(base64Length / 1000)}KB base64 (384px width, gerçek token sayısı API'den gelecek)`);
          }
          
          resolve(base64Result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      if (__DEV__) console.error("Image conversion error:", err);
      throw new Error("Görsel işlenemedi");
    }
  };

  // Analyze image
  const analyzeImage = useCallback(
    async (imageUri, inputMethod = "gallery") => {
      if (!user?.id) throw new Error("Kullanıcı giriş yapmamış");

      setLoading(true);
      setGlobalLoading(true, t('common.processing.imageAnalyzer'), 'imageAnalyzer');
      setError(null);

      try {
        // Convert image to base64 (zaten base64 ise direkt kullan)
        const imageDataUrl = await convertImageToBase64(imageUri);

        const userLanguage = i18n.language || "tr";
        
        // Modül kategorisini al
        const imageAnalyzerModule = MODULES.find(m => m.id === 'imageAnalyzer');
        const category = imageAnalyzerModule?.category || 'information';

        // Token kontrolü edge function'da yapılıyor (Math modülündeki gibi)

        // Call Supabase Edge Function
        const { data, error: functionError } = await supabase.functions.invoke(
          "analyze-image",
          {
            body: {
              imageUrl: imageDataUrl,
              inputMethod,
              userId: user.id,
              userLanguage,
              category: category, // Kategori bilgisini gönder
            },
          }
        );

        if (functionError) {
          if (__DEV__) console.error("Function invoke error:", functionError);
          showError(t("errors.api.title"), t("errors.api.message"));
          throw new Error(t("errors.api.title"));
        }

        if (data?.error) {
          if (data.errorCode === "INSUFFICIENT_TOKENS") {
            throw new Error("INSUFFICIENT_TOKENS");
          }
          if (__DEV__) console.error("Function returned error:", data.error);
          showError(t("errors.api.title"), t("errors.api.message"));
          throw new Error(t("errors.api.title"));
        }

        // History'yi yeniden yükle (Math modülündeki gibi await ile)
        await fetchHistory();

        // Aktivite kaydet
        await logActivity(
          user.id,
          "imageAnalyzer",
          t('modules.imageAnalyzer.title'),
          data.result.slice(0, 100),
          {
            inputMethod,
            tokensUsed: data.tokensUsed || 6,
            analysisId: data.analysisId,
          }
        );

        // Analytics
        await analytics.trackAIUsage("imageAnalyzer", {
          inputMethod,
          tokensUsed: data.tokensUsed || 6,
        });

        // Token'ı refresh et
        await refreshTokens();

        // Aktivite geçmişini yenile (ana sayfa ve aktivite sayfası için)
        triggerRefresh();

        return {
          success: true,
          result: data.result,
          tokensUsed: data.tokensUsed || 6,
          analysisId: data.analysisId,
        };
      } catch (err) {
        const errorMessage = err.message || "Görsel analizi başarısız";
        setError(errorMessage);
        if (__DEV__) console.error("Image Analyzer error:", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    },
    [user?.id, i18n.language, convertImageToBase64, fetchHistory, refreshTokens, t, setGlobalLoading, triggerRefresh]
  );

  // Fetch history from database
  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("image_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setHistory(data || []);
    } catch (err) {
      setError("Geçmiş yüklenemedi");
      if (__DEV__) console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete single analysis
  const deleteAnalysis = useCallback(
    async (analysisId) => {
      if (!user?.id) throw new Error("Kullanıcı giriş yapmamış");

      try {
        const { error: deleteError } = await supabase
          .from("image_analyses")
          .delete()
          .eq("id", analysisId)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        setHistory((prev) => prev.filter((item) => item.id !== analysisId));
        return { success: true };
      } catch (err) {
        if (__DEV__) console.error("Delete analysis error:", err);
        throw err;
      }
    },
    [user]
  );

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]); // Math modülündeki gibi sadece user?.id

  return {
    history,
    loading,
    error,
    analyzeImage,
    fetchHistory,
    deleteAnalysis,
  };
};

