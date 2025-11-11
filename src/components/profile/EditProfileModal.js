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

const EditProfileModal = ({
  visible,
  onClose,
  onSave,
  initialData,
  loading = false,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialData || {});
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
    
    if (!formData.name?.trim()) {
      newErrors.name = t('auth.errors.fullNameRequired');
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = t('auth.errors.phoneRequired');
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
    setFormData(initialData || {});
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
            {t('profile.editProfile')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Input
            label={t('auth.fullName')}
            value={formData.name || ''}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder={t('auth.fullNamePlaceholder')}
            error={errors.name}
            icon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label={t('auth.email')}
            value={formData.email || ''}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            error={errors.email}
            icon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label={t('auth.phone')}
            value={formData.phone || ''}
            onChangeText={(value) => handleInputChange('phone', value)}
            placeholder={t('auth.phonePlaceholder')}
            keyboardType="phone-pad"
            error={errors.phone}
            icon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
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

export default EditProfileModal;
