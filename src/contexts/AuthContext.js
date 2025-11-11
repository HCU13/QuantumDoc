import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import { supabase, getCurrentSession, onAuthStateChange } from "../services/supabase";
import { useLoading } from "./LoadingContext";
import { useTranslation } from "react-i18next";
import { showSuccess, showError } from "../utils/toast";
import userStorage from "../utils/userStorage";
import { initializeRealtime, cleanupRealtime } from "../services/realtime";
import { configureRevenueCat, loginRevenueCat, logoutRevenueCat } from "../services/revenuecat";
import analytics from "../services/analytics";

const AuthContext = createContext({
  token: null,
  user: null,
  loading: false,
  isAuthenticated: false,
  currentAvatar: null,
  updateAvatar: async (_avatar) => {},
  login: async (_e, _p, _n) => {},
  register: async (_d) => {},
  verifyOtp: async (_e, _c) => {},
  resendOtp: async (_e) => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const { setLoading: setGlobalLoading } = useLoading();

  // Avatar güncelleme fonksiyonu
  const updateAvatar = async (newAvatar) => {
    try {
      if (!user?.id) {
        logError('❌ AVATAR: No user ID for avatar update');
        return false;
      }

      // Avatar'ı güncelle
      const avatarString = JSON.stringify(newAvatar);

      // AsyncStorage'ı güncelle
      const userData = await userStorage.getUserData();
      if (userData) {
        userData.avatar_url = avatarString;
        await userStorage.updateUserInfo(userData);
      }

      // Supabase profiles tablosunu güncelle
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarString,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        logError('⚠️ AVATAR: Could not update profiles table:', error);
        return false;
      }

      // Global state'i güncelle
      setCurrentAvatar(newAvatar);

      return true;

    } catch (error) {
      logError('❌ AVATAR: Update error:', error);
      return false;
    }
  };

  // Development mode için console log kontrolü - sadece kritik hatalar
  const logError = (message, ...args) => {
    console.error(message, ...args);
  };

  const initializeAuth = async () => {
    try {
      const currentSession = await getCurrentSession();

      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAuthenticated(true);

        // Session restored

        // Analytics user ID'yi set et
        analytics.setUserId(currentSession.user.id);

        // RevenueCat'i başlat
        try {
          await configureRevenueCat(currentSession.user.id);
        } catch (rcError) {
          logError('[RevenueCat] Initialization failed:', rcError);
        }
      } else {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        analytics.setUserId(null);
      }
    } catch (error) {
      logError('❌ AUTH: Restore failed', error.message);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auth state'i initialize et
    initializeAuth();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {

      setSession(session);
      setUser(session?.user || null);
      setIsAuthenticated(!!session?.user);

      if (session?.user) {
        // Analytics user ID'yi set et
        analytics.setUserId(session.user.id);
        
        // Real-time bağlantısını başlat
        initializeRealtime(session.user);
        
        // RevenueCat login
        try {
          await loginRevenueCat(session.user.id);
        } catch (rcError) {
          logError('[RevenueCat] Login failed:', rcError);
        }
      } else {
        // Analytics user ID'yi temizle
        analytics.setUserId(null);
        
        // Real-time bağlantısını temizle
        cleanupRealtime();
        
        // RevenueCat logout
        try {
          await logoutRevenueCat();
        } catch (rcError) {
          logError('[RevenueCat] Logout failed:', rcError);
        }
      }
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
      cleanupRealtime();
    };
  }, []);

  const login = async (email, password, navigation = null) => {
    setLoading(true);
    setGlobalLoading(true, "Giriş yapılıyor...", "auth");

    try {

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logError('❌ LOGIN ERROR:', error.message);
        throw error;
      }

      // Login successful

      // Kullanıcı bilgilerini AsyncStorage'da sakla
      try {
        const now = new Date().toISOString();
        const currentLoginCount = await userStorage.getLoginCount();

        const userData = {
          // Temel kullanıcı bilgileri
          user_email: data.user.email,
          user_id: data.user.id,
          user_full_name: data.user.user_metadata?.full_name || '',
          user_phone: data.user.user_metadata?.phone || '',
          user_display_name: data.user.user_metadata?.display_name || '',

          // Session ve token bilgileri
          access_token: data.session?.access_token || '',
          refresh_token: data.session?.refresh_token || '',
          expires_at: data.session?.expires_at || '',

          // Kullanıcı durumu
          email_confirmed: data.user.email_confirmed_at ? true : false,
          phone_confirmed: data.user.phone_confirmed_at ? true : false,
          user_created_at: data.user.created_at || '',
          user_updated_at: data.user.updated_at || '',

          // Login bilgileri
          last_login_at: now,
          login_count: currentLoginCount + 1,

          // App bilgileri
          app_version: '1.0.0', // Bu değer package.json'dan alınabilir
          device_info: Platform.OS, // iOS/Android
        };



        // userStorage utility ile kaydet
        await userStorage.updateUserInfo(userData);

        // User data saved
      } catch (error) {
        logError('❌ SAVE USER DATA ERROR:', error.message);
      }

      // Authentication state'ini güncelle
      setIsAuthenticated(true);

      // Toast mesajı göster
      showSuccess("Başarılı", "Giriş yapıldı");

      return { success: true, user: data.user };

    } catch (err) {
      logError('❌ LOGIN FAILED:', err.message);

      // Email doğrulanmamış kullanıcılar için özel işlem
      if (err.message.includes('Email not confirmed')) {
        // Session'u temizle
        await supabase.auth.signOut();

        // Email doğrulama ekranına yönlendir
        if (navigation) {
          navigation.navigate("EmailVerification", {
            email: email,
            fromLogin: true
          });
        }

        return {
          success: false,
          needsVerification: true,
          email: email
        };
      }

      // Diğer hatalar için normal hata mesajı
      let errorMessage = "Giriş hatası";
      if (err.message.includes('Invalid login credentials')) {
        errorMessage = 'E-posta veya şifre hatalı';
      }

      showError("Hata", errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const register = async ({ email, password, fullName, phone, avatar_url }) => {
    setLoading(true);
    setGlobalLoading(true, "Kayıt yapılıyor...", "auth");

    try {
      // Register started

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            display_name: fullName,
            avatar_url: avatar_url, // Avatar'ı metadata'ya da ekle
          },
        },
      });

      // Avatar auth metadata'ya kaydedildi, profiles tablosu otomatik oluşacak
      if (data.user && avatar_url) {
      }

      if (error) {
        logError('❌ REGISTER ERROR:', error.message);
        throw error;
      }

      // Register successful

      // Session kept for navigation

      return {
        success: true,
        needsConfirmation: true,
        user: data.user
      };

    } catch (err) {
      logError('❌ REGISTER FAILED:', err.message);

      // Toast hata mesajı göster
      let errorMessage = "Kayıt hatası";
      if (err.message.includes('User already registered')) {
        errorMessage = 'Bu e-posta adresi zaten kayıtlı';
      } else if (err.message.includes('Password should be at least')) {
        errorMessage = 'Şifre en az 6 karakter olmalı';
      }

      showError("Hata", errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  // Email Verification
  const verifyOtp = async (email, token, navigation = null) => {
    setLoading(true);
    setGlobalLoading(true, "Doğrulanıyor...", "auth");

    try {

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) {
        logError('❌ OTP ERROR:', error.message);
        throw error;
      }

      // OTP verified

      // Email doğrulandı, session'u temizle ve Login'e yönlendir
      if (navigation) {
        // Session'u temizle ki kullanıcı tekrar giriş yapmalı
        await supabase.auth.signOut();

        showSuccess("Başarılı", "Email doğrulandı! Şimdi giriş yapabilirsiniz.");

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "Login",
                params: {
                  verifiedEmail: email,
                  message: "Email doğrulandı, giriş yapabilirsiniz"
                }
              }
            ]
          });
        }, 100);
      }

      return {
        success: true,
        user: data.user,
        emailVerified: true
      };

    } catch (err) {
      logError('❌ OTP VERIFICATION FAILED:', err.message);

      let errorMessage = "Doğrulama başarısız";
      if (err.message.includes('Token has expired')) {
        errorMessage = "Kod süresi dolmuş. Yeni kod isteyin";
      } else if (err.message.includes('Invalid token')) {
        errorMessage = "Geçersiz doğrulama kodu";
      }

      showError("Hata", errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  // Resend OTP Code
  const resendOtp = async (email) => {
    setLoading(true);
    setGlobalLoading(true, "Kod gönderiliyor...", "auth");

    try {

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        logError('❌ RESEND ERROR:', error.message);
        throw error;
      }

      // Resend successful

      showSuccess("Başarılı", "Doğrulama kodu tekrar gönderildi");

      return { success: true };

    } catch (err) {
      logError('❌ RESEND FAILED:', err.message);

      let errorMessage = "Kod gönderilemedi";
      if (err.message.includes('rate limit')) {
        errorMessage = "Çok fazla deneme. Biraz bekleyin";
      }

      showError("Hata", errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setGlobalLoading(true, "Çıkış yapılıyor...", "auth");

    try {

      const { error } = await supabase.auth.signOut();

      if (error) {
        logError('❌ LOGOUT ERROR:', error.message);
        throw error;
      }

      // Logout successful

      // AsyncStorage'dan kullanıcı bilgilerini temizle
      try {
        await userStorage.clearUserData();
        // User data cleared
      } catch (error) {
        logError('❌ CLEAR USER DATA ERROR:', error.message);
      }

      setSession(null);
      setUser(null);
      setIsAuthenticated(false);

      showSuccess("Başarılı", "Çıkış yapıldı");

    } catch (err) {
      logError('❌ LOGOUT FAILED:', err.message);
      // Hata durumunda bile state'leri temizle
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  // Token getter
  const token = session?.access_token || null;

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      session,
      isAuthenticated,
      currentAvatar,
      updateAvatar,
      login,
      register,
      verifyOtp,
      resendOtp,
      logout,
    }),
    [session, user, loading, token, isAuthenticated, currentAvatar]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);