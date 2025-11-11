// 🪙 TOKEN EARNINGS SERVICE
// Token kazanım işlemlerini yönetir (günlük giriş, reklam izleme, görevler)
// Günlük limitler user_daily_stats tablosunda tutulur

import { supabase } from './supabase';
import analytics from './analytics';

/**
 * Türkiye saatine göre bugünün tarihini al (YYYY-MM-DD)
 * Türkiye saati UTC+3 olduğu için UTC'ye 3 saat eklenir
 * Yeni gün 03:00'da başlar (cron job ile uyumlu)
 */
const getTurkeyDate = () => {
  const now = new Date();
  // UTC saatini al
  const utcHours = now.getUTCHours();
  const utcDate = now.getUTCDate();
  const utcMonth = now.getUTCMonth();
  const utcYear = now.getUTCFullYear();
  
  // Türkiye saati = UTC + 3 saat
  let turkeyHours = utcHours + 3;
  let turkeyDate = utcDate;
  let turkeyMonth = utcMonth;
  let turkeyYear = utcYear;
  
  // Saat 24'ü geçerse bir sonraki güne geç
  if (turkeyHours >= 24) {
    turkeyHours -= 24;
    turkeyDate += 1;
    // Ay sonunu kontrol et (basitleştirilmiş)
    const daysInMonth = new Date(turkeyYear, turkeyMonth + 1, 0).getDate();
    if (turkeyDate > daysInMonth) {
      turkeyDate = 1;
      turkeyMonth += 1;
      if (turkeyMonth > 11) {
        turkeyMonth = 0;
        turkeyYear += 1;
      }
    }
  }
  
  // Eğer Türkiye saati 03:00'dan önceyse dünü kullan (yeni gün 03:00'da başlar)
  if (turkeyHours < 3) {
    // Dünün tarihini al
    turkeyDate -= 1;
    if (turkeyDate < 1) {
      turkeyMonth -= 1;
      if (turkeyMonth < 0) {
        turkeyMonth = 11;
        turkeyYear -= 1;
      }
      turkeyDate = new Date(turkeyYear, turkeyMonth + 1, 0).getDate();
    }
  }
  
  // YYYY-MM-DD formatına çevir
  const monthStr = String(turkeyMonth + 1).padStart(2, '0');
  const dateStr = String(turkeyDate).padStart(2, '0');
  return `${turkeyYear}-${monthStr}-${dateStr}`;
};

/**
 * Kullanıcının bugünkü daily stats'ını al veya oluştur
 * Türkiye saatine göre bugünün tarihini kullanır (yeni gün 03:00'da başlar)
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<Object>} Daily stats objesi
 */
