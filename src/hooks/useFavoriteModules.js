import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useFavoriteRefresh } from '../contexts/FavoriteRefreshContext';

/**
 * Favori modülleri yönetmek için hook
 */
export const useFavoriteModules = () => {
  const { user } = useAuth();
  const { refreshKey } = useFavoriteRefresh();
  const [favoriteModules, setFavoriteModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Favori modülleri yükle
  const loadFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavoriteModules([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('favorite_modules')
        .eq('id', user.id)
        .single();

      if (error) {
        if (__DEV__) console.error('❌ FAVORITES: Load error:', error);
        setFavoriteModules([]);
        return;
      }

      // JSONB array'i parse et
      const favorites = data?.favorite_modules || [];
      setFavoriteModules(Array.isArray(favorites) ? favorites : []);
    } catch (error) {
      if (__DEV__) console.error('❌ FAVORITES: Load error:', error);
      setFavoriteModules([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Favori ekle
  const addFavorite = useCallback(async (moduleId) => {
    if (!user?.id || !moduleId) return false;

    try {
      const currentFavorites = [...favoriteModules];
      
      // Zaten favorilerde varsa ekleme
      if (currentFavorites.includes(moduleId)) {
        return true;
      }

      currentFavorites.push(moduleId);

      const { error } = await supabase
        .from('profiles')
        .update({ favorite_modules: currentFavorites })
        .eq('id', user.id);

      if (error) {
        if (__DEV__) console.error('❌ FAVORITES: Add error:', error);
        return false;
      }

      setFavoriteModules(currentFavorites);
      return true;
    } catch (error) {
      if (__DEV__) console.error('❌ FAVORITES: Add error:', error);
      return false;
    }
  }, [user?.id, favoriteModules]);

  // Favori çıkar
  const removeFavorite = useCallback(async (moduleId) => {
    if (!user?.id || !moduleId) return false;

    try {
      const currentFavorites = favoriteModules.filter(id => id !== moduleId);

      const { error } = await supabase
        .from('profiles')
        .update({ favorite_modules: currentFavorites })
        .eq('id', user.id);

      if (error) {
        if (__DEV__) console.error('❌ FAVORITES: Remove error:', error);
        return false;
      }

      setFavoriteModules(currentFavorites);
      return true;
    } catch (error) {
      if (__DEV__) console.error('❌ FAVORITES: Remove error:', error);
      return false;
    }
  }, [user?.id, favoriteModules]);

  // Favori mi kontrol et
  const isFavorite = useCallback((moduleId) => {
    return favoriteModules.includes(moduleId);
  }, [favoriteModules]);

  // Toggle favori (ekle/çıkar)
  const toggleFavorite = useCallback(async (moduleId) => {
    if (isFavorite(moduleId)) {
      return await removeFavorite(moduleId);
    } else {
      return await addFavorite(moduleId);
    }
  }, [favoriteModules, addFavorite, removeFavorite, isFavorite]);

  // İlk yüklemede ve refreshKey değiştiğinde favorileri çek
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, refreshKey]);

  return {
    favoriteModules,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites: loadFavorites,
  };
};

