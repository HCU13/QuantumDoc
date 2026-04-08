import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';
import { configureRevenueCat, getPremiumPackages } from '@/services/revenuecat';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface UsageInfo {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  subscription_type: 'free' | 'premium';
}

export interface Purchase {
  id: string;
  product_id: string;
  product_name: string;
  amount: number;
  currency: string;
  store: string;
  purchased_at: string;
  expires_at: string | null;
  is_renewal: boolean;
  period_type: string | null;
  status: string;
}

const PRICE_CACHE_KEY = '@quorax_premium_price_v2';

interface SubscriptionContextType {
  subscriptionType: 'free' | 'premium';
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'trial';
  expiresAt: string | null;
  isPremium: boolean;
  isLoading: boolean;
  premiumPriceString: string;
  purchases: Purchase[];
  purchasesLoading: boolean;
  refreshSubscription: () => Promise<void>;
  checkUsageLimit: (moduleId: 'chat' | 'math' | 'exam_lab' | 'calculator') => Promise<UsageInfo | null>;
  logUsage: (
    moduleId: string,
    operationType: string,
    inputTokens?: number,
    outputTokens?: number,
    metadata?: any
  ) => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, isLoggedIn, refreshUser } = useAuth();
  const [subscriptionType, setSubscriptionType] = useState<'free' | 'premium'>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'cancelled' | 'expired' | 'trial'>('active');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [premiumPriceString, setPremiumPriceString] = useState('—');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  // Abonelik tek kaynak: user_subscriptions tablosundan yükle (profile kullanılmıyor)
  const loadSubscriptionFromDb = useCallback(async () => {
    if (!user?.id || !isLoggedIn) {
      setSubscriptionType('free');
      setSubscriptionStatus('active');
      setExpiresAt(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select('subscription_type, subscription_status, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        if (__DEV__) console.warn('Subscription fetch error:', error);
        setSubscriptionType('free');
        setSubscriptionStatus('active');
        setExpiresAt(null);
        setIsLoading(false);
        return;
      }

      if (subscription) {
        setSubscriptionType(subscription.subscription_type ?? 'free');
        setSubscriptionStatus(subscription.subscription_status ?? 'active');
        setExpiresAt(subscription.expires_at ?? null);
      } else {
        setSubscriptionType('free');
        setSubscriptionStatus('active');
        setExpiresAt(null);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscriptionType('free');
      setSubscriptionStatus('active');
      setExpiresAt(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isLoggedIn]);

  useEffect(() => {
    loadSubscriptionFromDb();
  }, [loadSubscriptionFromDb]);

  // Satın alım geçmişini arka planda çek — sayfa açılınca zaten hazır olsun
  const loadPurchases = useCallback(async () => {
    if (!user?.id || !isLoggedIn) {
      setPurchases([]);
      return;
    }
    setPurchasesLoading(true);
    try {
      const { data } = await supabase
        .from('purchases')
        .select('id, product_id, product_name, amount, currency, store, purchased_at, expires_at, is_renewal, period_type, status')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });
      setPurchases(data || []);
    } catch {
      // sessizce devam
    } finally {
      setPurchasesLoading(false);
    }
  }, [user?.id, isLoggedIn]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // Fiyatı uygulama açılışında çek, cache'e kaydet
  useEffect(() => {
    const loadPrice = async () => {
      // Önce cache'den oku (anında göster)
      try {
        const cached = await AsyncStorage.getItem(PRICE_CACHE_KEY);
        if (cached) setPremiumPriceString(cached);
      } catch {}

      // Sonra RevenueCat'ten taze fiyatı çek (user olmasa da anonim configure ile çalışır)
      try {
        await configureRevenueCat(user?.id ?? null);
        const pkgs = await getPremiumPackages();
        const price = pkgs[0]?.product?.priceString;
        if (price) {
          setPremiumPriceString(price);
          await AsyncStorage.setItem(PRICE_CACHE_KEY, price);
        }
      } catch {}
    };
    loadPrice();
  }, [user?.id]);

  const isPremium = subscriptionType === 'premium' && subscriptionStatus === 'active' && (expiresAt === null || new Date(expiresAt) > new Date());

  // Refresh subscription from database (tek kaynak: user_subscriptions)
  const refreshSubscription = useCallback(async () => {
    await loadSubscriptionFromDb();
    await refreshUser();
    await loadPurchases();
  }, [loadSubscriptionFromDb, refreshUser, loadPurchases]);

  // Check usage limit for a module
  const checkUsageLimit = useCallback(async (
    moduleId: 'chat' | 'math' | 'exam_lab' | 'calculator'
  ): Promise<UsageInfo | null> => {
    if (!user?.id || !isLoggedIn) {
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('check_daily_usage_limit', {
        p_user_id: user.id,
        p_module_id: moduleId,
      });

      if (error) {
        console.error('Error checking usage limit:', error);
        return null;
      }

      return data as UsageInfo;
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return null;
    }
  }, [user?.id, isLoggedIn]);

  // Log usage for a module
  const logUsage = useCallback(async (
    moduleId: string,
    operationType: string,
    inputTokens: number = 0,
    outputTokens: number = 0,
    metadata: any = {}
  ): Promise<boolean> => {
    if (!user?.id || !isLoggedIn) {
      return false;
    }

    try {
      const { error } = await supabase.rpc('log_usage', {
        p_user_id: user.id,
        p_module_id: moduleId,
        p_operation_type: operationType,
        p_input_tokens: inputTokens,
        p_output_tokens: outputTokens,
        p_metadata: metadata,
      });

      if (error) {
        console.error('Error logging usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging usage:', error);
      return false;
    }
  }, [user?.id, isLoggedIn]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionType,
        subscriptionStatus,
        expiresAt,
        isPremium,
        isLoading,
        premiumPriceString,
        purchases,
        purchasesLoading,
        refreshSubscription,
        checkUsageLimit,
        logUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
