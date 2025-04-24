import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
} from "react-native";
import GradientBackground from "../../components/common/GradientBackground";
import WelcomeMessage from "../../components/auth/WelcomeMessage";
import Button from "../../components/common/Button";
import { SIZES } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";

const { width } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Hey Human!",
    subtitle: "Discover Chat AI about anything you want!",
    image: require("../../assets/images/robot.png"),
  },
  {
    key: "2",
    title: "Talk to AI",
    subtitle: "Chat like never before, get instant responses!",
    image: require("../../assets/images/robot.png"), // Şimdilik aynı
  },
  {
    key: "3",
    title: "Save Your Notes",
    subtitle: "Keep what matters. Let AI help you organize.",
    image: require("../../assets/images/robot.png"), // Şimdilik aynı
  },
];

const Welcome = ({ navigation }) => {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate("Login");
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    slide: {
      width,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SIZES.padding,
    },
    buttonContainer: {
      width: "100%",
      paddingHorizontal: SIZES.padding,
      paddingBottom: SIZES.padding,
    },
    stepIndicator: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 20,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.gray,
      marginHorizontal: 4,
    },
    activeDot: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginHorizontal: 4,
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEnabled={true}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <WelcomeMessage
                title={item.title}
                subtitle={item.subtitle}
                showRobot={true}
                robotSize={180}
                robotSource={item.image}
              />
            </View>
          )}
        />

        <View style={styles.buttonContainer}>
          <View style={styles.stepIndicator}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={i === currentIndex ? styles.activeDot : styles.dot}
              />
            ))}
          </View>

          <Button
            title={
              currentIndex === slides.length - 1 ? "Get Started" : "Continue"
            }
            gradient
            onPress={handleNext}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Welcome;