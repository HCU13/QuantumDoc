import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, BORDER_RADIUS, TEXT_STYLES, SHADOWS } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: any;
  modulePrimary?: string; // Modül primary rengi
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  modulePrimary,
}) => {
  const { colors } = useTheme();
  
  const primaryColor = modulePrimary || colors.primary;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: SPACING.xs + 2,
          paddingHorizontal: SPACING.md,
          fontSize: TEXT_STYLES.bodySmall.fontSize,
        };
      case 'large':
        return {
          paddingVertical: SPACING.sm + 2,
          paddingHorizontal: SPACING.lg,
          fontSize: TEXT_STYLES.bodyLarge.fontSize,
        };
      default: // medium
        return {
          paddingVertical: SPACING.sm + 2,
          paddingHorizontal: SPACING.lg,
          fontSize: TEXT_STYLES.bodyMedium.fontSize,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
          borderWidth: 1,
          textColor: colors.textPrimary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: primaryColor,
          borderWidth: 1,
          textColor: primaryColor,
        };
      default: // primary
        return {
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          borderWidth: 0,
          textColor: colors.textOnPrimary,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: isDisabled
            ? colors.surfaceMuted
            : variantStyles.backgroundColor,
          borderColor: isDisabled
            ? colors.borderSubtle
            : variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: isDisabled ? 0.6 : 1,
          width: fullWidth ? '100%' : 'auto',
          ...SHADOWS.small,
        },
        style,
      ]}
    >
      {loading ? (
        <View style={styles.content}>
          <ActivityIndicator
            size="small"
            color={isDisabled ? colors.textTertiary : variantStyles.textColor}
          />
          <Text style={[styles.text, {
            color: isDisabled ? colors.textTertiary : variantStyles.textColor,
            fontSize: sizeStyles.fontSize,
            opacity: 0.7,
          }]}>
            {title}
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={20}
              color={
                isDisabled ? colors.textTertiary : variantStyles.textColor
              }
              style={styles.iconLeft}
            />
          )}

          <Text
            style={[
              styles.text,
              {
                color: isDisabled
                  ? colors.textTertiary
                  : variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
              },
            ]}
          >
            {title}
          </Text>

          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={20}
              color={
                isDisabled ? colors.textTertiary : variantStyles.textColor
              }
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  text: {
    ...TEXT_STYLES.labelLarge,
    fontWeight: '700',
  },
  iconLeft: {
    marginRight: -SPACING.xs,
  },
  iconRight: {
    marginLeft: -SPACING.xs,
  },
});

