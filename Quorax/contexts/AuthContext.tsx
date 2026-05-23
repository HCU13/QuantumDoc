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
  email_verified: boolean | null;
  created_at: string;
  updated_at: string;
  push_token: string | null;
  push_token_updated_at: string | null;
  rating_prompt_shown: boolean | null;
  rating_prompt_shown_at: string | null;
  rating_choice: string | null;
  rating_choice_at: string | null;
  app_session_count: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoggedIn: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { full_name?: string; display_name?: string }) => Promise<{ success: boolean; error?: string }>;
  getRememberedEmail: () => Promise<string | null>;
  clearRememberedEmail: () => Promise<void>;
  signInAnonymouslyIfNeeded: () => Promise<void>;
  upgradeAnonymousToRegistered: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
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

  const clearInvalidSession = async () => {
    try { await supabase.auth.signOut(); } catch { /* sessizce devam et */ }
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const isInvalidTokenError = (msg?: string) =>
    msg?.includes('Invalid Refresh Token') || msg?.includes('Refresh Token Not Found');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
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

          try {
            await configureRevenueCat(currentSession.user.id);
          } catch {
            // Silent error
          }
        }
      } catch (error: any) {
        if (isInvalidTokenError(error?.message)) await clearInvalidSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(session.user);
          await loadUserProfile(session.user.id);

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
          if (session) {
            setSession(session);
          } else {
            try {
              await supabase.auth.signOut();
            } catch {
              // ignore
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

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        setSession(data.session);
        setUser(data.user);
        await loadUserProfile(data.user.id);

        try {
          await loginRevenueCat(data.user.id);
        } catch {
          // Silent
        }

        if (rememberMe) {
          await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
        } else {
          await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }

        return { success: true };
      }
      return { success: false, error: 'Session oluşturulamadı' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Giriş yapılırken bir hata oluştu' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      try {
        await logoutRevenueCat();
      } catch {
        // ignore
      }
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

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

  const getRememberedEmail = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
    } catch {
      return null;
    }
  };

  const clearRememberedEmail = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
    } catch { /* sessizce devam et */ }
  };

  const updateProfile = async (data: { full_name?: string; display_name?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user?.id) {
        return { success: false, error: 'Kullanıcı bulunamadı' };
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name || data.display_name,
          display_name: data.display_name || data.full_name,
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      if (data.full_name !== undefined) updateData.full_name = data.full_name;
      if (data.display_name !== undefined) updateData.display_name = data.display_name;

      const { error: profileError } = await supabase
        .from(TABLES.PROFILES)
        .upsert({ id: user.id, ...updateData })
        .eq('id', user.id);

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      await refreshUser();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Profil güncellenirken bir hata oluştu' };
    }
  };

  // Anonymous auth: kullanıcı session'ı yoksa anonim session aç.
  // Onboarding sonunda veya welcome'ın 'Get Started' butonunda çağrılır.
  const signInAnonymouslyIfNeeded = async (): Promise<void> => {
    try {
      const { data: { session: existing } } = await supabase.auth.getSession();
      if (existing) return;

      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        // Setting kapalıysa veya başka bir nedenle başarısızsa sessizce devam et;
        // diğer kod yolları '!user' durumunu zaten ele alıyor.
        return;
      }
      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await loadUserProfile(data.user.id);
        try {
          await configureRevenueCat(data.user.id);
        } catch {
          // Silent
        }
      }
    } catch {
      // Silent fallback - eğer açık değilse, app guest mode'unda kalır
    }
  };

  // Anonim user'ı kalıcı kullanıcıya çevir (data + RC entitlement korunur)
  const upgradeAnonymousToRegistered = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Aktif kullanıcı yok' };
      }

      const isAnon = (user as any).is_anonymous === true;
      if (!isAnon) {
        return { success: false, error: 'Zaten kayıtlı bir hesap' };
      }

      // Step 1: Anonim user'a email/password ata (Supabase identity ekler)
      const { error: updateError } = await supabase.auth.updateUser({
        email: email.trim(),
        password,
        data: fullName ? { full_name: fullName } : undefined,
      });

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Step 2: Profile'ı güncelle (email/full_name)
      const profileUpdate: any = {
        id: user.id,
        email: email.trim(),
        updated_at: new Date().toISOString(),
      };
      if (fullName) profileUpdate.full_name = fullName;

      await supabase.from(TABLES.PROFILES).upsert(profileUpdate).eq('id', user.id);

      // Step 3: RC alias - aynı user.id korunur, dolayısıyla entitlement otomatik geçer
      try {
        await loginRevenueCat(user.id);
      } catch {
        // Silent
      }

      await refreshUser();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Hesap oluşturma sırasında hata' };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoggedIn: !!user && !!session,
    isAnonymous: (user as any)?.is_anonymous === true,
    isLoading,
    login,
    logout,
    refreshUser,
    updateProfile,
    getRememberedEmail,
    clearRememberedEmail,
    signInAnonymouslyIfNeeded,
    upgradeAnonymousToRegistered,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
