import React, { createContext, useContext, useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
// import Purchases from "react-native-purchases";
import { FIRESTORE_DB } from "../../firebase/FirebaseConfig";
import { useAuth } from "./AuthContext";
import { showToast } from "../utils/toast";

// Token context oluşturma
const TokenContext = createContext(null);

// Token maliyetleri için sabitler
export const TOKEN_COSTS = {
  DOCUMENT_ANALYSIS: 1, // Temel analiz (1-5 sayfa)
  LARGE_DOCUMENT: 2, // Büyük belgeler (5+ sayfa)
  QUESTION: 0.2, // İlk 3 ücretsiz sorudan sonra her soru için
};

// RevenueCat paket isimleri
export const PACKAGES = {
  TOKENS_20: "tokens_20", // 20 token ($4.99)
  TOKENS_50: "tokens_50", // 50 token ($9.99)
  TOKENS_120: "tokens_120", // 120 token ($19.99)
  SUBSCRIPTION: "sub_monthly", // Aylık abonelik ($9.99/ay, 50 token/ay)
};

/**
 * Token yönetim Provider bileşeni
 * Kullanıcı token bakiyesini ve satın alma işlemlerini yönetir
 */
export function TokenProvider({ children }) {
  const { user } = useAuth();
  const [tokens, setTokens] = useState(0);
  const [freeTrialUsed, setFreeTrialUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [subscription, setSubscription] = useState(null);

  // Kullanıcı değiştiğinde token bakiyesini yükle
  useEffect(() => {
    if (user) {
      loadTokenBalance();
      checkSubscription();
    } else {
      setTokens(0);
      setFreeTrialUsed(false);
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  /**
   * Kullanıcının token bakiyesini Firestore'dan yükler
   */
  const loadTokenBalance = async () => {
    try {
      setLoading(true);

      const userRef = doc(FIRESTORE_DB, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setTokens(userData.tokens || 0);
        setFreeTrialUsed(userData.freeTrialUsed || false);

        // Token geçmişini yükle
        try {
          const historySnapshot = await getDocs(
            query(
              collection(FIRESTORE_DB, "tokenHistory"),
              where("userId", "==", user.uid),
              orderBy("timestamp", "desc"),
              limit(10)
            )
          );

          const history = historySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          }));

          setTokenHistory(history);
        } catch (historyError) {
          console.error("Error loading token history:", historyError);
        }
      } else {
        // Kullanıcı belgesi yoksa oluştur
        await setDoc(userRef, {
          tokens: 5, // 5 ücretsiz token ile başla
          freeTrialUsed: false,
          createdAt: serverTimestamp(),
        });
        setTokens(5);
        setFreeTrialUsed(false);
      }
    } catch (error) {
      console.error("Error loading token balance:", error);
      showToast("error", "Failed to load token balance");
    } finally {
      setLoading(false);
    }
  };

  /**
   * RevenueCat abonelik durumunu kontrol eder
   */
  const checkSubscription = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      // Aktif abonelik kontrolü
      const activeSubscription =
        Object.values(customerInfo.entitlements.active).length > 0;

      if (activeSubscription) {
        setSubscription({
          active: true,
          expirationDate: customerInfo.latestExpirationDate,
        });
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  /**
   * Kullanıcının bir işlem için yeterli tokeni olup olmadığını kontrol eder
   * @param {number} cost - İşlem maliyeti
   * @returns {boolean} - Yeterli token var mı
   */
  const hasEnoughTokens = (cost) => {
    if (!user) return false;

    // Ücretsiz deneme kullanılabilirse izin ver
    if (!freeTrialUsed && cost === TOKEN_COSTS.DOCUMENT_ANALYSIS) {
      return true;
    }

    // Aktif abonelik varsa her zaman izin ver
    if (subscription?.active) {
      return true;
    }

    return tokens >= cost;
  };

  /**
   * Bir işlem için token kullanır
   * @param {number} cost - İşlem maliyeti
   * @param {string} operationType - İşlem türü ('analysis', 'question', vb.)
   * @param {string} documentId - İlgili belge ID'si (varsa)
   * @returns {Promise<boolean>} - İşlem başarılı mı
   */
  const useTokens = async (cost, operationType, documentId = null) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setLoading(true);

      // Ücretsiz deneme kullanımı
      if (!freeTrialUsed && cost === TOKEN_COSTS.DOCUMENT_ANALYSIS) {
        // Ücretsiz deneme durumunu güncelle
        const userRef = doc(FIRESTORE_DB, "users", user.uid);
        await updateDoc(userRef, {
          freeTrialUsed: true,
        });

        setFreeTrialUsed(true);

        // Ücretsiz deneme kullanımını logla
        await addDoc(collection(FIRESTORE_DB, "tokenHistory"), {
          userId: user.uid,
          amount: 0,
          operationType,
          documentId,
          description: "Free trial used",
          timestamp: serverTimestamp(),
        });

        return true;
      }

      // Aktif abonelik kontrolü
      if (subscription?.active) {
        // Abonelik ile kullanım, token düşürme yok sadece kayıt
        await addDoc(collection(FIRESTORE_DB, "tokenHistory"), {
          userId: user.uid,
          amount: 0,
          operationType,
          documentId,
          description:
            getOperationDescription(operationType) + " (Subscription)",
          timestamp: serverTimestamp(),
        });

        return true;
      }

      // Yeterli token kontrolü
      if (tokens < cost) {
        throw new Error("Not enough tokens");
      }

      // Token bakiyesini güncelle
      const userRef = doc(FIRESTORE_DB, "users", user.uid);
      await updateDoc(userRef, {
        tokens: increment(-cost),
      });

      // Yerel durumu güncelle
      setTokens((prevTokens) => prevTokens - cost);

      // Token kullanımını logla
      await addDoc(collection(FIRESTORE_DB, "tokenHistory"), {
        userId: user.uid,
        amount: -cost,
        operationType,
        documentId,
        description: getOperationDescription(operationType),
        timestamp: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("Error using tokens:", error);
      showToast("error", error.message || "Failed to use tokens");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Token satın alma işlevselliği (RevenueCat ile)
   * @param {string} packageId - Satın alınacak paket kimliği
   * @returns {Promise<boolean>} - İşlem başarılı mı
   */
  const purchaseTokens = async (packageId) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setLoading(true);

      // RevenueCat ile satın alma işlemi
      const purchaseInfo = await Purchases.purchasePackage(packageId);

      // Satın alma başarılı mı kontrol et
      if (purchaseInfo?.customerInfo?.entitlements?.active) {
        // Paket ID'ye göre token miktarını belirle
        let tokensToAdd = 0;

        switch (packageId) {
          case PACKAGES.TOKENS_20:
            tokensToAdd = 20;
            break;
          case PACKAGES.TOKENS_50:
            tokensToAdd = 50;
            break;
          case PACKAGES.TOKENS_120:
            tokensToAdd = 120;
            break;
          case PACKAGES.SUBSCRIPTION:
            // Abonelik için aylık token eklemesi
            tokensToAdd = 50;
            await checkSubscription(); // Abonelik durumunu güncelle
            break;
        }

        if (tokensToAdd > 0) {
          // Token bakiyesini güncelle
          const userRef = doc(FIRESTORE_DB, "users", user.uid);
          await updateDoc(userRef, {
            tokens: increment(tokensToAdd),
          });

          // Yerel durumu güncelle
          setTokens((prevTokens) => prevTokens + tokensToAdd);

          // Token eklemeyi logla
          await addDoc(collection(FIRESTORE_DB, "tokenHistory"), {
            userId: user.uid,
            amount: tokensToAdd,
            operationType: "purchase",
            description: `Purchased ${tokensToAdd} tokens`,
            timestamp: serverTimestamp(),
          });
        }

        showToast("success", "Purchase successful");
        return true;
      } else {
        throw new Error("Purchase failed or was cancelled");
      }
    } catch (error) {
      console.error("Purchase error:", error);

      // RevenueCat hatalarını yönet
      if (error.userCancelled) {
        showToast("info", "Purchase cancelled");
      } else {
        showToast(
          "error",
          "Purchase failed: " + (error.message || "Unknown error")
        );
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Token işlemi için açıklama döndürür
   * @param {string} operationType - İşlem türü
   * @returns {string} - İşlem açıklaması
   */
  const getOperationDescription = (operationType) => {
    switch (operationType) {
      case "analysis":
        return "Document analysis";
      case "question":
        return "Document question";
      case "export":
        return "Document export";
      default:
        return "Token usage";
    }
  };

  return (
    <TokenContext.Provider
      value={{
        tokens,
        freeTrialUsed,
        subscription,
        loading,
        tokenHistory,
        hasEnoughTokens,
        useTokens,
        purchaseTokens,
        refreshBalance: loadTokenBalance,
        refreshSubscription: checkSubscription,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

// Token context'i hook'unu dışa aktar
export function useTokens() {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokens must be used within a TokenProvider");
  }
  return context;
}
