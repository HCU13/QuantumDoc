import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

// Expo Go vs Development Build kontrolü
// storeClient = Expo Go
// standalone/bare = Development Build veya Production
const isExpoGo = Constants.executionEnvironment === 'storeClient';
const isDevelopmentBuild = !isExpoGo && (Constants.executionEnvironment === 'standalone' || Constants.executionEnvironment === 'bare' || __DEV__);

// Simulator kontrolü
const isSimulator = Platform.OS === 'ios' && Constants.isDevice === false;

// Environment check removed - too verbose

// RevenueCat API Keys - RevenueCat Dashboard > Project Settings > API Keys'den alınmalı
const REVENUECAT_CONFIG = {
  ios: 'appl_FlNxVNmexcqwPoRgWEmBPyKHSAa',
  android: '', // Android için RevenueCat Dashboard'dan "Google Play" API key'i alınmalı (goog_ ile başlar)
};

// Expo Go için Test Store API Keys (RevenueCat Dashboard'dan alınmalı)
const REVENUECAT_TEST_CONFIG = {
  ios: 'appl_FlNxVNmexcqwPoRgWEmBPyKHSAa', // Test Store key buraya eklenecek
  android: '', // Android Test Store key eklenecek
};

// RevenueCat servisinin başlatılıp başlatılmadığını takip et
let isConfigured = false;

/**
 * RevenueCat SDK'yı başlat
 * @param {string} userId - Kullanıcı ID'si (opsiyonel)
 */
export const configureRevenueCat = async (userId = null) => {
  try {
    if (isConfigured) {
      return;
    }

    // Expo Go'da çalışıyorsak uyarı ver ama devam etme
    if (isExpoGo) {
      console.warn('[RevenueCat] ⚠️ Expo Go içinde çalışıyor, RevenueCat native özellikler kullanılamaz');
      console.warn('[RevenueCat] Development build oluşturmanız gerekiyor: npx expo run:android');
      return;
    }

    // Development Build veya Production'da çalışıyorsak configure et
    const apiKey = Platform.OS === 'ios' 
      ? REVENUECAT_CONFIG.ios
      : REVENUECAT_CONFIG.android;

    if (!apiKey || apiKey.includes('XXXXXXXX')) {
      console.error(`[RevenueCat] ❌ API key bulunamadı veya geçersiz: ${Platform.OS}`);
      console.error(`[RevenueCat] RevenueCat Dashboard'dan API key alıp REVENUECAT_CONFIG'e ekleyin`);
      throw new Error(`RevenueCat API key bulunamadı: ${Platform.OS}`);
    }

    await Purchases.configure({ apiKey });

    // Log seviyesini ayarla
    // Development'ta INFO (daha az hata göster), production'da ERROR (sessiz)
    // NOT: RevenueCat SDK iç hatalarını gösterir ama offerings hataları normal (App Store Connect yapılandırması eksik)
    if (__DEV__) {
      // Development'ta INFO seviyesi - sadece önemli hataları göster
      await Purchases.setLogLevel(Purchases.LOG_LEVEL.INFO);
    } else {
      // Production'da ERROR seviyesi - sadece kritik hataları göster
      await Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);
    }

    if (userId) {
      await Purchases.logIn(userId);
    }

    isConfigured = true;

  } catch (error) {
    console.error('[RevenueCat] Configuration error:', error);
    // Expo Go hatası ise fırlatma, sadece logla
    if (isExpoGo || error.message?.includes('Expo Go')) {
      console.warn('⚠️ RevenueCat Expo Go\'da çalışmıyor, mock data kullanılacak');
      return;
    }
    throw error;
  }
};

/**
 * Kullanıcı giriş yaptığında RevenueCat'e bildir
 * @param {string} userId - Kullanıcı ID'si
 */
export const loginRevenueCat = async (userId) => {
  try {
    if (!isConfigured) {
      await configureRevenueCat(userId);
      return;
    }

    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Login error:', error);
    throw error;
  }
};

/**
 * Kullanıcı çıkış yaptığında RevenueCat'i temizle
 */
export const logoutRevenueCat = async () => {
  try {
    await Purchases.logOut();

  } catch (error) {
    console.error('[RevenueCat] RevenueCat logout hatası:', error);
    throw error;
  }
};

