import React, { createContext, useContext, useState, useCallback } from 'react';

const ActivityRefreshContext = createContext({
  triggerRefresh: () => {},
});

export const ActivityRefreshProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Bu fonksiyon çağrıldığında refreshKey değişir ve useActivity hook'u yeniden çalışır
  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const value = {
    refreshKey,
    triggerRefresh,
  };

  return (
    <ActivityRefreshContext.Provider value={value}>
      {children}
    </ActivityRefreshContext.Provider>
  );
};

export const useActivityRefresh = () => useContext(ActivityRefreshContext);

