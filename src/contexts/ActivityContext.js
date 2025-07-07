import React, { createContext, useContext } from 'react';
import { useActivity as useActivityHook } from '../hooks/useActivity';

const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  const activityData = useActivityHook();

  return (
    <ActivityContext.Provider value={activityData}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}; 