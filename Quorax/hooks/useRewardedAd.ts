// 📺 ADMOB HOOK
// Google AdMob ödüllü reklam yönetimi.
// - Expo Go: Native SDK yok → mock reklam (test simülasyonu).
// - Development / TestFlight (__DEV__ veya EXPO_PUBLIC_USE_TEST_ADS=true): Test reklam birimleri.
// - Production: Canlı reklam birimleri.
// Reklam göstermek için useAppAd kullanın; premium kullanıcıya reklam gösterilmez.

import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { getRewardedAdUnitId, isExpoGo, isTestAdEnv } from '@/constants/adConfig';

// AdMob SDK modülleri (lazy load)
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let AdMobModule: any = null;
let MobileAds: any = null;

// Global reklam instance (birden fazla mount olsa bile tek instance kullan)
let globalAdInstance: any = null;
let globalAdListeners: Array<() => void> = [];
let isGlobalAdLoading: boolean = false;


/**
 * AdMob SDK'sını initialize et
 */
const initializeAdMob = async (): Promise<boolean> => {
  if (isExpoGo) return false;
  
  try {
    const mod = require('react-native-google-mobile-ads');
    if (!mod || !mod.default) return false;
    
    const MobileAdsInstance = mod.default;
    if (typeof MobileAdsInstance.initialize !== 'function') return false;
    
    await MobileAdsInstance.initialize();
    
    if (isTestAdEnv && typeof MobileAdsInstance.setRequestConfiguration === 'function') {
      await MobileAdsInstance.setRequestConfiguration({
        testDeviceIdentifiers: ['EMULATOR'],
      });
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * AdMob native modülünü yükle (Expo Go dışında).
 */
const getAdMobModule = (): typeof AdMobModule => {
  if (AdMobModule !== null) {
    return AdMobModule;
  }
  if (isExpoGo) {
    AdMobModule = false;
    return false;
  }
  try {
    const mod = require('react-native-google-mobile-ads');
    AdMobModule = mod;
    RewardedAd = mod.RewardedAd;
    RewardedAdEventType = mod.RewardedAdEventType;
    MobileAds = mod.default;
    
    // SDK'yı hemen initialize et
    initializeAdMob().catch(console.warn);
    
    return AdMobModule;
  } catch (error) {
    console.warn('⚠️ AdMob module not available:', error);
    AdMobModule = false;
    return false;
  }
};

/**
 * Rewarded Ad Hook
 */
export const useRewardedAd = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const rewardedAdRef = useRef<any>(null);
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  // AdMob modülünü yükle
  useEffect(() => {
    if (!isExpoGo) {
      getAdMobModule();
    }
  }, []);

  const useMockAdMob = isExpoGo || !RewardedAd;

  // Mock fonksiyonlar (Expo Go için)
  const mockLoadAd = async () => {
    setIsLoading(true);
    setAdError(null);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsReady(true);
    setIsLoading(false);
  };

  const mockShowAd = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsLoading(false);
    setIsReady(false);
    
    setTimeout(() => mockLoadAd(), 500);
    
    return {
      reward: {
        type: 'token',
        amount: 2,
      },
    };
  };

  // Event listener cleanup
  const cleanupEventListeners = () => {
    unsubscribeRefs.current.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    unsubscribeRefs.current = [];
  };

  // Global cleanup
  const cleanupGlobalListeners = () => {
    globalAdListeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    globalAdListeners = [];
  };

  // Ad yükle
  const loadAd = async () => {
    if (useMockAdMob) {
      return mockLoadAd();
    }

    try {
      if (!RewardedAd) {
        getAdMobModule();
      }
      
      if (!RewardedAd || !RewardedAdEventType) {
        return mockLoadAd();
      }

      if (isGlobalAdLoading) {
        return;
      }

      if (globalAdInstance && globalAdInstance.loaded === true) {
        rewardedAdRef.current = globalAdInstance;
        setIsReady(true);
        setIsLoading(false);
        return;
      }

      isGlobalAdLoading = true;
      setIsLoading(true);
      setIsReady(false);
      setAdError(null);
      
      cleanupEventListeners();

      if (!globalAdInstance) {
        const adUnitId = getRewardedAdUnitId();
        globalAdInstance = RewardedAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: false,
          keywords: ['education', 'learning', 'study'],
        });
      }

      const rewardedAd = globalAdInstance;
      const loadedEvent = RewardedAdEventType?.LOADED;
      const failedEvent = RewardedAdEventType?.ERROR;

      if (!loadedEvent || typeof loadedEvent !== 'string') {
        isGlobalAdLoading = false;
        return mockLoadAd();
      }

      rewardedAdRef.current = rewardedAd;

      if (globalAdListeners.length === 0) {
        const unsubscribeLoaded = rewardedAd.addAdEventListener(loadedEvent, () => {
          isGlobalAdLoading = false;
          setIsReady(true);
          setIsLoading(false);
          setAdError(null);
        });
        globalAdListeners.push(unsubscribeLoaded);
        
        if (failedEvent) {
          const unsubscribeFailed = rewardedAd.addAdEventListener(failedEvent, (error: any) => {
            isGlobalAdLoading = false;
            globalAdInstance = null;
            setAdError(error?.message || 'Ad failed to load');
            setIsReady(false);
            setIsLoading(false);
          });
          globalAdListeners.push(unsubscribeFailed);
        }
        
        try {
          rewardedAd.load();
        } catch (error: any) {
          isGlobalAdLoading = false;
          globalAdInstance = null;
          setAdError(error?.message || String(error));
          setIsReady(false);
          setIsLoading(false);
        }
      } else {
        if (globalAdInstance.loaded === true) {
          setIsReady(true);
          setIsLoading(false);
          isGlobalAdLoading = false;
        }
      }

    } catch (error: any) {
      isGlobalAdLoading = false;
      setAdError(error.message);
      setIsLoading(false);
      setIsReady(false);
    }
  };

  // Ad göster
  const showAd = async () => {
    if (useMockAdMob) {
      return mockShowAd();
    }

    if (!RewardedAdEventType) {
      return mockShowAd();
    }

    return new Promise<{ reward: { type: string; amount: number } }>((resolve, reject) => {
      if (!rewardedAdRef.current) {
        loadAd().catch(console.warn);
        reject(new Error('Reklam yüklenemedi'));
        return;
      }

      const adInstance = rewardedAdRef.current;
      const isAdLoaded = adInstance.loaded === true || isReady;
      
      if (!isAdLoaded) {
        reject(new Error('Reklam henüz hazır değil'));
        return;
      }
      
      setIsLoading(true);
      let rewardGiven = false;
      let unsubscribeEarned: (() => void) | null = null;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const earnedRewardEvent = RewardedAdEventType?.EARNED_REWARD;

      if (!earnedRewardEvent || typeof earnedRewardEvent !== 'string') {
        reject(new Error('Invalid event types'));
        return;
      }

      unsubscribeEarned = rewardedAdRef.current.addAdEventListener(
        earnedRewardEvent,
        (reward: any) => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          
          if (rewardGiven) return;

          rewardGiven = true;
          setIsLoading(false);
          setIsReady(false);
          
          if (unsubscribeEarned) unsubscribeEarned();

          resolve({
            reward: {
              type: reward?.type || 'token',
              amount: reward?.amount || 2,
            },
          });

          globalAdInstance = null;
          cleanupGlobalListeners();
          setTimeout(() => {
            loadAd().catch(console.warn);
          }, 1000);
        }
      );

      rewardedAdRef.current
        .show()
        .then(() => {
          timeoutId = setTimeout(() => {
            if (!rewardGiven) {
              setIsLoading(false);
              setIsReady(false);
              if (unsubscribeEarned) unsubscribeEarned();
              globalAdInstance = null;
              cleanupGlobalListeners();
              loadAd().catch(console.warn);
              reject(new Error('Reklam zaman aşımına uğradı'));
            }
          }, 60000);
        })
        .catch((error: any) => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          
          setIsLoading(false);
          setIsReady(false);
          
          if (unsubscribeEarned) unsubscribeEarned();
          
          reject(error);
          globalAdInstance = null;
          cleanupGlobalListeners();
          setTimeout(() => {
            loadAd().catch(console.warn);
          }, 1000);
        });
    });
  };

  // İlk yükleme — tek deneme, AdContext zaten retry yapıyor
  useEffect(() => {
    if (!useMockAdMob) {
      // İlk yüklemeyi dene; hata olursa AdContext'teki backoff devralır
      loadAd().catch((e) => console.error('[useRewardedAd] Initial load failed:', e));

      return () => {
        cleanupEventListeners();
        if (rewardedAdRef.current) {
          rewardedAdRef.current = null;
        }
      };
    } else {
      // Mock mode - hemen hazır
      setIsReady(true);
      
      return () => {
        cleanupEventListeners();
        if (rewardedAdRef.current) {
          rewardedAdRef.current = null;
        }
      };
    }
  }, [useMockAdMob]);

  return {
    loadAd,
    showAd,
    isLoading,
    isReady,
    adError,
  };
};

export default useRewardedAd;

