/**
 * Reklam yönetimi — günlük kullanım limitine göre ayarlanmış frekans.
 *
 * Kurallar:
 * - Premium kullanıcı: reklam asla gösterilmez.
 * - Her modülün kendi sayacı var; eşiğe ulaşınca reklam gösterilir, sayaç sıfırlanır.
 *
 * Frekanslar (free günlük limitler: chat=10, math=1, exam=1):
 *   chat  → her 3 mesajda bir → günde ~3 reklam
 *   math  → her seferinde     → günde 1 reklam
 *   exam  → her seferinde     → günde 1 reklam
 */

import { useAppAd } from "@/hooks/useAppAd";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

// Free kullanıcı günlük limitleri: chat=10, math=1, exam=1
// Chat'te her 3 mesajda bir → günde ~3 reklam
// Math ve exam'da limit 1 olduğu için her seferinde reklam göster
const ACTION_THRESHOLD: Record<string, number> = {
  chat: 3,
  math: 1,
  exam: 1,
};

interface AdContextType {
  /**
   * AI işlemi öncesi frekans kontrolü yapar; koşullar sağlanırsa reklam gösterir.
   * module: 'chat' | 'math' | 'exam'
   * Premium ise veya eşik dolmadıysa direkt callback çalışır.
   */
  showAdBeforeAction: (callback: () => void, module?: string) => void;
  /** Geriye dönük uyumluluk — kullanılmıyor ama export kalıyor */
  tryShowIntervalAd: () => Promise<void>;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showAd, canShowAd, loadAd, isReady, isLoading } = useAppAd();
  const actionCountRef = useRef<Record<string, number>>({});

  // Reklam yükleme: exponential backoff (1s → 2s → 4s, max 3 deneme)
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
      if (!isReady && isLoading) {
        const start = Date.now();
        while (!isReady && Date.now() - start < 8000) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
      if (!isReady) {
        const loadPromise = loadAd();
        await Promise.race([loadPromise, new Promise((r) => setTimeout(r, 6000))]);
        await new Promise((r) => setTimeout(r, 500));
      }
      if (!isReady) throw new Error("Ad not ready");
      await showAd();
    } catch {
      // Reklam yüklenemedi veya iptal — kullanıcıyı bloklamadan devam et
    } finally {
      callback();
      setTimeout(() => loadAd().catch(() => {}), 500);
    }
  }, [showAd, loadAd, isReady, isLoading]);

  const showAdBeforeAction = useCallback(
    (callback: () => void, module = "chat") => {
      if (!canShowAd) {
        callback();
        return;
      }

      const threshold = ACTION_THRESHOLD[module] ?? 4;
      const current = (actionCountRef.current[module] ?? 0) + 1;
      actionCountRef.current[module] = current;

      if (current >= threshold) {
        // Koşullar sağlandı → reklam göster, sayacı sıfırla
        actionCountRef.current[module] = 0;
        attemptShowAd(callback);
      } else {
        // Koşullar sağlanmadı → direkt işleme geç
        callback();
      }
    },
    [canShowAd, attemptShowAd],
  );

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const tryShowIntervalAd = useCallback(async () => {}, []);

  return (
    <AdContext.Provider value={{ showAdBeforeAction, tryShowIntervalAd }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => {
  const ctx = useContext(AdContext);
  if (ctx === undefined) throw new Error("useAd must be used within AdProvider");
  return ctx;
};
