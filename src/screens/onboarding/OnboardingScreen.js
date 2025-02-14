import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Animated,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";

const slides = [
  {
    id: "1",
    title: "slides.welcome.title",
    description: "slides.welcome.description",
    icon: "document-text",
  },
  {
    id: "2",
    title: "slides.analyze.title",
    description: "slides.analyze.description",
    icon: "analytics",
  },
  {
    id: "3",
    title: "slides.ai.title",
    description: "slides.ai.description",
    icon: "brain",
  },
];

export const OnboardingScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index ?? 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (index) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index });
    }
  };

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={theme.colors.gradient.primary}
          style={styles.iconBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={item.icon} size={48} color={theme.colors.white} />
        </LinearGradient>
      </View>
      <Text variant="h1" style={[styles.title, { color: theme.colors.text }]}>
        {t(item.title)}
      </Text>
      <Text
        variant="body"
        style={[styles.description, { color: theme.colors.textSecondary }]}
      >
        {t(item.description)}
      </Text>
    </View>
  );

  const Pagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.skipContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Auth")}
          style={styles.skipButton}
        >
          <Text
            style={[styles.skipText, { color: theme.colors.textSecondary }]}
          >
            {t("common.skip")}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={slides}
        renderItem={renderSlide}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
        scrollEventThrottle={32}
      />

      <View style={styles.bottomContainer}>
        <Pagination />

        <View style={styles.buttonContainer}>
          {currentIndex < slides.length - 1 ? (
            <Button
              title={t("common.next")}
              onPress={() => scrollTo(currentIndex + 1)}
              theme={theme}
              size="large"
            />
          ) : (
            <Button
              title={t("common.getStarted")}
              onPress={() => navigation.navigate("Auth")}
              theme={theme}
              size="large"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    textAlign: "center",
    paddingHorizontal: 24,
  },
  bottomContainer: {
    padding: 32,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
});
