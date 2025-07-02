import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";

const HelpSupportScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    subjectError: "",
    messageError: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
    },
    header: {
      alignItems: "center",
      marginVertical: 15,
    },
    headerTitle: {
      ...FONTS.h2,
      color: colors.textOnGradient,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
    },
    headerSubtitle: {
      ...FONTS.body3,
      color: colors.textSecondary,
      textAlign: "center",
    },
    searchContainer: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.15)" : colors.card,
      borderRadius: SIZES.radius,
      paddingHorizontal: 15,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      ...FONTS.body3,
      color: colors.textPrimary,
      flex: 1,
      marginLeft: 10,
      height: 40,
    },
    categoriesTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginVertical: 15,
      fontWeight: "bold",
    },
    categoriesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    categoryCard: {
      width: "48%",
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.15)" : colors.card,
      borderRadius: SIZES.radius,
      padding: 15,
      marginBottom: 15,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryIcon: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(138, 79, 255, 0.1)",
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    categoryTitle: {
      ...FONTS.body3,
      color: colors.textPrimary,
      textAlign: "center",
      fontWeight: "600",
    },
    faqTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginVertical: 15,
      fontWeight: "bold",
    },
    faqItem: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.15)" : colors.card,
      borderRadius: SIZES.radius,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    faqQuestion: {
      ...FONTS.body3,
      color: colors.textPrimary,
      fontWeight: "bold",
    },
    faqAnswer: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginTop: 10,
      lineHeight: 20,
    },
    contactSection: {
      marginVertical: 20,
    },
    contactTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginBottom: 15,
      fontWeight: "bold",
    },
    contactCard: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.15)" : colors.card,
      borderRadius: SIZES.radius,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contactOption: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    contactOptionText: {
      ...FONTS.body3,
      color: colors.textPrimary,
      marginLeft: 15,
    },
    formContainer: {
      marginTop: 10,
    },
    messageInput: {
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : colors.lightGray,
      borderRadius: SIZES.radius,
      padding: 15,
      color: colors.textPrimary,
      ...FONTS.body3,
      minHeight: 120,
      textAlignVertical: "top",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 5,
    },
    errorText: {
      ...FONTS.body5,
      color: "#FF453A",
      marginBottom: 15,
      marginLeft: 5,
    },
    categoryContent: {
      marginTop: 10,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    backButtonText: {
      ...FONTS.body3,
      color: colors.primary,
      marginLeft: 5,
    },
    socialMediaContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 20,
    },
    socialButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(138, 79, 255, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 10,
    },
    versionText: {
      ...FONTS.body5,
      color: colors.textTertiary,
      textAlign: "center",
      marginVertical: 20,
    },
  });

  const categories = [
    {
      id: "account",
      title: "Hesap ve Giriş",
      icon: <Ionicons name="person-outline" size={24} color={colors.primary} />,
      faqs: [
        {
          question: "Şifremi nasıl değiştirebilirim?",
          answer:
            "Şifrenizi değiştirmek için Profil > Hesap Bilgileri > Şifre Değiştir bölümüne gidin. Eski şifrenizi ve yeni şifrenizi girerek değişikliği tamamlayabilirsiniz.",
        },
        {
          question: "Hesabımı nasıl silebilirim?",
          answer:
            "Hesabınızı silmek için Profil > Hesap Bilgileri sayfasına gidin ve sayfanın altındaki 'Hesabı Sil' butonuna tıklayın. Bu işlem geri alınamaz ve tüm verileriniz silinir.",
        },
        {
          question: "Şifremi unuttum, ne yapmalıyım?",
          answer:
            "Giriş sayfasında 'Şifremi Unuttum' seçeneğine tıklayarak e-posta adresinize bir şifre sıfırlama bağlantısı gönderebilirsiniz.",
        },
      ],
    },
    {
      id: "tokens",
      title: "Token ve Ödemeler",
      icon: <Ionicons name="cash-outline" size={24} color={colors.primary} />,
      faqs: [
        {
          question: "Token nedir ve nasıl kullanılır?",
          answer:
            "Tokenlar, AI özelliklerine erişim sağlayan dijital kredilerdir. Farklı özelliklerin farklı token maliyeti vardır. Video izleyerek, uygulamayı paylaşarak veya abonelik satın alarak token kazanabilirsiniz.",
        },
        {
          question: "Daha fazla token nasıl kazanabilirim?",
          answer:
            "Profil > Token Yönetimi sayfasından günlük video izleyerek, uygulamayı paylaşarak veya geri bildirim vererek ücretsiz token kazanabilirsiniz. Ayrıca abonelik planları satın alarak daha fazla token elde edebilirsiniz.",
        },
        {
          question: "Abonelik planları nelerdir?",
          answer:
            "Ücretsiz, Premium ve Sınırsız olmak üzere üç abonelik planımız bulunmaktadır. Profil > Abonelik sayfasından planları inceleyebilir ve size uygun olanı seçebilirsiniz.",
        },
      ],
    },
    {
      id: "ai",
      title: "AI Özellikleri",
      icon: <Ionicons name="bulb-outline" size={24} color={colors.primary} />,
      faqs: [
        {
          question: "AI sohbet nasıl çalışır?",
          answer:
            "AI sohbet, yapay zeka ile doğal bir diyalog kurmanızı sağlar. Sorularınızı yazabilir veya sesli olarak sorabilirsiniz. AI, sorularınıza kapsamlı ve anlamlı yanıtlar verecektir.",
        },
        {
          question: "AI cevaplarının doğruluğu nasıl?",
          answer:
            "AI, güvenilir bilgiler sunmak için eğitilmiştir, ancak her zaman %100 doğru olmayabilir. Önemli konularda profesyonel tavsiye almak her zaman daha iyidir.",
        },
        {
          question: "AI hangi dilleri destekler?",
          answer:
            "AI birçok dili destekler. Profil > Dil Ayarları sayfasından AI yanıtları için tercih ettiğiniz dili seçebilirsiniz.",
        },
      ],
    },
    {
      id: "privacy",
      title: "Gizlilik ve Güvenlik",
      icon: <Ionicons name="shield-outline" size={24} color={colors.primary} />,
      faqs: [
        {
          question: "Verilerim nasıl korunuyor?",
          answer:
            "Verileriniz, endüstri standardı şifreleme yöntemleriyle korunmaktadır. Gizlilik politikamız hakkında daha fazla bilgi için Profil > Gizlilik sayfasını ziyaret edebilirsiniz.",
        },
        {
          question: "Sohbet geçmişim saklanıyor mu?",
          answer:
            "Varsayılan olarak, sohbet geçmişiniz daha iyi hizmet verebilmek için saklanır. Profil > Gizlilik sayfasından bu ayarı değiştirebilir ve geçmişinizi temizleyebilirsiniz.",
        },
        {
          question: "Verilerimi nasıl silebilirim?",
          answer:
            "Tüm verilerinizi silmek için Profil > Gizlilik sayfasına gidin ve 'Tüm Verilerimin Silinmesini Talep Et' butonuna tıklayın. Bu işlem 30 gün içinde tamamlanacaktır.",
        },
      ],
    },
  ];

  const popularFaqs = [
    {
      question: "AI yanıtları için token neden gerekli?",
      answer:
        "Token sistemi, hizmet kalitesini sürdürmek ve sunucu maliyetlerini karşılamak için kullanılır. Ayrıca, kullanıcıların farklı abonelik planları arasında seçim yapmasına olanak tanır.",
    },
    {
      question: "Uygulama çevrimdışı çalışır mı?",
      answer:
        "Hayır, AI özellikleri için internet bağlantısı gereklidir. Ancak önceden kaydedilen bazı notlarınıza çevrimdışıyken de erişebilirsiniz.",
    },
    {
      question: "AI yanıtlarının doğruluğundan emin olabilir miyim?",
      answer:
        "AI, en güncel bilgileri sunmak için eğitilmiştir, ancak yanıtların %100 doğruluğunu garanti edemeyiz. Önemli kararlar için her zaman uzman görüşü almanızı öneririz.",
    },
  ];

  const handleSearch = () => {
    // Search implementation would go here
    console.log("Searching for:", searchQuery);
  };

  const validateForm = () => {
    let valid = true;
    let errors = {
      subjectError: "",
      messageError: "",
    };

    if (!contactForm.subject.trim()) {
      errors.subjectError = "Konu gerekli";
      valid = false;
    }

    if (!contactForm.message.trim()) {
      errors.messageError = "Mesaj gerekli";
      valid = false;
    } else if (contactForm.message.trim().length < 10) {
      errors.messageError = "Mesaj çok kısa, lütfen daha detaylı açıklayın";
      valid = false;
    }

    setContactForm({ ...contactForm, ...errors });
    return valid;
  };

  const handleSubmitForm = () => {
    if (validateForm()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        Alert.alert(
          "Başarılı",
          "Mesajınız gönderildi. En kısa sürede size dönüş yapacağız."
        );
        setContactForm({
          subject: "",
          message: "",
          subjectError: "",
          messageError: "",
        });
        setShowContactForm(false);
      }, 1500);
    }
  };

  const handleOpenEmail = () => {
    Linking.openURL("mailto:support@aiapp.com");
  };

  const handleOpenWebsite = () => {
    Linking.openURL("https://www.aiapp.com");
  };

  const handleSocialMedia = (platform) => {
    let url = "";
    switch (platform) {
      case "twitter":
        url = "https://twitter.com/aiapp";
        break;
      case "facebook":
        url = "https://facebook.com/aiapp";
        break;
      case "instagram":
        url = "https://instagram.com/aiapp";
        break;
      default:
        return;
    }
    Linking.openURL(url);
  };

  const renderSelectedCategory = () => {
    const category = categories.find((cat) => cat.id === selectedCategory);

    if (!category) return null;

    return (
      <View style={styles.categoryContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedCategory(null)}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.backButtonText}>Kategorilere Dön</Text>
        </TouchableOpacity>

        <Text style={styles.faqTitle}>{category.title} Hakkında SSS</Text>

        {category.faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        ))}

        <Button
          title="Daha Fazla Yardım Gerekiyor"
          neon
          icon={
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={colors.textOnPrimary}
            />
          }
          onPress={() => setShowContactForm(true)}
          containerStyle={{ marginVertical: 15 }}
        />
      </View>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        /> */}

        <Header title="Yardım ve Destek" showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nasıl Yardımcı Olabiliriz?</Text>
            <Text style={styles.headerSubtitle}>
              Sorularınızı yanıtlamak için buradayız
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.textPrimary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Yardım konusu ara..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>

          {!selectedCategory && !showContactForm ? (
            <>
              <Text style={styles.categoriesTitle}>Yardım Kategorileri</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: colors.card },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <View style={styles.categoryIcon}>{category.icon}</View>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.faqTitle}>Sık Sorulan Sorular</Text>
              {popularFaqs.map((faq, index) => (
                <View
                  key={index}
                  style={[styles.faqItem, { backgroundColor: colors.card }]}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              ))}

              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>Bizimle İletişime Geçin</Text>
                <View
                  style={[styles.contactCard, { backgroundColor: colors.card }]}
                >
                  <TouchableOpacity
                    style={styles.contactOption}
                    onPress={handleOpenEmail}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={24}
                      color={colors.primary}
                    />
                    <Text style={styles.contactOptionText}>
                      support@aiapp.com
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.contactOption}
                    onPress={handleOpenWebsite}
                  >
                    <Ionicons
                      name="globe-outline"
                      size={24}
                      color={colors.primary}
                    />
                    <Text style={styles.contactOptionText}>www.aiapp.com</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.contactOption, { marginBottom: 0 }]}
                    onPress={() => setShowContactForm(true)}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={24}
                      color={colors.primary}
                    />
                    <Text style={styles.contactOptionText}>
                      Destek Formu Gönder
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.socialMediaContainer}>
                <TouchableOpacity
                  style={[
                    styles.socialButton,
                    { backgroundColor: colors.card },
                  ]}
                  onPress={() => handleSocialMedia("twitter")}
                >
                  <Ionicons
                    name="logo-twitter"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.socialButton,
                    { backgroundColor: colors.card },
                  ]}
                  onPress={() => handleSocialMedia("facebook")}
                >
                  <Ionicons
                    name="logo-facebook"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.socialButton,
                    { backgroundColor: colors.card },
                  ]}
                  onPress={() => handleSocialMedia("instagram")}
                >
                  <Ionicons
                    name="logo-instagram"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.versionText}>Uygulama Versiyonu: 1.0.0</Text>
            </>
          ) : showContactForm ? (
            <View style={styles.formContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowContactForm(false)}
              >
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text style={styles.backButtonText}>{t("common.back")}</Text>
              </TouchableOpacity>

              <Text style={styles.contactTitle}>{t("screens.profile.help.supportForm")}</Text>
              <Card>
                <Input
                  label={t("screens.profile.help.subject")}
                  value={contactForm.subject}
                  onChangeText={(text) =>
                    setContactForm({
                      ...contactForm,
                      subject: text,
                      subjectError: "",
                    })
                  }
                  placeholder={t("screens.profile.help.subjectPlaceholder")}
                  error={contactForm.subjectError}
                  icon={
                    <Ionicons
                      name="help-circle-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />

                <Text
                  style={{
                    ...FONTS.body4,
                    color: colors.textPrimary,
                    marginBottom: 8,
                  }}
                >
                  {t("screens.profile.help.message")}
                </Text>
                <TextInput
                  style={styles.messageInput}
                  placeholder={t("screens.profile.help.messagePlaceholder")}
                  placeholderTextColor={colors.textTertiary}
                  value={contactForm.message}
                  onChangeText={(text) =>
                    setContactForm({
                      ...contactForm,
                      message: text,
                      messageError: "",
                    })
                  }
                  multiline
                  numberOfLines={6}
                />
                {contactForm.messageError ? (
                  <Text style={styles.errorText}>
                    {contactForm.messageError}
                  </Text>
                ) : null}

                <Button
                  title={t("screens.profile.help.send")}
                  gradient
                  icon={
                    <Ionicons
                      name="send-outline"
                      size={18}
                      color={colors.textOnPrimary}
                    />
                  }
                  onPress={handleSubmitForm}
                  loading={isSubmitting}
                  containerStyle={{ marginTop: 10 }}
                />
              </Card>
            </View>
          ) : (
            renderSelectedCategory()
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default HelpSupportScreen;
