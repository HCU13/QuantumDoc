import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApi } from "./useApi";
import { API_ENDPOINTS } from "../utils/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { post, get, put, delete: del } = useApi();

  // Kullanıcı bilgilerini AsyncStorage'a kaydet
  const saveUserToStorage = useCallback(async (userData) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
      console.error("Kullanıcı bilgileri kaydedilemedi:", error);
    }
  }, []);

  // Kullanıcı bilgilerini AsyncStorage'dan yükle
  const loadUserFromStorage = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userData");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Kullanıcı bilgileri yüklenemedi:", error);
    }
    return null;
  }, []);

  // Token'ı AsyncStorage'dan yükle
  const loadToken = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      const storedUser = await AsyncStorage.getItem("userData");
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Token yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Giriş yap
  const login = useCallback(async (email, password) => {
    try {
      const response = await post(API_ENDPOINTS.LOGIN, { email, password });
      
      const { token: authToken, user: userData } = response;
      
      setToken(authToken);
      setUser(userData);
      
      await AsyncStorage.setItem("authToken", authToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      
      return response;
    } catch (error) {
      console.error("Giriş hatası:", error);
      throw error;
    }
  }, [post]);

  // Kayıt ol
  const register = useCallback(async (userData) => {
    try {
      const response = await post(API_ENDPOINTS.REGISTER, userData);
      
      const { token: authToken, user: newUser } = response;
      
      setToken(authToken);
      setUser(newUser);
      
      await AsyncStorage.setItem("authToken", authToken);
      await AsyncStorage.setItem("userData", JSON.stringify(newUser));
      
      return response;
    } catch (error) {
      console.error("Kayıt hatası:", error);
      throw error;
    }
  }, [post]);

  // Şifremi unuttum
  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      return response;
    } catch (error) {
      console.error("Şifre sıfırlama hatası:", error);
      throw error;
    }
  }, [post]);

  // Şifre sıfırla
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      const response = await post(API_ENDPOINTS.RESET_PASSWORD, { token, newPassword });
      return response;
    } catch (error) {
      console.error("Şifre sıfırlama hatası:", error);
      throw error;
    }
  }, [post]);

  // Çıkış yap
  const logout = useCallback(async () => {
    try {
      setToken(null);
      setUser(null);
      
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  }, []);

  // Profil güncelle
  const updateProfile = useCallback(async (profileData) => {
    if (!token) throw new Error("Token gerekli");
    try {
      const response = await put(API_ENDPOINTS.UPDATE_PROFILE, profileData, token);
      setUser(response);
      
      await AsyncStorage.setItem("userData", JSON.stringify(response));
      
      return response;
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      throw error;
    }
  }, [put, token]);

  // Şifre değiştir
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!token) throw new Error("Token gerekli");
    try {
      const response = await put(API_ENDPOINTS.CHANGE_PASSWORD, {
        password: currentPassword,
        newPassword
      }, token);
      
      return response;
    } catch (error) {
      console.error("Şifre değiştirme hatası:", error);
      throw error;
    }
  }, [put, token]);

  // Profil resmi yükle
  const uploadProfileImage = useCallback(async (imageUri) => {
    if (!token) throw new Error("Token gerekli");
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg"
      });

      const response = await post(API_ENDPOINTS.UPLOAD_PROFILE_IMAGE, formData, token, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      
      setUser(response);
      await AsyncStorage.setItem("userData", JSON.stringify(response));
      
      return response;
    } catch (error) {
      console.error("Profil resmi yükleme hatası:", error);
      throw error;
    }
  }, [post, token]);

  // Hesap sil
  const deleteAccount = useCallback(async () => {
    try {
      await del(API_ENDPOINTS.DELETE_ACCOUNT, null, token);
      await logout();
      return { success: true };
    } catch (error) {
      console.error("Hesap silme hatası:", error);
      throw error;
    }
  }, [del, token, logout]);

  // İlk yükleme
  useEffect(() => {
    loadToken();
  }, [loadToken]);

  return {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    uploadProfileImage,
    deleteAccount,
  };
};
