import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { Button } from "@/components/common/Button";
import { NotebookBackground } from "@/components/common/NotebookBackground";
import { BORDER_RADIUS, HIT_SLOP, SPACING } from "@/constants/theme";
import { ONBOARDING_SLIDES } from "@/constants/onboarding";
import { useTheme } from "@/contexts/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SlideProps {
  item: (typeof ONBOARDING_SLIDES)[number];
  index: number;
  scrollX: SharedValue<number>;
}

const OnboardingSlide: React.FC<SlideProps> = ({ item, index, scrollX }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolate.CLAMP,
    );
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [16, 0, 16],
      Extrapolate.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  const pageNum = String(index + 1).padStart(2, "0");

  return (
    <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
      <Animated.View style={[styles.contentWrap, animatedStyle]}>
        {/* Page number */}
        <Text style={[styles.pageMeta, { color: colors.textTertiary }]}>
          — {pageNum} —
        </Text>

        {/* Big emoji like a chalkboard sketch */}
        <Text style={styles.icon}>{item.icon}</Text>

        {/* Section label + title + accent */}
        {item.features && item.features.length > 0 && (
          <Text style={[styles.section, { color: colors.primary }]}>
            §  {item.features[0]}
          </Text>
        )}
        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {t(item.titleKey)}
        </Text>
        <View
          style={[styles.accent, { backgroundColor: colors.primary }]}
        />

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t(item.descriptionKey)}
        </Text>

        {/* Features as quiet bullets — like a notebook list */}
        {item.features && item.features.length > 0 && (
          <View style={styles.featureList}>
            {item.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text
                  style={[styles.featureBullet, { color: colors.primary }]}
                >
                  ›
                </Text>
                <Text
                  style={[styles.featureText, { color: colors.textSecondary }]}
                >
                  {f}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const Pagination: React.FC<{
  scrollX: SharedValue<number>;
  total: number;
}> = ({ scrollX, total }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.paginationRow}>
      {Array.from({ length: total }).map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const animatedStyle = useAnimatedStyle(() => {
          const width = interpolate(
            scrollX.value,
            inputRange,
            [6, 24, 6],
            Extrapolate.CLAMP,
          );
          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolate.CLAMP,
          );
          return { width, opacity };
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: colors.primary },
              animatedStyle,
            ]}
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
  const [currentIndex, setCurrentIndex] = useState(
    startAtLast === "true" ? lastIndex : 0,
  );

  useEffect(() => {
    if (startAtLast === "true") {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: lastIndex,
          animated: false,
        });
      }, 50);
    }
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem("@onboarding_completed", "true");
    } catch {}
    router.replace("/(main)/welcome" as any);
  };

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <NotebookBackground cornerGlyphs={["∞", "Δ"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top bar — page count + skip */}
      <View style={styles.topBar}>
        <Text style={[styles.topMeta, { color: colors.textTertiary }]}>
          {String(currentIndex + 1).padStart(2, "0")} /{" "}
          {String(ONBOARDING_SLIDES.length).padStart(2, "0")}
        </Text>
        {!isLastSlide && (
          <TouchableOpacity
            onPress={() =>
              flatListRef.current?.scrollToIndex({
                index: ONBOARDING_SLIDES.length - 1,
                animated: true,
              })
            }
            activeOpacity={0.7}
            hitSlop={HIT_SLOP.medium}
          >
            <Text style={[styles.skipText, { color: colors.primary }]}>
              {t("onboarding.buttons.skip")} →
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
      <View style={styles.bottomBar}>
        <Pagination scrollX={scrollX} total={ONBOARDING_SLIDES.length} />

        <View style={styles.cta}>
          <Button
            title={
              isLastSlide
                ? t("onboarding.buttons.start")
                : t("onboarding.buttons.next")
            }
            onPress={handleNext}
            size="large"
            fullWidth
            icon="arrow-forward"
            iconPosition="right"
          />
        </View>
      </View>
    </NotebookBackground>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  topMeta: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.6,
    fontVariant: ["tabular-nums"],
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
  },

  slideContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    justifyContent: "center",
  },
  contentWrap: {
    alignItems: "flex-start",
  },
  pageMeta: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 96,
    marginBottom: SPACING.xl,
  },
  section: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: SPACING.sm,
  },
  accent: {
    width: 48,
    height: 4,
    borderRadius: 2,
    opacity: 0.85,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    marginBottom: SPACING.lg,
  },
  featureList: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  featureBullet: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
  },

  bottomBar: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    gap: SPACING.lg,
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 8,
    gap: 4,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  cta: {
    width: "100%",
  },
});
