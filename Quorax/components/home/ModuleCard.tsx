import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/services/supabase';
import { SPACING, BORDER_RADIUS, TEXT_STYLES, SHADOWS } from '@/constants/theme';
import type { Module } from '@/constants/modules';

interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
}

interface ModuleCardProps {
  module: Module;
  isLoggedIn?: boolean;
  onPress: () => void;
  usageInfo?: UsageInfo | null;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, isLoggedIn = false, onPress, usageInfo }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  
  // Token sistemi kaldırıldı - artık subscription bazlı
  const tokenCost = 0; // Artık token gösterme
  
  // Calculator is always available
  const isLocked = !isLoggedIn && module.id !== "calculator";

  const handlePress = () => {
    if (isLocked) {
      // Kilitli modüllere tıklandığında login sayfasına yönlendir
      router.push("/(main)/login");
      return;
    }
    onPress();
  };

  const isPrimary = !!module.isPrimary;
  const iconName = module.icon as keyof typeof Ionicons.glyphMap;
  const iconType = module.iconType || 'outline';
  
  const fullIconName =
    iconType === 'solid'
      ? (iconName as any)
      : ((String(iconName).endsWith('-outline') ? iconName : `${iconName}-outline`) as any);
  
  const getModuleColor = (): { primary: string; light: string; dark: string; iconBg: string; iconBgDark: string } => {
    const moduleColors: Record<string, { primary: string; light: string; dark: string; iconBg: string; iconBgDark: string }> = {
      chat: { 
        primary: '#8B5CF6', 
        light: '#F3E8FF', 
        dark: '#2D1B4E',
        iconBg: '#C4B5FD',
        iconBgDark: '#5B21B6'
      },
      math: { 
        primary: '#10B981', 
        light: '#ECFDF5', 
        dark: '#1A3A2E',
        iconBg: '#6EE7B7',
        iconBgDark: '#047857'
      },
      calculator: { 
        primary: '#3B82F6', 
        light: '#EFF6FF', 
        dark: '#1E3A5F',
        iconBg: '#93C5FD',
        iconBgDark: '#1E40AF'
      },
      'exam-lab': { 
        primary: '#F59E0B', 
        light: '#FFF4E6', 
        dark: '#3A2817',
        iconBg: '#FCD34D',
        iconBgDark: '#B45309'
      },
    };
    return moduleColors[module.id] || { 
      primary: colors.primary, 
      light: colors.primarySoft, 
      dark: colors.card,
      iconBg: colors.iconContainerPrimary,
      iconBgDark: colors.iconContainerPrimary
    };
  };
  
  const moduleColor = getModuleColor();
  const cardBackground = isPrimary
    ? (isDark ? moduleColor.dark : moduleColor.light)
    : (isDark ? moduleColor.dark : moduleColor.light);

  const getIconContainerBackground = (): string => {
    const mc = getModuleColor();
    return isPrimary
      ? (isDark ? mc.iconBgDark : mc.primary)
      : (isDark ? mc.iconBgDark : mc.iconBg);
  };

  const iconContainerBackground = getIconContainerBackground();

  if (isPrimary) {
    const primaryGradientLight = isDark ? moduleColor.dark : moduleColor.light;
    const primaryGradientAccent = isDark ? moduleColor.iconBgDark : moduleColor.primary;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        disabled={false}
        style={[styles.wrapperPrimary, isLocked && { opacity: 0.6 }]}
      >
        <LinearGradient
          colors={[primaryGradientLight, primaryGradientAccent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primaryCard, SHADOWS.small]}
        >
          <View style={styles.primaryContent}>
            <View style={styles.primaryHeader}>
              <View style={[styles.primaryIconWrap, { backgroundColor: moduleColor.primary }]}>
                <Ionicons
                  name={fullIconName}
                  size={20}
                  color={colors.textOnPrimary}
                />
              </View>

              {isLocked ? (
                <View style={[styles.primaryToken, { backgroundColor: colors.warning || "#F59E0B" }]}>
                  <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
                </View>
              ) : isLoggedIn && usageInfo ? (
                <View style={[styles.primaryToken, {
                  backgroundColor: usageInfo.remaining === 0 ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.12)",
                  borderWidth: 1,
                  borderColor: usageInfo.remaining === 0 ? "rgba(239,68,68,0.3)" : "rgba(0,0,0,0.08)",
                }]}>
                  <Ionicons
                    name={usageInfo.remaining === 0 ? "lock-closed" : "time-outline"}
                    size={11}
                    color={usageInfo.remaining === 0 ? "#EF4444" : colors.textSecondary}
                  />
                  <Text style={[styles.primaryTokenText, {
                    color: usageInfo.remaining === 0 ? "#EF4444" : colors.textSecondary,
                  }]}>
                    {usageInfo.used}/{usageInfo.limit}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.primaryTextContainer}>
              <Text
                style={[styles.primaryTitle, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {t(module.titleKey)}
              </Text>
              <Text
                style={[styles.primaryDesc, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {isLocked ? t("modules.locked") : t(module.descriptionKey)}
              </Text>
            </View>

            <View style={styles.primaryAction}>
              {isLocked
                ? <Ionicons name="lock-closed" size={18} color={colors.textSecondary} />
                : <Ionicons name="arrow-forward-circle" size={18} color={moduleColor.primary} />
              }
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      disabled={false}
      style={[styles.wrapperSecondary, isLocked && { opacity: 0.6 }]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardBackground,
            borderColor: isLocked ? colors.borderSubtle : colors.borderSubtle,
            borderWidth: 1,
            ...SHADOWS.subtle,
          },
        ]}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: iconContainerBackground,
              },
            ]}
          >
            <Ionicons
              name={fullIconName}
              size={20}
              color={isLocked ? colors.textTertiary : (isDark ? '#FFFFFF' : moduleColor.primary)}
            />
          </View>

          {isLocked ? (
            <View style={[styles.token, { backgroundColor: colors.warning || '#F59E0B' }]}>
              <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
            </View>
          ) : isLoggedIn && usageInfo ? (
            <View style={[styles.token, {
              backgroundColor: usageInfo.remaining === 0 ? "rgba(239,68,68,0.12)" : colors.surfaceMuted,
              borderWidth: 1,
              borderColor: usageInfo.remaining === 0 ? "rgba(239,68,68,0.25)" : "transparent",
            }]}>
              <Ionicons
                name={usageInfo.remaining === 0 ? "lock-closed" : "time-outline"}
                size={11}
                color={usageInfo.remaining === 0 ? "#EF4444" : colors.textSecondary}
              />
              <Text style={[styles.tokenText, {
                color: usageInfo.remaining === 0 ? "#EF4444" : colors.textSecondary,
              }]}>
                {usageInfo.used}/{usageInfo.limit}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Content */}
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {t(module.titleKey)}
          </Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={1}>
            {isLocked ? t("modules.locked") : t(module.descriptionKey)}
          </Text>

        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapperPrimary: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  primaryCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  primaryContent: {
    padding: SPACING.md,
  },
  primaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  primaryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryToken: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  primaryTokenText: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
    fontWeight: '700',
  },
  primaryTextContainer: {
    marginBottom: SPACING.xs,
  },
  primaryTitle: {
    ...TEXT_STYLES.titleMedium,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  primaryDesc: {
    ...TEXT_STYLES.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryAction: {
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
  wrapperSecondary: {
    width: 156,
    marginRight: SPACING.md,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  token: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  tokenText: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    ...TEXT_STYLES.bodyMedium,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  desc: {
    ...TEXT_STYLES.bodySmall,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
  },
});
