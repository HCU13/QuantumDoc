/**
 * Uygulama reklam hook'u.
 * Kurallar:
 * - Giriş yapmamış kullanıcı (misafir): reklam her zaman gösterilir.
 * - Giriş yapmış + premium değil: reklam gösterilir (aralık + modülde işlem öncesi ödüllü).
 * - Premium: reklam asla gösterilmez.
 */

import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useCallback } from 'react';
import { useRewardedAd } from './useRewardedAd';

export const useAppAd = () => {
  const { isLoggedIn } = useAuth();
  const { isPremium } = useSubscription();
  const rewarded = useRewardedAd();

  /** Misafir veya premium olmayan kullanıcı = reklam göster */
  const canShowAd = !isLoggedIn || !isPremium;

  const showAd = useCallback(async () => {
    if (!canShowAd) return Promise.resolve({ reward: { type: 'skip', amount: 0 } });
    return rewarded.showAd();
  }, [canShowAd, rewarded.showAd]);

  const loadAd = useCallback(() => {
    // HER ZAMAN YÜKLE - canShowAd kontrolü yapma
    // Premium olup olmadığı sonra kontrol edilir (showAd'de)
    return rewarded.loadAd();
  }, [rewarded.loadAd]);

  return {
    ...rewarded,
    showAd,
    loadAd,
    canShowAd,
  };
};

export default useAppAd;
