import { genConfig } from '@zamplyy/react-native-nice-avatar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

/**
 * Avatar objesini JSON string'e çevir
 */
export const avatarToString = (avatarObj) => {
  return JSON.stringify(avatarObj);
};

/**
 * JSON string'i avatar objesine çevir
 */
export const stringToAvatar = (avatarString) => {
  try {
    if (!avatarString || typeof avatarString !== 'string') {
      return null;
    }
    const parsed = JSON.parse(avatarString);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    if (__DEV__) console.error('❌ AVATAR: Parse error:', error);
    return null;
  }
};

/**
 * Register için avatar seçenekleri oluştur
 */
export const generateAvatarOptions = (count = 24) => {
  return Array.from({ length: count }, (_, index) => genConfig({ seed: index }));
};

/**
 * Kullanıcının avatar'ını al (AsyncStorage'dan)
 */
export const getUserAvatar = async (userId) => {
  try {
    // AsyncStorage'dan avatar_url'yi al
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.avatar_url) {
        return stringToAvatar(parsed.avatar_url);
      }
    }

    // Eğer avatar yoksa null döndür
    return null;
  } catch (error) {
    if (__DEV__) console.error('❌ AVATAR: Get user avatar error:', error);
    return null;
  }
};

/**
 * Kullanıcının avatar'ını güncelle (AsyncStorage ve Supabase)
 */
export const updateUserAvatar = async (userId, newAvatar) => {
  try {
    const avatarString = avatarToString(newAvatar);

    // AsyncStorage'ı güncelle
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      parsed.avatar_url = avatarString;
      await AsyncStorage.setItem('userData', JSON.stringify(parsed));
    }

    // Supabase profiles tablosunu güncelle
    const { error } = await supabase
      .from('profiles')
      .update({
        avatar_url: avatarString,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      if (__DEV__) console.warn('⚠️ AVATAR: Could not update profiles table:', error);
    }

    return true;
  } catch (error) {
    if (__DEV__) console.error('❌ AVATAR: Update error:', error);
    return false;
  }
};

