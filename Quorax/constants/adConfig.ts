/**
 * Reklam ortam ve birim ID yapılandırması.
 *
 * - Expo Go: Native AdMob yok → uygulama mock reklam kullanır (test simülasyonu).
 * - Development / TestFlight (preview): __DEV__ true veya EXPO_PUBLIC_USE_TEST_ADS=true → test reklam birimleri.
 * - Production (store): Canlı reklam birimleri.
 *
 * Test reklam birimleri: Google resmi test ID'leri (hesap uyarısı riski yok).
 * Canlı: EXPO_PUBLIC_ADMOB_REWARDED_* ile override edilebilir.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Expo Go (storeClient) içinde mi çalışıyoruz — native AdMob yok, mock kullanılır */
export const isExpoGo = Constants.executionEnvironment === 'storeClient';

/**
 * Test reklamı gösterecek miyiz?
 * - __DEV__ (development/preview build) veya
 * - EXPO_PUBLIC_USE_TEST_ADS=true (örn. TestFlight'ta canlı build'de bile test reklam için)
 * - Expo Go içinde (mock reklam olsa bile test ID'leri kullan)
 */
export const isTestAdEnv =
  isExpoGo ||
  (typeof __DEV__ !== 'undefined' && __DEV__ === true) ||
  Constants.expoConfig?.extra?.useTestAds === true ||
  Constants.expoConfig?.extra?.eas?.useTestAds === true;

// Google resmi test rewarded ad unit ID'leri (platforma göre)
export const TEST_REWARDED_AD_UNIT_ID_ANDROID = 'ca-app-pub-3940256099942544/5224354917';
export const TEST_REWARDED_AD_UNIT_ID_IOS = 'ca-app-pub-3940256099942544/1712485313';

export const getTestRewardedAdUnitId = (): string =>
  Platform.OS === 'ios' ? TEST_REWARDED_AD_UNIT_ID_IOS : TEST_REWARDED_AD_UNIT_ID_ANDROID;

// Production rewarded ad unit ID'leri (env ile override)
export const PRODUCTION_REWARDED_ANDROID =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID) ||
  'ca-app-pub-2610484857413432/1092049417';
export const PRODUCTION_REWARDED_IOS =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_ADMOB_REWARDED_IOS) ||
  'ca-app-pub-2610484857413432/5423118612';

export const getProductionRewardedAdUnitId = (): string =>
  Platform.OS === 'android' ? PRODUCTION_REWARDED_ANDROID : PRODUCTION_REWARDED_IOS;

/** Kullanılacak rewarded ad unit ID (test ortamında test, production’da canlı) */
export const getRewardedAdUnitId = (): string =>
  isTestAdEnv ? getTestRewardedAdUnitId() : getProductionRewardedAdUnitId();
