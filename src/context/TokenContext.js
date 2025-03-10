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
import { FIRESTORE_DB } from "../../firebase/FirebaseConfig";
import { useAuth } from "./AuthContext";

// Token context creation
const TokenContext = createContext(null);

// Token cost constants
export const TOKEN_COSTS = {
  DOCUMENT_ANALYSIS: 1, // Basic analysis (1-5 pages)
  LARGE_DOCUMENT: 2, // Large documents (5+ pages)
  QUESTION: 0.2, // Each question after first 3 free
};

/**
 * Token management Provider component
 * Manages user token balance and purchases
 */
export function TokenProvider({ children }) {
  const { user } = useAuth();
  const [tokens, setTokens] = useState(0);
  const [freeTrialUsed, setFreeTrialUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [subscription, setSubscription] = useState(null);

  // Load token balance when user changes
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
   * Load user's token balance from Firestore
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

        // Load token history
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
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          tokens: 5, // Start with 5 free tokens
          freeTrialUsed: false,
          createdAt: serverTimestamp(),
        });
        setTokens(5);
        setFreeTrialUsed(false);
      }
    } catch (error) {
      console.error("Error loading token balance:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check subscription status
   */
  const checkSubscription = async () => {
    try {
      // For simplicity, we're using a mock subscription checker here
      // In a real app, you would integrate with a service like RevenueCat
      setSubscription(null);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  /**
   * Check if user has enough tokens for an operation
   * @param {number} cost - Operation cost
   * @returns {boolean} - Whether user has enough tokens
   */
  const hasEnoughTokens = (cost) => {
    if (!user) return false;

    // Allow if free trial available
    if (!freeTrialUsed && cost === TOKEN_COSTS.DOCUMENT_ANALYSIS) {
      return true;
    }

    // Always allow if user has active subscription
    if (subscription?.active) {
      return true;
    }

    return tokens >= cost;
  };

  /**
   * Use tokens for an operation
   * @param {number} cost - Operation cost
   * @param {string} operationType - Operation type ('analysis', 'question', etc.)
   * @param {string} documentId - Related document ID (if any)
   * @returns {Promise<boolean>} - Whether operation was successful
   */
  const useTokens = async (cost, operationType, documentId = null) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setLoading(true);

      // Free trial usage
      if (!freeTrialUsed && cost === TOKEN_COSTS.DOCUMENT_ANALYSIS) {
        // Update free trial status
        const userRef = doc(FIRESTORE_DB, "users", user.uid);
        await updateDoc(userRef, {
          freeTrialUsed: true,
        });

        setFreeTrialUsed(true);

        // Log free trial usage
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

      // Check for active subscription
      if (subscription?.active) {
        // Log usage with subscription (no token deduction)
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

      // Check if user has enough tokens
      if (tokens < cost) {
        throw new Error("Not enough tokens");
      }

      // Update token balance
      const userRef = doc(FIRESTORE_DB, "users", user.uid);
      await updateDoc(userRef, {
        tokens: increment(-cost),
      });

      // Update local state
      setTokens((prevTokens) => prevTokens - cost);

      // Log token usage
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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get description for an operation type
   * @param {string} operationType - Operation type
   * @returns {string} - Operation description
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
        refreshBalance: loadTokenBalance,
        refreshSubscription: checkSubscription,
        TOKEN_COSTS,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}

// Export the token context hook
export function useTokens() {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokens must be used within a TokenProvider");
  }
  return context;
}
