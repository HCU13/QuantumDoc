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

export const useNoteGenerator = () => {
  const { user } = useAuth();
  const { refreshTokens, getTokenCost, tokens } = useTokenContext();
  const { i18n, t } = useTranslation();
  const { setLoading: setGlobalLoading } = useLoading();
  const { triggerRefresh } = useActivityRefresh();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate note
  const generateNote = useCallback(
    async (
      inputText,
      mode,
      noteFormat = "plain",
      noteStyle = "casual",
      noteLength = "medium"
    ) => {
      if (!user?.id) throw new Error("Kullanıcı giriş yapmamış");

      setLoading(true);
      setGlobalLoading(true, t('common.processing.noteGenerator'), 'noteGenerator');
      setError(null);

      try {
        const userLanguage = i18n.language || "tr";
        
        // Modül kategorisini al
        const noteGeneratorModule = MODULES.find(m => m.id === 'noteGenerator');
        const category = noteGeneratorModule?.category || 'productivity';

        // Token kontrolü
        const tokenCost = getTokenCost("noteGenerator") || 4;
        if (tokens < tokenCost) {
          throw new Error("INSUFFICIENT_TOKENS");
        }

        // Call Supabase Edge Function
        const { data, error: functionError } = await supabase.functions.invoke(
          "generate-note",
          {
            body: {
              inputText: inputText.trim(),
              mode,
              userId: user.id,
              userLanguage,
              category: category, // Kategori bilgisini gönder
              noteFormat,
              noteStyle,
              noteLength,
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
          "noteGenerator",
          inputText.slice(0, 50) || t('modules.noteGenerator.title'),
          data.result.slice(0, 100),
          {
            mode,
            tokensUsed: data.tokensUsed || 4,
            noteId: data.noteId,
          }
        );

        // Analytics
        await analytics.trackAIUsage("noteGenerator", {
          mode,
          inputLength: inputText.length,
          tokensUsed: data.tokensUsed || 4,
        });

        // Token'ı refresh et
        await refreshTokens();

        // Aktivite geçmişini yenile (ana sayfa ve aktivite sayfası için)
        triggerRefresh();

        return {
          success: true,
          result: data.result,
          tokensUsed: data.tokensUsed || 4,
          noteId: data.noteId,
        };
      } catch (err) {
        const errorMessage = err.message || "Not oluşturma başarısız";
        setError(errorMessage);
        if (__DEV__) console.error("Note Generator error:", err);
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
        .from("generated_notes")
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

  // Delete single note
  const deleteNote = useCallback(
    async (noteId) => {
      if (!user?.id) throw new Error("Kullanıcı giriş yapmamış");

      try {
        const { error: deleteError } = await supabase
          .from("generated_notes")
          .delete()
          .eq("id", noteId)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        setHistory((prev) => prev.filter((item) => item.id !== noteId));
        return { success: true };
      } catch (err) {
        if (__DEV__) console.error("Delete note error:", err);
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
    generateNote,
    fetchHistory,
    deleteNote,
  };
};