const getOrCreateDailyStats = async (userId) => {
  const today = getTurkeyDate(); // Türkiye saatine göre bugünün tarihi

  // Bugünkü kaydı al
  const { data: existingStats, error: fetchError } = await supabase
    .from('user_daily_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('stats_date', today)
    .single();

  // Eğer kayıt varsa döndür
  if (existingStats && !fetchError) {
    return existingStats;
  }

  // Eğer kayıt yoksa oluştur (veya hata varsa)
  const { data: newStats, error: insertError } = await supabase
    .from('user_daily_stats')
    .insert({
      user_id: userId,
      stats_date: today,
      ads_watched: 0,
      daily_login_claimed: false,
      login_streak: 0,
      last_login_date: null,
    })
    .select()
    .single();

  if (insertError) {
    // Eğer unique constraint hatası varsa (race condition), tekrar dene
    if (insertError.code === '23505') {
      const { data: retryStats } = await supabase
        .from('user_daily_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('stats_date', today)
        .single();
      return retryStats || { ads_watched: 0, daily_login_claimed: false, login_streak: 0 };
    }
    console.error('[TokenEarnings] Daily stats oluşturma hatası:', insertError);
    return { ads_watched: 0, daily_login_claimed: false, login_streak: 0, last_login_date: null };
  }

  return newStats || { ads_watched: 0, daily_login_claimed: false, login_streak: 0, last_login_date: null };
};

/**
 * Kullanıcı istatistiklerini güncelle
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} statType - İstatistik tipi ('daily_login', 'streak_7', 'video_watched')
 */
const updateUserStatistics = async (userId, statType) => {
  try {
    // Önce kayıt var mı kontrol et
    const { data: existingStats } = await supabase
      .from('user_statistics')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingStats) {
      // Kayıt yoksa oluştur
      const { error: insertError } = await supabase
        .from('user_statistics')
        .insert({ user_id: userId });
      
      if (insertError && insertError.code !== '23505') {
        console.warn('[TokenEarnings] İstatistik kaydı oluşturulamadı:', insertError);
      }
    }

    // İstatistiği güncelle - mevcut değeri al ve artır
    const { data: currentStats } = await supabase
      .from('user_statistics')
      .select('total_daily_logins, total_streak_7_completed, total_videos_watched')
      .eq('user_id', userId)
      .single();

    if (currentStats) {
      const updates = {};
      if (statType === 'daily_login') {
        updates.total_daily_logins = (currentStats.total_daily_logins || 0) + 1;
      } else if (statType === 'streak_7') {
        updates.total_streak_7_completed = (currentStats.total_streak_7_completed || 0) + 1;
      } else if (statType === 'video_watched') {
        updates.total_videos_watched = (currentStats.total_videos_watched || 0) + 1;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('user_statistics')
          .update(updates)
          .eq('user_id', userId);
      }
    }
  } catch (error) {
    console.warn('[TokenEarnings] İstatistik güncelleme hatası:', error);
  }
};

/**
 * Kullanıcıya token ekle (kazanım için)
 * @param {string} userId - Kullanıcı ID'si
 * @param {number} amount - Kazanılan token miktarı
 * @param {string} earningType - Kazanım tipi ('daily_login', 'ad_reward', 'mission_complete', etc.)
 * @param {Object} metadata - Ek bilgiler (opsiyonel)
 */
export const earnTokens = async (userId, amount, earningType, metadata = {}) => {
  try {
    // Mevcut token sayısını al
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const currentTokens = profile?.tokens || 0;
    const newTokens = currentTokens + amount;

    // Token'ları güncelle
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        tokens: newTokens,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Token transaction kaydı oluştur
    const { error: txError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: 'reward',
        description: getEarningDescription(earningType, amount),
        reference_type: earningType,
        metadata: {
          earningType,
          ...metadata
        },
      });

    if (txError) {
      console.warn('[TokenEarnings] Transaction kaydı oluşturulamadı:', txError);
    }

    // Analytics event
    await analytics.trackTokenEvent('earn', amount, {
      earningType,
      ...metadata
    });

    return { success: true, newBalance: newTokens };
  } catch (error) {
    console.error('[TokenEarnings] Token kazanım hatası:', error);
    throw error;
  }
};

/**
 * Kazanım tipine göre açıklama oluştur
 */
const getEarningDescription = (earningType, amount) => {
  const descriptions = {
    daily_login: `Günlük giriş ödülü: +${amount} token`,
    ad_reward: `Reklam izleme ödülü: +${amount} token`,
    mission_complete: `Görev tamamlama ödülü: +${amount} token`,
    streak_reward: `Seri ödülü: +${amount} token`,
    share_app: `Uygulama paylaşım ödülü: +${amount} token`,
    feedback: `Geri bildirim ödülü: +${amount} token`,
  };
  
  return descriptions[earningType] || `Token kazanımı: +${amount} token`;
};

/**
 * Bugün reklam izlenme sayısını al
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<number>} Bugün izlenen reklam sayısı
 */
export const getTodayAdWatchCount = async (userId) => {
  try {
    const stats = await getOrCreateDailyStats(userId);
    return stats.ads_watched || 0;
  } catch (error) {
    console.error('[TokenEarnings] Reklam sayısı sorgulama hatası:', error);
    return 0;
  }
};

/**
 * Reklam izleme sayısını artır (günde max 5)
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<{success: boolean, currentCount: number, limitReached: boolean}>}
 */
export const incrementAdWatchCount = async (userId) => {
  try {
    const today = getTurkeyDate(); // Türkiye saatine göre bugünün tarihi
    const stats = await getOrCreateDailyStats(userId);

    // Limit kontrolü
    if (stats.ads_watched >= 5) {
      return { success: false, currentCount: stats.ads_watched, limitReached: true };
    }

    // Reklam sayısını artır
    const { data: updatedStats, error } = await supabase
      .from('user_daily_stats')
      .update({
        ads_watched: (stats.ads_watched || 0) + 1,
      })
      .eq('user_id', userId)
      .eq('stats_date', today)
      .select()
      .single();

    if (error) throw error;

    // Toplam video izleme istatistiğini güncelle
    await updateUserStatistics(userId, 'video_watched');

    return {
      success: true,
      currentCount: updatedStats.ads_watched,
      limitReached: updatedStats.ads_watched >= 5,
    };
  } catch (error) {
    console.error('[TokenEarnings] Reklam sayısı artırma hatası:', error);
    throw error;
  }
};

