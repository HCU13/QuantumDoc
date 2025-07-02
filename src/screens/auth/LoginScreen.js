import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showSuccess, showError } from '../../utils/toast';
// ... existing imports ...

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      // ... existing login logic ...
      
      // Başarılı giriş durumunda
      showSuccess(t('messages.success'), t('messages.login_success'));
      // ... navigation logic ...
    } catch (error) {
      showError(t('messages.error'), t('messages.login_error'));
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component code ...
}; 