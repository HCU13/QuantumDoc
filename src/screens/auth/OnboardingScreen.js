// src/screens/auth/OnboardingScreen.js
import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text } from "../../components/Text";
import { Button } from "../../components/Button";

const { width } = Dimensions.get("window");

const OnboardingScreen = ({ onComplete }) => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const flatListRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Onboarding'de gösterilecek adımlar
  const slides = [
    {
      id: "welcome",
      icon: "document-text",
      titleKey: "onboarding.welcome.title",
      descriptionKey: "onboarding.welcome.description",
    },
    {
      id: "upload",
      icon: "cloud-upload",
      titleKey: "onboarding.upload.title",
      descriptionKey: "onboarding.upload.description",
    },
    {
      id: "analyze",
      icon: "analytics",
      titleKey: "onboarding.analyze.title",
      descriptionKey: "onboarding.analyze.description",
    },
    {
      id: "ask",
      icon: "chatbubble-ellipses",
      titleKey: "onboarding.ask.title",
      descriptionKey: "onboarding.ask.description",
    },
  ];

  // Sonraki slayta geç
  const goToNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Son slayt, onboarding'i tamamla
      onComplete();
    }
  };

  // Onboarding'i atla
  const skipOnboarding = () => {
    onComplete();
  };

  // Kaydırma olayını takip et
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // Her bir slaytı render et
  const renderSlide = ({ item, index }) => {
    return (
      <View style={[styles.slideContainer, { width }]}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary + "15" },
          ]}
        >
          <Ionicons name={item.icon} size={60} color={theme.colors.primary} />
        </View>
        <Text variant="h1" style={styles.title}>
          {t(item.titleKey)}
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {t(item.descriptionKey)}
        </Text>
      </View>
    );
  };

  // İlerleme göstergeleri
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor:
                  index === currentIndex
                    ? theme.colors.primary
                    : theme.colors.border,
                width: index === currentIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // Düğmeler
  const renderButtons = () => {
    const isLastSlide = currentIndex === slides.length - 1;

    return (
      <View style={styles.buttonsContainer}>
        {!isLastSlide && (
          <Button
            title={t("common.skip")}
            onPress={skipOnboarding}
            type="outline"
            style={styles.skipButton}
          />
        )}
        <Button
          title={isLastSlide ? t("common.getStarted") : t("common.next")}
          onPress={goToNextSlide}
          style={styles.nextButton}
          rightIcon={
            !isLastSlide && (
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            )
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />
      {renderPagination()}
      {renderButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 30,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  skipButton: {
    flex: 1,
    marginRight: 10,
  },
  nextButton: {
    flex: 1,
  },
});

export default OnboardingScreen;
