// src/screens/auth/OnboardingScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text } from "../../components/Text";
import { Button } from "../../components/Button";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

const OnboardingScreen = ({ onComplete }) => {
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const flatListRef = useRef(null);
  const currentSlideAnim = useRef(new Animated.Value(0)).current;
  const lastSlideIndex = useRef(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSkipButton, setShowSkipButton] = useState(true);

  // Animation refs
  const slideAnimations = useRef([
    new Animated.Value(0), // Slide 0 animation value
    new Animated.Value(0), // Slide 1 animation value
    new Animated.Value(0), // Slide 2 animation value
    new Animated.Value(0), // Slide 3 animation value
  ]).current;

  // Progress bar animations
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Buttons animation
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  // Start animations when current index changes
  useEffect(() => {
    // Animate current slide in
    Animated.timing(slideAnimations[currentIndex], {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / slides.length,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Animate buttons on last slide
    if (currentIndex === slides.length - 1) {
      setShowSkipButton(false);
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }).start();

      // Vibrate to indicate last slide
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      setShowSkipButton(true);
      buttonsAnim.setValue(0);
    }

    // Animate slide transition
    Animated.timing(currentSlideAnim, {
      toValue: currentIndex,
      duration: 300,
      useNativeDriver: true,
    }).start();

    lastSlideIndex.current = currentIndex;
  }, [currentIndex]);

  // Onboarding slides
  const slides = [
    {
      id: "welcome",
      icon: "document-text",
      animation: "welcome.json",
      titleKey: "onboarding.welcome.title",
      descriptionKey: "onboarding.welcome.description",
      primaryColor: theme.colors.primary,
      secondaryColor: theme.colors.secondary,
    },
    {
      id: "upload",
      icon: "cloud-upload",
      animation: "upload.json",
      titleKey: "onboarding.upload.title",
      descriptionKey: "onboarding.upload.description",
      primaryColor: theme.colors.info,
      secondaryColor: theme.colors.primary,
    },
    {
      id: "analyze",
      icon: "analytics",
      animation: "analyze.json",
      titleKey: "onboarding.analyze.title",
      descriptionKey: "onboarding.analyze.description",
      primaryColor: theme.colors.success,
      secondaryColor: theme.colors.info,
    },
    {
      id: "ask",
      icon: "chatbubble-ellipses",
      animation: "chat.json",
      titleKey: "onboarding.ask.title",
      descriptionKey: "onboarding.ask.description",
      primaryColor: theme.colors.secondary,
      secondaryColor: theme.colors.primary,
    },
  ];

  // Go to next slide
  const goToNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });

      // Haptic feedback for slide change
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  // Skip onboarding
  const skipOnboarding = () => {
    // Haptic feedback for skip
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  // Complete onboarding
  const completeOnboarding = () => {
    // Haptic feedback for completion
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  // Track scrolling
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // Scroll detection for current index animation
  const handleScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(newIndex);
  };

  // Render single slide
  const renderSlide = ({ item, index }) => {
    return (
      <Animated.View
        style={[
          styles.slideContainer,
          {
            width,
            opacity: slideAnimations[index],
            transform: [
              {
                translateY: slideAnimations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            `${item.primaryColor}10`,
            "transparent",
            `${item.secondaryColor}05`,
          ]}
          style={styles.slideGradient}
        >
          <MotiView
            from={{ opacity: 0.5, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              delay: 300,
            }}
            style={styles.animationContainer}
          >
            {/* <LottieView
              source={getLottieAnimation(item.animation)}
              style={styles.animation}
              autoPlay
              loop
            /> */}
          </MotiView>

          <View
            style={[
              styles.iconCircle,
              { backgroundColor: item.primaryColor + "20" },
            ]}
          >
            <Ionicons name={item.icon} size={32} color={item.primaryColor} />
          </View>

          <Text variant="h1" style={styles.title} weight="bold">
            {t(item.titleKey)}
          </Text>

          <Text
            variant="body1"
            color={theme.colors.textSecondary}
            style={styles.description}
          >
            {t(item.descriptionKey)}
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  // Progress indicators
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.border },
            ]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: getSlideColor(currentIndex),
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.paginationDots}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dotContainer}
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                });
              }}
            >
              <Animated.View
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor:
                      index === currentIndex
                        ? getSlideColor(currentIndex)
                        : theme.colors.border,
                    width: currentIndex === index ? 24 : 8,
                    opacity: currentIndex === index ? 1 : 0.5,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Navigation buttons
  const renderButtons = () => {
    const isLastSlide = currentIndex === slides.length - 1;

    return (
      <View style={styles.buttonsContainer}>
        {showSkipButton ? (
          <Button
            title={t("common.skip")}
            onPress={skipOnboarding}
            type="outline"
            style={styles.skipButton}
          />
        ) : (
          <View style={styles.skipButton} />
        )}

        {isLastSlide ? (
          <Animated.View
            style={[
              styles.getStartedContainer,
              {
                opacity: buttonsAnim,
                transform: [
                  {
                    translateY: buttonsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Button
              title={t("common.getStarted")}
              onPress={completeOnboarding}
              style={styles.getStartedButton}
              gradient={true}
              fullWidth={true}
            />
          </Animated.View>
        ) : (
          <Button
            title={t("common.next")}
            onPress={goToNextSlide}
            style={styles.nextButton}
            rightIcon="arrow-forward"
          />
        )}
      </View>
    );
  };

  // Get slide color based on index
  const getSlideColor = (index) => {
    if (index >= 0 && index < slides.length) {
      return slides[index].primaryColor;
    }
    return theme.colors.primary;
  };

  // Get Lottie animation based on filename
  // const getLottieAnimation = (filename) => {
  //   switch (filename) {
  //     case "welcome.json":
  //       return require("../../assets/animations/welcome.json");
  //     case "upload.json":
  //       return require("../../assets/animations/upload.json");
  //     case "analyze.json":
  //       return require("../../assets/animations/analyze.json");
  //     case "chat.json":
  //       return require("../../assets/animations/chat.json");
  //     default:
  //       return require("../../assets/animations/welcome.json");
  //   }
  // };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.header}>
        {/* <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        /> */}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        bounces={false}
      />

      {renderPagination()}
      {renderButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 40,
  },
  slideContainer: {
    flex: 1,
  },
  slideGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  animationContainer: {
    width: 240,
    height: 240,
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 200,
    height: 200,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  paginationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dotContainer: {
    padding: 8, // Larger touch target
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    alignItems: "center",
  },
  skipButton: {
    width: 100,
  },
  nextButton: {
    width: 100,
  },
  getStartedContainer: {
    flex: 1,
  },
  getStartedButton: {
    height: 54,
  },
});

export default OnboardingScreen;
