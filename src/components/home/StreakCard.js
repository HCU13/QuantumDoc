import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT_STYLES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import useTheme from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import tokenEarnings from '../../services/tokenEarnings';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const StreakCard = ({ onPress }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadStreak = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const streakData = await tokenEarnings.getLoginStreak(user.id);
      setStreak(streakData.streak || 0);
    } catch (error) {
      console.error('[StreakCard] Streak yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  // Ana sayfa her focus olduğunda streak bilgisini yenile
  useFocusEffect(
    useCallback(() => {
      loadStreak();
    }, [loadStreak])
  );

  // Sonsuz streak - progress bar kaldırıldı

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.md,
    },
    card: {
      borderRadius: BORDER_RADIUS.lg,
      overflow: 'hidden',
      ...SHADOWS.medium,
    },
    gradient: {
      padding: SPACING.md,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    leftSection: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    title: {
      ...TEXT_STYLES.titleSmall,
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: SPACING.xs,
    },
    description: {
      ...TEXT_STYLES.bodySmall,
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 13,
      lineHeight: 18,
      marginBottom: SPACING.xs,
    },
    rightSection: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: SPACING.md,
      minWidth: 60,
    },
    flameIcon: {
      marginBottom: 4,
    },
    streakNumber: {
      ...TEXT_STYLES.titleLarge,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 28,
      lineHeight: 34,
    },
    streakLabel: {
      ...TEXT_STYLES.labelSmall,
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: 11,
      marginTop: 2,
      fontWeight: '500',
    },
  });

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View style={styles.titleRow}>
                <Ionicons name="flame" size={20} color="#FFFFFF" />
                <Text style={styles.title}>
                  {t('home.streak.title')}
                </Text>
              </View>
              
              <Text style={styles.description}>
                {streak > 0 
                  ? t('home.streak.descriptionActive')
                  : t('home.streak.description')
                }
              </Text>
            </View>

            <View style={styles.rightSection}>
              {streak > 0 ? (
                <>
                  <Ionicons
                    name="flame"
                    size={36}
                    color="#FFFFFF"
                    style={styles.flameIcon}
                  />
                  <Text style={styles.streakNumber}>{streak}</Text>
                  <Text style={styles.streakLabel}>
                    {t('home.streak.days')}
                  </Text>
                </>
              ) : (
                <Ionicons
                  name="calendar-outline"
                  size={32}
                  color="rgba(255, 255, 255, 0.7)"
                  style={styles.flameIcon}
                />
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default StreakCard;

