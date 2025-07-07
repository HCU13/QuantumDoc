// API yapılandırması
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5001' 
  : 'https://your-production-api.com';

// API endpoint'leri
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // User
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  DELETE_ACCOUNT: '/user/account',
  UPLOAD_PROFILE_IMAGE: '/user/profile/image',
  CHANGE_PASSWORD: '/user/profile',
  
  // Tokens
  GET_TOKENS: '/tokens',
  USE_TOKENS: '/tokens/use',
  ADD_TOKENS: '/tokens',
  WATCH_VIDEO_FOR_TOKENS: '/tokens/watch-video',
  CLAIM_DAILY_REWARD: '/tokens/daily-reward',
  PURCHASE_TOKENS: '/tokens/purchase',
  GET_TOKEN_HISTORY: '/tokens/history',
  
  // Subscription
  GET_SUBSCRIPTION: '/subscription',
  UPGRADE_SUBSCRIPTION: '/subscription',
  CANCEL_SUBSCRIPTION: '/subscription/cancel',
  GET_SUBSCRIPTION_HISTORY: '/subscription/history',
  
  // Notes
  GET_NOTES: '/notes',
  CREATE_NOTE: '/notes',
  UPDATE_NOTE: '/notes/:id',
  DELETE_NOTE: '/notes/:id',
  ADD_NOTE_AI: '/notes/ai',
  
  // Tasks
  GET_TASKS: '/tasks',
  CREATE_TASK: '/tasks',
  UPDATE_TASK: '/tasks/:id',
  DELETE_TASK: '/tasks/:id',
  
  // Chat
  GET_CHATS: '/chat',
  CREATE_CHAT: '/chat',
  GET_MESSAGES: '/chat/room/:id/message',
  SEND_MESSAGE: '/chat/room/:id/message',
  DELETE_CHAT: '/chat/:id',
  GET_CHAT_ROOMS: '/chat/room',
  CREATE_CHAT_ROOM: '/chat/room',
  ADD_MESSAGE_TO_ROOM: '/chat/room/:id/message',
  GET_MESSAGES_FOR_ROOM: '/chat/room/:id/message',
  
  // Math
  SOLVE_MATH: '/math',
  GET_MATH_HISTORY: '/math',
  UPLOAD_MATH_IMAGE: '/math/upload',
  
  // Translation
  TRANSLATE: '/translate',
  GET_TRANSLATION_HISTORY: '/translate',
  
  // Text Generation
  GENERATE_TEXT: '/write',
  GET_WRITE_HISTORY: '/write',
  
  // News
  GET_NEWS: '/news',
  GET_NEWS_DETAIL: '/news/:id',
  GET_NEWS_BY_CATEGORY: '/news/category/:category',
  
  // Activity
  GET_ACTIVITY: '/activity',
  LOG_ACTIVITY: '/activity',
  CLEAR_ACTIVITY: '/activity',
  GET_ACTIVITY_STATS: '/activity/stats',
  GET_RECENT_ACTIVITIES: '/activity/recent',
  
  // Search
  GLOBAL_SEARCH: '/search',
  
  // Settings
  GET_SETTINGS: '/settings',
  UPDATE_SETTINGS: '/settings',
  UPDATE_LANGUAGE: '/settings/language',
  UPDATE_THEME: '/settings/theme',
  
  // Support
  CREATE_TICKET: '/support/ticket',
  GET_TICKETS: '/support/tickets',
  GET_TICKET: '/support/ticket/:id',
  UPDATE_TICKET: '/support/ticket/:id',
};

// API istekleri için yardımcı fonksiyonlar
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Auth endpointleri için token eklenmesin
  const isAuthEndpoint =
    endpoint.startsWith('/auth') ||
    endpoint.startsWith('/user/register') ||
    endpoint.startsWith('/user/forgot-password');

  const token = options.token;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && !isAuthEndpoint ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers: defaultHeaders,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (!isAuthEndpoint) {
      console.error('API request failed:', error);
    }
    throw error;
  }
};

// GET isteği
export const apiGet = (endpoint, token = null) => {
  return apiRequest(endpoint, { 
    method: 'GET',
    token 
  });
};

// POST isteği
export const apiPost = (endpoint, data, token = null) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    token
  });
};

// PUT isteği
export const apiPut = (endpoint, data, token = null) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    token
  });
};

// DELETE isteği
export const apiDelete = (endpoint, data = null, token = null) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
    token
  });
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
}; 