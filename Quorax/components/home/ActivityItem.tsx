import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, BORDER_RADIUS, TEXT_STYLES, SHADOWS } from '@/constants/theme';

export interface Activity {
  id: string;
  type: 'chat' | 'math' | 'calculator' | 'exam';
  title: string;
  timestamp: string;
  tokenCost?: number;
  problemImageUrl?: string;
  /** Sınav: konu | doğru/toplam (örn. "Türev | 3/5") */
  subtitle?: string;
}

interface ActivityItemProps {
  activity: Activity;
  onPress?: () => void;
}

const ACTIVITY_ICONS: Record<Activity['type'], string> = {
  chat: 'chatbubble-outline',
  math: 'calculator-outline',
  calculator: 'grid-outline',
  exam: 'document-text-outline',
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onPress }) => {
  const { colors } = useTheme();

  const interactive = !!onPress;

  const getActivityColor = (): { primary: string; light: string } => {
    const activityColors: Record<Activity['type'], { primary: string; light: string }> = {
      chat: { primary: '#8B5CF6', light: '#F3E8FF' },
      math: { primary: '#10B981', light: '#ECFDF5' },
      calculator: { primary: '#3B82F6', light: '#EFF6FF' },
      exam: { primary: '#F59E0B', light: '#FFF4E6' },
    };
    return activityColors[activity.type] || { primary: colors.primary, light: colors.primarySoft };
  };

  const activityColor = getActivityColor();

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderSubtle,
          opacity: interactive ? 1 : 0.7,
        },
        interactive ? styles.rowInteractive : null,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!interactive}
    >
      {/* Icon or Image */}
      {activity.type === 'math' && activity.problemImageUrl && 
       activity.problemImageUrl !== 'base64-image' &&
       (activity.problemImageUrl.startsWith('data:image') || 
        activity.problemImageUrl.startsWith('http://') || 
        activity.problemImageUrl.startsWith('https://')) ? (
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: activity.problemImageUrl }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: activityColor.light,
              borderColor: activityColor.light,
            },
          ]}
        >
          <Ionicons
            name={ACTIVITY_ICONS[activity.type] as any}
            size={16}
            color={activityColor.primary}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {activity.title}
        </Text>
        {activity.subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {activity.subtitle}
          </Text>
        ) : null}
        <Text style={[styles.timestamp, { color: colors.textTertiary }]} numberOfLines={1}>
          {activity.timestamp}
        </Text>
      </View>

      {/* Token */}
      {typeof activity.tokenCost === 'number' && activity.tokenCost > 0 ? (
        <View
          style={[
            styles.tokenPill,
            {
              backgroundColor: colors.cardSecondary,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Ionicons name="diamond-outline" size={12} color={activityColor.primary} />
          <Text style={[styles.tokenText, { color: activityColor.primary }]}>
            {activity.tokenCost}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  rowInteractive: {
    // çok hafif “premium” hissi; theme’de SHADOWS varsa kullan
    ...(SHADOWS?.xs ?? {}),
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
  },
  imageWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    marginRight: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    ...TEXT_STYLES.bodySmall,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 2,
    opacity: 0.9,
  },
  timestamp: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
    opacity: 0.8,
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  tokenText: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: '600',
    fontSize: 12,
  },
});
