import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';
import {
  subscribeToToast,
  getToastState,
  ToastState,
} from '@/utils/toast';
import { SPACING, BORDER_RADIUS, TEXT_STYLES, SHADOWS } from '@/constants/theme';

export const Toast: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [toast, setToast] = useState<ToastState>(getToastState());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    const unsubscribe = subscribeToToast((state) => {
      setToast(state);
      
      if (state.visible) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    return unsubscribe;
  }, []);

  if (!toast.visible) {
    return null;
  }

  const getIconName = () => {
    switch (toast.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.info;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          ...SHADOWS.small,
        },
      ]}
    >
      <Ionicons
        name={getIconName()}
        size={20}
        color={colors.textOnPrimary}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textOnPrimary }]}>
          {toast.title}
        </Text>
        {toast.message ? (
          <Text style={[styles.message, { color: colors.textOnPrimary }]}>
            {toast.message}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    zIndex: 9999,
  },
  content: {
    flex: 1,
  },
  title: {
    ...TEXT_STYLES.bodyMedium,
    fontWeight: '600',
  },
  message: {
    ...TEXT_STYLES.bodySmall,
    marginTop: 2,
    opacity: 0.9,
  },
});

