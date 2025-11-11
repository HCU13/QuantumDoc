import { useState, useEffect, useCallback } from 'react';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  isPremiumActive,
  getActiveSubscriptions,
  addCustomerInfoUpdateListener,
} from '../services/revenuecat';
import { useAuth } from '../contexts/AuthContext';

/**
 * Subscription yönetimi için custom hook
 * @returns {Object} Subscription state ve fonksiyonlar
 */
const useSubscription = () => {
  const { user } = useAuth(); // AuthContext'ten kullanıcı bilgisini al
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [activeSubscriptionDetails, setActiveSubscriptionDetails] = useState(null); // Aktif subscription detayları
  const [error, setError] = useState(null);

  /**
   * Offerings'leri yükle
   */
  const loadOfferings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedOfferings = await getOfferings();
      setOfferings(fetchedOfferings);
      
      // Offerings loaded successfully
    } catch (err) {
      // Simulator/development'ta bu hata normal, sadece production'da log'la
      if (!__DEV__) {
        console.error('[Subscription] Offerings yükleme hatası:', err);
      }
      
      // Simulator/development'ta test için mock data
      if (__DEV__) {
        setOfferings({
          current: {
            identifier: 'default',
            availablePackages: [
              {
                identifier: '$rc_monthly',
                packageType: 'MONTHLY',
                product: {
                  identifier: 'premium_monthly',
                  title: 'Premium Monthly',
                  description: 'Premium Monthly Subscription',
                  price: 9.99,
                  priceString: '$9.99',
                  currencyCode: 'USD',
                  subscriptionPeriod: 'P1M',
                },
              },
            ],
          },
        });
        setError(null);
      } else {
        setError(err.message || 'Ürünler yüklenirken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Aktif subscription detaylarını hesapla
   */
  const calculateActiveSubscriptionDetails = useCallback((info, offeringsData) => {
    if (!info || !offeringsData?.current) return null;

    // Premium entitlement kontrolü
    const premiumEntitlement = info.entitlements.active['premium'];
    if (!premiumEntitlement) return null;

    // Aktif subscription'ları bul
    const activeSubs = info.activeSubscriptions || [];
    if (activeSubs.length === 0) return null;

    // İlk aktif subscription'ı al
    const firstSubscriptionId = activeSubs[0];
    const subscription = info.subscriptionsByProductIdentifier?.[firstSubscriptionId];

    if (!subscription) return null;

    // Offerings'ten product title'ı bul
    let productTitle = 'Premium Subscription';
    const packageData = offeringsData.current.availablePackages.find(
      pkg => pkg.product.identifier === firstSubscriptionId
    );
    
    if (packageData?.product?.title) {
      productTitle = packageData.product.title;
    } else {
      // Product ID'den plan adını çıkar
      if (firstSubscriptionId?.includes('pro')) productTitle = 'Pro Plan';
      else if (firstSubscriptionId?.includes('basic') || firstSubscriptionId?.includes('student')) productTitle = 'Basic Plan';
      else if (firstSubscriptionId?.includes('monthly') || firstSubscriptionId?.includes('premium')) productTitle = 'Plus Plan';
    }

    return {
      productId: firstSubscriptionId,
      productName: productTitle,
      expiresDate: premiumEntitlement.expiresDate,
      willRenew: subscription.willRenew || false,
      isActive: subscription.isActive || false,
    };
  }, []);

  /**
   * Customer info'yu yükle
   */
  const loadCustomerInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const info = await getCustomerInfo();
      setCustomerInfo(info);

      const premium = await isPremiumActive();
      setIsPremium(premium);

      const subs = await getActiveSubscriptions();
      setActiveSubscriptions(subs);

      // Aktif subscription detaylarını hesapla
      const details = calculateActiveSubscriptionDetails(info, offerings);
      setActiveSubscriptionDetails(details);

      // Customer info loaded successfully
    } catch (err) {
      console.error('[Subscription] Customer info yükleme hatası:', err);
      setError(err.message || 'Kullanıcı bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [offerings, calculateActiveSubscriptionDetails]);

  /**
   * Satın alma işlemi
   * @param {Object} packageToPurchase - Satın alınacak package
   */
  const purchase = useCallback(async (packageToPurchase) => {
    try {
      setLoading(true);
      setError(null);

      // Purchase started

      // userId'yi purchasePackage'a gönder (Supabase'e kaydetmek için)
      const result = await purchasePackage(packageToPurchase, user?.id);
      
      // Satın alma sonrası customer info'yu güncelle
      await loadCustomerInfo();

      // Purchase successful

      return result;
    } catch (err) {
      if (err.message === 'CANCELLED') {
        setError('Satın alma iptal edildi');
        throw new Error('CANCELLED');
      }

      console.error('[Subscription] Satın alma hatası:', err);
      setError(err.message || 'Satın alma sırasında hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCustomerInfo, user?.id]);

  /**
   * Satın almaları geri yükle
   */
  const restore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Restoring purchases

      const info = await restorePurchases(user?.id);
      setCustomerInfo(info);

      // Premium durumunu güncelle
      await loadCustomerInfo();

      // Purchases restored

      return info;
    } catch (err) {
      console.error('[Subscription] Restore error:', err);
      setError(err.message || 'Satın almalar geri yüklenirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCustomerInfo, user?.id]);

  /**
   * Refresh - Tüm bilgileri yeniden yükle
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      loadOfferings(),
      loadCustomerInfo(),
    ]);
  }, [loadOfferings, loadCustomerInfo]);

  /**
   * Offerings değiştiğinde active subscription detaylarını güncelle
   */
  useEffect(() => {
    if (customerInfo && offerings) {
      const details = calculateActiveSubscriptionDetails(customerInfo, offerings);
      setActiveSubscriptionDetails(details);
    }
  }, [offerings, customerInfo, calculateActiveSubscriptionDetails]);

  /**
   * Component mount olduğunda offerings ve customer info'yu yükle
   */
  useEffect(() => {
    loadOfferings();
    loadCustomerInfo();
  }, [loadOfferings, loadCustomerInfo]);

  /**
   * Customer info değişikliklerini dinle
   */
  useEffect(() => {
    const removeListener = addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
      
      // Premium durumunu güncelle
      const premium = info.entitlements.active['premium'] !== undefined;
      setIsPremium(premium);

      // Active subscriptions'ı güncelle
      const subs = Object.keys(info.entitlements.active);
      setActiveSubscriptions(subs);

      // Aktif subscription detaylarını güncelle
      const details = calculateActiveSubscriptionDetails(info, offerings);
      setActiveSubscriptionDetails(details);
    });

    return () => {
      removeListener();
    };
  }, [offerings, calculateActiveSubscriptionDetails]);

  /**
   * Belirli bir package'ı ID ile bul
   * @param {string} packageId - Package ID
   * @returns {Object|null} Package objesi
   */
  const getPackageById = useCallback((packageId) => {
    if (!offerings || !offerings.current) return null;
    
    return offerings.current.availablePackages.find(
      pkg => pkg.identifier === packageId
    ) || null;
  }, [offerings]);

  /**
   * Belirli bir product'ı ID ile bul
   * @param {string} productId - Product ID
   * @returns {Object|null} Package objesi
   */
  const getPackageByProductId = useCallback((productId) => {
    if (!offerings || !offerings.current) return null;
    
    return offerings.current.availablePackages.find(
      pkg => pkg.product.identifier === productId
    ) || null;
  }, [offerings]);

  return {
    // State
    loading,
    offerings,
    customerInfo,
    isPremium,
    activeSubscriptions,
    activeSubscriptionDetails, // Aktif subscription detayları (productName, expiresDate, vb.)
    error,

    // Functions
    purchase,
    restore,
    refresh,
    loadOfferings,
    loadCustomerInfo,
    getPackageById,
    getPackageByProductId,

    // Computed
    hasOfferings: offerings && offerings.current && offerings.current.availablePackages.length > 0,
    currentOffering: offerings?.current || null,
    availablePackages: offerings?.current?.availablePackages || [],
  };
};

export default useSubscription;

