// 🪙 TOKEN CONTEXT - Merkezi Token Yönetimi
// Tüm uygulama için tek bir token state'i - real-time güncelleme

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const TokenContext = createContext({
  tokens: 0,
  tokenCosts: {},
  loading: false,
  error: null,
  getTokenCost: () => 0,
  getTokenCostLabel: async () => null,
  hasEnoughTokens: () => false,
  fetchTokens: async () => {},
  refreshTokens: async () => {},
  fetchTokenCosts: async () => {},
});

export const useTokenContext = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useTokenContext must be used within TokenProvider');
  }
  return context;
};

export const TokenProvider = ({ children }) => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState(0);
  const [tokenCosts, setTokenCosts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Token'ları Supabase'den çek
  const fetchTokens = useCallback(async (showLoading = true) => {
    if (!user?.id) {
      setTokens(0);
      return;
    }

    if (showLoading) setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setTokens(data?.tokens || 0);
    } catch (err) {
      setError('Token bilgileri yüklenemedi');
      if (__DEV__) console.error('[TokenContext] Fetch error:', err);
      setTokens(0);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user?.id]);

  // Manuel refresh (polling yerine)
  const refreshTokens = useCallback(async () => {
    await fetchTokens(false);
  }, [fetchTokens]);

  // Token maliyetlerini database'den çek
  const fetchTokenCosts = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('module_token_costs')
        .select('module_id, token_cost, display_label')
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      // Array'i object'e çevir
      const costs = {};
      const displayLabels = {};
      
      if (data) {
        data.forEach(item => {
          costs[item.module_id] = item.token_cost;
          if (item.display_label) {
            displayLabels[item.module_id] = item.display_label;
          }
        });
      }

      setTokenCosts(costs);
      
      // Display labels loaded
    } catch (err) {
      if (__DEV__) console.error('[TokenContext] Fetch token costs error:', err);
      // Fallback: Default değerler
      setTokenCosts({
        chat: 1,
        math: 7,
      });
    }
  }, []);

  // Token maliyetini al
  const getTokenCost = useCallback((moduleId) => {
    return tokenCosts[moduleId] || 0;
  }, [tokenCosts]);

  // Token maliyeti display label'ını al
  const getTokenCostLabel = useCallback(async (moduleId) => {
    try {
      const { data, error } = await supabase
        .from('module_token_costs')
        .select('display_label')
        .eq('module_id', moduleId)
        .eq('is_active', true)
        .single();

      if (error || !data) return null;
      return data.display_label;
    } catch (err) {
      if (__DEV__) console.error('[TokenContext] Get token cost label error:', err);
      return null;
    }
  }, []);

  // Yeterli token var mı kontrol et
  const hasEnoughTokens = useCallback((moduleId) => {
    const cost = getTokenCost(moduleId);
    return tokens >= cost;
  }, [tokens, getTokenCost]);

  // İlk yükleme ve Real-time subscription
  useEffect(() => {
    if (!user?.id) {
      setTokens(0);
      isInitializedRef.current = false;
      return;
    }
    
    // Her user değişiminde yeniden başlat
    if (isInitializedRef.current) {
      // Reset and reinitialize
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      isInitializedRef.current = false;
    }
    
    isInitializedRef.current = true;
    
    // İlk token'ı ve token maliyetlerini çek
    fetchTokens();
    fetchTokenCosts();

    // Real-time subscription - SADECE BİR KEZ
    const channel = supabase
      .channel(`token-updates:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          // Token değişikliğini güncelle
          if (payload.new && typeof payload.new.tokens === 'number') {
            setTokens(payload.new.tokens);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'token_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Token transaction olduğunda token'ı refresh et
          fetchTokens(false);
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      isInitializedRef.current = false;
    };
  }, [user?.id, fetchTokens]);

  // User değiştiğinde reset et
  useEffect(() => {
    if (!user?.id) {
      setTokens(0);
      isInitializedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }
  }, [user?.id]);

  const value = {
    tokens,
    tokenCosts,
    loading,
    error,
    getTokenCost,
    getTokenCostLabel,
    hasEnoughTokens,
    fetchTokens,
    refreshTokens,
    fetchTokenCosts,
  };

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
};
