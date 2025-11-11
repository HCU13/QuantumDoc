// utils/activityLogger.js
// Aktivite kaydetme utility fonksiyonu (circular dependency olmaması için ayrı dosya)

import { supabase } from '../services/supabase';

/**
 * Kullanıcı aktivitesi kaydet
 * @param {string} userId - Kullanıcı ID
 * @param {string} activityType - Aktivite tipi (chat, math, news_read, etc.)
 * @param {string} title - Aktivite başlığı
 * @param {string} description - Aktivite açıklaması (opsiyonel)
 * @param {object} metadata - Ek bilgiler (opsiyonel)
 * @returns {Promise<object|null>} - Kaydedilen aktivite veya null
 */
export const logActivity = async (userId, activityType, title, description = '', metadata = {}) => {
  if (!userId) {
    if (__DEV__) console.warn('⚠️ Activity Log: userId is required');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        title,
        description,
        metadata
      })
      .select()
      .single();

    if (error) {
      if (__DEV__) console.error('❌ Activity Log Error:', error);
      return null;
    }

    return data;
  } catch (error) {
    if (__DEV__) console.error('❌ Activity Log Exception:', error);
    return null;
  }
};

export default { logActivity };

