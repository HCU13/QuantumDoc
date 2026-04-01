/**
 * Reklam debug paneli - sadece development modunda görünür
 * Reklam sisteminin durumunu ve loglarını gösterir
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { isExpoGo, isTestAdEnv, getRewardedAdUnitId } from '@/constants/adConfig';
import { useAd } from '@/contexts/AdContext';
import { useAppAd } from '@/hooks/useAppAd';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTheme } from '@/contexts/ThemeContext';

export const AdDebugPanel: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const { isLoggedIn } = useAuth();
  const { isPremium } = useSubscription();
  const { canShowAd, isReady, isLoading, adError, loadAd } = useAppAd();
  const { showAdBeforeAction, tryShowIntervalAd } = useAd();

  // Sadece development modunda göster
  if (!__DEV__) {
    return null;
  }

  const handleTestAd = () => {
    showAdBeforeAction(() => {
      console.log('✅ Test ad completed successfully');
    });
  };

  const handleTestIntervalAd = () => {
    tryShowIntervalAd();
  };

  const handleLoadAd = async () => {
    console.log('📺 Manual ad load triggered from debug panel');
    try {
      await loadAd();
      console.log('✅ Manual ad load successful');
    } catch (error) {
      console.error('❌ Manual ad load failed:', error);
    }
  };

  const statusColor = isReady ? '#10B981' : isLoading ? '#F59E0B' : '#EF4444';
  const statusText = isReady ? 'Hazır' : isLoading ? 'Yükleniyor...' : 'Hazır Değil';

  return (
    <>
      {/* Floating Debug Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.primary }]}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="bug" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Debug Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="bug" size={24} color={colors.primary} />
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Reklam Debug
                </Text>
              </View>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Status Card */}
              <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                  Durum
                </Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                    {statusText}
                  </Text>
                </View>
                {adError && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    Hata: {adError}
                  </Text>
                )}
              </View>

              {/* Environment Card */}
              <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                  Ortam Bilgisi
                </Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
                    Platform:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                    {isExpoGo ? 'Expo Go (Mock)' : 'Native Build'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
                    Reklam Modu:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                    {isTestAdEnv ? 'Test Reklamları' : 'Production Reklamları'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
                    Ad Unit ID:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.textSecondary }]} numberOfLines={1}>
                    {getRewardedAdUnitId()}
                  </Text>
                </View>
              </View>

              {/* User Status Card */}
              <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                  Kullanıcı Durumu
                </Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
                    Giriş Yapıldı:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                    {isLoggedIn ? 'Evet' : 'Hayır'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
                    Premium:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                    {isPremium ? 'Evet' : 'Hayır'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
                    Reklam Göster:
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                    {canShowAd ? 'Evet' : 'Hayır (Premium)'}
                  </Text>
                </View>
              </View>

              {/* Test Buttons */}
              <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                  Test İşlemleri
                </Text>
                <TouchableOpacity
                  style={[styles.testButton, { 
                    backgroundColor: isReady ? colors.primary : '#6B7280',
                    opacity: isReady ? 1 : 0.6
                  }]}
                  onPress={handleTestAd}
                  disabled={!canShowAd || !isReady}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play-circle" size={20} color="#fff" />
                  <Text style={styles.testButtonText}>
                    Ödüllü Reklam Göster {!isReady && '(Hazır Değil)'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: '#8B5CF6' }]}
                  onPress={handleLoadAd}
                  disabled={!canShowAd || isLoading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.testButtonText}>
                    Reklam Yükle {isLoading && '(Yükleniyor...)'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: colors.secondary }]}
                  onPress={handleTestIntervalAd}
                  disabled={!canShowAd}
                  activeOpacity={0.8}
                >
                  <Ionicons name="time" size={20} color="#fff" />
                  <Text style={styles.testButtonText}>
                    Aralık Reklamı Göster
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View style={[styles.infoBox, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoBoxText, { color: colors.textSecondary }]}>
                  {isExpoGo
                    ? 'Expo Go\'da çalışıyorsunuz. Gerçek reklamlar gösterilmez, sadece mock simülasyon çalışır.'
                    : isTestAdEnv
                    ? 'Test modu aktif. Google test reklamları gösterilir.'
                    : 'Production modu. Gerçek reklamlar gösterilir.'}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoBoxText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
