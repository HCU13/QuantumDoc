import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '../../../../components';
import { useTheme } from '../../../../context/ThemeContext';

const ScanDocumentModule = ({ onPress }) => {
  const { theme, isDark } = useTheme();

  // Scan features
  const scanFeatures = [
    { title: 'Auto-detection', icon: 'scan-circle', color: theme.colors.success },
    { title: 'Image enhancement', icon: 'color-filter', color: theme.colors.info },
    { title: 'Text recognition', icon: 'text', color: theme.colors.primary },
  ];

  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={isDark 
          ? [theme.colors.card, theme.colors.card] 
          : ['#FFFFFF', '#F9FAFB']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <TouchableOpacity 
            style={styles.mainButton}
            onPress={onPress}
          >
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.info]}
              style={styles.buttonGradient}
            >
              <Ionicons name="scan" size={32} color="#FFFFFF" />
              <Text 
                variant="h3" 
                color="#FFFFFF" 
                style={styles.buttonText}
              >
                Scan Document
              </Text>
              <Text
                variant="body2"
                color="rgba(255, 255, 255, 0.8)"
                style={styles.buttonSubtext}
              >
                Use your camera
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.featuresContainer}>
            {scanFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[
                  styles.featureIcon, 
                  { backgroundColor: feature.color + '15' }
                ]}>
                  <Ionicons name={feature.icon} size={20} color={feature.color} />
                </View>
                <Text variant="body2" style={styles.featureText}>
                  {feature.title}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Example Scan Images */}
          <View style={styles.examplesContainer}>
            <Text variant="caption" color={theme.colors.textSecondary} style={styles.examplesLabel}>
              Perfect for scanning:
            </Text>
            <View style={styles.exampleImageRow}>
              <View style={styles.exampleImageContainer}>
                <View style={[styles.exampleImage, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Ionicons name="document-text" size={24} color={theme.colors.primary} />
                </View>
                <Text variant="caption" style={styles.exampleLabel}>Documents</Text>
              </View>
              
              <View style={styles.exampleImageContainer}>
                <View style={[styles.exampleImage, { backgroundColor: theme.colors.info + '15' }]}>
                  <Ionicons name="newspaper" size={24} color={theme.colors.info} />
                </View>
                <Text variant="caption" style={styles.exampleLabel}>Articles</Text>
              </View>
              
              <View style={styles.exampleImageContainer}>
                <View style={[styles.exampleImage, { backgroundColor: theme.colors.success + '15' }]}>
                  <Ionicons name="receipt" size={24} color={theme.colors.success} />
                </View>
                <Text variant="caption" style={styles.exampleLabel}>Receipts</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardGradient: {
    width: '100%',
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  mainButton: {
    width: '100%',
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonText: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },
  buttonSubtext: {
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    textAlign: 'center',
    fontSize: 13,
  },
  examplesContainer: {
    width: '100%',
    marginTop: 24,
  },
  examplesLabel: {
    marginBottom: 12,
    textAlign: 'center',
  },
  exampleImageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  exampleImageContainer: {
    alignItems: 'center',
  },
  exampleImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 12,
  },
});

export default ScanDocumentModule;