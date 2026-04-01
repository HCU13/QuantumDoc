import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface TokenContextType {
  tokens: number;
  isLoading: boolean;
  refreshTokens: () => Promise<void>;
  deductTokens: (amount: number, description?: string, referenceType?: string, referenceId?: string) => Promise<boolean>;
  addTokens: (amount: number, description?: string, referenceType?: string, referenceId?: string) => Promise<boolean>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const { profile, user, isLoggedIn, refreshUser } = useAuth();
  const [tokens, setTokens] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Subscription modelinde token kolonu kaldırıldı; sadece gösterim için 0 kullanıyoruz
  useEffect(() => {
    if (isLoggedIn && profile) {
      setTokens(0);
      setIsLoading(false);
    } else {
      setTokens(0);
      setIsLoading(false);
    }
  }, [profile, isLoggedIn]);

  // Refresh tokens from database
  const refreshTokens = useCallback(async () => {
    if (!user?.id || !isLoggedIn) {
      setTokens(0);
      return;
    }

    try {
      setIsLoading(true);
      await refreshUser(); // This will update the profile in AuthContext
      // Token will be updated via useEffect when profile changes
    } catch (error) {
      console.error('Error refreshing tokens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isLoggedIn, refreshUser]);

  // Subscription modelinde update_user_tokens RPC kaldırıldı; no-op
  const deductTokens = useCallback(async (
    _amount: number,
    _description?: string,
    _referenceType?: string,
    _referenceId?: string
  ): Promise<boolean> => {
    if (!user?.id || !isLoggedIn) return false;
    return false; // Token sistemi kaldırıldı
  }, [user?.id, isLoggedIn]);

  // Subscription modelinde update_user_tokens RPC kaldırıldı; no-op
  const addTokens = useCallback(async (
    _amount: number,
    _description?: string,
    _referenceType?: string,
    _referenceId?: string
  ): Promise<boolean> => {
    if (!user?.id || !isLoggedIn) return false;
    return false; // Token sistemi kaldırıldı
  }, [user?.id, isLoggedIn]);

  return (
    <TokenContext.Provider
      value={{
        tokens,
        isLoading,
        refreshTokens,
        deductTokens,
        addTokens,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};

