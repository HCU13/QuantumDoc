// src/utils/userStorage.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

/**
 * Kullanıcı verilerini AsyncStorage'dan yönetmek için utility fonksiyonlar
 */
const userStorage = {
  /**
   * Tüm kullanıcı verilerini AsyncStorage'dan al
   */
  async getUserData() {
    try {
      const keys = [
        'user_email', 'user_id', 'user_full_name', 'user_phone', 'user_display_name',
        'access_token', 'refresh_token', 'expires_at',
        'email_confirmed', 'phone_confirmed', 'user_created_at', 'user_updated_at',
        'last_login_at', 'login_count', 'app_version', 'device_info'
      ];

      const values = await AsyncStorage.multiGet(keys);
      const userData = {};

      values.forEach(([key, value]) => {
        if (value !== null) {
          // Boolean değerleri dönüştür
          if (key === 'email_confirmed' || key === 'phone_confirmed') {
            userData[key] = value === 'true';
          }
          // Number değerleri dönüştür
          else if (key === 'login_count') {
            userData[key] = parseInt(value) || 0;
          }
          // Diğer değerler string olarak kalır
          else {
            userData[key] = value;
          }
        }
      });

      return userData;
    } catch (error) {
      if (__DEV__) console.error('❌ USER STORAGE: Get user data error:', error);
      return {};
    }
  },

  /**
   * Belirli bir kullanıcı verisini al
   */
  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      if (__DEV__) console.error(`❌ USER STORAGE: Get ${key} error:`, error);
      return null;
    }
  },

  /**
   * Kullanıcı verisini kaydet
   */
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value.toString());
      return true;
    } catch (error) {
      if (__DEV__) console.error(`❌ USER STORAGE: Set ${key} error:`, error);
      return false;
    }
  },

  /**
   * Kullanıcı verisini sil
   */
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      if (__DEV__) console.error(`❌ USER STORAGE: Remove ${key} error:`, error);
      return false;
    }
  },

  /**
   * Tüm kullanıcı verilerini temizle (logout için)
   */
  async clearUserData() {
    try {
      const keysToRemove = [
        'user_email', 'user_id', 'user_full_name', 'user_phone', 'user_display_name',
        'access_token', 'refresh_token', 'expires_at',
        'email_confirmed', 'phone_confirmed', 'user_created_at', 'user_updated_at',
        'last_login_at'
      ];

      // login_count'u silme, sadece diğer verileri temizle
      await AsyncStorage.multiRemove(keysToRemove);

      return true;
    } catch (error) {
      if (__DEV__) console.error('❌ USER STORAGE: Clear user data error:', error);
      return false;
    }
  },

  /**
   * Token'ın geçerli olup olmadığını kontrol et
   */
  async isTokenValid() {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const expiresAt = await AsyncStorage.getItem('expires_at');

      if (!accessToken || !expiresAt) {
        return false;
      }

      const isExpired = new Date(expiresAt) < new Date();
      return !isExpired;
    } catch (error) {
      if (__DEV__) console.error('❌ USER STORAGE: Token validation error:', error);
      return false;
    }
  },

  /**
   * Kullanıcının email doğrulayıp doğrulamadığını kontrol et
   */
  async isEmailConfirmed() {
    try {
      const emailConfirmed = await AsyncStorage.getItem('email_confirmed');
      return emailConfirmed === 'true';
    } catch (error) {
      if (__DEV__) console.error('❌ USER STORAGE: Email confirmation check error:', error);
      return false;
    }
  },

  /**
   * Son login zamanını al
   */
  async getLastLoginTime() {
    try {
      return await AsyncStorage.getItem('last_login_at');
    } catch (error) {
      if (__DEV__) console.error('❌ USER STORAGE: Get last login time error:', error);
      return null;
    }
  },

  /**
   * Login sayısını al
   */
  async getLoginCount() {
    try {
      const count = await AsyncStorage.getItem('login_count');
      return parseInt(count) || 0;
    } catch (error) {
      if (__DEV__) console.error('❌ USER STORAGE: Get login count error:', error);
      return 0;
    }
  },

  /**
   * Kullanıcı bilgilerini güncelle
   */
  async updateUserInfo(userInfo) {
    try {
      const updates = [];

      for (const [key, value] of Object.entries(userInfo)) {
        if (value !== undefined && value !== null) {
          updates.push([key, value.toString()]);
        }
      }

      await AsyncStorage.multiSet(updates);
      return true;
    } catch (error) {
      if (__DEV__) console.error('❌ USER STORAGE: Update user info error:', error);
      return false;
    }
  },

  /**
   * Profiles tablosundan kullanıcı verilerini al
   */
  async getProfileFromDatabase(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (__DEV__) console.error('❌ USER STORAGE: Get profile from database error:', error);
        return null;
      }

      return data;
    } catch (error) {
      if (__DEV__) console.error('❌ USER STORAGE: Get profile from database failed:', error);
      return null;
    }
  }
};

export default userStorage;