/**
 * Mevcut offerings'leri (ürünleri) getir
 * @returns {Promise<Object>} Offerings objesi
 */
export const getOfferings = async () => {
  try {
    // Configure edilmemişse veya Expo Go'daysa null döndür
    if (!isConfigured || isExpoGo) {
      return null;
    }

    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    // Development'ta bu hata normal - App Store Connect ürünleri henüz yapılandırılmamış
    // Production'da App Store Connect'te ürünler olacak, o zaman çalışacak
    if (__DEV__) {
      // Development'ta sessizce null döndür - hata log'lamayalım
      // Bu hatalar App Store Connect yapılandırması eksik olduğu için normal
      return null;
    }
    
    // Production'da gerçek hata varsa log'la
    console.error('[RevenueCat] Offerings error:', error);
    
    // Singleton instance hatası ise null döndür
    if (error.message?.includes('singleton instance')) {
      return null;
    }
    
    // Simulator'da da sessizce null döndür
    if (isSimulator) {
      return null;
    }
    
    // Production'da gerçek hata varsa throw et
    throw error;
  }
};

/**
 * Product ID'den plan adını belirle (subscription_type için)
 * @param {string} productId - Product ID
 * @returns {string} Plan adı (basic, plus, pro, premium)
 */
const getPlanNameFromProductId = (productId) => {
  // Product ID'ye göre plan adı
  const planMap = {
    'premium_monthly': 'plus',
    'premium_student': 'basic',
    'premium_pro': 'pro',
  };

  // Product ID'de 'pro' varsa 'pro', 'basic' varsa 'basic', yoksa 'plus'
  if (productId?.includes('pro')) return 'pro';
  if (productId?.includes('basic') || productId?.includes('student')) return 'basic';
  if (productId?.includes('monthly') || productId?.includes('premium')) return 'plus';
  
  return planMap[productId] || 'premium';
};

/**
 * Satın alma bilgilerini Supabase'e kaydet
 * @param {string} userId - Kullanıcı ID'si
 * @param {Object} purchaseInfo - Satın alma bilgileri
 * @param {Object} packageInfo - Package bilgisi (product title için)
 */
