import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ViewToken,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/contexts/ThemeContext';
import { ONBOARDING_SLIDES } from '@/constants/onboarding';
import { SPACING, BORDER_RADIUS, TEXT_STYLES } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingSlide = ({ item, index, scrollX }: any) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolate.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [20, 0, 20], Extrapolate.CLAMP);
    return { transform: [{ scale }, { translateY }], opacity };
  });

  return (
    <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        {/* Icon box */}
        <View style={styles.iconWrapper}>
          <LinearGradient
            colors={item.gradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <View style={[styles.decorCircle1, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
            <View style={[styles.decorCircle2, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            <Text style={styles.icon}>{item.icon}</Text>
          </LinearGradient>
          <LinearGradient
            colors={[item.gradient[0] + '30', 'transparent']}
            style={styles.iconGlow}
          />
        </View>

        {/* Feature Pills */}
        {item.features && (
          <View style={styles.featuresRow}>
            {item.features.map((feature: string, i: number) => (
              <View
                key={i}
                style={[
                  styles.featurePill,
                  {
                    backgroundColor: item.gradient[0] + '18',
                    borderColor: item.gradient[0] + '40',
                  },
                ]}
              >
                <Text style={[styles.featurePillText, { color: item.gradient[0] }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t(item.titleKey)}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t(item.descriptionKey)}
        </Text>
      </Animated.View>
    </View>
  );
};

const Pagination = ({ scrollX, total }: { scrollX: any; total: number }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: total }).map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];
        const animatedStyle = useAnimatedStyle(() => {
          const width = interpolate(scrollX.value, inputRange, [6, 28, 6], Extrapolate.CLAMP);
          const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);
          return { width, opacity };
        });
        return (
          <Animated.View
            key={index}
            style={[styles.paginationDot, { backgroundColor: colors.primary }, animatedStyle]}
          />
        );
      })}
    </View>
  );
};

export default function OnboardingScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { startAtLast } = useLocalSearchParams<{ startAtLast?: string }>();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const lastIndex = ONBOARDING_SLIDES.length - 1;
  const [currentIndex, setCurrentIndex] = useState(startAtLast === 'true' ? lastIndex : 0);

  useEffect(() => {
    if (startAtLast === 'true') {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: lastIndex, animated: false });
      }, 50);
    }
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
    } catch {}
    router.replace('/(main)/welcome');
  };

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;
  const currentSlide = ONBOARDING_SLIDES[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Subtle background tint based on current slide */}
      <LinearGradient
        colors={[currentSlide.gradient[0] + (isDark ? '12' : '08'), 'transparent']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={[styles.stepBadge, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.stepText, { color: colors.primary }]}>
            {currentIndex + 1} / {ONBOARDING_SLIDES.length}
          </Text>
        </View>
        {!isLastSlide && (
          <TouchableOpacity
            style={[styles.skipBtn, { backgroundColor: colors.primarySoft }]}
            onPress={() =>
              flatListRef.current?.scrollToIndex({
                index: ONBOARDING_SLIDES.length - 1,
                animated: true,
              })
            }
            activeOpacity={0.7}
          >
            <Text style={[styles.skipText, { color: colors.primary }]}>
              {t('onboarding.buttons.skip')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={({ item, index }) => (
          <OnboardingSlide item={item} index={index} scrollX={scrollX} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={(event) => {
          scrollX.value = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{ flex: 1 }}
      />

      {/* Bottom */}
      <View style={styles.bottomContainer}>
        <Pagination scrollX={scrollX} total={ONBOARDING_SLIDES.length} />

        {isLastSlide ? (
          <View style={styles.lastSlideButtons}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleFinish}>
              <LinearGradient
                colors={currentSlide.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>{t('onboarding.buttons.start')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nextRow}>
            {/* Progress bar */}
            <View style={[styles.progressTrack, { backgroundColor: colors.borderSubtle }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: currentSlide.gradient[0],
                    width: `${((currentIndex + 1) / ONBOARDING_SLIDES.length) * 100}%`,
                  },
                ]}
              />
            </View>

            <TouchableOpacity activeOpacity={0.85} onPress={handleNext}>
              <LinearGradient
                colors={currentSlide.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButton}
              >
                <Text style={styles.nextButtonText}>{t('onboarding.buttons.next')}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
  },
  stepBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.round,
  },
  stepText: { fontSize: 13, fontWeight: '600' },
  skipBtn: {
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
  },
  skipText: { fontSize: 14, fontWeight: '600' },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  iconGradient: {
    width: 176,
    height: 176,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    top: -18,
    right: -18,
  },
  decorCircle2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    bottom: -8,
    left: -8,
  },
  iconGlow: {
    position: 'absolute',
    width: 200,
    height: 50,
    bottom: -25,
    borderRadius: 100,
  },
  icon: { fontSize: 84 },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  featurePill: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
  },
  featurePillText: { fontSize: 12, fontWeight: '600' },
  title: {
    ...TEXT_STYLES.headlineLarge,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: -0.5,
  },
  description: {
    ...TEXT_STYLES.bodyLarge,
    textAlign: 'center',
    lineHeight: 27,
    paddingHorizontal: SPACING.md,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    height: 8,
    gap: 4,
  },
  paginationDot: { height: 8, borderRadius: 4 },
  bottomContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 48,
  },
  nextRow: { gap: SPACING.md },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  lastSlideButtons: { gap: SPACING.sm },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  outlineButtonText: { fontSize: 16, fontWeight: '700' },
  guestButton: { alignItems: 'center', paddingVertical: SPACING.sm },
  guestButtonText: { fontSize: 14, fontWeight: '500' },
});
