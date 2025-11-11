import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TEXT_STYLES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import useTheme from '../../hooks/useTheme';
import Input from './Input';
import Button from './Button';
import { useSupport } from '../../hooks/useSupport';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import tokenEarnings from '../../services/tokenEarnings';
import { showSuccess, showError } from '../../utils/toast';
import { supabase } from '../../services/supabase';

const FeedbackModal = ({ visible, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { createTicket, loading } = useSupport();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    rating: null,
    type: null,
  });

  const [errors, setErrors] = useState({});

  const ratings = [
    { id: 5, label: t('profile.tokens.feedback.excellent', 'Mükemmel'), icon: 'star', color: '#22C55E' },
    { id: 4, label: t('profile.tokens.feedback.good', 'İyi'), icon: 'star', color: '#3B82F6' },
    { id: 3, label: t('profile.tokens.feedback.average', 'Orta'), icon: 'star', color: '#F59E0B' },
    { id: 2, label: t('profile.tokens.feedback.poor', 'Kötü'), icon: 'star', color: '#EF4444' },
    { id: 1, label: t('profile.tokens.feedback.veryPoor', 'Çok Kötü'), icon: 'star', color: '#DC2626' },
  ];

  const feedbackTypes = [
    { id: 'bug', label: t('profile.tokens.feedback.bug', 'Hata/Bug'), icon: 'bug-outline' },
    { id: 'suggestion', label: t('profile.tokens.feedback.suggestion', 'Öneri'), icon: 'bulb-outline' },
    { id: 'improvement', label: t('profile.tokens.feedback.improvement', 'İyileştirme'), icon: 'trending-up-outline' },
    { id: 'other', label: t('profile.tokens.feedback.other', 'Diğer'), icon: 'chatbubble-outline' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    placeholder: {
      width: 40,
    },
    scrollContent: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
      marginTop: SPACING.md,
    },
    ratingContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    ratingOption: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginHorizontal: 4,
    },
    ratingOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    ratingIcon: {
      marginBottom: 4,
    },
    ratingLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      marginTop: 4,
    },
    ratingLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    typeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    typeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      minWidth: '45%',
    },
    typeOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    typeIcon: {
      marginRight: 6,
    },
    typeLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    typeLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    helperText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
      lineHeight: 18,
    },
    buttonContainer: {
      marginTop: SPACING.md,
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = t('profile.tokens.feedback.errors.subjectRequired', 'Konu gereklidir');
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = t('profile.tokens.feedback.errors.subjectMinLength', 'Konu en az 5 karakter olmalıdır');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('profile.tokens.feedback.errors.messageRequired', 'Mesaj gereklidir');
    } else if (formData.message.trim().length < 20) {
      newErrors.message = t('profile.tokens.feedback.errors.messageMinLength', 'Mesaj en az 20 karakter olmalıdır');
    }

    if (!formData.type) {
      newErrors.type = t('profile.tokens.feedback.errors.typeRequired', 'Geri bildirim tipi seçilmelidir');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Destek ticket'ı oluştur
      const typeLabel = feedbackTypes.find(t => t.id === formData.type)?.label || formData.type;
      const ratingLabel = formData.rating ? ratings.find(r => r.id === formData.rating)?.label : 'Belirtilmedi';
      
      const ticketSubject = `[Geri Bildirim - ${typeLabel}] ${formData.subject}`;
      const ticketMessage = `Değerlendirme: ${ratingLabel}\n\nTip: ${typeLabel}\n\nMesaj:\n${formData.message}`;
      
      const result = await createTicket({
        subject: ticketSubject,
        message: ticketMessage,
        priority: 'medium',
      });

      if (result.success && user?.id) {
        // Token ödülü ver (sadece ilk geri bildirim için - tüm zamanlar için kontrol)
        try {
          // Daha önce hiç geri bildirim token'ı alınmış mı kontrol et
          const { data: previousFeedback, error: checkError } = await supabase
            .from('token_transactions')
            .select('id')
            .eq('user_id', user.id)
            .eq('reference_type', 'feedback')
            .limit(1)
            .maybeSingle();

          if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 = no rows returned (normal durum)
            console.error('[FeedbackModal] Token kontrol hatası:', checkError);
          }

          if (!previousFeedback) {
            // İlk geri bildirim, token ödülü ver
            await tokenEarnings.earnTokens(
              user.id,
              5,
              'feedback',
              { ticketId: result.ticket?.id, rating: formData.rating, type: formData.type }
            );

            Alert.alert(
              t('profile.tokens.feedback.success.title', 'Teşekkürler!'),
              t('profile.tokens.feedback.success.message', 'Geri bildiriminiz için +5 token kazandınız! 🎉'),
              [
                {
                  text: t('common.ok', 'Tamam'),
                  onPress: () => {
                    setFormData({ subject: '', message: '', rating: null, type: null });
                    setErrors({});
                    onClose();
                    if (onSuccess) onSuccess(true);
                  },
                },
              ]
            );
          } else {
            Alert.alert(
              t('profile.tokens.feedback.success.title', 'Teşekkürler!'),
              t('profile.tokens.feedback.success.messageNoToken', 'Geri bildiriminiz için teşekkürler!'),
              [
                {
                  text: t('common.ok', 'Tamam'),
                  onPress: () => {
                    setFormData({ subject: '', message: '', rating: null, type: null });
                    setErrors({});
                    onClose();
                    if (onSuccess) onSuccess(false);
                  },
                },
              ]
            );
          }
        } catch (tokenError) {
          console.error('[FeedbackModal] Token ödülü hatası:', tokenError);
          Alert.alert(
            t('profile.tokens.feedback.success.title', 'Teşekkürler!'),
            t('profile.tokens.feedback.success.messageNoToken', 'Geri bildiriminiz için teşekkürler!'),
            [
              {
                text: t('common.ok', 'Tamam'),
                onPress: () => {
                  setFormData({ subject: '', message: '', rating: null, type: null });
                  setErrors({});
                  onClose();
                  if (onSuccess) onSuccess(false);
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('[FeedbackModal] Submit error:', error);
      Alert.alert(
        t('common.error', 'Hata'),
        t('profile.tokens.feedback.errors.sendError', 'Geri bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'),
        [{ text: t('common.ok', 'Tamam') }]
      );
    }
  };

  const handleClose = () => {
    setFormData({ subject: '', message: '', rating: null, type: null });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {t('profile.tokens.feedback.title', 'Geri Bildirim Ver')}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Rating */}
            <Text style={styles.sectionTitle}>
              {t('profile.tokens.feedback.rating', 'Uygulamayı Değerlendir')}
            </Text>
            <View style={styles.ratingContainer}>
              {ratings.map((rating) => (
                <TouchableOpacity
                  key={rating.id}
                  style={[
                    styles.ratingOption,
                    formData.rating === rating.id && styles.ratingOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, rating: rating.id })}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={formData.rating === rating.id ? 'star' : 'star-outline'}
                    size={20}
                    color={formData.rating === rating.id ? rating.color : colors.textSecondary}
                    style={styles.ratingIcon}
                  />
                  <Text
                    style={[
                      styles.ratingLabel,
                      formData.rating === rating.id && styles.ratingLabelActive,
                    ]}
                    numberOfLines={2}
                  >
                    {rating.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Feedback Type */}
            <Text style={styles.sectionTitle}>
              {t('profile.tokens.feedback.type', 'Geri Bildirim Tipi')}
            </Text>
            <View style={styles.typeContainer}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    formData.type === type.id && styles.typeOptionActive,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, type: type.id });
                    if (errors.type) {
                      setErrors({ ...errors, type: null });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={formData.type === type.id ? colors.primary : colors.textSecondary}
                    style={styles.typeIcon}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      formData.type === type.id && styles.typeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.type && (
              <Text style={{ fontSize: 12, color: colors.error || '#EF4444', marginTop: -SPACING.sm, marginBottom: SPACING.sm }}>
                {errors.type}
              </Text>
            )}

            {/* Subject */}
            <Input
              label={t('profile.tokens.feedback.subject', 'Konu')}
              value={formData.subject}
              onChangeText={(text) => {
                setFormData({ ...formData, subject: text });
                if (errors.subject) {
                  setErrors({ ...errors, subject: null });
                }
              }}
              placeholder={t('profile.tokens.feedback.subjectPlaceholder', 'Geri bildirim konusu...')}
              icon={<Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />}
              error={errors.subject}
              autoCapitalize="sentences"
              autoCorrect={true}
            />

            {/* Message */}
            <Input
              label={t('profile.tokens.feedback.message', 'Detaylar')}
              value={formData.message}
              onChangeText={(text) => {
                setFormData({ ...formData, message: text });
                if (errors.message) {
                  setErrors({ ...errors, message: null });
                }
              }}
              placeholder={t('profile.tokens.feedback.messagePlaceholder', 'Geri bildiriminizi detaylı olarak yazın...')}
              icon={<Ionicons name="create-outline" size={20} color={colors.textSecondary} />}
              error={errors.message}
              multiline={true}
              autoCapitalize="sentences"
              autoCorrect={true}
            />

            {/* Helper Text */}
            <Text style={styles.helperText}>
              {t('profile.tokens.feedback.helperText', 'Geri bildiriminiz bizim için çok değerli! İlk geri bildiriminiz için 5 token kazanacaksınız.')}
            </Text>

            {/* Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={t('profile.tokens.feedback.submit', 'Gönder')}
                gradient
                icon={<Ionicons name="send-outline" size={18} color="#fff" />}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
              />
            </View>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FeedbackModal;
