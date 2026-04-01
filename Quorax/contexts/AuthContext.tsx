import { configureRevenueCat, loginRevenueCat, logoutRevenueCat } from '@/services/revenuecat';
import { supabase, TABLES } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;

  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { full_name?: string; display_name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  getRememberedEmail: () => Promise<string | null>;
  clearRememberedEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REMEMBERED_EMAIL_KEY = '@quorax_remembered_email';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Geçersiz session temizleme - tüm auth hataları için ortak helper
  const clearInvalidSession = async () => {
    try { await supabase.auth.signOut(); } catch { /* sessizce devam et */ }
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const isInvalidTokenError = (msg?: string) =>
    msg?.includes('Invalid Refresh Token') || msg?.includes('Refresh Token Not Found');

  // Session kontrolü ve user verilerini yükle
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Mevcut session'ı kontrol et
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (isInvalidTokenError(error.message)) await clearInvalidSession();
          setIsLoading(false);
          return;
        }
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await loadUserProfile(currentSession.user.id);
          
            // RevenueCat'i başlat
          try {
            await configureRevenueCat(currentSession.user.id);
          } catch {
            // Silent error - RevenueCat başlatılamazsa devam et
          }
        }
      } catch (error: any) {
        if (isInvalidTokenError(error?.message)) await clearInvalidSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
      if (event === 'SIGNED_IN' && session) {
        setSession(session);
        setUser(session.user);
        await loadUserProfile(session.user.id);
        
        // RevenueCat'e login yap
        try {
          await loginRevenueCat(session.user.id);
        } catch {
          // Silent error
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refresh başarılı
          if (session) {
            setSession(session);
          } else {
            // Token refresh başarısız - session'ı temizle
            try {
              await supabase.auth.signOut();
            } catch (signOutError) {
              // Sign out hatası görmezden gel
            }
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error: any) {
        if (isInvalidTokenError(error?.message)) await clearInvalidSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // User profile'ını yükle
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) return;

      if (data) setProfile(data as Profile);
    } catch { /* sessizce devam et */ }
  };

  // Login fonksiyonu
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    return new Promise(async (resolve) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          resolve({ success: false, error: error.message });
          return;
        }

        if (data.user && data.session) {
          setSession(data.session);
          setUser(data.user);
          await loadUserProfile(data.user.id);

          // RevenueCat'e login yap
          try {
            await loginRevenueCat(data.user.id);
          } catch {
            // Silent error
          }

          // Remember me seçildiyse email'i kaydet
          if (rememberMe) {
            await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
          } else {
            await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
          }

          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'Session oluşturulamadı' });
        }
      } catch (error: any) {
        resolve({ success: false, error: error.message || 'Giriş yapılırken bir hata oluştu' });
      }
    });
  };

  // Logout fonksiyonu
  const logout = async (): Promise<void> => {
    try {
      // Supabase'den çıkış yap (bu AsyncStorage'daki session'ı da temizler)
      await supabase.auth.signOut();
      
      // RevenueCat'ten logout yap
      try {
        await logoutRevenueCat();
      } catch {
        // Silent error
      }
      
      // State'leri temizle
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Remembered email'i temizleme (kullanıcı isterse)
      // await clearRememberedEmail();
    } catch {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

  // User verilerini yenile
  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        if (isInvalidTokenError(error.message)) await clearInvalidSession();
        return;
      }
      
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.id);
      }
    } catch (error: any) {
      if (isInvalidTokenError(error?.message)) await clearInvalidSession();
    }
  };

  // Hatırlanan email'i al
  const getRememberedEmail = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
    } catch {
      return null;
    }
  };

  // Hatırlanan email'i temizle
  const clearRememberedEmail = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
    } catch { /* sessizce devam et */ }
  };

  // Profile güncelle (name, phone, etc.)
  const updateProfile = async (data: { full_name?: string; display_name?: string; phone?: string }): Promise<{ success: boolean; error?: string }> => {
    return new Promise(async (resolve) => {
      try {
        if (!user?.id) {
          resolve({ success: false, error: 'Kullanıcı bulunamadı' });
          return;
        }

        // Auth metadata'yı güncelle
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            full_name: data.full_name || data.display_name,
            display_name: data.display_name || data.full_name,
            phone: data.phone,
          },
        });

        if (authError) {
          resolve({ success: false, error: authError.message });
          return;
        }

        // Profiles tablosunu güncelle
        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (data.full_name !== undefined) {
          updateData.full_name = data.full_name;
        }
        if (data.display_name !== undefined) {
          updateData.display_name = data.display_name;
        }
        if (data.phone !== undefined) {
          updateData.phone = data.phone;
        }

        const { error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .upsert({ id: user.id, ...updateData })
          .eq('id', user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          resolve({ success: false, error: profileError.message });
          return;
        }

        // Profile state'ini güncelle
        await refreshUser();

        resolve({ success: true });
      } catch (error: any) {
        console.error('Profile update exception:', error);
        resolve({ success: false, error: error.message || 'Profil güncellenirken bir hata oluştu' });
      }
    });
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoggedIn: !!user && !!session,
    isLoading,
    login,
    logout,
    refreshUser,
    updateProfile,
    getRememberedEmail,
    clearRememberedEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

