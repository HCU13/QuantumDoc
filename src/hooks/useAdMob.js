// 📺 ADMOB HOOK
// Google AdMob rewarded ads yönetimi

import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Expo Go vs Development Build kontrolü
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// AdMob SDK modülleri
let RewardedAd = null;
let RewardedAdEventType = null;
let TestIds = null;
let AdMobModule = null;

// Production Ad Unit IDs - Platform bazlı
const PRODUCTION_AD_UNIT_ID_ANDROID = 'ca-app-pub-2610484857413432/1092049417';
const PRODUCTION_AD_UNIT_ID_IOS = 'ca-app-pub-2610484857413432/5423118612';
const TEST_REWARDED_AD_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';

/**
 * Event type helper - v16 API string formatını kullan
 * API her zaman string format bekliyor: 'rewarded_loaded', 'rewarded_error', vb.
 */
const getEventType = (eventName) => {
  // React Native Google Mobile Ads v16 API string formatı
  const eventTypeMap = {
    loaded: 'rewarded_loaded',
    error: 'rewarded_error', 
    dismissed: 'rewarded_dismissed',
    rewarded: 'rewarded_earned_reward',
  };
  
  return eventTypeMap[eventName] || `rewarded_${eventName}`;
};

/**
 * Ad Unit ID helper
 */
const getAdUnitId = (testIds) => {
  if (__DEV__) {
    if (testIds && testIds.REWARDED) {
      return testIds.REWARDED;
    }
    return TEST_REWARDED_AD_UNIT_ID;
  }
  
  return Platform.OS === 'android' 
    ? PRODUCTION_AD_UNIT_ID_ANDROID 
    : PRODUCTION_AD_UNIT_ID_IOS;
};

/**
 * AdMob native modülünü yükle
 */
