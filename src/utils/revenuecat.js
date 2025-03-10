// src/utils/revenuecat.js
import { Platform } from "react-native";

// Expo Go ortamında mı çalışıyoruz kontrolü
const isExpoGo =
  !global.nativeCallSyncHook ||
  global.__expo?.expoVersion ||
  process.env.EXPO_ENVIRONMENT === "EXPO_GO";

console.log("Running in Expo Go mode:", isExpoGo);

// RevenueCat API anahtarları
// NOT: Bu anahtarları gerçek projenizde .env dosyasında saklamanız güvenlik açısından daha iyidir
const API_KEYS = {
  apple: "REVENUECAT_APPLE_API_KEY", // iOS için API anahtarı
  google: "REVENUECAT_GOOGLE_API_KEY", // Android için API anahtarı
};

// Paket kimlikleri (hem Apple hem de Google için)
export const PACKAGE_IDS = {
  // Token paketleri
  tokens20: "tokens_20_package", // 20 token paketi
  tokens50: "tokens_50_package", // 50 token paketi
  tokens120: "tokens_120_package", // 120 token paketi

  // Abonelik
  monthly: "monthly_subscription", // Aylık abonelik
  yearly: "yearly_subscription", // Yıllık abonelik
};

// Satın alma paketlerinin detayları
export const PACKAGES = {
  // Token paketleri
  [PACKAGE_IDS.tokens20]: {
    id: PACKAGE_IDS.tokens20,
    title: "Basic Package",
    tokens: 20,
    price: "$4.99",
    localizedPrice: "$4.99", // Sabit fiyat
    description: "20 tokens for occasional use",
  },
  [PACKAGE_IDS.tokens50]: {
    id: PACKAGE_IDS.tokens50,
    title: "Standard Package",
    tokens: 50,
    price: "$9.99",
    localizedPrice: "$9.99", // Sabit fiyat
    description: "50 tokens with 20% savings",
    isBestValue: false,
  },
  [PACKAGE_IDS.tokens120]: {
    id: PACKAGE_IDS.tokens120,
    title: "Premium Package",
    tokens: 120,
    price: "$19.99",
    localizedPrice: "$19.99", // Sabit fiyat
    description: "120 tokens with 30% savings",
    isBestValue: true,
  },

  // Abonelikler
  [PACKAGE_IDS.monthly]: {
    id: PACKAGE_IDS.monthly,
    title: "Monthly Subscription",
    tokens: 50, // Her ay 50 token
    price: "$9.99/month",
    localizedPrice: "$9.99/month", // Sabit fiyat
    description: "50 tokens per month + unlimited analysis",
    isBestValue: true,
    isSubscription: true,
  },
  [PACKAGE_IDS.yearly]: {
    id: PACKAGE_IDS.yearly,
    title: "Yearly Subscription",
    tokens: 600, // Yılda toplam 600 token (ayda 50)
    price: "$99.99/year",
    localizedPrice: "$99.99/year", // Sabit fiyat
    description: "Save 17% with annual billing",
    isSubscription: true,
  },
};

// Yetkilendirme kimlikleri
export const ENTITLEMENTS = {
  premium: "premium_access", // Premium erişim yetkilendirmesi
};

// Mock Purchases objesi (Expo Go için)
const mockPurchases = {
  LOG_LEVEL: {
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
  },
  PACKAGE_TYPE: {
    LIFETIME: "lifetime",
    ANNUAL: "annual",
    MONTHLY: "monthly",
  },
  configure: async () => {
    console.log("[Mock RevenueCat] Configured");
    return Promise.resolve();
  },
  setLogLevel: async () => {
    console.log("[Mock RevenueCat] Log level set");
    return Promise.resolve();
  },
  getCustomerInfo: async () => {
    console.log("[Mock RevenueCat] Getting customer info");
    return Promise.resolve({
      entitlements: {
        active: {},
      },
      allPurchaseDates: {},
    });
  },
  purchasePackage: async (pkg) => {
    console.log(
      "[Mock RevenueCat] Purchase package:",
      pkg.id || pkg.identifier
    );
    return Promise.resolve({
      customerInfo: {
        entitlements: {
          active: {},
        },
      },
      productIdentifier: pkg.id || pkg.identifier,
    });
  },
  logIn: async (userId) => {
    console.log("[Mock RevenueCat] Logged in:", userId);
    return Promise.resolve();
  },
  logOut: async () => {
    console.log("[Mock RevenueCat] Logged out");
    return Promise.resolve();
  },
  getOfferings: async () => {
    console.log("[Mock RevenueCat] Getting offerings");

    // Mock paketler oluştur
    const mockAvailablePackages = Object.values(PACKAGES).map((pkg) => ({
      identifier: pkg.id,
      packageType: pkg.isSubscription
        ? pkg.id.includes("monthly")
          ? "MONTHLY"
          : "ANNUAL"
        : "LIFETIME",
      product: {
        priceString: pkg.price,
        price: Number(pkg.price.replace("$", "").split("/")[0]),
        identifier: pkg.id,
        title: pkg.title,
        description: pkg.description,
      },
    }));

    return Promise.resolve({
      current: {
        identifier: "main",
        availablePackages: mockAvailablePackages,
      },
      all: {
        tokens: {
          identifier: "tokens",
          availablePackages: mockAvailablePackages.filter(
            (p) =>
              !p.packageType.includes("MONTHLY") &&
              !p.packageType.includes("ANNUAL")
          ),
        },
        subscriptions: {
          identifier: "subscriptions",
          availablePackages: mockAvailablePackages.filter(
            (p) =>
              p.packageType.includes("MONTHLY") ||
              p.packageType.includes("ANNUAL")
          ),
        },
      },
    });
  },
  presentCodeRedemptionSheet: async () => {
    console.log("[Mock RevenueCat] Presented code redemption sheet");
    return Promise.resolve();
  },
  beginRefundRequest: async () => {
    console.log("[Mock RevenueCat] Begin refund request");
    return Promise.resolve();
  },
};

