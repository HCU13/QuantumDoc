import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔧 SUPABASE CONFIGURATION
// Bu değerleri kendi Supabase proje bilgilerinizle değiştirin
const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fcyzxfajpolzdboyhatf.supabase.co',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjeXp4ZmFqcG9semRib3loYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDg0OTcsImV4cCI6MjA3MTQyNDQ5N30.j0O6TQsbp8E_77ygbh_PtZIBbH9OK02WHpVxsMk9fpM',

  // Client options
  options: {
    auth: {
      // AsyncStorage kullanarak session'ları persist et
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    // Real-time özelliklerini aktifleştir
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
};

// 🚀 SUPABASE CLIENT - Tek instance kullan
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  SUPABASE_CONFIG.options
);

// 🎯 DATABASE TABLES - Tüm tablo isimlerini merkezi yönetim
export const TABLES = {
  // User management
  PROFILES: 'profiles',

  // Chat system
  CHATS: 'chats',
  MESSAGES: 'messages',
  CHAT_PARTICIPANTS: 'chat_participants',

  // News system
  NEWS: 'news',
  NEWS_CATEGORIES: 'news_categories',

  // Support system
  SUPPORT_TICKETS: 'support_tickets',
  FAQ: 'faq',

  // Token system
  TOKEN_TRANSACTIONS: 'token_transactions',
  USER_TOKENS: 'user_tokens',

  // Math solver
  MATH_SOLUTIONS: 'math_solutions',

  // Activity tracking
  USER_ACTIVITIES: 'user_activities',
};

// 🤖 AI FUNCTIONS - Edge Functions endpoint'leri
export const AI_FUNCTIONS = {
  MATH_SOLVER: 'solve-math-problem',
  CHAT_AI: 'chat-ai-response',
  TEXT_TRANSLATE: 'translate-text',
  IMAGE_TO_TEXT: 'image-to-text',
};

// 📊 REALTIME CHANNELS - Real-time subscription'lar
export const REALTIME_CHANNELS = {
  CHAT_MESSAGES: 'chat_messages',
  USER_ACTIVITIES: 'user_activities',
  NEWS_UPDATES: 'news_updates',
};

// 🛠️ UTILITY FUNCTIONS

/**
 * Edge Function çağırma helper
 * @param {string} functionName - Function adı
 * @param {object} payload - Gönderilecek data
 * @returns {Promise} Function response
 */
export const invokeAIFunction = async (functionName, payload = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      if (__DEV__) console.error(`❌ AI Function Error (${functionName}):`, error);
      throw error;
    }

    return data;
  } catch (err) {
    if (__DEV__) console.error(`❌ AI Function Call Failed (${functionName}):`, err);
    throw err;
  }
};

/**
 * Real-time subscription oluşturma helper
 * @param {string} table - Tablo adı
 * @param {string} event - Event tipi ('INSERT', 'UPDATE', 'DELETE', '*')
 * @param {function} callback - Callback function
 * @param {object} filter - Filtreleme (opsiyonel)
 * @returns {object} Subscription
 */
export const createRealtimeSubscription = (table, event, callback, filter = {}) => {
  const channel = supabase
    .channel(`realtime_${table}`)
    .on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        ...filter,
      },
      callback
    )
    .subscribe();

  return channel;
};

/**
 * Kullanıcı session bilgisini al
 * @returns {Promise<object>} Session data
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      if (__DEV__) console.error('❌ Session Error:', error);
      return null;
    }

    return session;
  } catch (err) {
    if (__DEV__) console.error('❌ Get Session Failed:', err);
    return null;
  }
};

/**
 * Kullanıcı profil bilgisini al
 * @returns {Promise<object>} User profile
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      if (__DEV__) console.error('❌ User Error:', error);
      return null;
    }

    return user;
  } catch (err) {
    if (__DEV__) console.error('❌ Get User Failed:', err);
    return null;
  }
};

/**
 * Database sorgu helper - hata yönetimi ile
 * @param {function} queryFunction - Supabase query function
 * @param {string} operation - Operation açıklaması (log için)
 * @returns {Promise<object>} Query result
 */
export const executeQuery = async (queryFunction, operation = 'Database Operation') => {
  try {
    const result = await queryFunction();
    const { data, error } = result;

    if (error) {
      if (__DEV__) console.error(`❌ ${operation} - Error:`, error);
      throw error;
    }

    return { data, error: null };

  } catch (err) {
    if (__DEV__) console.error(`❌ ${operation} - Failed:`, err);
    return { data: null, error: err };
  }
};

// 🔄 AUTH STATE LISTENER
/**
 * Auth state değişikliklerini dinle
 * @param {function} callback - Auth state callback
 * @returns {object} Subscription
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// 📱 CONFIG EXPORT
export const SUPABASE_CONFIG_INFO = {
  isConfigured: SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL',
  tables: Object.keys(TABLES).length,
  aiFunctions: Object.keys(AI_FUNCTIONS).length,
  realtimeChannels: Object.keys(REALTIME_CHANNELS).length,
};

// 🚨 Development helper - Config kontrolü
if (__DEV__ && !SUPABASE_CONFIG_INFO.isConfigured) {
  console.warn(`
🚨 SUPABASE YAPIM GEREKİYOR:

1. Supabase Dashboard'a git: https://supabase.com
2. Yeni proje oluştur
3. Settings > API'den URL ve ANON KEY'i al
4. src/services/supabase.js dosyasındaki SUPABASE_CONFIG'i güncelle

YA DA

.env dosyası oluştur:
EXPO_PUBLIC_SUPABASE_URL=your_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
`);
}

export default supabase;
