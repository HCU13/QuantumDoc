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
    EXPO_PUBLIC_REVENUECAT_IOS_KEY: string;
  }
}
