import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { logUIError } from '../../services/errorTracking';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    logUIError(error, errorInfo);
    
    if (__DEV__) {
      console.error('Error Boundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, onReset }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.error + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 12,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    button: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    errorDetails: {
      marginTop: 24,
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      maxWidth: '100%',
    },
    errorText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'monospace',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
      </View>

      <Text style={styles.title}>Bir Hata Oluştu</Text>
      <Text style={styles.message}>
        Üzgünüz, beklenmedik bir hata meydana geldi. Lütfen tekrar deneyin.
      </Text>

      <TouchableOpacity style={styles.button} onPress={onReset} activeOpacity={0.8}>
        <Ionicons name="refresh" size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Tekrar Dene</Text>
      </TouchableOpacity>

      {__DEV__ && error && (
        <View style={styles.errorDetails}>
          <Text style={styles.errorText}>
            {error.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ErrorBoundary;

