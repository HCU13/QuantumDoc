import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { Component, useEffect, useRef, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Animated, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { RatingPromptModal } from '@/components/common/RatingPromptModal';
import { Toast } from '@/components/common/Toast';
import { ActivityProvider } from '@/contexts/ActivityContext';
import { AdProvider, useAd } from '@/contexts/AdContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SubscriptionProvider, useSubscription } from '@/contexts/SubscriptionContext';
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

// Logolu Splash Ekranı — tüm veriler hazır olana kadar gösterilir, sonra fade out yapar
function SplashScreen({ onReady, allReady }: { onReady: () => void; allReady: boolean }) {
  // Ana wrapper fade (çıkış için)
  const containerFade = useRef(new Animated.Value(1)).current;

  // Logo: aşağıdan gelir + scale
  const logoTranslate = useRef(new Animated.Value(60)).current;
  const logoScale     = useRef(new Animated.Value(0.7)).current;
  const logoOpacity   = useRef(new Animated.Value(0)).current;

  // Işık halkası pulse
  const ringScale   = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  // "QUORAX" yazısı + alt tagline
  const textTranslate = useRef(new Animated.Value(24)).current;
  const textOpacity   = useRef(new Animated.Value(0)).current;

  // Loading dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  const exitStarted = useRef(false);

  useEffect(() => {
    // 1) Logo giriş (0ms)
    Animated.parallel([
      Animated.spring(logoScale,     { toValue: 1,    tension: 55, friction: 7, useNativeDriver: true }),
      Animated.spring(logoTranslate, { toValue: 0,    tension: 55, friction: 7, useNativeDriver: true }),
      Animated.timing(logoOpacity,   { toValue: 1,    duration: 400, useNativeDriver: true }),
    ]).start();

    // 2) Işık halkası (200ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(ringOpacity, { toValue: 0.18, duration: 500, useNativeDriver: true }),
        Animated.spring(ringScale,   { toValue: 1,    tension: 40, friction: 6, useNativeDriver: true }),
      ]).start(() => {
        // Sürekli nefes alma efekti
        Animated.loop(
          Animated.sequence([
            Animated.timing(ringScale,   { toValue: 1.08, duration: 1400, useNativeDriver: true }),
            Animated.timing(ringScale,   { toValue: 1.0,  duration: 1400, useNativeDriver: true }),
          ])
        ).start();
      });
    }, 200);

    // 3) Yazı giriş (380ms delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(textTranslate, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(textOpacity,   { toValue: 1, duration: 450, useNativeDriver: true }),
      ]).start();
    }, 380);

    // 4) Loading dots sıralı pulse
    const pulseDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1,   duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();

    setTimeout(() => {
      pulseDot(dot1, 0);
      pulseDot(dot2, 200);
      pulseDot(dot3, 400);
    }, 700);
  }, []);

  // allReady gelince çıkış animasyonu (min 1.4s gösterilsin — psikolojik güven)
  useEffect(() => {
    if (!allReady || exitStarted.current) return;
    exitStarted.current = true;

    setTimeout(() => {
      Animated.timing(containerFade, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onReady());
    }, 400); // veriler geldikten 400ms sonra çık — ani geçiş olmasın
  }, [allReady]);

  return (
    <Animated.View style={[styles.splash, { opacity: containerFade }]}>
      {/* Arka plan gradient efekti (radial simülasyonu) */}
      <View style={styles.splashGlow} />

      {/* Logo + halka */}
      <View style={{ alignItems: 'center' }}>
        {/* Işık halkası */}
        <Animated.View style={[
          styles.splashRing,
          { transform: [{ scale: ringScale }], opacity: ringOpacity }
        ]} />

        {/* Logo */}
        <Animated.View style={{
          transform: [{ translateY: logoTranslate }, { scale: logoScale }],
          opacity: logoOpacity,
        }}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Uygulama adı + tagline */}
      <Animated.View style={[
        styles.splashTextBlock,
        { transform: [{ translateY: textTranslate }], opacity: textOpacity }
      ]}>
        <Text style={styles.splashTitle}>QUORAX</Text>
        <Text style={styles.splashTagline}>Your AI Study Companion</Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.splashDots, { opacity: textOpacity }]}>
        <Animated.View style={[styles.splashDot, { opacity: dot1 }]} />
        <Animated.View style={[styles.splashDot, { opacity: dot2 }]} />
        <Animated.View style={[styles.splashDot, { opacity: dot3 }]} />
      </Animated.View>
    </Animated.View>
  );
}

function RootLayoutContent() {
  const { isDark } = useTheme();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { isLoading: subLoading } = useSubscription();
  const router = useRouter();
  const segments = useSegments();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestChecked, setGuestChecked] = useState(false);
  const { shouldShow: showRatingPrompt, markPrompted } = useRatingPrompt();
  usePushToken();

  // Tüm veriler hazır mı?
  const allReady = onboardingChecked && guestChecked && !authLoading && !subLoading;

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
        setOnboardingChecked(true);
      }
    };
    checkOnboarding();
  }, []);

  // Guest mode durumunu kontrol et (bir kez başlangıçta)
  useEffect(() => {
    const checkGuestMode = async () => {
      try {
        const guest = await AsyncStorage.getItem('@guest_mode');
        setIsGuestMode(!!guest);
      } catch {}
      setGuestChecked(true);
    };
    checkGuestMode();
  }, []);

  // Auth durumu değişince tek yerden yönlendir
  useEffect(() => {
    if (!allReady) return;
    const inAuthFlow = segments.includes('login') || segments.includes('signup') || segments.includes('welcome');
    const inResetPassword = segments.includes('reset-password');
    if (isLoggedIn) {
      AsyncStorage.removeItem('@guest_mode').catch(() => {});
      if (segments.includes('login') || segments.includes('signup') || segments.includes('welcome')) {
        router.replace('/(main)');
      }
    } else if (!isLoggedIn && !inAuthFlow && !inResetPassword && segments.includes('(main)')) {
      // Direkt AsyncStorage'dan oku — state güncellenmemiş olabilir
      AsyncStorage.getItem('@guest_mode').then((guest) => {
        if (!guest) router.replace('/(main)/welcome');
      }).catch(() => {});
    }
  }, [isLoggedIn, allReady, segments]);

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

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url && isValidResetLink(url)) {
        router.replace('/(main)/reset-password');
      }
    }).catch(() => {});

    return () => subscription.remove();
  }, []);

  // Splash, tüm veriler hazır olana kadar gösterilir
  const showSplash = !splashDone || !allReady;

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
      {/* Splash: veriler hazır olunca fade out yapar ve kaldırılır */}
      {showSplash && (
        <SplashScreen allReady={allReady} onReady={() => setSplashDone(true)} />
      )}
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
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    gap: 28,
  },
  splashGlow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#5B21B6',
    opacity: 0.12,
    top: '50%',
    left: '50%',
    marginTop: -170,
    marginLeft: -170,
  },
  splashRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    backgroundColor: 'transparent',
  },
  splashLogo: {
    width: 110,
    height: 110,
  },
  splashTextBlock: {
    alignItems: 'center',
    gap: 6,
  },
  splashTitle: {
    color: '#1a0533',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 8,
  },
  splashTagline: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1.5,
  },
  splashDots: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    bottom: 80,
  },
  splashDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#8B5CF6',
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
