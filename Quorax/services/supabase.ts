import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// 🔧 SUPABASE CONFIGURATION – değerler .env dosyasından okunur
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// 🚀 SUPABASE CLIENT - Tek instance kullan
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 🎯 DATABASE TABLES - Tüm tablo isimlerini merkezi yönetim
export const TABLES = {
  PROFILES: 'profiles',
  USER_ACTIVITIES: 'user_activities',
  EXAM_RESULTS: 'exam_results',
  SUPPORT_TICKETS: 'support_tickets',
  CHATS: 'chats',
  MESSAGES: 'messages',
} as const;

export default supabase;

