// src/screens/auth/Welcome.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import GradientBackground from "../../components/common/GradientBackground";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import Button from "../../components/common/Button";

const { width } = Dimensions.get("window");

const logoImage = require("../../../assets/images/logo.png");
const onboardAnimation = require("../../../assets/animations/onboard.json");

const Welcome = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Üstte app adı/logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={logoImage} 
            style={styles.logoIcon} 
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Quorax</Text>
        </View>

        {/* Ortada büyük başlık ve Lottie animasyonu */}
        <View style={styles.contentContainer}>
          <View style={styles.content}>
            <LottieView
              source={onboardAnimation}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <Text style={styles.greetingText}>{t("welcome.greeting")}</Text>
            <Text style={styles.descriptionText}>{t("welcome.description")}</Text>
          </View>
        </View>

        {/* Butonlar */}
        <View style={styles.buttonGroup}>
          <Button
            title={t('auth.register')}
            onPress={handleRegister}
            fluid
            containerStyle={styles.buttonSpacing}
            size="auth"
          />
          <Button
            title={t('auth.login')}
            onPress={handleLogin}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    marginTop: 18,
    marginBottom: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#222',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Medium' : 'sans-serif-medium',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  content: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  robotImage: {
    width: width * 0.28,
    height: width * 0.28,
    marginBottom: 18,
  },
  lottieAnimation: {
    width: width * 0.6,
    height: width * 0.6,
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
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    lineHeight: 40,
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
    maxWidth: '90%',
    ...FONTS.h1,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
    lineHeight: 24,
    marginBottom: 0,
    textAlign: 'center',
    maxWidth: '85%',
    paddingHorizontal: 20,
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
});

export default Welcome;
