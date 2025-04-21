// src/utils/tokenUtils.js

/**
 * Token ile ilgili yardımcı fonksiyonlar
 */
const tokenUtils = {
  // Aynı gün içinde olup olmadığını kontrol et
  isSameDay: (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  },

  // Token maliyet hesaplama
  getFeatureCost: (featureId) => {
    const costs = {
      chat: 1,
      math: 2,
      write: 3,
      translate: 1,
      tasks: 0, // ücretsiz
      voice: 2,
      notes: 1,
      calendar: 1,
    };

    return costs[featureId] || 1;
  },

  // İnsan-okunabilir formatta token sayısı
  formatTokenCount: (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  },
};

export { tokenUtils };
