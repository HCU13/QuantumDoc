import React, { createContext, useContext } from 'react';
import { useSearch as useSearchHook } from '../hooks/useSearch';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const searchData = useSearchHook();

  return (
    <SearchContext.Provider value={searchData}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}; 