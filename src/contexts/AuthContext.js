import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { ThemeContext } from "./ThemeContext";

export const AuthContext = ({ children }) => {
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      return token;
    }
  };
  const authContext = {
    getToken,
  };

  return (
    <ThemeContext.Provider value={authContext}>
      {children}
    </ThemeContext.Provider>
  );
};

const styles = StyleSheet.create({});