// Gerçek Purchases (eğer kullanılabilirse) veya mock implementasyon
const Purchases = isExpoGo ? mockPurchases : null;

/**
 * RevenueCat'i initialize eder ve konfigüre eder
 * @returns {Promise<void>}
 */
export const initializeRevenueCat = async () => {
  try {
    if (isExpoGo) {
      console.log("[Mock] RevenueCat successfully initialized in Expo Go");
      return;
    }

    // Normal bir build'de react-native-purchases'ı çalıştırırız
    // Bu kısmı sadece normal build'de aktif et
    /*
    // Platformu tespit et ve ilgili API anahtarını kullan
    const apiKey = Platform.OS === "ios" ? API_KEYS.apple : API_KEYS.google;

    // Debug modunu aktif etmek için
    if (__DEV__) {
      await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }

    // RevenueCat SDK'sını başlat
    await Purchases.configure({
      apiKey,
      appUserID: null, // null bırakılırsa RevenueCat kendi kimliğini oluşturur
    });
    */
  } catch (error) {
    console.error("Error initializing RevenueCat:", error);
  }
};

/**
 * Mevcut kullanıcı için RevenueCat kimliğini ayarlar
 * @param {string} userId - Kullanıcı kimliği (Firebase Auth UID)
 * @returns {Promise<void>}
 */
export const identifyUser = async (userId) => {
  if (!userId) return;

  try {
    if (isExpoGo) {
      console.log("[Mock] User identified with RevenueCat:", userId);
      return;
    }

    // RevenueCat'te kullanıcıyı tanımla
    // await Purchases.logIn(userId);
  } catch (error) {
    console.error("Error identifying user with RevenueCat:", error);
  }
};

/**
 * RevenueCat'ten çıkış yapar
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    if (isExpoGo) {
      console.log("[Mock] User logged out from RevenueCat");
      return;
    }

    // await Purchases.logOut();
  } catch (error) {
    console.error("Error logging out from RevenueCat:", error);
  }
};

/**
 * Kullanıcının abonelik durumunu kontrol eder
 * @returns {Promise<Object>} Abonelik durumu
 */
export const checkSubscriptionStatus = async () => {
  try {
    if (isExpoGo) {
      // Expo Go için sabit bir abonelik durumu
      const mockSubscriptionActive = Math.random() > 0.5; // Rastgele true/false

      console.log(
        "[Mock] Subscription status:",
        mockSubscriptionActive ? "Active" : "Inactive"
      );

      return {
        isSubscribed: mockSubscriptionActive,
        expirationDate: mockSubscriptionActive
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null, // 30 gün sonra
        customerInfo: {
          entitlements: {
            active: mockSubscriptionActive
              ? {
                  [ENTITLEMENTS.premium]: {
                    expiresDate: new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ),
                  },
                }
              : {},
          },
        },
      };
    }

    // Normal platformda çalışacak kod
    /*
    const customerInfo = await Purchases.getCustomerInfo();

    // Premium yetkilendirmesi var mı kontrol et
    const hasPremium =
      customerInfo.entitlements.active[ENTITLEMENTS.premium] !== undefined;

    return {
      isSubscribed: hasPremium,
      expirationDate: hasPremium
        ? new Date(
            customerInfo.entitlements.active[ENTITLEMENTS.premium].expiresDate
          )
        : null,
      customerInfo,
    };
    */

    return {
      isSubscribed: false,
      expirationDate: null,
      customerInfo: null,
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return {
      isSubscribed: false,
      expirationDate: null,
      customerInfo: null,
    };
  }
};

/**
 * Tüm mevcut paketleri fiyatlandırma bilgileriyle getirir
 * @returns {Promise<Array>} Tüm paketler
 */
