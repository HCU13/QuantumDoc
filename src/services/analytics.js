// 📊 ANALYTICS SERVICE
// Event tracking ve kullanıcı davranış analizi

import { supabase } from './supabase';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

// 🎯 EVENT TYPES
export const EVENT_TYPES = {
  // User Actions
  USER_LOGIN: 'user_login',
  USER_REGISTER: 'user_register',
  USER_LOGOUT: 'user_logout',

  // AI Usage
  AI_CHAT_MESSAGE: 'ai_chat_message',
  AI_MATH_SOLVE: 'ai_math_solve',

  // Token Events
  TOKEN_EARN: 'token_earn',
  TOKEN_SPEND: 'token_spend',
  TOKEN_PURCHASE: 'token_purchase',

  // Feature Usage
  SCREEN_VIEW: 'screen_view',
  BUTTON_CLICK: 'button_click',
  FEATURE_USE: 'feature_use',

  // Support
  SUPPORT_TICKET_CREATE: 'support_ticket_create',
  FAQ_VIEW: 'faq_view',

  // News
  NEWS_VIEW: 'news_view',
  NEWS_CLICK: 'news_click',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
};

// 📱 DEVICE INFO
const getDeviceInfo = async () => {
  try {
    return {
      deviceName: Device.deviceName,
      deviceModel: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      appVersion: Application.nativeApplicationVersion,
      buildVersion: Application.nativeBuildVersion,
      platform: Device.platformApiLevel ? 'android' : 'ios',
    };
  } catch (error) {
    if (__DEV__) console.error('Error getting device info:', error);
    return {};
  }
};

// 📊 ANALYTICS CLASS
class Analytics {
  constructor() {
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.isEnabled = true;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  /**
   * Track an event
   * @param {string} eventType - Event type from EVENT_TYPES
   * @param {object} properties - Additional event properties
   */
  async trackEvent(eventType, properties = {}) {
    if (!this.isEnabled) return;

    try {
      const deviceInfo = await getDeviceInfo();

      const eventData = {
        user_id: this.userId, // null olabilir (anonymous tracking)
        session_id: this.sessionId,
        event_type: eventType,
        properties: {
          ...properties,
          ...deviceInfo,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };

      // Supabase'e kaydet
      // Not: user_id null ise RLS policy izin verir (anonymous tracking)
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventData);

      if (error) {
        if (__DEV__) console.error('Analytics track error:', error);
      }

      // Development log
      if (__DEV__) {
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  /**
   * Track screen view
   * @param {string} screenName - Screen name
   */
  async trackScreenView(screenName) {
    await this.trackEvent(EVENT_TYPES.SCREEN_VIEW, {
      screen_name: screenName,
    });
  }

  /**
   * Track AI usage
   * @param {string} aiType - 'chat' or 'math'
   * @param {object} metadata - Additional metadata
   */
  async trackAIUsage(aiType, metadata = {}) {
    const eventType = aiType === 'chat'
      ? EVENT_TYPES.AI_CHAT_MESSAGE
      : EVENT_TYPES.AI_MATH_SOLVE;

    await this.trackEvent(eventType, {
      ai_type: aiType,
      ...metadata,
    });
  }

  /**
   * Track token event
   * @param {string} action - 'earn', 'spend', 'purchase'
   * @param {number} amount - Token amount
   * @param {object} metadata - Additional metadata
   */
  async trackTokenEvent(action, amount, metadata = {}) {
    const eventTypeMap = {
      earn: EVENT_TYPES.TOKEN_EARN,
      spend: EVENT_TYPES.TOKEN_SPEND,
      purchase: EVENT_TYPES.TOKEN_PURCHASE,
    };

    await this.trackEvent(eventTypeMap[action], {
      action,
      amount,
      ...metadata,
    });
  }

  /**
   * Track error
   * @param {Error} error - Error object
   * @param {object} context - Error context
   */
  async trackError(error, context = {}) {
    await this.trackEvent(EVENT_TYPES.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  /**
   * Track user action
   * @param {string} action - Action name
   * @param {object} properties - Additional properties
   */
  async trackUserAction(action, properties = {}) {
    await this.trackEvent(EVENT_TYPES.FEATURE_USE, {
      action,
      ...properties,
    });
  }

  /**
   * Get analytics summary for a user
   * @param {string} userId - User ID
   * @returns {Promise<object>} Analytics summary
   */
  async getUserAnalytics(userId) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type, created_at, properties')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Process analytics
      const summary = {
        totalEvents: data.length,
        eventsByType: {},
        recentEvents: data.slice(0, 10),
      };

      // Count events by type
      data.forEach(event => {
        summary.eventsByType[event.event_type] =
          (summary.eventsByType[event.event_type] || 0) + 1;
      });

      return summary;
    } catch (error) {
      if (__DEV__) console.error('Get user analytics error:', error);
      return null;
    }
  }

  /**
   * Get app usage stats
   * @returns {Promise<object>} Usage stats
   */
  async getAppStats() {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type, user_id, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = {
        totalEvents: data.length,
        uniqueUsers: new Set(data.map(e => e.user_id)).size,
        aiUsage: data.filter(e =>
          e.event_type === EVENT_TYPES.AI_CHAT_MESSAGE ||
          e.event_type === EVENT_TYPES.AI_MATH_SOLVE
        ).length,
      };

      return stats;
    } catch (error) {
      if (__DEV__) console.error('Get app stats error:', error);
      return null;
    }
  }
}

// 🚀 SINGLETON INSTANCE
const analytics = new Analytics();

export default analytics;

// 🔧 CONVENIENCE FUNCTIONS
export const trackScreen = (screenName) => analytics.trackScreenView(screenName);
export const trackAI = (aiType, metadata) => analytics.trackAIUsage(aiType, metadata);
export const trackToken = (action, amount, metadata) => analytics.trackTokenEvent(action, amount, metadata);
export const trackError = (error, context) => analytics.trackError(error, context);
export const trackAction = (action, properties) => analytics.trackUserAction(action, properties);

