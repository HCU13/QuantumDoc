import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { Component, useEffect, useRef, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { RatingPromptModal } from '@/components/common/RatingPromptModal';
import { Toast } from '@/components/common/Toast';
import { ActivityProvider } from '@/contexts/ActivityContext';
import { AdProvider, useAd } from '@/contexts/AdContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { TokenProvider } from '@/contexts/TokenContext';
import i18n from '@/i18n/config';
import { useAppAd } from '@/hooks/useAppAd';
import { usePushToken } from '@/hooks/usePushToken';
import { useRatingPrompt } from '@/hooks/useRatingPrompt';

export const unstable_settings = {
  anchor: '(main)',
};

// Global hata sınırı — herhangi bir component crash olursa uygulamanın tamamı çökmez
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#121212' }}>
          <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            Bir şeyler ters gitti
          </Text>
          <Text style={{ color: '#a1a1aa', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            {this.state.error?.message ?? 'Beklenmeyen bir hata oluştu.'}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ backgroundColor: '#8B5CF6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// UYGULAMA BAŞLATICI - Reklamı başlangıçta yükle (AdContext zaten retry yapıyor)
function AppStartupAdLoader() {
  const { loadAd } = useAppAd();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadAd().catch((e) => console.error('[AdLoader] Initial load failed:', e));
  }, [loadAd]);

  return null;
}

// İnternet bağlantısı kesilince üstte gösterilen banner
function OfflineBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return unsubscribe;
  }, []);

  if (isConnected !== false) return null;

  return (
    <SafeAreaView style={{ backgroundColor: '#b45309' }}>
      <View style={{ paddingVertical: 6, paddingHorizontal: 16, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
          İnternet bağlantısı yok
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Aralık reklamı için periyodik kontrol süresi (cooldown AdContext'te 3 dk)
const INTERVAL_AD_CHECK_MS = 60 * 1000; // Her 1 dakikada cooldown kontrolü

function AdIntervalTrigger() {
  const segments = useSegments();
  const { tryShowIntervalAd } = useAd();
  const mountedRef = useRef(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Onboarding durumunu kontrol et
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem('@onboarding_completed');
        setOnboardingCompleted(!!completed);
      } catch (error) {
        console.error('Onboarding check error:', error);
      }
    };
    checkOnboarding();
  }, []);

  // İlk tetikleme: main'e girince bir kez (ilk 5 sn, sonraki geçişlerde 1.5 sn)
  useEffect(() => {
    const inMain = segments.includes('(main)');
    const notOnboarding = !segments.includes('(onboarding)');

    if (!onboardingCompleted || !inMain || !notOnboarding) return;

    const isFirstEntry = !mountedRef.current;
    if (isFirstEntry) mountedRef.current = true;

    const delayMs = isFirstEntry ? 5000 : 1500;
    const t = setTimeout(() => {
      tryShowIntervalAd();
    }, delayMs);
    return () => clearTimeout(t);
  }, [segments, tryShowIntervalAd, onboardingCompleted]);

  // Periyodik tetikleme: reklam kapatıldıktan sonra cooldown bitince otomatik reklam
  // Main ekrandayken her INTERVAL_AD_CHECK_MS'de tryShowIntervalAd çağrılır;
  // AdContext içinde 3 dk cooldown olduğu için sadece süre dolunca reklam gösterilir
  useEffect(() => {
    const inMain = segments.includes('(main)');
    const notOnboarding = !segments.includes('(onboarding)');

    if (!onboardingCompleted || !inMain || !notOnboarding) return;

    const intervalId = setInterval(() => {
      tryShowIntervalAd();
    }, INTERVAL_AD_CHECK_MS);

    return () => clearInterval(intervalId);
  }, [segments, tryShowIntervalAd, onboardingCompleted]);

  return null;
}

function RootLayoutContent() {
  const { isDark } = useTheme();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const { shouldShow: showRatingPrompt, markPrompted } = useRatingPrompt();
  usePushToken();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('@onboarding_completed');
        if (!onboardingCompleted && !segments.includes('(onboarding)')) {
          router.replace('/(onboarding)');
        }
      } catch (error) {
        console.error('Onboarding kontrolü hatası:', error);
      } finally {
        setIsReady(true);
      }
    };

    checkOnboarding();
  }, []);

  // Auth durumu değişince tek yerden yönlendir
  useEffect(() => {
    if (!isReady || authLoading) return;
    const inAuthFlow = segments.includes('login') || segments.includes('signup');
    const inResetPassword = segments.includes('reset-password');
    if (isLoggedIn && inAuthFlow) {
      router.replace('/(main)');
    } else if (!isLoggedIn && !inAuthFlow && !inResetPassword && segments.includes('(main)')) {
      router.replace('/(main)/login');
    }
  }, [isLoggedIn, isReady, authLoading, segments]);

  // Şifre sıfırlama deep link'i yakala (quorax://reset-password)
  useEffect(() => {
    const isValidResetLink = (url: string) => {
      try {
        const parsed = new URL(url);
        return (
          (parsed.protocol === 'quorax:' && parsed.pathname.includes('reset-password')) ||
          (parsed.hostname === 'quorax.app' && parsed.pathname.includes('reset-password')) ||
          parsed.searchParams.get('type') === 'recovery'
        );
      } catch {
        return false;
      }
    };

    const handleDeepLink = (event: { url: string }) => {
      if (isValidResetLink(event.url)) {
        router.replace('/(main)/reset-password');
      }
    };

    // Uygulama açıkken gelen deep link
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Uygulama kapalıyken tıklanan deep link
    Linking.getInitialURL().then((url) => {
      if (url && isValidResetLink(url)) {
        router.replace('/(main)/reset-password');
      }
    }).catch(() => {});

    return () => subscription.remove();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color={isDark ? '#a78bfa' : '#8B5CF6'} />
        <Text style={[styles.loadingText, { color: isDark ? '#e5e5e5' : '#525252' }]}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <OfflineBanner />
      <AppStartupAdLoader />
      <AdIntervalTrigger />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(main)" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Toast />
      <RatingPromptModal visible={showRatingPrompt} onDismiss={markPrompted} />
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
});

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <TokenProvider>
                <ActivityProvider>
                  <AdProvider>
                    <RootLayoutContent />
                  </AdProvider>
                </ActivityProvider>
              </TokenProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}
