// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, AppState } from "react-native";
import { useAuth } from "./AuthContext";
import { useTokens } from "./TokenContext";

// Uygulama context'i oluşturma
const AppContext = createContext(null);

/**
 * Uygulama durumu Provider bileşeni
 * Genel uygulama durumlarını ve ayarlarını yönetir
 */
export function AppProvider({ children }) {
  const { user } = useAuth();
  const { refreshBalance, refreshSubscription } = useTokens();

  const [lastActive, setLastActive] = useState(new Date());
  const [appNotifications, setAppNotifications] = useState([]);
  const [appState, setAppState] = useState(AppState.currentState);
  const [appSettings, setAppSettings] = useState({
    notificationsEnabled: true,
    autoAnalyzeDocuments: true,
    documentSortBy: "date", // 'date', 'name', 'type'
    documentSortOrder: "desc", // 'asc', 'desc'
  });

  // Uygulama durum değişikliklerini izle
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Ayarları yükle
    loadAppSettings();

    return () => {
      subscription.remove();
    };
  }, []);

  // Kullanıcı değiştiğinde bildirim verileri yükle
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setAppNotifications([]);
    }
  }, [user]);

  // Uygulama arka plandan ön plana geldiğinde çalışacak işlemler
  const handleAppStateChange = (nextAppState) => {
    // Uygulama arka plandan ön plana geldiğinde
    if (appState.match(/inactive|background/) && nextAppState === "active") {
      const now = new Date();
      const diffMinutes = (now - lastActive) / (1000 * 60);

      // 15 dakikadan fazla süre geçtiyse tokenleri yenile
      if (diffMinutes > 15 && user) {
        refreshBalance();
        refreshSubscription();
      }

      setLastActive(now);
    }

    setAppState(nextAppState);
  };

  // Bildirim verilerini yükle
  const loadNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem(
        `notifications_${user.uid}`
      );
      if (storedNotifications) {
        setAppNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // Uygulama ayarlarını yükle
  const loadAppSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem("appSettings");
      if (storedSettings) {
        setAppSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading app settings:", error);
    }
  };

  // Uygulama ayarlarını güncelle
  const updateAppSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...appSettings, ...newSettings };
      setAppSettings(updatedSettings);
      await AsyncStorage.setItem(
        "appSettings",
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error("Error saving app settings:", error);
    }
  };

  // Yeni bildirim ekle
  const addNotification = async (notification) => {
    try {
      if (!user) return;

      const newNotification = {
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
        ...notification,
      };

      const updatedNotifications = [newNotification, ...appNotifications];
      setAppNotifications(updatedNotifications);

      await AsyncStorage.setItem(
        `notifications_${user.uid}`,
        JSON.stringify(updatedNotifications)
      );

      return newNotification;
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  // Bildirimi okundu olarak işaretle
  const markNotificationAsRead = async (notificationId) => {
    try {
      if (!user) return;

      const updatedNotifications = appNotifications.map((notification) => {
        if (notification.id === notificationId) {
          return { ...notification, read: true };
        }
        return notification;
      });

      setAppNotifications(updatedNotifications);

      await AsyncStorage.setItem(
        `notifications_${user.uid}`,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Bildirimleri temizle
  const clearNotifications = async () => {
    try {
      if (!user) return;

      setAppNotifications([]);
      await AsyncStorage.removeItem(`notifications_${user.uid}`);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Hata durumlarını yönet
  const handleError = (error, customMessage = null) => {
    console.error("App error:", error);

    const errorMessage =
      customMessage ||
      error.message ||
      "An unexpected error occurred. Please try again.";

    Alert.alert("Error", errorMessage);
  };

  return (
    <AppContext.Provider
      value={{
        appSettings,
        updateAppSettings,
        notifications: appNotifications,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        handleError,
        appState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Uygulama context'i hook'unu dışa aktar
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
