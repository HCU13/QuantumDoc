import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, BORDER_RADIUS, TEXT_STYLES } from '@/constants/theme';

interface ChipProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress: () => void;
  flex?: boolean; // Scroll içinde kullanılıyorsa false olmalı
  modulePrimary?: string; // Modül primary rengi
  moduleLight?: string; // Modül light rengi
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  selected = false,
  onPress,
  flex = true,
  modulePrimary,
  moduleLight,
}) => {
  const { colors } = useTheme();

  const primaryColor = modulePrimary || colors.primary;
  const lightColor = moduleLight || colors.primarySoft;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        flex ? styles.chipFlex : styles.chipAuto,
        {
          backgroundColor: selected ? lightColor : colors.surface,
          borderColor: selected ? primaryColor : colors.borderSubtle,
        },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={selected ? primaryColor : colors.textSecondary}
        />
      )}
      <Text
        style={[
          styles.chipText,
          {
            color: selected ? primaryColor : colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  chipFlex: {
    flex: 1,
  },
  chipAuto: {
    // Scroll içinde kullanıldığında flex yok, otomatik genişlik
  },
  chipText: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: '600',
    fontSize: 12,
  },
});