const savePurchaseToSupabase = async (userId, purchaseInfo, packageInfo = null) => {
  try {
    const { productIdentifier, customerInfo } = purchaseInfo;
    
    // Premium entitlement kontrolü
    const hasPremium = customerInfo.entitlements.active['premium'] !== undefined;
    const premiumEntitlement = customerInfo.entitlements.active['premium'];
    
    // Product bilgilerini al
    const subscription = customerInfo.activeSubscriptions?.includes(productIdentifier)
      ? customerInfo.subscriptionsByProductIdentifier?.[productIdentifier]
      : null;

    // Product adını belirle: packageInfo'dan veya productIdentifier'dan
    let productName = 'Premium Subscription';
    if (packageInfo?.product?.title) {
      productName = packageInfo.product.title;
    } else if (productIdentifier) {
      // Product ID'den plan adını çıkar
      const planName = getPlanNameFromProductId(productIdentifier);
      productName = planName === 'pro' ? 'Pro Plan' : 
                   planName === 'basic' ? 'Basic Plan' : 
                   planName === 'plus' ? 'Plus Plan' : 'Premium Subscription';
    }

    // Plan adını belirle (subscription_type için)
    const planName = getPlanNameFromProductId(productIdentifier);

    // Subscription bilgisi varsa purchases tablosuna kaydet
    if (subscription) {
      const purchaseData = {
        user_id: userId,
        product_id: productIdentifier,
        product_name: productName, // Dinamik product adı
        product_type: 'subscription',
        transaction_id: subscription.storeTransactionId || 'sandbox_sub_' + Date.now(),
        amount: subscription.price?.amount || 9.99,
        currency: subscription.price?.currencyCode || 'USD',
        payment_method: Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay',
        payment_provider: Platform.OS === 'ios' ? 'app_store' : 'play_store',
        store: Platform.OS === 'ios' ? 'app_store' : 'play_store',
        status: 'completed',
        purchased_at: subscription.purchaseDate || new Date().toISOString(),
        completed_at: new Date().toISOString(),
        
        // Subscription detayları
        expires_at: subscription.expiresDate,
        will_renew: subscription.willRenew || false,
        is_sandbox: subscription.isSandbox || __DEV__,
        billing_issues_detected_at: subscription.billingIssuesDetectedAt || null,
        cancelled_at: subscription.unsubscribeDetectedAt || null,
        refunded_at: subscription.refundedAt || null,
        
        // Metadata - ek bilgiler
        metadata: {
          original_purchase_date: subscription.originalPurchaseDate,
          latest_expiration_date: subscription.latestExpirationDate,
          management_url: subscription.managementURL,
          period_type: subscription.periodType,
          is_active: subscription.isActive,
          plan_name: planName, // Plan adını metadata'ya da ekle
        }
      };

      const { error } = await supabase
        .from('purchases')
        .upsert(purchaseData, { 
          onConflict: 'transaction_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
    }

    // Premium ise user'ı güncelle (subscription bilgisi olmasa bile)
    if (hasPremium && premiumEntitlement) {
      const updateData = {
        subscription_type: planName, // Plan adını kaydet (premium değil, plan adı)
        subscription_expires_at: premiumEntitlement.expiresDate,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

        if (profileError) {
          console.error('[RevenueCat] Profile update error:', profileError);
        }

      // İlk token kredisi ekle
      const monthlyTokens = getMonthlyTokensForPlan(productIdentifier);
      if (monthlyTokens > 0) {
        await addTokensToUser(
          userId, 
          monthlyTokens, 
          'initial_purchase',
          `İlk abonelik token kredisi: ${monthlyTokens} token`
        );
      }
    }
    
  } catch (error) {
    console.error('[RevenueCat] Supabase kaydetme hatası:', error);
  }
};

/**
 * Subscription planına göre aylık token miktarını belirle
 * @param {string} productId - Product ID
 * @returns {number} Aylık token miktarı
 */
const getMonthlyTokensForPlan = (productId) => {
  // Product ID'ye göre aylık token miktarı
  const tokenMap = {
    'premium_monthly': 500,    // Plus Plan
    'premium_student': 300,    // Student Plan
    'premium_pro': 1000,       // Pro Plan (gelecekte)
  };

  return tokenMap[productId] || 0;
};

/**
 * Kullanıcının subscription bilgilerini güncelle
 * @param {string} userId - Kullanıcı ID'si
 * @param {Object} subscription - Subscription bilgileri
 * @param {string} productId - Product ID
 * @param {boolean} isNewSubscription - Yeni subscription mı?
 */
const updateUserSubscription = async (userId, subscription, productId, isNewSubscription = false) => {
  try {
    // Plan adını belirle
    const planName = getPlanNameFromProductId(productId);
    
    const updateData = {
      subscription_type: subscription.isActive ? planName : 'free', // Plan adını kaydet
      subscription_expires_at: subscription.expiresDate,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;

    // Yeni subscription ise veya renewal ise aylık token kredisi ekle
    if (subscription.isActive) {
      const monthlyTokens = getMonthlyTokensForPlan(productId);
      
      if (monthlyTokens > 0) {
        await addTokensToUser(
          userId, 
          monthlyTokens, 
          subscription.storeTransactionId || 'sub_renewal',
          `${isNewSubscription ? 'İlk' : 'Aylık'} abonelik token kredisi: ${monthlyTokens} token`
        );
      }
    }
  } catch (error) {
    console.error('[RevenueCat] User subscription güncelleme hatası:', error);
  }
};

/**
 * Belirli bir package'ı satın al
 * @param {Object} packageToPurchase - Satın alınacak package
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<Object>} Purchase bilgisi
 */
export const purchasePackage = async (packageToPurchase, userId = null) => {
  try {
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);

    // Supabase'e kaydet - package bilgisini de gönder (product title için)
    if (userId) {
      await savePurchaseToSupabase(userId, { customerInfo, productIdentifier }, packageToPurchase);
    }

    return { customerInfo, productIdentifier };
  } catch (error) {
    if (error.userCancelled) {
      if (__DEV__) console.warn('[RevenueCat] Kullanıcı satın almayı iptal etti');
      throw new Error('CANCELLED');
    }
    
    console.error('[RevenueCat] Satın alma hatası:', error);
    throw error;
  }
};

/**
 * Satın almaları geri yükle (restore purchases)
 * @returns {Promise<Object>} Customer info
 */
export const restorePurchases = async (userId = null) => {
  try {
    const customerInfo = await Purchases.restorePurchases();

    // Restore sonrası premium durumunu Supabase'e kaydet
    if (userId && customerInfo) {
      const hasPremium = customerInfo.entitlements.active['premium'] !== undefined;
      const premiumEntitlement = customerInfo.entitlements.active['premium'];
      

      if (hasPremium && premiumEntitlement) {
        // Aktif subscription'ı bul ve plan adını belirle
        const activeSubscriptions = customerInfo.activeSubscriptions || [];
        const firstSubscriptionId = activeSubscriptions[0];
        const planName = firstSubscriptionId ? getPlanNameFromProductId(firstSubscriptionId) : 'premium';
        
        const updateData = {
          subscription_type: planName, // Plan adını kaydet
          subscription_expires_at: premiumEntitlement.expiresDate,
        };

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (error) {
          console.error('[RevenueCat] Profile update error:', error);
        }
      }
    }

    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Restore error:', error);
    throw error;
  }
};

/**
 * Mevcut kullanıcının subscription bilgilerini getir
 * @returns {Promise<Object>} Customer info
 */
export const getCustomerInfo = async () => {
  try {
    // Configure edilmemişse veya Expo Go'daysa null döndür
    if (!isConfigured || isExpoGo) {
      return null;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Customer info hatası:', error);
    // Singleton instance hatası ise null döndür
    if (error.message?.includes('singleton instance')) {
      if (__DEV__) {
        console.warn('[RevenueCat] Purchases configure edilmemiş');
      }
      return null;
    }
    throw error;
  }
};

/**
 * Kullanıcının premium üyeliği var mı kontrol et
 * @returns {Promise<boolean>} Premium üyelik durumu
 */
export const isPremiumActive = async () => {
  try {
    const customerInfo = await getCustomerInfo();
    
    // customerInfo null ise false döndür
    if (!customerInfo) {
      return false;
    }
    
    // "premium" entitlement'ını kontrol et
    const hasPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
    return hasPremium;
  } catch (error) {
    console.error('[RevenueCat] Premium kontrol hatası:', error);
    return false;
  }
};

/**
 * Kullanıcının aktif subscription'larını getir
 * @returns {Promise<Array>} Aktif subscription'lar
 */
export const getActiveSubscriptions = async () => {
  try {
    const customerInfo = await getCustomerInfo();
    
    // customerInfo null ise boş array döndür
    if (!customerInfo) {
      return [];
    }
    
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    return activeEntitlements;
  } catch (error) {
    console.error('[RevenueCat] Active subscriptions hatası:', error);
    return [];
  }
};

/**
 * RevenueCat listener'ı ekle (subscription değişikliklerini dinle)
 * @param {Function} callback - Değişiklik olduğunda çağrılacak fonksiyon
 * @returns {Function} Listener'ı kaldırmak için fonksiyon
 */
export const addCustomerInfoUpdateListener = (callback) => {
  try {
    const listener = Purchases.addCustomerInfoUpdateListener((customerInfo) => {

      callback(customerInfo);
    });

    // Listener'ı kaldırmak için fonksiyon döndür
    return () => {
      if (listener && listener.remove) {
        listener.remove();

      }
    };
  } catch (error) {
    console.error('[RevenueCat] Listener ekleme hatası:', error);
    return () => {};
  }
};

/**
 * RevenueCat'in yapılandırılıp yapılandırılmadığını kontrol et
 * @returns {boolean} Yapılandırma durumu
 */
export const isRevenueCatConfigured = () => isConfigured;

/**
 * Token (non-consumable / consumable) satın alma
 * @param {string} productId - Product ID (örn: 'tokens_100')
 * @param {number} tokenAmount - Token miktarı
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<Object>} Purchase bilgisi
 */
export const purchaseTokenPackage = async (productId, tokenAmount, userId = null) => {
  try {


    // Sandbox/Development için mock purchase
    if (__DEV__) {
      // Simüle edilmiş purchase bilgisi
      const mockPurchase = {
        productIdentifier: productId,
        transactionId: 'sandbox_token_' + Date.now(),
        purchaseDate: new Date().toISOString(),
        tokenAmount,
      };

      // Supabase'e kaydet
      if (userId) {
        await saveTokenPurchaseToSupabase(userId, mockPurchase);
      }

      return mockPurchase;
    }

    // Production'da gerçek RevenueCat Non-Consumable purchase
    // TODO: RevenueCat'te token product'ları oluşturulacak
    throw new Error('Token purchase için RevenueCat product oluşturulmalı');
    
  } catch (error) {
    console.error('[RevenueCat] Token satın alma hatası:', error);
    throw error;
  }
};

/**
 * Token satın alma bilgilerini Supabase'e kaydet
 * @param {string} userId - Kullanıcı ID'si
 * @param {Object} purchaseInfo - Token purchase bilgileri
 */
const saveTokenPurchaseToSupabase = async (userId, purchaseInfo) => {
  try {
    const { productIdentifier, transactionId, purchaseDate, tokenAmount } = purchaseInfo;

    // Supabase'e kaydet - DETAYLI RAPORLAMA için tüm kolonlar
    const tokenPackages = {
      '100_tokens': { name: '100 Token Paketi', amount: 4.99 },
      '500_tokens': { name: '500 Token Paketi', amount: 19.99 },
      '1000_tokens': { name: '1000 Token Paketi', amount: 34.99 },
    };
    
    const packageInfo = tokenPackages[productIdentifier] || { name: `${tokenAmount} Token`, amount: 0 };
    
    const purchaseData = {
      user_id: userId,
      product_id: productIdentifier,
      product_name: packageInfo.name,
      product_type: 'token_package',
      transaction_id: transactionId,
      amount: packageInfo.amount,
      currency: 'USD',
      payment_method: Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay',
      payment_provider: Platform.OS === 'ios' ? 'app_store' : 'play_store',
      store: Platform.OS === 'ios' ? 'app_store' : 'play_store',
      purchased_at: purchaseDate || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',
      is_sandbox: __DEV__,
      token_amount: tokenAmount,
      metadata: {
        token_amount: tokenAmount,
        package_type: 'one_time_purchase',
      }
    };

    const { error } = await supabase
      .from('purchases')
      .insert(purchaseData);

    if (error) throw error;



    // User'ın token miktarını güncelle
    await addTokensToUser(userId, tokenAmount, transactionId);
    
  } catch (error) {
    console.error('[RevenueCat] Token purchase kaydetme hatası:', error);
    throw error;
  }
};

/**
 * Kullanıcıya token ekle
 * @param {string} userId - Kullanıcı ID'si
 * @param {number} amount - Eklenecek token miktarı
 * @param {string} transactionId - İşlem ID'si
 * @param {string} description - İşlem açıklaması (opsiyonel)
 */
const addTokensToUser = async (userId, amount, transactionId, description = null) => {
  try {
    // Mevcut token sayısını al
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const currentTokens = profile?.tokens || 0;
    const newTokens = currentTokens + amount;

    // Token'ları güncelle
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        tokens: newTokens,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Token transaction kaydı oluştur
    const { error: txError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: description?.includes('abonelik') ? 'subscription_credit' : 'purchase',
        description: description || `Token satın alımı: ${amount} token`,
        reference_id: transactionId,
        reference_type: description?.includes('abonelik') ? 'subscription' : 'purchase',
      });

    if (txError) {
      console.error('[RevenueCat] Token transaction kaydı oluşturulamadı:', txError);
    }

    return true; // Başarılı
  } catch (error) {
    console.error('[RevenueCat] Token ekleme hatası:', error);
    throw error;
  }
};

// Export all functions
export default {
  configureRevenueCat,
  loginRevenueCat,
  logoutRevenueCat,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  isPremiumActive,
  getActiveSubscriptions,
  addCustomerInfoUpdateListener,
  isRevenueCatConfigured,
};