const getAdMobModule = () => {
  if (AdMobModule !== null) {
    return AdMobModule;
  }
  
  if (isExpoGo) {
    AdMobModule = false;
    return false;
  }
  
  try {
    AdMobModule = require('react-native-google-mobile-ads');
    RewardedAd = AdMobModule.RewardedAd;
    RewardedAdEventType = AdMobModule.RewardedAdEventType;
    TestIds = AdMobModule.TestIds;
    
    // Module loaded successfully
    
    return AdMobModule;
  } catch (error) {
    console.warn('[AdMob] Native module not available:', error.message);
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
  const [adError, setAdError] = useState(null);
  const rewardedAdRef = useRef(null);
  const unsubscribeRefs = useRef([]);

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
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsReady(true);
    setIsLoading(false);
  };

  const mockShowAd = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsReady(false);
    
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

  // Ad yükle
  const loadAd = async () => {
    if (useMockAdMob) {
      return mockLoadAd();
    }

    try {
      // RewardedAd yüklü mü kontrol et
      if (!RewardedAd) {
        // Eğer yüklenmemişse, tekrar yükle
        getAdMobModule();
      }
      
      if (!RewardedAd) {
        throw new Error('RewardedAd not available');
      }

      // EventType'ların yüklü olduğunu kontrol et - kritik!
      if (!RewardedAdEventType) {
        console.warn('[AdMob] RewardedAdEventType not available, using mock mode');
        return mockLoadAd();
      }

      setIsLoading(true);
      setAdError(null);
      
      // Eski ad instance'ını temizle
      cleanupEventListeners();
      if (rewardedAdRef.current) {
        rewardedAdRef.current = null;
      }

      // Yeni ad oluştur
      const adUnitId = getAdUnitId(TestIds);
      const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // Event type'ları - v16 API'de sadece LOADED ve EARNED_REWARD var!
      // ERROR ve DISMISSED event'leri yok - SDK dokümantasyonuna göre
      const loadedEvent = RewardedAdEventType?.LOADED;

      // Debug: Tüm RewardedAdEventType property'lerini göster (sadece development'ta)
      if (__DEV__ && RewardedAdEventType) {
        console.log('[AdMob] Available event types:', Object.keys(RewardedAdEventType));
        console.log('[AdMob] Event type values:', {
          LOADED: RewardedAdEventType.LOADED,
          EARNED_REWARD: RewardedAdEventType.EARNED_REWARD,
        });
      }

      // Event type'ın geçerli olduğunu kontrol et
      if (!loadedEvent || typeof loadedEvent !== 'string') {
        console.warn('[AdMob] Invalid loaded event type:', { 
          loadedEvent, 
          RewardedAdEventType: typeof RewardedAdEventType,
          availableKeys: RewardedAdEventType ? Object.keys(RewardedAdEventType) : 'none'
        });
        console.warn('[AdMob] Using mock mode - loaded event not available');
        return mockLoadAd();
      }
      
      // NOT: ERROR event'i v16 API'de yok - hataları try-catch ile yakalayacağız

      // Önce ad'ı ref'e kaydet (event listener'lar için gerekli)
      rewardedAdRef.current = rewardedAd;

      // Event listener'ları ekle
      // v16 API'de sadece LOADED event'i var - ERROR event'i yok!
      const unsubscribeLoaded = rewardedAd.addAdEventListener(loadedEvent, () => {
        setIsReady(true);
        setIsLoading(false);
      });
      unsubscribeRefs.current.push(unsubscribeLoaded);
      
      // Ad'ı yükle (event listener'lar eklendikten sonra)
      // v16 API'de load() void döndürür (promise değil), hatalar LOADED event'i gelmezse yakalanır
      // ERROR event'i yok, bu yüzden hataları try-catch ile yakalıyoruz
      try {
        rewardedAd.load();
        // Load başarılı - LOADED event'i geldiğinde setIsReady(true) olacak
      } catch (error) {
        // Load hatası - ERROR event'i olmadığı için try-catch ile yakalıyoruz
        setAdError(error?.message || String(error));
        setIsReady(false);
        setIsLoading(false);
        console.error('[AdMob] Load error (caught):', error);
      }

    } catch (error) {
      console.error('[AdMob] Load error:', error);
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

    // EventType'ların yüklü olduğunu kontrol et - kritik!
    if (!RewardedAdEventType) {
      console.warn('[AdMob] RewardedAdEventType not available, using mock mode');
      return mockShowAd();
    }

    return new Promise((resolve, reject) => {
      if (!rewardedAdRef.current || !isReady) {
        reject(new Error('Reklam hazır değil'));
        return;
      }

      setIsLoading(true);
      let rewardGiven = false;
      let unsubscribeEarned = null;
      let timeoutId = null; // Timeout için cleanup

      // Event type'ları - v16 API'de sadece EARNED_REWARD var!
      // DISMISSED event'i yok - SDK dokümantasyonuna göre
      const earnedRewardEvent = RewardedAdEventType?.EARNED_REWARD;

      // Event type'ın geçerli olduğunu kontrol et
      if (!earnedRewardEvent || typeof earnedRewardEvent !== 'string') {
        console.warn('[AdMob] Invalid earned reward event type:', { 
          earnedRewardEvent, 
          RewardedAdEventType: typeof RewardedAdEventType,
          availableKeys: RewardedAdEventType ? Object.keys(RewardedAdEventType) : 'none'
        });
        console.warn('[AdMob] Using mock mode - earned reward event not available');
        reject(new Error('Invalid event types'));
        return;
      }
      
      // NOT: DISMISSED event'i v16 API'de yok - ad gösterildikten sonra otomatik olarak temizlenecek

      // DISMISSED event'i v16 API'de yok - ad gösterildikten sonra otomatik temizlenir
      // Sadece EARNED_REWARD event'ini dinleyeceğiz

      // Reward earned event - v16 API'de tek event bu!
      unsubscribeEarned = rewardedAdRef.current.addAdEventListener(
        earnedRewardEvent,
        (reward) => {
          // Timeout'u temizle
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          
          if (rewardGiven) {
            console.warn('[AdMob] Reward already given, ignoring duplicate');
            return;
          }

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

          // Ad gösterildikten sonra yeni ad yükle (DISMISSED event'i yok, otomatik temizlenir)
          loadAd();
        }
      );

      // Ad'ı göster
      // DISMISSED event'i yok - ad kapandığında otomatik olarak temizlenecek
      rewardedAdRef.current
        .show()
        .then(() => {
          // Reklam gösterildi, kullanıcı izlemesini bekliyoruz
          // EARNED_REWARD event'i geldiğinde ödül verilecek
          
          // Timeout: Eğer belirli bir süre içinde reward gelmezse (kullanıcı ad'ı kapatırsa)
          // v16 API'de DISMISSED event'i olmadığı için timeout kullanıyoruz
          timeoutId = setTimeout(() => {
            if (!rewardGiven) {
              console.warn('[AdMob] Ad timeout - no reward received');
              setIsLoading(false);
              setIsReady(false);
              if (unsubscribeEarned) unsubscribeEarned();
              // Ad kapatıldı ama reward gelmedi - yeni ad yükle
              loadAd();
              reject(new Error('Ad timeout - no reward received'));
            }
          }, 60000); // 60 saniye timeout (normal ad süresi ~30 saniye)
        })
        .catch((error) => {
          // Timeout'u temizle
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          
          console.error('[AdMob] Show error:', error);
          setIsLoading(false);
          setIsReady(false);
          
          if (unsubscribeEarned) unsubscribeEarned();
          
          reject(error);
          loadAd();
        });
    });
  };

  // İlk yükleme
  useEffect(() => {
    if (!useMockAdMob) {
      loadAd().catch(() => {
        // Silent fail - will retry on showAd
      });
    } else {
      setIsReady(true);
    }

    return () => {
      cleanupEventListeners();
      if (rewardedAdRef.current) {
        rewardedAdRef.current = null;
      }
    };
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