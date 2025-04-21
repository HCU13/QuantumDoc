// src/contexts/TokenContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenUtils } from "../utils/tokenUtils";

// Token bağlamı oluşturma
export const TokenContext = createContext({
  tokens: 0,
  watchedVideosToday: 0,
  lastVideoWatchDate: null,
  addTokens: () => {},
  useTokens: () => {},
  canWatchVideoForTokens: () => {},
  watchVideoForTokens: () => {},
  resetDailyVideos: () => {},
});

// Token provider bileşeni
export const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState(0);
  const [watchedVideosToday, setWatchedVideosToday] = useState(0);
  const [lastVideoWatchDate, setLastVideoWatchDate] = useState(null);

  // Başlangıçta token verilerini yükle
  useEffect(() => {
    const loadTokenData = async () => {
      try {
        const savedTokens = await AsyncStorage.getItem("userTokens");
        const savedWatchedVideos = await AsyncStorage.getItem(
          "watchedVideosToday"
        );
        const savedLastWatchDate = await AsyncStorage.getItem(
          "lastVideoWatchDate"
        );

        if (savedTokens) setTokens(parseInt(savedTokens));
        if (savedWatchedVideos)
          setWatchedVideosToday(parseInt(savedWatchedVideos));
        if (savedLastWatchDate)
          setLastVideoWatchDate(new Date(savedLastWatchDate));

        // Gün değiştiyse, video izleme sayısını sıfırla
        if (
          lastVideoWatchDate &&
          !tokenUtils.isSameDay(new Date(), new Date(lastVideoWatchDate))
        ) {
          resetDailyVideos();
        }
      } catch (error) {
        console.log("Token verilerini yüklerken hata:", error);
      }
    };

    loadTokenData();
  }, []);

  // Token ekleme
  const addTokens = async (amount) => {
    const newTokens = tokens + amount;
    setTokens(newTokens);
    try {
      await AsyncStorage.setItem("userTokens", newTokens.toString());
    } catch (error) {
      console.log("Token eklerken hata:", error);
    }
    return newTokens;
  };

  // Token kullanma
  const useTokens = async (amount) => {
    if (tokens < amount) return false;

    const newTokens = tokens - amount;
    setTokens(newTokens);
    try {
      await AsyncStorage.setItem("userTokens", newTokens.toString());
    } catch (error) {
      console.log("Token kullanırken hata:", error);
    }
    return true;
  };

  // Video izleme hakkı var mı
  const canWatchVideoForTokens = () => {
    // Aynı gün içinde 3'ten az video izlendiyse izleyebilir
    return watchedVideosToday < 3;
  };

  // Video izleme ve token kazanma
  const watchVideoForTokens = async (tokenAmount = 2) => {
    if (!canWatchVideoForTokens()) return false;

    const newWatchCount = watchedVideosToday + 1;
    const now = new Date();

    setWatchedVideosToday(newWatchCount);
    setLastVideoWatchDate(now);

    try {
      await AsyncStorage.setItem(
        "watchedVideosToday",
        newWatchCount.toString()
      );
      await AsyncStorage.setItem("lastVideoWatchDate", now.toISOString());
      await addTokens(tokenAmount);
    } catch (error) {
      console.log("Video izleme kaydedilirken hata:", error);
    }

    return true;
  };

  // Günlük video izleme sayısını sıfırlama
  const resetDailyVideos = async () => {
    setWatchedVideosToday(0);
    try {
      await AsyncStorage.setItem("watchedVideosToday", "0");
    } catch (error) {
      console.log("Video sayısı sıfırlanırken hata:", error);
    }
  };

  return (
    <TokenContext.Provider
      value={{
        tokens,
        watchedVideosToday,
        lastVideoWatchDate,
        addTokens,
        useTokens,
        canWatchVideoForTokens,
        watchVideoForTokens,
        resetDailyVideos,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

// Token hook
export const useToken = () => useContext(TokenContext);

