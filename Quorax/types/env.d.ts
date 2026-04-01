/// <reference types="expo/types" />

// Environment variables type definitions
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_APP_NAME: string;
    EXPO_PUBLIC_APP_VERSION: string;
    EXPO_PUBLIC_APP_SCHEME: string;
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    EXPO_PUBLIC_SUPPORT_EMAIL: string;
    EXPO_PUBLIC_PRIVACY_EMAIL: string;
    EXPO_PUBLIC_DEEP_LINK_SCHEME: string;
    EXPO_PUBLIC_DEEP_LINK_HOST: string;
    EXPO_PUBLIC_ADMOB_REWARDED_ANDROID: string;
    EXPO_PUBLIC_ADMOB_REWARDED_IOS: string;
    EXPO_PUBLIC_USE_TEST_ADS?: string;
    EXPO_PUBLIC_REVENUECAT_IOS_KEY: string;
  }
}

// AdMob module types
declare module 'react-native-google-mobile-ads' {
  export interface RewardedAdReward {
    type: string;
    amount: number;
  }

  export interface AdEventListener {
    (event: any): void;
  }

  export class RewardedAd {
    static createForAdRequest(adUnitId: string, options?: any): RewardedAd;
    addAdEventListener(event: string, listener: AdEventListener): () => void;
    load(): void;
    show(): Promise<void>;
  }

  export enum RewardedAdEventType {
    LOADED = 'loaded',
    ERROR = 'error',
    EARNED_REWARD = 'earned_reward',
  }

  export const TestIds: {
    DEVICE_ID: string;
    REWARDED: string;
  };

  export default class MobileAds {
    static initialize(): Promise<void>;
    static setRequestConfiguration(config: any): Promise<void>;
  }
}
