import React, { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LoadingContext = createContext({
  loading: false,
  text: '',
  module: null,
  showLoading: () => {},
  hideLoading: () => {},
  setLoading: () => {},
});

export const LoadingProvider = ({ children }) => {
  const { t } = useTranslation();
  const [loading, setLoadingState] = useState(false);
  const [text, setText] = useState(t('common.preparing'));
  const [module, setModule] = useState(null);

  const showLoading = (loadingText = t('common.preparing'), loadingModule = null) => {
    setText(loadingText);
    setModule(loadingModule);
    setLoadingState(true);
  };

  const hideLoading = () => {
    setLoadingState(false);
    setText(t('common.preparing'));
    setModule(null);
  };

  const setLoading = (isLoading, loadingText = t('common.preparing'), loadingModule = null) => {
    if (isLoading) {
      showLoading(loadingText, loadingModule);
    } else {
      hideLoading();
    }
  };

  const value = {
    loading,
    text,
    module,
    showLoading,
    hideLoading,
    setLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
