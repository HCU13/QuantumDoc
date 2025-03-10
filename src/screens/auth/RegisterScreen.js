// src/screens/auth/RegisterScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  ImageBackground
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text } from "../../components/Text";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Loading } from "../../components/Loading";
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { register, loading } = useAuth();
  const { t } = useLocalization();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic info, 2: Password

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formFade = useRef(new Animated.Value(1)).current;
  const formSlide = useRef(new Animated.Value(0)).current;

  // Refs
  const lottieRef = useRef(null);

  // Start entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start Lottie animation
    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current.play();
      }, 500);
    }
  }, []);

  // Animate between registration steps
  const animateToNextStep = () => {
    // Fade out current form
    Animated.parallel([
      Animated.timing(formFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formSlide, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change to next step
      setCurrentStep(2);
      
      // Reset animation values
      formFade.setValue(0);
      formSlide.setValue(50);
      
      // Fade in new form
      Animated.parallel([
        Animated.timing(formFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Animate back to previous step
  const animateToPrevStep = () => {
    // Fade out current form
    Animated.parallel([
      Animated.timing(formFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formSlide, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change to prev step
      setCurrentStep(1);
      
      // Reset animation values
      formFade.setValue(0);
      formSlide.setValue(-50);
      
      // Fade in new form
      Animated.parallel([
        Animated.timing(formFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Form validation
  const validateFirstStepForm = () => {
    const newErrors = {};

    // Name validation
    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your name";
    }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSecondStepForm = () => {
    const newErrors = {};

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Password confirmation validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step button press
  const handleNextStep = () => {
    if (validateFirstStepForm()) {
      animateToNextStep();
    }
  };

  // Handle registration
  const handleRegister = async () => {
    if (validateSecondStepForm()) {
      try {
        await register(email, password, fullName);
        // Registration successful - AuthContext will automatically log in
      } catch (error) {
        console.error("Registration error", error);
        // Toast message shown in AuthContext
      }
    }
  };

  // Render step indicators
  const renderStepIndicators = () => (
    <View style={styles.stepIndicators}>
      <View 
        style={[
          styles.stepIndicator, 
          { 
            backgroundColor: currentStep >= 1 
              ? theme.colors.primary 
              : theme.colors.border 
          }
        ]}
      >
        <Text 
          variant="caption" 
          color="#ffffff"
        >
          1
        </Text>
      </View>
      <View 
        style={[
          styles.stepConnector, 
          { backgroundColor: currentStep > 1 ? theme.colors.primary : theme.colors.border }
        ]}
      />
      <View 
        style={[
          styles.stepIndicator, 
          { 
            backgroundColor: currentStep >= 2 
              ? theme.colors.primary 
              : theme.colors.border 
          }
        ]}
      >
        <Text 
          variant="caption" 
          color="#ffffff"
        >
          2
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <LinearGradient
          colors={isDark 
            ? [theme.colors.background, theme.colors.background] 
            : [theme.colors.background, theme.colors.card]}
          style={styles.gradient}
        >
          {/* Header with Back Button */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text variant="h2" style={styles.headerTitle}>
              {t("auth.register")}
            </Text>
            <View style={{ width: 40 }} />
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Create Account Animation */}
            <Animated.View 
              style={[
                styles.animationContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* <LottieView
                ref={lottieRef}
                source={require("../../assets/animations/create-account.json")}
                style={styles.animation}
                loop
              /> */}
              <Text
                variant="body1"
                color={theme.colors.textSecondary}
                style={styles.subtitle}
                centered
              >
                Create an account to get started with DocAI
              </Text>
            </Animated.View>

            {/* Step Indicators */}
            <Animated.View
              style={[
                styles.stepsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {renderStepIndicators()}
            </Animated.View>

            {/* Registration Form */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: Animated.multiply(fadeAnim, formFade),
                  transform: [
                    { translateY: Animated.add(slideAnim, formSlide) }
                  ]
                }
              ]}
            >
              <Card 
                style={styles.formCard}
                elevated={true}
              >
                {currentStep === 1 ? (
                  /* Step 1: Basic Information */
                  <View style={styles.formStep}>
                    <Text 
                      variant="subtitle1"
                      weight="semibold"
                      style={styles.formTitle}
                    >
                      Tell us about yourself
                    </Text>

                    <Input
                      label="Full Name"
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="John Doe"
                      icon="person"
                      error={errors.fullName}
                      variant="outline"
                      animatedLabel={true}
                    />

                    <Input
                      label="Email Address"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="email@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      icon="mail"
                      error={errors.email}
                      variant="outline"
                      animatedLabel={true}
                    />

                    <Button
                      title="Continue"
                      onPress={handleNextStep}
                      style={styles.actionButton}
                      gradient={true}
                      rightIcon="arrow-forward"
                    />
                  </View>
                ) : (
                  /* Step 2: Password */
                  <View style={styles.formStep}>
                    <Text 
                      variant="subtitle1"
                      weight="semibold"
                      style={styles.formTitle}
                    >
                      Set up your password
                    </Text>

                    <Input
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      secureTextEntry
                      icon="lock-closed"
                      error={errors.password}
                      variant="outline"
                      animatedLabel={true}
                    />

                    <Input
                      label="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••"
                      secureTextEntry
                      icon="lock-closed"
                      error={errors.confirmPassword}
                      variant="outline"
                      animatedLabel={true}
                    />

                    <View style={styles.passwordRequirements}>
                      <Text 
                        variant="caption" 
                        color={theme.colors.textSecondary}
                      >
                        Password should be at least 6 characters
                      </Text>
                    </View>

                    <View style={styles.twoButtonContainer}>
                      <Button
                        title="Back"
                        onPress={animateToPrevStep}
                        style={styles.backStepButton}
                        type="outline"
                      />
                      <Button
                        title="Create Account"
                        onPress={handleRegister}
                        style={styles.createButton}
                        gradient={true}
                        loading={loading}
                      />
                    </View>
                  </View>
                )}
              </Card>
            </Animated.View>

            {/* Sign in link */}
            <Animated.View
              style={[
                styles.signInContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.signInLink}
                onPress={() => navigation.navigate("Login")}
              >
                <Text 
                  variant="body2" 
                  color={theme.colors.textSecondary}
                >
                  {t("auth.alreadyHaveAccount")}{" "}
                  <Text 
                    variant="body2"
                    color={theme.colors.primary}
                    weight="semibold"
                  >
                    {t("auth.loginInstead")}
                  </Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Full screen loading indicator */}
      {loading && (
        <Loading 
          fullScreen 
          text="Creating your account..." 
          type="logo"
          blur={true}
          iconName="person-add"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    marginBottom: 0,
  },
  animationContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  animation: {
    width: 160,
    height: 160,
  },
  subtitle: {
    textAlign: "center",
    maxWidth: "80%",
    marginTop: 10,
  },
  stepsContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  stepIndicators: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  stepConnector: {
    height: 2,
    width: 50,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  formCard: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 20,
  },
  formStep: {
    alignItems: "stretch",
  },
  formTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  actionButton: {
    marginTop: 24,
  },
  passwordRequirements: {
    marginTop: 10,
    marginBottom: 20,
  },
  twoButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  backStepButton: {
    flex: 1,
    marginRight: 10,
  },
  createButton: {
    flex: 1,
  },
  signInContainer: {
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 24,
  },
  signInLink: {
    padding: 10,
  },
});

export default RegisterScreen;