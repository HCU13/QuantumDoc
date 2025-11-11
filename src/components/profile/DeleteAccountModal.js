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
import ConfirmationModal from '../common/ConfirmationModal';
import { TEXT_STYLES } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

const DeleteAccountModal = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (error) setError('');
  };

  const handleDeleteClick = () => {
    if (!password.trim()) {
      setError(t('auth.errors.passwordRequired'));
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmation(false);
    onConfirm(password);
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setShowConfirmation(false);
    onClose();
  };

  return (
    <>
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
            <Text style={[styles.title, { color: '#EF4444' }]}>
              {t('profile.accountInfo.deleteModal.title')}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.warningContainer}>
              <Ionicons 
                name="warning" 
                size={48} 
                color="#EF4444" 
              />
              <Text style={[styles.warningTitle, { color: colors.text }]}>
                {t('profile.accountInfo.deleteModal.warning')}
              </Text>
              <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                {t('profile.accountInfo.deleteModal.description')}
              </Text>
            </View>

            <Input
              label={t('profile.accountInfo.deleteModal.passwordLabel')}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder={t('profile.accountInfo.deleteModal.passwordPlaceholder')}
              error={error}
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
              title={loading ? t('common.deleting') : t('common.delete')}
              onPress={handleDeleteClick}
              disabled={loading}
              containerStyle={[styles.deleteButton, { backgroundColor: '#EF4444' }]}
              textStyle={{ color: '#fff' }}
            />
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title={t('profile.deleteAccount')}
        message={t('profile.deleteAccountWarning')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        loading={loading}
      />
    </>
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
  warningContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  warningTitle: {
    ...TEXT_STYLES.headlineSmall,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    ...TEXT_STYLES.bodyMedium,
    textAlign: 'center',
    lineHeight: 24,
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
  deleteButton: {
    flex: 1,
  },
});

export default DeleteAccountModal;