/**
 * Günlük giriş ödülünü kontrol et ve ver
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<{claimed: boolean, tokens?: number, newBalance?: number}>}
 */
export const claimDailyLoginReward = async (userId) => {
  try {
    const today = getTurkeyDate(); // Türkiye saatine göre bugünün tarihi
    const stats = await getOrCreateDailyStats(userId);

    // Bugün zaten ödül alınmış mı?
    if (stats.daily_login_claimed) {
      return { claimed: true };
    }

    // Önceki günün kaydını al (streak hesaplamak için)
    // Türkiye saatine göre dünün tarihini hesapla
    const todayTurkey = getTurkeyDate(); // Bugünün Türkiye tarihi
    const [year, month, day] = todayTurkey.split('-').map(Number);
    const todayDate = new Date(year, month - 1, day);
    
    // Dünün tarihini hesapla
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    
    // YYYY-MM-DD formatına çevir
    const yesterdayYear = yesterdayDate.getFullYear();
    const yesterdayMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
    const yesterdayDay = String(yesterdayDate.getDate()).padStart(2, '0');
    const yesterdayStr = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

    const { data: yesterdayStats } = await supabase
      .from('user_daily_stats')
      .select('login_streak, last_login_date')
      .eq('user_id', userId)
      .eq('stats_date', yesterdayStr)
      .single();

    // Streak hesapla
    let newStreak = 1;
    if (yesterdayStats?.last_login_date === yesterdayStr) {
      // Dün giriş yapılmış, seriyi devam ettir
      newStreak = (yesterdayStats.login_streak || 0) + 1;
    } else {
      // Dün giriş yapılmamış, sıfırla
      newStreak = 1;
    }

    // Token ödülünü DB'den al
    const { data: tokenCostData, error: costError } = await supabase
      .from('module_token_costs')
      .select('token_cost')
      .eq('module_id', 'daily_login')
      .eq('is_active', true)
      .single();
    
    const tokenReward = tokenCostData?.token_cost || 1; // Fallback: 1 token

    // Ödül ver
    const result = await earnTokens(userId, tokenReward, 'daily_login', {
      date: today,
      streak: newStreak,
    });

    // Daily stats'ı güncelle
    const { error: updateError } = await supabase
      .from('user_daily_stats')
      .update({
        daily_login_claimed: true,
        login_streak: newStreak,
        last_login_date: today,
      })
      .eq('user_id', userId)
      .eq('stats_date', today);

    if (updateError) {
      console.warn('[TokenEarnings] Daily stats güncelleme hatası:', updateError);
    }

    // Toplam günlük giriş istatistiğini güncelle
    await updateUserStatistics(userId, 'daily_login');

    return { claimed: false, tokens: tokenReward, newBalance: result.newBalance, streak: newStreak };
  } catch (error) {
    console.error('[TokenEarnings] Günlük giriş ödülü hatası:', error);
    throw error;
  }
};

/**
 * Streak (seri) bilgisini al
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<{streak: number, lastLoginDate: string}>}
 */
export const getLoginStreak = async (userId) => {
  try {
    const stats = await getOrCreateDailyStats(userId);
    
    return {
      streak: stats.login_streak || 0,
      lastLoginDate: stats.last_login_date || null,
    };
  } catch (error) {
    console.error('[TokenEarnings] Streak sorgulama hatası:', error);
    return { streak: 0, lastLoginDate: null };
  }
};

/**
 * Bugün günlük giriş ödülü alınmış mı kontrol et
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<boolean>}
 */
export const isDailyLoginClaimed = async (userId) => {
  try {
    const stats = await getOrCreateDailyStats(userId);
    return stats.daily_login_claimed || false;
  } catch (error) {
    console.error('[TokenEarnings] Günlük giriş kontrolü hatası:', error);
    return false;
  }
};


export default {
  earnTokens,
  getTodayAdWatchCount,
  incrementAdWatchCount,
  claimDailyLoginReward,
  getLoginStreak,
  isDailyLoginClaimed,
};
