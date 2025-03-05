// hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { signOut as firebaseSignOut } from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Uygulama başladığında kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        if (storedUser) {
          console.log("User found in SecureStore");
          setUser(JSON.parse(storedUser));
        } else {
          console.log("No user found in SecureStore");
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user from secure storage:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Kullanıcı bilgilerini kaydet
  const saveUser = async (userData) => {
    try {
      const userString = JSON.stringify(userData);
      await SecureStore.setItemAsync("user", userString);
      console.log("User saved to SecureStore");
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Error saving user to secure storage:", error);
      return false;
    }
  };

  // Çıkış yap
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await firebaseSignOut(FIREBASE_AUTH);
      await SecureStore.deleteItemAsync("user");
      console.log("User removed from SecureStore");
      setUser(null);
      return true;
    } catch (error) {
      console.error("Sign out error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    setUser,
    saveUser,
    signOut,
    loading,
  };
};