export const getAvailablePackages = async () => {
  try {
    if (isExpoGo) {
      console.log("[Mock] Getting available packages");

      // Mock paketleri döndür
      return Object.values(PACKAGES).map((pkg) => ({
        ...pkg,
        product: {
          priceString: pkg.price,
          identifier: pkg.id,
        },
        rcPackage: {
          identifier: pkg.id,
          product: {
            priceString: pkg.price,
            identifier: pkg.id,
          },
        },
      }));
    }

    // Normal platformda çalışacak kod
    /*
    // Abonelikler için entitlement kimliği ile paketleri al
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      throw new Error("No offerings found");
    }

    // Abonelik paketleri
    const subscriptionPackages = offerings.current.availablePackages;

    // Tek seferlik satın almalar
    const nonSubscriptionOffering =
      offerings.all["tokens"] || offerings.all["consumable"];
    const tokenPackages = nonSubscriptionOffering
      ? nonSubscriptionOffering.availablePackages
      : [];

    // Tüm paketleri birleştir ve yerelleştirilmiş fiyatlarla güncelle
    const allPackages = [...subscriptionPackages, ...tokenPackages].map(
      (pkg) => {
        // Paket ID'sine göre bilgileri bul
        const packageInfo = Object.values(PACKAGES).find(
          (p) => p.id === pkg.identifier
        ) || {
          title: pkg.identifier,
          description: "",
          tokens: 0,
          isBestValue: false,
          isSubscription: pkg.packageType !== Purchases.PACKAGE_TYPE.LIFETIME,
        };

        return {
          ...packageInfo,
          id: pkg.identifier,
          product: pkg.product,
          localizedPrice: pkg.product.priceString,
          // RevenueCat nesnelerini ekle
          rcPackage: pkg,
        };
      }
    );

    return allPackages;
    */

    // Hata durumunda statik paketleri döndür (yerelleştirilmiş fiyatlar olmadan)
    return Object.values(PACKAGES);
  } catch (error) {
    console.error("Error getting available packages:", error);

    // Hata durumunda statik paketleri döndür
    return Object.values(PACKAGES);
  }
};

/**
 * Belirli bir paketi satın alır
 * @param {string} packageId - Paket kimliği
 * @returns {Promise<Object>} Satın alma sonucu
 */
export const purchasePackage = async (packageId) => {
  try {
    if (isExpoGo) {
      console.log("[Mock] Purchasing package:", packageId);

      // Mock alım başarılı olduğunu varsayalım
      const packageInfo = PACKAGES[packageId] || {
        id: packageId,
        title: "Unknown Package",
        tokens: 50,
      };

      // 2 saniye bekle - UI'daki yükleme animasyonlarını görmek için
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        isPremium: packageInfo.isSubscription || false,
        packageInfo,
        productIdentifier: packageId,
      };
    }

    // Normal platformda çalışacak kod
    /*
    // Paketi satın al
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(
      rcPackage
    );

    // Satın alma başarılı mı kontrol et
    const isPremium =
      customerInfo.entitlements.active[ENTITLEMENTS.premium] !== undefined;

    return {
      success: true,
      isPremium,
      customerInfo,
      productIdentifier,
    };
    */

    return {
      success: true,
      isPremium: false,
      customerInfo: null,
      productIdentifier: packageId,
    };
  } catch (error) {
    console.log("Error purchasing package:", error);

    return {
      success: false,
      isPremium: false,
      error: error.message || "Unknown error",
    };
  }
};

/**
 * RevenueCat'den satın alma geçmişini alır
 * @returns {Promise<Array>} Satın alma geçmişi
 */
export const getPurchaseHistory = async () => {
  try {
    if (isExpoGo) {
      console.log("[Mock] Getting purchase history");

      // Mock satın alma geçmişi
      return {
        [PACKAGE_IDS.tokens20]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        [PACKAGE_IDS.tokens50]: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      };
    }

    // Normal platformda çalışacak kod
    /*
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.allPurchaseDates;
    */

    return [];
  } catch (error) {
    console.error("Error getting purchase history:", error);
    return [];
  }
};

/**
 * Aktif abonelikleri yönetme sayfasını açar
 * @returns {Promise<void>}
 */
export const manageSubscriptions = async () => {
  try {
    if (isExpoGo) {
      console.log("[Mock] Managing subscriptions");
      alert(
        "This would open the subscription management screen on a real device"
      );
      return;
    }

    // await Purchases.presentCodeRedemptionSheet();
  } catch (error) {
    console.error("Error opening subscription management:", error);
  }
};

/**
 * Geri ödeme talep etme sayfasını açar
 * @returns {Promise<void>}
 */
export const requestRefund = async () => {
  try {
    if (isExpoGo) {
      console.log("[Mock] Requesting refund");
      alert("This would open the refund request screen on a real device");
      return;
    }

    /*
    if (Platform.OS === "ios") {
      await Purchases.beginRefundRequest();
    } else {
      // Android için farklı bir yaklaşım gerekebilir
      console.warn("Refund requests on Android need to be handled differently");
    }
    */
  } catch (error) {
    console.error("Error requesting refund:", error);
  }
};
