// components/ScanGuides.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './common';
import { useTheme } from '../hooks/useTheme';

export const ScanGuides = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Köşe Kılavuzları */}
      <View
        style={[
          styles.corner,
          styles.topLeft,
          { borderColor: theme.colors.primary },
        ]}
      />
      <View
        style={[
          styles.corner,
          styles.topRight,
          { borderColor: theme.colors.primary },
        ]}
      />
      <View
        style={[
          styles.corner,
          styles.bottomLeft,
          { borderColor: theme.colors.primary },
        ]}
      />
      <View
        style={[
          styles.corner,
          styles.bottomRight,
          { borderColor: theme.colors.primary },
        ]}
      />

      {/* Orta Çizgiler */}
      <View
        style={[
          styles.centerLine,
          styles.verticalLine,
          { backgroundColor: theme.colors.primary + '30' },
        ]}
      />
      <View
        style={[
          styles.centerLine,
          styles.horizontalLine,
          { backgroundColor: theme.colors.primary + '30' },
        ]}
      />

      {/* Tarama İpucu */}
      <View
        style={[
          styles.tipContainer,
          { backgroundColor: 'rgba(0,0,0,0.7)' },
        ]}
      >
        <Text style={styles.tipText} color="white">
          Position document within frame
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 3,
  },
  topLeft: {
    top: '20%',
    left: '10%',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: '20%',
    right: '10%',
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: '35%',
    left: '10%',
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: '35%',
    right: '10%',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  centerLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  verticalLine: {
    width: 1,
    height: '45%',
    top: '20%',
  },
  horizontalLine: {
    width: '80%',
    height: 1,
    top: '42.5%',
  },
  tipContainer: {
    position: 'absolute',
    bottom: '28%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tipText: {
    fontSize: 14,
  },
});