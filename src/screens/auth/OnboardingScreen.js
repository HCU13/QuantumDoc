import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text, Button } from "../../components";
import { useTheme } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
const { width, height } = Dimensions.get("window");

const OnboardingScreen = ({ onComplete, navigation: propNavigation }) => {
  // State for tracking current page
  const [currentPage, setCurrentPage] = useState(0);
  const { theme } = useTheme();
  // Kullanıcı navigation özelliğini prop olarak geçtiyse onu kullan, geçmediyse useNavigation hook'unu kullan
  const hookNavigation = useNavigation();
  const navigation = propNavigation || hookNavigation;
  
  // Refs
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Onboarding data
  const onboardingData = [
    {
      id: "1",
      title: "Welcome to QuantumDoc",
      description: "Your AI-powered document analysis assistant",
      emoji: "🤖",
      backgroundColor: ["#5D5FEF", "#7879F1"],
    },
    {
      id: "2",
      title: "Scan & Upload",
      description:
        "Upload your documents or scan them directly using your camera",
      emoji: "📷",
      backgroundColor: ["#61DAFB", "#39C4E3"],
    },
    {
      id: "3",
      title: "AI Analysis",
      description:
        "Our AI analyzes documents and extracts key information in seconds",
      emoji: "✨",
      backgroundColor: ["#8B5CF6", "#A78BFA"],
    },
    {
      id: "4",
      title: "Ask Questions",
      description: "Chat with your documents and get immediate answers",
      emoji: "💬",
      backgroundColor: ["#10B981", "#34D399"],
    },
  ];

  // Handle next page
  const goToNextPage = () => {
    if (currentPage < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentPage + 1,
        animated: true,
      });
    } else {
      // Fade out animation before completing
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Önce onComplete callback'ini kontrol et
        if (onComplete) {
          onComplete();
        } 
        // Eğer navigation varsa ve navigate metodu varsa, kullan
        else if (navigation && navigation.navigate) {
          navigation.navigate("Login");
        }
      });
    }
  };

  // Handle skip
  const handleSkip = () => {
    // Fade out animation before completing
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Önce onComplete callback'ini kontrol et
      if (onComplete) {
        onComplete();
      } 
      // Eğer navigation varsa ve navigate metodu varsa, kullan
      else if (navigation && navigation.navigate) {
        navigation.navigate("Login");
      }
    });
  };

  // Render individual onboarding page
  const renderItem = ({ item, index }) => (
    <View style={[styles.slide, { width }]}>
      <LinearGradient
        colors={item.backgroundColor}
        style={styles.gradientBackground}
      >
        <View style={styles.topSection}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <Text variant="h2" style={[styles.title, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text
          variant="body1"
          color={theme.colors.text}
          style={styles.description}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );

  // Handle scroll events
  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const viewSize = event.nativeEvent.layoutMeasurement;

    // Calculate page number
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    setCurrentPage(pageNum);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.safeArea}>
        {/* Skip button */}
        <View style={styles.skipContainer}>
          {currentPage < onboardingData.length - 1 && (
            <TouchableOpacity onPress={handleSkip}>
              <Text variant="body2" color="#64748B">
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Onboarding Slides */}
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        {/* Pagination Indicators */}
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor:
                    currentPage === index
                      ? onboardingData[currentPage].backgroundColor[0]
                      : "#CBD5E1",
                  width: currentPage === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Bottom Button */}
        <View style={styles.buttonContainer}>
          <Button
            label={
              currentPage === onboardingData.length - 1 ? "Get Started" : "Next"
            }
            onPress={goToNextPage}
            gradient={true}
            style={styles.nextButton}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  skipContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  slide: {
    flex: 1,
  },
  gradientBackground: {
    height: height * 0.5,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  topSection: {
    justifyContent: "center",
    alignItems: "center",
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 60,
  },
  contentContainer: {
    padding: 32,
    alignItems: "center",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: 16,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  nextButton: {
    width: "100%",
  },
});

export default OnboardingScreen;
