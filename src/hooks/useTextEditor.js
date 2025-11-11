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

export const useTextEditor = () => {
  const { user } = useAuth();
  const { refreshTokens, getTokenCost, tokens } = useTokenContext();
  const { i18n, t } = useTranslation();
  const { setLoading: setGlobalLoading } = useLoading();
  const { triggerRefresh } = useActivityRefresh();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Process text (grammar check, summarize, email, tone, length)
  const processText = useCallback(
      async (
        inputText, 
        mode, 
        emailTo = null, 
        emailSubject = null, 
        emailTone = "professional",
        targetAudience = "general",
        outputFormat = "plain",
        academicStyle = "none",
        toneAnalysisEnabled = false,
        readabilityScoreEnabled = true
      ) => {
      if (!user?.id) throw new Error("Kullanıcı giriş yapmamış");

      setLoading(true);
      setGlobalLoading(true, t('common.processing.textEditor'), 'textEditor');
      setError(null);

      try {
        const userLanguage = i18n.language || "tr";
        
        // Modül kategorisini al
        const textEditorModule = MODULES.find(m => m.id === 'textEditor');
        const category = textEditorModule?.category || 'productivity';

        // Token kontrolü
        const tokenCost = getTokenCost("textEditor") || 3;
        if (tokens < tokenCost) {
          throw new Error("INSUFFICIENT_TOKENS");
        }

        // Call Supabase Edge Function
        const { data, error: functionError } = await supabase.functions.invoke(
          "process-text-editor",
          {
            body: {
              inputText: inputText.trim(),
              mode,
              userId: user.id,
              userLanguage,
              category: category, // Kategori bilgisini gönder
              emailTo,
              emailSubject,
              emailTone,
              // Gelişmiş ayarlar
              targetAudience,
              outputFormat,
              academicStyle,
              toneAnalysisEnabled,
              readabilityScoreEnabled,
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

        // History'yi yeniden yükle
        await fetchHistory();

        // Aktivite kaydet
        await logActivity(
          user.id,
          "textEditor",
          inputText.slice(0, 50) || t('modules.textEditor.title'),
          data.result.slice(0, 100),
          {
            mode,
            tokensUsed: data.tokensUsed || 3,
            resultId: data.resultId,
          }
        );

        // Analytics
        await analytics.trackAIUsage("textEditor", {
          mode,
          inputLength: inputText.length,
          tokensUsed: data.tokensUsed || 3,
        });

        // Token'ı refresh et
        await refreshTokens();

        // Aktivite geçmişini yenile (ana sayfa ve aktivite sayfası için)
        triggerRefresh();

        return {
          success: true,
          result: data.result,
          tokensUsed: data.tokensUsed || 3,
          resultId: data.resultId,
        };
      } catch (err) {
        const errorMessage = err.message || "İşlem başarısız";
        setError(errorMessage);
        if (__DEV__) console.error("Text Editor error:", err);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    },
    [user, refreshTokens, getTokenCost, tokens, i18n.language, t, setGlobalLoading, triggerRefresh]
  );

  // Fetch history from database
  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("text_editor_results")
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

  // Delete single result
  const deleteResult = useCallback(
    async (resultId) => {
      if (!user?.id) throw new Error("Kullanıcı giriş yapmamış");

      try {
        const { error: deleteError } = await supabase
          .from("text_editor_results")
          .delete()
          .eq("id", resultId)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        setHistory((prev) => prev.filter((item) => item.id !== resultId));
        return { success: true };
      } catch (err) {
        if (__DEV__) console.error("Delete result error:", err);
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
    processText,
    fetchHistory,
    deleteResult,
  };
};

