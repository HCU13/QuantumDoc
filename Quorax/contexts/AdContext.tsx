/**
 * Reklam yönetimi
 *
 * Kurallar:
 * - Premium kullanıcı: reklam asla gösterilmez.
 * - Math ve Exam: her işlemde reklam gösterilir (action-based).
 * - Chat: reklam gösterilmez.
 */

import { useAppAd } from "@/hooks/useAppAd";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";

// Sadece math ve exam action-based reklam alır, chat almaz
const ACTION_MODULES = new Set(["math", "exam"]);

interface AdContextType {
  showAdBeforeAction: (callback: () => void, module?: string) => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showAd, canShowAd, loadAd, isReady } = useAppAd();

  // İlk reklam yükleme
  useEffect(() => {
    let cancelled = false;
    const tryLoad = async (attempt: number) => {
      if (cancelled || isReady) return;
      try {
        await loadAd();
      } catch {
        if (attempt < 3 && !cancelled) {
          setTimeout(() => tryLoad(attempt + 1), Math.pow(2, attempt - 1) * 1000);
        }
      }
    };
    tryLoad(1);
    return () => { cancelled = true; };
  }, [loadAd]);

  const attemptShowAd = useCallback(async (callback: () => void) => {
    try {
      if (!isReady) throw new Error("Ad not ready");
      await showAd();
    } catch (e: any) {
      // Reklam hazır değil, iptal edildi veya hata — kullanıcıyı bloklamadan devam et
      if (__DEV__) console.warn('[AdContext] Ad skipped:', e?.message);
    } finally {
      callback();
      setTimeout(() => loadAd().catch(() => {}), 500);
    }
  }, [showAd, loadAd, isReady]);

  // Action-based: sadece math ve exam modülleri, her işlemde
  const showAdBeforeAction = useCallback(
    (callback: () => void, module = "chat") => {
      if (!canShowAd || !ACTION_MODULES.has(module)) {
        callback();
        return;
      }
      attemptShowAd(callback);
    },
    [canShowAd, attemptShowAd],
  );

  return (
    <AdContext.Provider value={{ showAdBeforeAction }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => {
  const ctx = useContext(AdContext);
  if (ctx === undefined) throw new Error("useAd must be used within AdProvider");
  return ctx;
};
