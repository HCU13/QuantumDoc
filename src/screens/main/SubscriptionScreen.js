import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const SubscriptionScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  // Örnek aktif abonelik
  const activeSubscription = {
    plan: 'Premium Monthly',
    price: 29.99,
    startDate: '2024-02-01',
    nextBillingDate: '2024-03-01',
    status: 'active',
    features: [
      'Unlimited Documents',
      'Priority Processing',
      'Advanced AI Analysis',
      'Premium Support',
    ],
  };

  // Örnek plan değişiklik seçenekleri
  const availablePlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      features: [
        '50 Documents/month',
        'Basic AI Analysis',
        'Email Support',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 29.99,
      features: [
        'Unlimited Documents',
        'Priority Processing',
        'Advanced AI Analysis',
        'Premium Support',
      ],
      current: true,
    },
    {
      id: 'business',
      name: 'Business',
      price: 49.99,
      features: [
        'Unlimited Documents',
        'Priority Processing',
        'Advanced AI Analysis',
        'Dedicated Support',
        'Team Management',
        'API Access',
      ],
    },
  ];

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Abonelik iptal işlemi burada yapılacak
              await new Promise(resolve => setTimeout(resolve, 1500));
              Alert.alert('Success', 'Your subscription has been cancelled');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]} variant="h2">
        Subscription
      </Text>
      <View style={styles.backButton} />
    </View>
  );

  const renderCurrentPlan = () => (
    <View
      style={[styles.currentPlanCard, { backgroundColor: theme.colors.surface }]}
    >
      <LinearGradient
        colors={theme.colors.gradient.primary}
        style={styles.planHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.planHeaderContent}>
          <View style={styles.planInfo}>
            <Text style={styles.planName} color="white">
              {activeSubscription.plan}
            </Text>
            <Text style={styles.planPrice} color="white">
              ${activeSubscription.price}/month
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: 'rgba(255,255,255,0.2)' },
            ]}
          >
            <Text color="white" style={styles.statusText}>
              Active
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.planDetails}>
        <View style={styles.billingInfo}>
          <Text style={[styles.billingLabel, { color: theme.colors.textSecondary }]}>
            Next billing date
          </Text>
          <Text style={[styles.billingDate, { color: theme.colors.text }]}>
            {activeSubscription.nextBillingDate}
          </Text>
        </View>

        <View style={styles.featuresList}>
          {activeSubscription.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text style={[styles.featureText, { color: theme.colors.text }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderAvailablePlans = () => (
    <View style={styles.availablePlansSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Available Plans
      </Text>

      {availablePlans.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={[
            styles.planCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: plan.current ? theme.colors.primary : 'transparent',
            },
          ]}
          onPress={() => {
            if (!plan.current) {
              // Plan değiştirme işlemi
            }
          }}
        >
          <View style={styles.planCardHeader}>
            <View>
              <Text style={[styles.planCardName, { color: theme.colors.text }]}>
                {plan.name}
              </Text>
              <Text
                style={[styles.planCardPrice, { color: theme.colors.primary }]}
              >
                ${plan.price}
                <Text
                  style={[
                    styles.planPeriod,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  /month
                </Text>
              </Text>
            </View>
            {plan.current && (
              <View
                style={[
                  styles.currentBadge,
                  { backgroundColor: theme.colors.primary + '15' },
                ]}
              >
                <Text style={{ color: theme.colors.primary }}>Current</Text>
              </View>
            )}
          </View>

          <View style={styles.planFeatures}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.planFeatureItem}>
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={theme.colors.success}
                />
                <Text
                  style={[
                    styles.planFeatureText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.content}>
        {renderCurrentPlan()}
        {renderAvailablePlans()}

        <Button
          title={loading ? 'Cancelling...' : 'Cancel Subscription'}
          onPress={handleCancelSubscription}
          type="secondary"
          theme={theme}
          style={styles.cancelButton}
          disabled={loading}
        />
      </ScrollView>
    </SafeAreaView>
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
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  currentPlanCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  planHeader: {
    padding: 20,
  },
  planHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    gap: 4,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
  },
  planPrice: {
    fontSize: 16,
    opacity: 0.9,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planDetails: {
    padding: 20,
  },
  billingInfo: {
    marginBottom: 16,
  },
  billingLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  billingDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
  },
  availablePlansSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  planCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planCardName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  planCardPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  planPeriod: {
    fontSize: 14,
  },
  currentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  planFeatures: {
    gap: 8,
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planFeatureText: {
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 8,
  },
});