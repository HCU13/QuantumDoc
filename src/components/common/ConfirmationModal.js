import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { FONTS, SIZES } from '../../constants/theme';

const ConfirmationModal = ({
  visible = false,
  onClose,
  onConfirm,
  title = "Onay",
  message = "Bu işlemi gerçekleştirmek istediğinizden emin misiniz?",
  confirmText = "Evet",
  cancelText = "İptal",
  type = "warning", // warning, danger, info
  icon = null,
  loading = false,
}) => {
  const { colors, isDark } = useTheme();

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: colors.error || '#ef4444',
          iconName: 'warning',
          backgroundColor: isDark ? '#1f2937' : '#fef2f2',
          borderColor: colors.error || '#ef4444',
        };
      case 'info':
        return {
          iconColor: colors.primary,
          iconName: 'information-circle',
          backgroundColor: isDark ? '#1f2937' : '#eff6ff',
          borderColor: colors.primary,
        };
      default: // warning
        return {
          iconColor: '#f59e0b',
          iconName: 'alert-circle',
          backgroundColor: isDark ? '#1f2937' : '#fffbeb',
          borderColor: '#f59e0b',
        };
    }
  };

  const typeStyles = getTypeStyles();

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 40,
      maxWidth: 320,
      width: '85%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: typeStyles.backgroundColor,
      borderWidth: 2,
      borderColor: typeStyles.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      ...FONTS.h3,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
      fontWeight: 'bold',
    },
    message: {
      ...FONTS.body3,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: isDark ? '#374151' : '#f3f4f6',
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#d1d5db',
    },
    confirmButton: {
      backgroundColor: type === 'danger' ? (colors.error || '#ef4444') : colors.primary,
    },
    buttonText: {
      ...FONTS.body4,
      fontWeight: '600',
      fontSize: 13,
    },
    cancelButtonText: {
      color: colors.textPrimary,
    },
    confirmButtonText: {
      color: colors.white,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      ...FONTS.body4,
      color: colors.white,
      marginLeft: 8,
    },
  });

  const handleConfirm = () => {
    if (!loading && onConfirm) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!loading && onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              {icon ? (
                icon
              ) : (
                <Ionicons
                  name={typeStyles.iconName}
                  size={24}
                  color={typeStyles.iconColor}
                />
              )}
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="reload" size={16} color={colors.white} />
                  <Text style={styles.loadingText}>İşleniyor...</Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, styles.confirmButtonText]}>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal