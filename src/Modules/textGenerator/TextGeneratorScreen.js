import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Share,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";

const { width } = Dimensions.get("window");

const TextGeneratorScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const [contentType, setContentType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const scrollViewRef = useRef();

  const tokenCost = 3; // Cost to generate text

  // Content types with improved categorization
  const contentTypes = [
    { id: "blog", label: "Blog Yazısı", icon: "document-text" },
    { id: "social", label: "Sosyal Medya", icon: "share-social" },
    { id: "email", label: "E-posta", icon: "mail" },
    { id: "story", label: "Hikaye", icon: "book" },
    { id: "academic", label: "Akademik", icon: "school" },
    { id: "business", label: "İş Metni", icon: "briefcase" },
    { id: "cv", label: "CV/Özgeçmiş", icon: "person" },
    { id: "product", label: "Ürün Açıklaması", icon: "pricetag" },
    { id: "recipe", label: "Yemek Tarifi", icon: "restaurant" },
    { id: "poem", label: "Şiir/Şarkı Sözü", icon: "musical-notes" },
    { id: "news", label: "Haber Makalesi", icon: "newspaper" },
    { id: "speech", label: "Konuşma/Sunum", icon: "megaphone" },
  ];

  // Tone options with improved descriptions
  const toneOptions = [
    { id: "professional", label: "Profesyonel", icon: "briefcase" },
    { id: "casual", label: "Günlük", icon: "cafe" },
    { id: "formal", label: "Resmi", icon: "document-text" },
    { id: "friendly", label: "Arkadaşça", icon: "happy" },
    { id: "persuasive", label: "İkna Edici", icon: "trending-up" },
    { id: "humorous", label: "Mizahi", icon: "happy" },
    { id: "inspirational", label: "İlham Verici", icon: "sparkles" },
    { id: "educational", label: "Eğitici", icon: "school" },
  ];

  // Length options with icons
  const lengthOptions = [
    { id: "short", label: "Kısa", icon: "text", description: "250-300 kelime" },
    {
      id: "medium",
      label: "Orta",
      icon: "list",
      description: "500-600 kelime",
    },
    {
      id: "long",
      label: "Uzun",
      icon: "document",
      description: "1000+ kelime",
    },
  ];

  // Generate text based on user selections
  const generateText = async () => {
    if (!topic.trim()) {
      Alert.alert("Hata", "Lütfen bir konu girin.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setShowResult(false);

    try {
      // Simulate API call with timeout
      setTimeout(() => {
        const generatedContent = generateSampleText(
          contentType,
          topic,
          tone,
          length
        );
        setGeneratedText(generatedContent);
        setLoading(false);
        setShowResult(true);

        // Scroll to results
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }, 2000);
    } catch (error) {
      console.log("Error generating text:", error);
      setLoading(false);
      Alert.alert("Hata", "Yazı üretilirken bir hata oluştu.");
    }
  };

  // Sample text generation (simulate AI response)
  const generateSampleText = (type, userTopic, userTone, userLength) => {
    let baseText = "";
    const topic = userTopic.charAt(0).toUpperCase() + userTopic.slice(1);

    // Type-specific intro
    switch (type) {
      case "blog":
        baseText = `# ${topic} Hakkında Bilmeniz Gerekenler\n\n`;
        baseText += `${topic} günümüzde giderek önem kazanan bir konu. Bu yazıda, ${topic.toLowerCase()} hakkında detaylı bilgiler ve önemli ipuçları paylaşacağım.\n\n`;
        break;
      case "social":
        baseText = `📱 #${topic.replace(/\s+/g, "")}\n\n`;
        baseText += `Bugün sizlerle ${topic.toLowerCase()} hakkında heyecan verici bilgiler paylaşmak istiyorum! 👇\n\n`;
        break;
      case "email":
        baseText = `Konu: ${topic} Hakkında Bilgilendirme\n\n`;
        baseText += `Sayın İlgili,\n\nBu e-postayı ${topic.toLowerCase()} hakkında sizi bilgilendirmek amacıyla yazıyorum.\n\n`;
        break;
      case "story":
        baseText = `# ${topic}: Bir Hikaye\n\n`;
        baseText += `Bir zamanlar, ${topic.toLowerCase()} ile derin bir bağı olan birisi vardı. Günlerden bir gün, beklenmedik bir olay gerçekleşti...\n\n`;
        break;
      default:
        baseText = `# ${topic}\n\n`;
    }

    // Tone-specific content
    let toneText = "";
    switch (userTone) {
      case "professional":
        toneText = `${topic} alanında profesyonel bir yaklaşım benimsemek, günümüz rekabet ortamında önemli avantajlar sağlayabilir. Verilere dayalı stratejiler ve sistematik yöntemler, bu konuda ilerlemenin anahtarıdır.`;
        break;
      case "casual":
        toneText = `Hey, ${topic} hakkında konuşalım biraz! Biliyorsun, bu konu gerçekten ilginç ve herkesin hayatına dokunabiliyor. Ben şahsen bu konuyu her zaman merak etmişimdir.`;
        break;
      default:
        toneText = `${topic} hakkında düşüncelerim şu şekilde...`;
    }

    baseText += toneText + "\n\n";

    // Generate paragraphs based on length
    let paragraphs = "";
    const paragraphCount =
      userLength === "short" ? 2 : userLength === "medium" ? 4 : 6;

    const paragraphTemplates = [
      `${topic} alanında yapılan son araştırmalar, birçok yeni bulguyu ortaya koymuştur. Özellikle teknolojinin gelişmesiyle birlikte, bu alandaki ilerlemeler hız kazanmıştır. Uzmanlar, önümüzdeki yıllarda daha fazla yeniliğin geleceğini öngörmektedir.`,
      `Peki ${topic} ile ilgili bilmeniz gereken temel noktalar nelerdir? Öncelikle, bu konuya yaklaşırken bütünsel bir bakış açısı geliştirmek önemlidir. Farklı perspektiflerden değerlendirmeler yapmak, daha kapsamlı bir anlayış sağlayacaktır.`,
      `${topic} konusundaki genel yanılgılardan biri, onun sadece belirli bir kesimi ilgilendirdiği düşüncesidir. Oysa yapılan araştırmalar, toplumun her kesiminin bu konudan etkilendiğini göstermektedir.`,
    ];

    for (let i = 0; i < paragraphCount; i++) {
      paragraphs += paragraphTemplates[i % paragraphTemplates.length] + "\n\n";
    }

    baseText += paragraphs;

    // Conclusion
    baseText += `## Sonuç\n\n${topic} hakkında paylaştığım bu bilgilerin size faydalı olmasını umuyorum. Sorularınız veya yorumlarınız varsa, lütfen paylaşmaktan çekinmeyin.`;

    return baseText;
  };

  // Share generated text
  const shareGeneratedText = async () => {
    try {
      await Share.share({
        message: generatedText,
      });
    } catch (error) {
      Alert.alert("Hata", "Paylaşım sırasında bir hata oluştu.");
    }
  };

  // Copy text to clipboard
  const copyToClipboard = () => {
    // Clipboard.setString(generatedText);
    Alert.alert("Başarılı", "Metin panoya kopyalandı.");
  };

  // Get placeholder text based on content type
  const getPlaceholderText = () => {
    switch (contentType) {
      case "blog":
        return "Blog konunuzu girin...";
      case "social":
        return "Sosyal medya içeriğinizin konusunu girin...";
      case "email":
        return "E-posta konusunu girin...";
      default:
        return "Yazınızın konusu ne olacak?";
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
    },
    // Content type selection
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginTop: 20,
      marginBottom: 16,
      fontWeight: "bold",
    },
    contentTypeContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    contentTypeItem: {
      width: "31%",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.8)",
      borderRadius: 16,
      padding: 12,
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "transparent",
    },
    contentTypeItemSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? `${colors.primary}20` : `${colors.primary}10`,
    },
    contentTypeIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.15)"
        : colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    contentTypeIconSelected: {
      backgroundColor: colors.primary,
    },
    contentTypeText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      textAlign: "center",
    },
    // Input section
    inputSection: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.8)",
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
    },
    inputLabel: {
      ...FONTS.h4,
      color: colors.textOnGradient,
      marginBottom: 12,
    },
    inputField: {
      backgroundColor: isDark
        ? "rgba(0, 0, 0, 0.2)"
        : "rgba(255, 255, 255, 0.9)",
      borderRadius: 12,
      padding: 16,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      minHeight: 100,
      textAlignVertical: "top",
      ...FONTS.body3,
    },
    characterCount: {
      ...FONTS.body5,
      color: colors.textSecondary,
      textAlign: "right",
      marginTop: 8,
    },
    // Options section
    optionsSection: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.8)",
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
    },
    optionTitle: {
      ...FONTS.h4,
      color: colors.textOnGradient,
      marginBottom: 16,
    },
    optionRow: {
      flexDirection: "row",
      marginBottom: 8,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark
        ? "rgba(0, 0, 0, 0.2)"
        : "rgba(255, 255, 255, 0.9)",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginRight: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "transparent",
    },
    optionItemSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? `${colors.primary}20` : `${colors.primary}10`,
    },
    optionIcon: {
      marginRight: 8,
    },
    optionText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
    },
    optionTextSelected: {
      ...FONTS.body4,
      color: colors.primary,
      fontWeight: "bold",
    },
    // Generate button
    generateButton: {
      marginBottom: 24,
      overflow: "hidden",
      borderRadius: 16,
      elevation: 5,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    generateButtonInner: {
      flexDirection: "row",
      height: 56,
      alignItems: "center",
      justifyContent: "center",
    },
    generateButtonText: {
      ...FONTS.h3,
      color: "#FFFFFF",
      fontWeight: "bold",
      marginLeft: 12,
    },
    // Loading indicator
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 30,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.8)",
      borderRadius: 16,
      marginBottom: 24,
    },
    loadingText: {
      ...FONTS.body3,
      color: colors.textOnGradient,
      marginTop: 16,
      textAlign: "center",
    },
    // Results section
    resultContainer: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(255, 255, 255, 0.8)",
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 16,
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)",
    },
    resultTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      fontWeight: "bold",
    },
    actionButtonsContainer: {
      flexDirection: "row",
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.15)"
        : "rgba(255, 255, 255, 0.9)",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    },
    resultContent: {
      ...FONTS.body3,
      color: colors.textOnGradient,
      lineHeight: 24,
    },
    // Reset button
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.15)"
        : "rgba(255, 255, 255, 0.9)",
      borderRadius: 12,
      padding: 14,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    resetButtonText: {
      ...FONTS.body3,
      color: colors.primary,
      fontWeight: "bold",
      marginLeft: 8,
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title="Yazı Üretici" showBackButton />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : null}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
          >
            {/* Content Type Selection */}
            <Text style={styles.sectionTitle}>İçerik Türü</Text>
            <View style={styles.contentTypeContainer}>
              {contentTypes.slice(0, 6).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.contentTypeItem,
                    contentType === item.id && styles.contentTypeItemSelected,
                  ]}
                  onPress={() => setContentType(item.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.contentTypeIcon,
                      contentType === item.id && styles.contentTypeIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={
                        contentType === item.id ? "#FFFFFF" : colors.primary
                      }
                    />
                  </View>
                  <Text style={styles.contentTypeText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Topic Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Konu veya Anahtar Kelimeler</Text>
              <TextInput
                style={styles.inputField}
                placeholder={getPlaceholderText()}
                placeholderTextColor={
                  isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)"
                }
                value={topic}
                onChangeText={setTopic}
                multiline
                maxLength={200}
              />
              <Text style={styles.characterCount}>{topic.length}/200</Text>
            </View>

            {/* Tone Selection */}
            <View style={styles.optionsSection}>
              <Text style={styles.optionTitle}>Yazı Tonu</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {toneOptions.slice(0, 4).map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionItem,
                      tone === option.id && styles.optionItemSelected,
                    ]}
                    onPress={() => setTone(option.id)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={
                        tone === option.id
                          ? colors.primary
                          : colors.textOnGradient
                      }
                      style={styles.optionIcon}
                    />
                    <Text
                      style={
                        tone === option.id
                          ? styles.optionTextSelected
                          : styles.optionText
                      }
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Length Selection */}
            <View style={styles.optionsSection}>
              <Text style={styles.optionTitle}>Yazı Uzunluğu</Text>
              {lengthOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionItem,
                    length === option.id && styles.optionItemSelected,
                    { width: "100%", marginRight: 0 },
                  ]}
                  onPress={() => setLength(option.id)}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={
                      length === option.id
                        ? colors.primary
                        : colors.textOnGradient
                    }
                    style={styles.optionIcon}
                  />
                  <View>
                    <Text
                      style={
                        length === option.id
                          ? styles.optionTextSelected
                          : styles.optionText
                      }
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={{ ...FONTS.body5, color: colors.textSecondary }}
                    >
                      {option.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateText}
              disabled={loading || !topic.trim()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.generateButtonInner,
                  { opacity: !topic.trim() || loading ? 0.7 : 1 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="create-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>Yazı Oluştur</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Loading Indicator */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>
                  Yazınız yapay zeka tarafından oluşturuluyor...
                </Text>
              </View>
            )}

            {/* Results */}
            {showResult && (
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Oluşturulan İçerik</Text>
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={copyToClipboard}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={shareGeneratedText}
                    >
                      <Ionicons
                        name="share-outline"
                        size={18}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.resultContent}>{generatedText}</Text>

                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setShowResult(false);
                    setGeneratedText("");
                    scrollViewRef.current?.scrollTo({
                      x: 0,
                      y: 0,
                      animated: true,
                    });
                  }}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.resetButtonText}>
                    Yeni İçerik Oluştur
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Spacing */}
            <View style={{ height: 30 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default TextGeneratorScreen;
