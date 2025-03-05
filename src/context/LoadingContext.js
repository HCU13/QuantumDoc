// context/LoadingContext.js
import React, { createContext, useState, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

// Create context
const LoadingContext = createContext();

// Provider component
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  // Start loading
  const startLoading = () => setLoading(true);
  
  // Stop loading
  const stopLoading = () => setLoading(false);

  // Show loading for async operations
  const showLoading = async (asyncFunction) => {
    try {
      startLoading();
      return await asyncFunction();
    } finally {
      stopLoading();
    }
  };

  return (
    <LoadingContext.Provider value={{ loading, startLoading, stopLoading, showLoading }}>
      {children}
      {loading && (
        <View style={styles.overlay}>
          <View style={[styles.loadingContainer, { backgroundColor: theme.colors.surface }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </View>
      )}
    </LoadingContext.Provider>
  );
};

// Custom hook to use the loading context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});