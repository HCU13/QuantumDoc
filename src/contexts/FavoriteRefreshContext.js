import React, { createContext, useContext, useState, useCallback } from 'react';

const FavoriteRefreshContext = createContext({
  refreshKey: 0,
  triggerRefresh: () => {},
});

export const FavoriteRefreshProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const value = {
    refreshKey,
    triggerRefresh,
  };

  return (
    <FavoriteRefreshContext.Provider value={value}>
      {children}
    </FavoriteRefreshContext.Provider>
  );
};

export const useFavoriteRefresh = () => useContext(FavoriteRefreshContext);

