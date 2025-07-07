// src/contexts/TokenContext.js
import React, { createContext, useContext } from "react";
import { useTokens as useTokensHook } from "../hooks/useTokens";

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const tokenData = useTokensHook();

  return (
    <TokenContext.Provider value={tokenData}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useToken must be used within a TokenProvider");
  }
  return context;
};

