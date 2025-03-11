import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
  Animated,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLocalization } from "../../context/LocalizationContext";
import { useFocusEffect } from "@react-navigation/native";
import { Text, Card, Button, Divider, Badge } from "../../components";
import AnimatedHeader from "../../components/AnimatedHeader";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { TabBarStyleContext } from "../../navigation/MainNavigator";

const HelpScreen = ({ navigation }) => {
  const { tabBarStyle } = useContext(TabBarStyleContext);
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Expanded FAQs
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeSection, setActiveSection] = useState("faq"); // 'faq' or 'contact'

  // FAQ data
  const faqs = [
    {
      id: "1",
      question: t("help.faq.what_is_app") || "QuantumDoc uygulaması nedir?",
      answer:
        t("help.faq.what_is_app_answer") ||
        "QuantumDoc, belgelerinizi yapay zeka ile analiz edebilen, özetler çıkarabilen ve belge içeriği hakkında sorular sorabileceğiniz bir akıllı belge asistanıdır.",
    },
    {
      id: "2",
      question: t("help.faq.how_tokens_work") || "Tokenlar nasıl çalışır?",
      answer:
        t("help.faq.how_tokens_work_answer") ||
        "Tokenlar, AI analizleri ve diğer premium özellikleri kullanmak için gereken dijital para birimidir. Her belge analizi 1 token, her sorunun 0.2 token değeri vardır. İlk 3 sorunuz ücretsizdir.",
    },
    {
      id: "3",
      question: t("help.faq.privacy") || "Belgelerimin gizliliği korunuyor mu?",
      answer:
        t("help.faq.privacy_answer") ||
        "Evet, belgeleriniz güvenli sunucularda saklanır ve sadece sizin hesabınız ile erişilebilir. Tüm veri aktarımları şifrelenir ve yetkisiz erişime karşı korunur.",
    },
    {
      id: "4",
      question:
        t("help.faq.supported_formats") || "Hangi tür belgeler destekleniyor?",
      answer:
        t("help.faq.supported_formats_answer") ||
        "PDF, DOCX, JPG, PNG ve TXT formatındaki belgeler desteklenmektedir. Maksimum belge boyutu 10MB'dır.",
    },
    {
      id: "5",
      question: t("help.faq.subscription") || "Abonelik nasıl çalışır?",
      answer:
        t("help.faq.subscription_answer") ||
        "Aylık abonelik ile 50 token ve sınırsız belge analizi hakkı elde edersiniz. Abonelik, satın alma tarihinden itibaren 30 gün boyunca geçerlidir ve otomatik olarak yenilenir.",
    },
  ];

  // Social media links
  const socialMedia = [
    {
      id: "twitter",
      icon: "logo-twitter",
      color: "#1DA1F2",
      url: "https://twitter.com/quantumdoc",
    },
    {
      id: "facebook",
      icon: "logo-facebook",
      color: "#4267B2",
      url: "https://facebook.com/quantumdoc",
    },
    {
      id: "instagram",
      icon: "logo-instagram",
      color: "#E1306C",
      url: "https://instagram.com/quantumdoc",
    },
    {
      id: "linkedin",
      icon: "logo-linkedin",
      color: "#0077B5",
      url: "https://linkedin.com/company/quantumdoc",
    },
  ];

  // Entrance animations
  useEffect(() => {
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

  // FAQ Toggle with animation
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Main header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text variant="h2">{t("profile.help") || "Yardım ve Destek"}</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  // FAQs section
  const renderFaqs = () => {
    return (
      <Animated.View
        style={[
          styles.faqContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, 1.1) }],
          },
        ]}
      >
        <Card style={styles.faqCard}>
          {faqs.map((faq, index) => (
            <MotiView
              key={faq.id}
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100, type: "timing", duration: 300 }}
            >
              <View style={styles.faqItem}>
                <TouchableOpacity
                  style={[
                    styles.faqQuestion,
                    expandedFaq === faq.id && {
                      backgroundColor: theme.colors.primary + "05",
                    },
                  ]}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="body1"
                    weight={expandedFaq === faq.id ? "semibold" : "medium"}
                    style={styles.questionText}
                  >
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={
                      expandedFaq === faq.id ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color={
                      expandedFaq === faq.id
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                </TouchableOpacity>

                {expandedFaq === faq.id && (
                  <View
                    style={[
                      styles.faqAnswer,
                      {
                        backgroundColor: isDark
                          ? theme.colors.card + "50"
                          : theme.colors.border + "10",
                      },
                    ]}
                  >
                    <Text variant="body2" color={theme.colors.textSecondary}>
                      {faq.answer}
                    </Text>
                  </View>
                )}

                {index < faqs.length - 1 && <Divider />}
              </View>
            </MotiView>
          ))}
        </Card>
      </Animated.View>
    );
  };

  // Contact section
  const renderContactSection = () => (
    <Animated.View
      style={[
        styles.contactContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Email Contact Card */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
      >
        <Card style={styles.emailCard}>
          <LinearGradient
            colors={[theme.colors.primary + "30", theme.colors.background]}
            style={styles.emailCardGradient}
          >
            <View style={styles.emailCardContent}>
              <View style={styles.emailIconContainer}>
                <Ionicons name="mail" size={36} color={theme.colors.primary} />
              </View>
              <Text variant="h3" style={styles.emailTitle}>
                {t("help.contact.emailUs") || "Bize Yazın"}
              </Text>
              <Text
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.emailDescription}
              >
                {t("help.contact.emailDescription") ||
                  "Sorularınız için destek ekibimizle iletişime geçin. En kısa sürede size dönüş yapacağız."}
              </Text>
              <Text variant="subtitle2" style={styles.emailAddress}>
                support@quantumdoc.app
              </Text>
              <Button
                label={t("help.contact.sendEmail") || "E-posta Gönder"}
                onPress={() => Linking.openURL("mailto:support@quantumdoc.app")}
                style={styles.emailButton}
                gradient={true}
                leftIcon={<Ionicons name="send" size={18} color="#FFFFFF" />}
              />
            </View>
          </LinearGradient>
        </Card>
      </MotiView>

      {/* Social Media */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400, delay: 200 }}
      >
        <Card style={styles.socialCard}>
          <Text
            variant="subtitle1"
            weight="semibold"
            style={styles.socialTitle}
          >
            {t("help.social.title") || "Sosyal Medya"}
          </Text>
          <View style={styles.socialIconsContainer}>
            {socialMedia.map((social, index) => (
              <MotiView
                key={social.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 100,
                  type: "timing",
                  duration: 300,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.socialIconButton,
                    { backgroundColor: social.color + "15" },
                  ]}
                  onPress={() => Linking.openURL(social.url)}
                >
                  <Ionicons name={social.icon} size={24} color={social.color} />
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        </Card>
      </MotiView>

      {/* Feedback button */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400, delay: 300 }}
      >
        <Button
          label={t("help.feedback.button") || "Geri Bildirim Gönder"}
          gradient={true}
          style={styles.feedbackButton}
          leftIcon={
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
          }
          onPress={() => Linking.openURL("mailto:feedback@quantumdoc.app")}
        />
      </MotiView>

      {/* App version */}
      <View style={styles.versionContainer}>
        <View style={styles.versionContent}>
          <View style={styles.versionInfo}>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {t("profile.version") || "Versiyon"}: QuantumDoc 1.0.0
            </Text>
          </View>
          <Badge label="Güncel" variant="success" size="small" />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: 50,
        },
      ]}
    >
      <SafeAreaView
        style={{
          backgroundColor: theme.colors.primary + (isDark ? "80" : "40"),
        }}
      />

      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <AnimatedHeader
        title={t("profile.help") || "Yardım ve Destek"}
        scrollY={scrollY}
        theme={theme}
        onBackPress={() => navigation.goBack()}
        statusBarHeight={
          Platform.OS === "android" ? StatusBar.currentHeight : 0
        }
        topPosition={30}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderHeader()}
        {renderContactSection()}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Section Tabs
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  tabIcon: {
    marginRight: 8,
  },
  // FAQ List
  faqContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  faqCard: {
    borderRadius: 16,
    padding: 0,
    overflow: "hidden",
  },
  faqItem: {
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingVertical: 18,
  },
  questionText: {
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 16,
    paddingLeft: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  // Contact Section
  contactContainer: {
    padding: 16,
  },
  // Email Card
  emailCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  emailCardGradient: {
    padding: 0,
  },
  emailCardContent: {
    padding: 24,
    alignItems: "center",
  },
  emailIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emailTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  emailDescription: {
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  emailAddress: {
    marginBottom: 20,
    color: "#3D5AFE",
  },
  emailButton: {
    minWidth: 200,
  },
  // Social Media
  socialCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  socialTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
  },
  socialIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  // Feedback Button
  feedbackButton: {
    marginBottom: 20,
  },
  // Version Info
  versionContainer: {
    alignItems: "center",
  },
  versionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  versionInfo: {
    marginRight: 8,
  },
});

export default HelpScreen;
