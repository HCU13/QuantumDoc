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

const SupportTicketModal = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { createTicket, loading } = useSupport();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  });

  const [errors, setErrors] = useState({});

  const priorities = [
    { id: 'low', label: t('profile.help.priorityLow'), icon: 'arrow-down-circle-outline', color: '#22C55E' },
    { id: 'medium', label: t('profile.help.priorityMedium'), icon: 'remove-circle-outline', color: '#F59E0B' },
    { id: 'high', label: t('profile.help.priorityHigh'), icon: 'arrow-up-circle-outline', color: '#EF4444' },
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
    priorityContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    priorityOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginHorizontal: 4,
    },
    priorityOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    priorityLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 6,
      fontWeight: '500',
    },
    priorityLabelActive: {
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
      newErrors.subject = t('profile.help.errors.subjectRequired');
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = t('profile.help.errors.subjectMinLength');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('profile.help.errors.messageRequired');
    } else if (formData.message.trim().length < 20) {
      newErrors.message = t('profile.help.errors.messageMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await createTicket(formData);
      
      if (result.success) {
        Alert.alert(
          t('profile.help.success.title'),
          t('profile.help.success.message'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                setFormData({ subject: '', message: '', priority: 'medium' });
                setErrors({});
                onClose();
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('profile.help.errors.sendError'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleClose = () => {
    setFormData({ subject: '', message: '', priority: 'medium' });
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
            <Text style={styles.title}>{t('profile.help.sendTicket')}</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Subject */}
            <Input
              label={t('profile.help.subject')}
              value={formData.subject}
              onChangeText={(text) => {
                setFormData({ ...formData, subject: text });
                if (errors.subject) {
                  setErrors({ ...errors, subject: null });
                }
              }}
              placeholder={t('profile.help.subjectPlaceholder')}
              icon={<Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />}
              error={errors.subject}
              autoCapitalize="sentences"
              autoCorrect={true}
            />

            {/* Priority */}
            <Text style={styles.sectionTitle}>{t('profile.help.priority')}</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.id}
                  style={[
                    styles.priorityOption,
                    formData.priority === priority.id && styles.priorityOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, priority: priority.id })}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={priority.icon}
                    size={16}
                    color={formData.priority === priority.id ? colors.primary : priority.color}
                  />
                  <Text
                    style={[
                      styles.priorityLabel,
                      formData.priority === priority.id && styles.priorityLabelActive,
                    ]}
                  >
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Message */}
            <Input
              label={t('profile.help.message')}
              value={formData.message}
              onChangeText={(text) => {
                setFormData({ ...formData, message: text });
                if (errors.message) {
                  setErrors({ ...errors, message: null });
                }
              }}
              placeholder={t('profile.help.messagePlaceholder')}
              icon={<Ionicons name="create-outline" size={20} color={colors.textSecondary} />}
              error={errors.message}
              multiline={true}
              autoCapitalize="sentences"
              autoCorrect={true}
            />

            {/* Helper Text & Button */}
            <Text style={styles.helperText}>
              {t('profile.help.helperText')}
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title={t('profile.help.send')}
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

export default SupportTicketModal;

