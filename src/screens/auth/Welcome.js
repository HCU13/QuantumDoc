// src/screens/auth/Welcome.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import GradientBackground from "../../components/common/GradientBackground";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import Button from "../../components/common/Button";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const robotImage = require("../../assets/images/robot.png");

const Welcome = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Slide başlıkları (her biri çok satırlı olabilir)
  const slides = [
    {
      key: "1",
      title: t("welcome.slide1.title"),
      subtitle: t("welcome.slide1.subtitle"),
      image: robotImage,
    },
    {
      key: "2",
      title: t("welcome.slide2.title"),
      subtitle: t("welcome.slide2.subtitle"),
      image: robotImage,
    },
    {
      key: "3",
      title: t("welcome.slide3.title"),
      subtitle: t("welcome.slide3.subtitle"),
      image: robotImage,
    },
  ];

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Üstte app adı/logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>QuantumDoc</Text>
        </View>

        {/* Ortada büyük başlık (slide) */}
        <View style={styles.slideContainer}>
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
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <Image source={item.image} style={styles.robotImage} resizeMode="contain" />
                <Text style={styles.slideTitle}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
                ) : null}
              </View>
            )}
          />
        </View>

        {/* Dot/step indicator */}
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={
                i === currentIndex
                  ? styles.activeDot
                  : styles.dot
              }
            />
          ))}
        </View>

        {/* Butonlar */}
        <View style={styles.buttonGroup}>
          <Button
            title={t('auth.register')}
            onPress={() => navigation.navigate('Register')}
            fluid
            containerStyle={styles.buttonSpacing}
            size="auth"
          />
          <Button
            title={t('auth.login')}
            onPress={() => navigation.navigate('Login')}
            fluid
            outlined
            containerStyle={styles.buttonSpacing}
            size="auth"
          />
        </View>

        {/* Açıklama metni */}
        <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomText}>
            {t('welcome.terms')}
          </Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 28,
    marginTop: 18,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#222',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Medium' : 'sans-serif-medium',
  },
  slideContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  robotImage: {
    width: width * 0.32,
    height: width * 0.32,
    marginBottom: 18,
  },
  slideTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#222',
    lineHeight: 42,
    marginBottom: 10,
    letterSpacing: -0.5,
    textAlign: 'center',
    maxWidth: '90%',
    ...FONTS.h1,
  },
  slideSubtitle: {
    fontSize: 17,
    color: '#888',
    fontWeight: '400',
    lineHeight: 24,
    marginBottom: 0,
    textAlign: 'center',
    maxWidth: '90%',
    ...FONTS.body3,
  },
  buttonGroup: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 18,
    marginTop: 0,
  },
  buttonSpacing: {
    marginBottom: 12,
    width: '100%',
  },
  bottomTextContainer: {
    width: '100%',
    paddingHorizontal: 32,
    marginBottom: 18,
  },
  bottomText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1cbe9', // soluk ana renk
    marginHorizontal: 5,
    opacity: 0.5,
  },
  activeDot: {
    width: 18,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8A4FFF', // ana renk
    marginHorizontal: 5,
    opacity: 1,
  },
});

export default Welcome;
