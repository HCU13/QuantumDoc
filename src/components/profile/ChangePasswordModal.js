import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import Input from '../common/Input';
import Button from '../common/Button';
import { TEXT_STYLES } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

const ChangePasswordModal = ({
  visible,
  onClose,
  onSave,
  loading = false,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.current?.trim()) {
      newErrors.current = t('auth.errors.currentPasswordRequired');
    }
    
    if (!formData.new?.trim()) {
      newErrors.new = t('auth.errors.newPasswordRequired');
    } else if (formData.new.length < 6) {
      newErrors.new = t('auth.errors.passwordMinLength');
    }
    
    if (!formData.confirm?.trim()) {
      newErrors.confirm = t('auth.errors.confirmPasswordRequired');
    } else if (formData.new !== formData.confirm) {
      newErrors.confirm = t('auth.errors.passwordsDontMatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    setFormData({ current: '', new: '', confirm: '' });
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('profile.changePassword')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Input
            label={t('auth.currentPassword')}
            value={formData.current}
            onChangeText={(value) => handleInputChange('current', value)}
            placeholder={t('auth.currentPasswordPlaceholder')}
            error={errors.current}
            secureTextEntry
            autoCapitalize="none"
            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label={t('auth.newPassword')}
            value={formData.new}
            onChangeText={(value) => handleInputChange('new', value)}
            placeholder={t('auth.newPasswordPlaceholder')}
            error={errors.new}
            secureTextEntry
            autoCapitalize="none"
            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label={t('auth.confirmPassword')}
            value={formData.confirm}
            onChangeText={(value) => handleInputChange('confirm', value)}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            error={errors.confirm}
            secureTextEntry
            autoCapitalize="none"
            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          />
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Button
            title={t('common.cancel')}
            onPress={handleClose}
            outlined
            containerStyle={styles.cancelButton}
          />
          <Button
            title={loading ? t('common.saving') : t('common.save')}
            onPress={handleSave}
            gradient
            disabled={loading}
            containerStyle={styles.saveButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    ...TEXT_STYLES.titleLarge,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default ChangePasswordModal;
