// 💰 REVENUECAT SERVICE
// iOS için premium subscription yönetimi

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import Purchases from 'react-native-purchases';

// Expo Go vs Development Build kontrolü
const isExpoGo = Constants.executionEnvironment === 'storeClient';
const isSimulator = Platform.OS === 'ios' && Constants.isDevice === false;

// RevenueCat API Keys – değerler .env dosyasından okunur
const REVENUECAT_CONFIG = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  android: '', // Android için şimdilik boş
};

// RevenueCat servisinin başlatılıp başlatılmadığını takip et
let isConfigured = false;
let currentUserId: string | null = null;

/**
 * RevenueCat SDK'yı başlat
 * @param {string} userId - Kullanıcı ID'si (opsiyonel)
 */
export const configureRevenueCat = async (userId: string | null = null): Promise<void> => {
  try {
    if (isConfigured) {
      // SDK zaten başlatıldı; sadece yeni user varsa login yap
      if (userId && currentUserId !== userId) {
        await Purchases.logIn(userId);
        currentUserId = userId;
      }
      return;
    }

    // Expo Go'da çalışıyorsak uyarı ver
    if (isExpoGo) {
      console.warn('RevenueCat Expo Go\'da çalışmaz. Development build gerekli.');
      return;
    }

    // Sadece iOS için çalış
    if (Platform.OS !== 'ios') {
      console.warn('RevenueCat şu anda sadece iOS için aktif.');
      return;
    }

    // API key kontrolü
    const apiKey = REVENUECAT_CONFIG.ios;

    if (!apiKey || apiKey.includes('XXXXXXXX')) {
      throw new Error('RevenueCat iOS API key bulunamadı');
    }

    // RevenueCat'i configure et
    await Purchases.configure({ apiKey });

    // Log seviyesini ayarla (sadece geliştirme ortamında)
    if (__DEV__) Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    // Kullanıcı ID'si varsa login yap
    if (userId) {
      await Purchases.logIn(userId);
      currentUserId = userId;
    }

    isConfigured = true;
  } catch (error: any) {
    if (isExpoGo) {
      return;
    }
    console.error('RevenueCat configure error:', error);
    throw error;
  }
};

/**
 * Kullanıcı giriş yaptığında RevenueCat'e bildir
 * @param {string} userId - Kullanıcı ID'si
 */
export const loginRevenueCat = async (userId: string): Promise<CustomerInfo | null> => {
  try {
    if (isExpoGo || Platform.OS !== 'ios') {
      return null;
    }

    if (!isConfigured) {
      await configureRevenueCat(userId);
      return null;
    }

    // Aynı kullanıcıyla zaten login olduysa tekrar logIn çağırma
    if (currentUserId === userId) {
      return null;
    }

    const { customerInfo } = await Purchases.logIn(userId);
    currentUserId = userId;
    return customerInfo;
  } catch (error: any) {
    console.error('RevenueCat login error:', error);
    return null;
  }
};

/**
 * Kullanıcı çıkış yaptığında RevenueCat'i temizle
 */
export const logoutRevenueCat = async (): Promise<void> => {
  try {
    if (!isConfigured || isExpoGo || Platform.OS !== 'ios') {
      return;
    }

    // Anonymous kullanıcıda logOut çağrılamaz — sadece loggedIn kullanıcıda çağır
    if (!currentUserId) {
      return;
    }

    await Purchases.logOut();
    currentUserId = null;
  } catch (error: any) {
    // Silent error
    console.error('RevenueCat logout error:', error);
  }
};


/**
 * Premium subscription paketlerini getir
 */
export const getPremiumPackages = async (): Promise<PurchasesPackage[]> => {
  try {
    if (isExpoGo || Platform.OS !== 'ios') {
      return [];
    }

    if (!isConfigured) {
      return [];
    }

    const offerings = await Purchases.getOfferings();

    // Tüm offering'lerdeki tüm paketleri tara, 'premium' identifier'ı içereni bul
    const allPackages: PurchasesPackage[] = [];

    if (offerings?.current) {
      allPackages.push(...offerings.current.availablePackages);
    }

    // current dışındaki offering'leri de tara
    if (offerings?.all) {
      Object.values(offerings.all).forEach((offering: any) => {
        offering.availablePackages?.forEach((pkg: PurchasesPackage) => {
          if (!allPackages.find((p) => p.identifier === pkg.identifier)) {
            allPackages.push(pkg);
          }
        });
      });
    }

    const premiumPackages = allPackages.filter(
      (pkg) => pkg.product?.identifier?.includes('premium')
    );

    return premiumPackages;
  } catch (error: any) {
    console.error('Premium packages error:', error);
    return [];
  }
};

/**
 * Premium subscription satın al
 */
export const purchasePremiumSubscription = async (
  packageToPurchase: PurchasesPackage
): Promise<{
  productIdentifier: string;
  transactionId: string;
  purchaseDate: string;
  expiresDate?: string;
}> => {
  try {
    if (isExpoGo || Platform.OS !== 'ios') {
      throw new Error('Premium subscription sadece iOS cihazlarda kullanılabilir.');
    }

    if (!isConfigured) {
      throw new Error('RevenueCat configure edilmemiş.');
    }

    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
    
    // Subscription bilgilerini al
    const entitlements = customerInfo.entitlements.active;
    const premiumEntitlement = entitlements['premium']
      ?? entitlements['Premium']
      ?? Object.values(entitlements)[0]
      ?? null;
    
    const purchaseInfo = {
      productIdentifier: productIdentifier || packageToPurchase.product.identifier,
      transactionId: premiumEntitlement?.originalPurchaseDate || new Date().toISOString(),
      purchaseDate: new Date().toISOString(),
      expiresDate: premiumEntitlement?.expirationDate || undefined,
    };

    return purchaseInfo;
    
  } catch (error: any) {
    if (error.userCancelled) {
      throw new Error('CANCELLED');
    }
    throw new Error(error.message || 'Premium satın alma başarısız oldu');
  }
};

/**
 * Satın alımları geri yükle
 */
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  try {
    if (isExpoGo || Platform.OS !== 'ios') {
      return null;
    }

    if (!isConfigured) {
      throw new Error('RevenueCat configure edilmemiş.');
    }

    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error: any) {
    throw error;
  }
};


