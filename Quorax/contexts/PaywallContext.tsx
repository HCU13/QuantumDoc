import React, { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useRouter } from "expo-router";

export type PaywallReason =
  | "limit"        // Daily/lifetime usage limit reached
  | "feature"     // Locked PRO feature (verify, explain, similar, etc.)
  | "firstSolve"  // After Nth free solve, hard paywall before next
  | "exitIntent"; // User dismissed paywall, show discount offer

interface PaywallContextType {
  /** Open the paywall sheet/modal with the given reason. */
  openPaywall: (reason: PaywallReason) => void;
  /** Last reason the paywall was opened with, for analytics or copy adaption. */
  lastReason: PaywallReason | null;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

export const PaywallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [lastReason, setLastReason] = useState<PaywallReason | null>(null);

  const openPaywall = useCallback(
    (reason: PaywallReason) => {
      setLastReason(reason);
      // Tek bir paywall sayfası kullanıyoruz; reason'ı param ile geçiyoruz.
      router.push({
        pathname: "/(main)/profile/subscription",
        params: { reason },
      } as any);
    },
    [router]
  );

  return (
    <PaywallContext.Provider value={{ openPaywall, lastReason }}>
      {children}
    </PaywallContext.Provider>
  );
};

export const usePaywall = (): PaywallContextType => {
  const ctx = useContext(PaywallContext);
  if (!ctx) {
    throw new Error("usePaywall must be used within PaywallProvider");
  }
  return ctx;
};
