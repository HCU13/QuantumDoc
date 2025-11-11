// 🐛 ERROR TRACKING SERVICE
// Hata yakalama ve raporlama

import { supabase } from './supabase';
import * as Device from 'expo-device';

class ErrorTracking {
  constructor() {
    this.userId = null;
    this.isEnabled = true;
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
   * Log an error
   * @param {Error} error - Error object
   * @param {object} context - Additional context
   * @param {string} severity - 'low', 'medium', 'high', 'critical'
   */
  async logError(error, context = {}, severity = 'medium') {
    if (!this.isEnabled) return;

    try {
      const errorData = {
        user_id: this.userId,
        error_type: error.name || 'Error',
        error_message: error.message,
        error_stack: error.stack,
        severity,
        context: {
          ...context,
          device: Device.modelName,
          os: Device.osName,
          osVersion: Device.osVersion,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('error_logs')
        .insert(errorData);

      if (dbError) {
        if (__DEV__) console.error('Error logging failed:', dbError);
      }

      // Development console
      if (__DEV__) {
        console.error('🐛 Error Tracked:', {
          type: error.name,
          message: error.message,
          severity,
          context,
        });
      }
    } catch (err) {
      if (__DEV__) console.error('Error tracking system failed:', err);
    }
  }

  /**
   * Log API error
   * @param {object} error - API error
   * @param {string} endpoint - API endpoint
   */
  async logAPIError(error, endpoint) {
    await this.logError(error, {
      type: 'API_ERROR',
      endpoint,
      status: error.status,
    }, 'high');
  }

  /**
   * Log UI error (for error boundaries)
   * @param {Error} error - React error
   * @param {object} errorInfo - React error info
   */
  async logUIError(error, errorInfo) {
    await this.logError(error, {
      type: 'UI_ERROR',
      componentStack: errorInfo.componentStack,
    }, 'high');
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Unhandled Promise rejections
    if (typeof Promise !== 'undefined') {
      Promise.prototype.catch = new Proxy(Promise.prototype.catch, {
        apply: (target, thisArg, argumentsList) => {
          const [onRejected] = argumentsList;
          const wrappedOnRejected = (error) => {
            this.logError(error, { type: 'UNHANDLED_PROMISE' }, 'high');
            if (onRejected) return onRejected(error);
            throw error;
          };
          return Reflect.apply(target, thisArg, [wrappedOnRejected]);
        },
      });
    }

    // Global error handler
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.logError(error, {
        type: 'GLOBAL_ERROR',
        isFatal,
      }, isFatal ? 'critical' : 'high');
    });
  }

  /**
   * Get error stats for a user
   * @param {string} userId - User ID
   * @returns {Promise<object>} Error stats
   */
  async getUserErrorStats(userId) {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('error_type, severity, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const stats = {
        totalErrors: data.length,
        bySeverity: {},
        byType: {},
      };

      data.forEach(log => {
        stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
        stats.byType[log.error_type] = (stats.byType[log.error_type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      if (__DEV__) console.error('Get error stats failed:', error);
      return null;
    }
  }
}

// 🚀 SINGLETON INSTANCE
const errorTracking = new ErrorTracking();

export default errorTracking;

// 🔧 CONVENIENCE FUNCTIONS
export const logError = (error, context, severity) =>
  errorTracking.logError(error, context, severity);

export const logAPIError = (error, endpoint) =>
  errorTracking.logAPIError(error, endpoint);

export const logUIError = (error, errorInfo) =>
  errorTracking.logUIError(error, errorInfo);

export const setupErrorTracking = () =>
  errorTracking.setupGlobalHandlers();

