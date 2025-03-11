import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Linking,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text, Card, Badge } from "../../components";
import AnimatedHeader from "../../components/AnimatedHeader";

const { width, height } = Dimensions.get("window");

const AboutScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // App version
  const APP_VERSION = "1.0.0";

  // Start entrance animations when component mounts
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Function to open URLs (for privacy policy, etc.)
  const openLink = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Error opening URL:", err)
    );
  };

  // Render header without animation (fixed position)
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text variant="h2">{t("profile.about")}</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  // Render app logo section
  const renderLogoSection = () => (
    <Animated.View
      style={[
        styles.logoContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? [theme.colors.primary + "80", theme.colors.background]
            : [theme.colors.primary + "40", theme.colors.background]
        }
        style={styles.logoGradient}
      >
        <View style={styles.logoBackground}>
          <Text style={styles.logoText}>🤖</Text>
        </View>
        <Text variant="h2" style={styles.appName}>
          QuantumDoc
        </Text>
        <Text
          variant="body2"
          color={isDark ? "#FFFFFF80" : theme.colors.textSecondary}
          style={styles.appTagline}
        >
          AI-Powered Document Analysis
        </Text>
        <Badge
          label={`Version ${APP_VERSION}`}
          variant="secondary"
          size="small"
          style={styles.versionBadge}
        />
      </LinearGradient>
    </Animated.View>
  );

  // Features section
  const renderFeaturesSection = () => (
    <Animated.View
      style={[
        styles.sectionContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, 1.2) }],
        },
      ]}
    >
      <Card style={styles.card} variant={isDark ? "default" : "bordered"}>
        <Text variant="h3" style={styles.sectionTitle}>
          Key Features
        </Text>

        <FeatureItem
          icon="document-text"
          color={theme.colors.primary}
          title="AI Document Analysis"
          description="Upload documents for instant summaries, key points extraction, and detailed analysis powered by artificial intelligence."
        />

        <FeatureItem
          icon="scan"
          color={theme.colors.info}
          title="Document Scanning"
          description="Scan physical documents with your camera and convert them into digital format with automatic edge detection."
        />

        <FeatureItem
          icon="chatbubble"
          color={theme.colors.secondary}
          title="Ask Questions"
          description="Chat with your documents and get immediate answers to your specific questions about the content."
        />

        <FeatureItem
          icon="shield-checkmark"
          color={theme.colors.success}
          title="Secure Storage"
          description="All your documents and analyses are securely stored and protected with enterprise-grade encryption."
        />
      </Card>
    </Animated.View>
  );

  // Technology section
  const renderTechnologySection = () => (
    <Animated.View
      style={[
        styles.sectionContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, 1.4) }],
        },
      ]}
    >
      <Card style={styles.card} variant={isDark ? "default" : "bordered"}>
        <Text variant="h3" style={styles.sectionTitle}>
          Powered By
        </Text>

        <View style={styles.techContainer}>
          <TechItem name="Claude AI" icon="brain" />
          <TechItem name="Firebase" icon="server" />
          <TechItem name="React Native" icon="phone-portrait" />
          <TechItem name="OCR Technology" icon="eye" />
        </View>
      </Card>
    </Animated.View>
  );

  // Company info section
  const renderCompanySection = () => (
    <Animated.View
      style={[
        styles.sectionContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, 1.6) }],
        },
      ]}
    >
      <Card style={styles.card} variant={isDark ? "default" : "bordered"}>
        <Text variant="h3" style={styles.sectionTitle}>
          About Us
        </Text>

        <Text variant="body1" style={styles.companyText}>
          QuantumDoc was developed by a team passionate about making document
          analysis accessible to everyone. Our mission is to help users extract
          insights from documents quickly and effortlessly.
        </Text>

        <Text variant="body1" style={styles.companyText}>
          Founded in 2023, we're continually improving our AI technology to
          deliver the most accurate and helpful document analysis.
        </Text>
      </Card>
    </Animated.View>
  );

  // Links section (Privacy Policy, Terms, etc.)
  const renderLinksSection = () => (
    <Animated.View
      style={[
        styles.sectionContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, 1.8) }],
        },
      ]}
    >
      <Card style={styles.linkCard} variant={isDark ? "default" : "bordered"}>
        <TouchableOpacity
          style={styles.linkItem}
          onPress={() => openLink("https://www.example.com/privacy")}
        >
          <Ionicons
            name="shield-outline"
            size={22}
            color={theme.colors.primary}
          />
          <Text
            variant="body1"
            color={theme.colors.text}
            style={styles.linkText}
          >
            Privacy Policy
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkItem}
          onPress={() => openLink("https://www.example.com/terms")}
        >
          <Ionicons
            name="document-text-outline"
            size={22}
            color={theme.colors.primary}
          />
          <Text
            variant="body1"
            color={theme.colors.text}
            style={styles.linkText}
          >
            Terms of Service
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkItem}
          onPress={() => openLink("https://www.example.com/contact")}
        >
          <Ionicons
            name="mail-outline"
            size={22}
            color={theme.colors.primary}
          />
          <Text
            variant="body1"
            color={theme.colors.text}
            style={styles.linkText}
          >
            Contact Us
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  // Copyright section
  const renderCopyrightSection = () => (
    <Animated.View
      style={[
        styles.copyrightContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, 2) }],
        },
      ]}
    >
      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={styles.copyright}
      >
        © 2023-2025 QuantumDoc. All rights reserved.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: 50 },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Animated header that appears when scrolling */}
      <AnimatedHeader
        title={t("profile.about")}
        scrollY={scrollY}
        theme={theme}
        onBackPress={() => navigation.goBack()}
        statusBarHeight={
          Platform.OS === "android" ? StatusBar.currentHeight : 0
        }
        topPosition={30}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderHeader()}
        {renderLogoSection()}
        {renderFeaturesSection()}
        {renderTechnologySection()}
        {renderCompanySection()}
        {renderLinksSection()}
        {renderCopyrightSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

// Feature Item Component
const FeatureItem = ({ icon, color, title, description }) => (
  <View style={styles.featureItem}>
    <View
      style={[styles.featureIconContainer, { backgroundColor: color + "15" }]}
    >
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.featureContent}>
      <Text variant="subtitle2" style={styles.featureTitle}>
        {title}
      </Text>
      <Text variant="body2" color="#64748B" style={styles.featureDescription}>
        {description}
      </Text>
    </View>
  </View>
);

// Technology Item Component
const TechItem = ({ name, icon }) => (
  <View style={styles.techItem}>
    <View style={styles.techIconContainer}>
      <Ionicons name={icon} size={24} color="#5D5FEF" />
    </View>
    <Text variant="caption" style={styles.techName}>
      {name}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoGradient: {
    width: "100%",
    paddingVertical: 30,
    alignItems: "center",
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    marginBottom: 8,
  },
  appTagline: {
    marginBottom: 16,
  },
  versionBadge: {
    marginTop: 8,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: 4,
  },
  featureDescription: {
    lineHeight: 22,
  },
  techContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  techItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 24,
  },
  techIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#5D5FEF15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  techName: {
    textAlign: "center",
  },
  companyText: {
    marginBottom: 16,
    lineHeight: 24,
  },
  linkCard: {
    padding: 0,
    borderRadius: 16,
    overflow: "hidden",
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  linkText: {
    flex: 1,
    marginLeft: 12,
  },
  copyrightContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  copyright: {
    textAlign: "center",
  },
});

export default AboutScreen;
