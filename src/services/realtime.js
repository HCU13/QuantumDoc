// 🔄 REAL-TIME SUBSCRIPTIONS
// Supabase real-time özelliklerini yöneten servis

import { supabase, createRealtimeSubscription, TABLES, REALTIME_CHANNELS } from './supabase';

// 📡 SUBSCRIPTION MANAGER
class RealtimeManager {
  constructor() {
    this.subscriptions = new Map();
    this.isConnected = false;
  }

  // 🔌 Connect to realtime
  connect() {
    if (this.isConnected) return;

    this.isConnected = true;
  }

  // 🔌 Disconnect from realtime
  disconnect() {
    // Unsubscribe from all channels
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
    });

    this.subscriptions.clear();
    this.isConnected = false;
  }

  // 📨 Subscribe to chat messages
  subscribeToChatMessages(chatId, onMessage) {
    const key = `chat_messages_${chatId}`;

    if (this.subscriptions.has(key)) {
      return this.subscriptions.get(key);
    }

    const subscription = createRealtimeSubscription(
      TABLES.MESSAGES,
      'INSERT',
      (payload) => {
        onMessage(payload.new);
      },
      { filter: `chat_id=eq.${chatId}` }
    );

    this.subscriptions.set(key, subscription);
    return subscription;
  }

  // 📰 Subscribe to news updates
  subscribeToNewsUpdates(onNewsUpdate) {
    const key = REALTIME_CHANNELS.NEWS_UPDATES;

    if (this.subscriptions.has(key)) {
      return this.subscriptions.get(key);
    }

    const subscription = createRealtimeSubscription(
      TABLES.NEWS,
      '*', // All events
      (payload) => {
        onNewsUpdate(payload);
      }
    );

    this.subscriptions.set(key, subscription);
    return subscription;
  }

  // 📊 Subscribe to user activities
  subscribeToUserActivities(userId, onActivity) {
    const key = `user_activities_${userId}`;

    if (this.subscriptions.has(key)) {
      return this.subscriptions.get(key);
    }

    const subscription = createRealtimeSubscription(
      TABLES.USER_ACTIVITIES,
      'INSERT',
      (payload) => {
        onActivity(payload.new);
      },
      { filter: `user_id=eq.${userId}` }
    );

    this.subscriptions.set(key, subscription);
    return subscription;
  }

  // 🪙 Subscribe to token changes
  subscribeToTokenChanges(userId, onTokenChange) {
    const key = `token_changes_${userId}`;

    if (this.subscriptions.has(key)) {
      return this.subscriptions.get(key);
    }

    const subscription = createRealtimeSubscription(
      TABLES.TOKEN_TRANSACTIONS,
      'INSERT',
      (payload) => {
        onTokenChange(payload.new);
      },
      { filter: `user_id=eq.${userId}` }
    );

    this.subscriptions.set(key, subscription);
    return subscription;
  }

  // 🎫 Subscribe to support ticket updates
  subscribeToTicketUpdates(userId, onTicketUpdate) {
    const key = `support_tickets_${userId}`;

    if (this.subscriptions.has(key)) {
      return this.subscriptions.get(key);
    }

    const subscription = createRealtimeSubscription(
      TABLES.SUPPORT_TICKETS,
      '*', // All events
      (payload) => {
        onTicketUpdate(payload);
      },
      { filter: `user_id=eq.${userId}` }
    );

    this.subscriptions.set(key, subscription);
    return subscription;
  }

  // 🔧 Unsubscribe from specific channel
  unsubscribe(key) {
    const subscription = this.subscriptions.get(key);

    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  // 📋 Get subscription status
  getSubscriptionStatus() {
    return {
      isConnected: this.isConnected,
      activeSubscriptions: Array.from(this.subscriptions.keys()),
      subscriptionCount: this.subscriptions.size
    };
  }
}

// 🌟 GLOBAL INSTANCE
export const realtimeManager = new RealtimeManager();

// 🎯 READY-TO-USE HOOKS

/**
 * Chat messages real-time hook
 * @param {string} chatId - Chat ID
 * @param {function} onMessage - Message callback
 * @returns {function} Cleanup function
 */
export const useChatMessages = (chatId, onMessage) => {
  if (!chatId) return () => {};

  const subscription = realtimeManager.subscribeToChatMessages(chatId, onMessage);

  return () => {
    realtimeManager.unsubscribe(`chat_messages_${chatId}`);
  };
};

/**
 * News updates real-time hook
 * @param {function} onNewsUpdate - News update callback
 * @returns {function} Cleanup function
 */
export const useNewsUpdates = (onNewsUpdate) => {
  const subscription = realtimeManager.subscribeToNewsUpdates(onNewsUpdate);

  return () => {
    realtimeManager.unsubscribe(REALTIME_CHANNELS.NEWS_UPDATES);
  };
};

/**
 * User activities real-time hook
 * @param {string} userId - User ID
 * @param {function} onActivity - Activity callback
 * @returns {function} Cleanup function
 */
export const useUserActivities = (userId, onActivity) => {
  if (!userId) return () => {};

  const subscription = realtimeManager.subscribeToUserActivities(userId, onActivity);

  return () => {
    realtimeManager.unsubscribe(`user_activities_${userId}`);
  };
};

/**
 * Token changes real-time hook
 * @param {string} userId - User ID
 * @param {function} onTokenChange - Token change callback
 * @returns {function} Cleanup function
 */
export const useTokenChanges = (userId, onTokenChange) => {
  if (!userId) return () => {};

  const subscription = realtimeManager.subscribeToTokenChanges(userId, onTokenChange);

  return () => {
    realtimeManager.unsubscribe(`token_changes_${userId}`);
  };
};

/**
 * Support ticket updates real-time hook
 * @param {string} userId - User ID
 * @param {function} onTicketUpdate - Ticket update callback
 * @returns {function} Cleanup function
 */
export const useTicketUpdates = (userId, onTicketUpdate) => {
  if (!userId) return () => {};

  const subscription = realtimeManager.subscribeToTicketUpdates(userId, onTicketUpdate);

  return () => {
    realtimeManager.unsubscribe(`support_tickets_${userId}`);
  };
};

// 🔧 UTILITY FUNCTIONS

/**
 * Initialize realtime for authenticated user
 * @param {object} user - User object
 */
export const initializeRealtime = (user) => {
  if (!user) {
    realtimeManager.disconnect();
    return;
  }

  realtimeManager.connect();

  // Auto-subscribe to user-specific channels
  // Bu fonksiyonlar ihtiyaç halinde çağrılabilir
};

/**
 * Cleanup realtime on logout
 */
export const cleanupRealtime = () => {
  realtimeManager.disconnect();
};

export default realtimeManager;
