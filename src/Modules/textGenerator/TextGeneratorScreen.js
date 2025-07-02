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
  Clipboard,
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

const languages = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "İngilizce", flag: "🇬🇧" },
  { code: "de", name: "Almanca", flag: "🇩🇪" },
  { code: "fr", name: "Fransızca", flag: "🇫🇷" },
  { code: "es", name: "İspanyolca", flag: "🇪🇸" },
];

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

const lengthOptions = [
  { id: "short", label: "Kısa", icon: "text", description: "250-300 kelime" },
  { id: "medium", label: "Orta", icon: "list", description: "500-600 kelime" },
  { id: "long", label: "Uzun", icon: "document", description: "1000+ kelime" },
];

const TextGeneratorScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const [language, setLanguage] = useState("tr");
  const [contentType, setContentType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'up' | 'down'
  const [starRating, setStarRating] = useState(0);
  const scrollViewRef = useRef();

  // --- Mantıksal yardımcılar ---
  const getContentTypeLabel = () =>
    contentTypes.find((t) => t.id === contentType)?.label;
  const getToneLabel = () => toneOptions.find((t) => t.id === tone)?.label;
  const getLengthLabel = () =>
    lengthOptions.find((l) => l.id === length)?.label;
  const getLanguageLabel = () =>
    languages.find((l) => l.code === language)?.name;
  const getLanguageFlag = () =>
    languages.find((l) => l.code === language)?.flag;

  // --- Yazı üretme simülasyonu ---
  const generateText = async () => {
    if (!topic.trim()) {
      Alert.alert("Hata", "Lütfen bir konu girin.");
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setShowResult(false);
    setTimeout(() => {
      setGeneratedText(
        `# ${topic}\n\nBu, örnek bir metindir.\n\nSeçilen içerik tipi: ${getContentTypeLabel()}\nTon: ${getToneLabel()}\nUzunluk: ${getLengthLabel()}\nDil: ${getLanguageLabel()}`
      );
      setLoading(false);
      setShowResult(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }, 1500);
  };

  // --- Kopyala/Paylaş ---
  const copyToClipboard = () => {
    Clipboard.setString(generatedText);
    Alert.alert("Başarılı", "Metin panoya kopyalandı.");
  };
  const shareGeneratedText = async () => {
    try {
      await Share.share({ message: generatedText });
    } catch (error) {
      Alert.alert("Hata", "Paylaşım sırasında bir hata oluştu.");
    }
  };

  // --- Stiller ---
  const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 25 },
    content: { flex: 1, paddingHorizontal: SIZES.padding },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginTop: 20,
      marginBottom: 16,
      fontWeight: "bold",
    },
    horizontalList: { flexDirection: "row", marginBottom: 18 },
    item: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderWidth: 0.75,
      borderColor: colors.textSecondary,
      borderRadius: 8,
      marginRight: 10,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F8F8F8",
    },
    itemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "22",
    },
    flag: { fontSize: 20, marginRight: 8 },
    icon: { marginRight: 8 },
    itemLabel: { fontSize: 16, fontWeight: "500", color: colors.textPrimary },
    itemLabelSelected: { color: colors.primary },
    inputSection: {
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F8F8F8",
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      top: 10,
    },
    inputLabel: {
      ...FONTS.h4,
      color: colors.textOnGradient,
      marginBottom: 12,
      fontWeight: "500",
    },
    inputField: {
      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "#FFF",
      borderRadius: 12,
      padding: 16,
      color: colors.textPrimary,
      borderWidth: 0.75,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#EEE",
      minHeight: 100,
      textAlignVertical: "top",
      ...FONTS.body3,
      fontWeight: "400",
    },
    characterCount: {
      ...FONTS.body5,
      color: colors.textSecondary,
      textAlign: "right",
      marginTop: 8,
    },
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
      fontWeight: "500",
      marginLeft: 12,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 30,
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#FFF",
      borderRadius: 16,
      marginBottom: 24,
    },
    loadingText: {
      ...FONTS.body3,
      color: colors.textOnGradient,
      marginTop: 16,
      textAlign: "center",
    },
    resultContainer: {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#FFF",
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingBottom: 8,
      marginBottom: 8,
      borderBottomWidth: 0.75,
      borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "#EEE",
    },
    resultTitle: {
      ...FONTS.h4,
      color: colors.textOnGradient,
      fontWeight: "500",
      marginBottom: 2,
    },
    actionButtonsContainer: { flexDirection: "row" },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#F8F8F8",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 18,
      borderWidth: 0.75,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#EEE",
    },
    editableResultContent: {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#FFF",
      borderRadius: 16,
      padding: 16,
      color: colors.textPrimary,
      borderWidth: 0.75,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#EEE",
      minHeight: 100,
      textAlignVertical: "top",
      ...FONTS.body3,
      fontWeight: "400",
    },
    feedbackContainer: { alignItems: "center", marginTop: 18 },
    feedbackText: {
      ...FONTS.body3,
      color: colors.textPrimary,
      marginBottom: 10,
      fontWeight: "400",
    },
    feedbackRow: { flexDirection: "row", marginBottom: 8 },
    feedbackStar: { marginHorizontal: 2 },
    feedbackThanks: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginBottom: 8,
      fontWeight: "400",
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
            {/* Dil seçici */}
            <Text style={styles.sectionTitle}>Dil</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalList}
            >
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.item,
                    language === lang.code && styles.itemSelected,
                  ]}
                  onPress={() => setLanguage(lang.code)}
                >
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.itemLabel,
                      language === lang.code && styles.itemLabelSelected,
                    ]}
                  >
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* İçerik tipi seçici */}
            <Text style={styles.sectionTitle}>İçerik Tipi</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalList}
            >
              {contentTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.item,
                    contentType === type.id && styles.itemSelected,
                  ]}
                  onPress={() => setContentType(type.id)}
                >
                  <Ionicons
                    name={type.icon}
                    size={20}
                    color={
                      contentType === type.id
                        ? colors.primary
                        : colors.textSecondary
                    }
                    style={styles.icon}
                  />
                  <Text
                    style={[
                      styles.itemLabel,
                      contentType === type.id && styles.itemLabelSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Konu/Anahtar kelime girişi - tam içerik tipi ile yazı tonu arasında ortalanmış şekilde */}
            <View
              style={[styles.inputSection, { marginTop: 0, marginBottom: 18 }]}
            >
              <Text style={styles.inputLabel}>Konu veya Anahtar Kelimeler</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Konu veya anahtar kelimeler..."
                placeholderTextColor={
                  isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"
                }
                value={topic}
                onChangeText={setTopic}
                multiline
                maxLength={200}
              />
              <Text style={styles.characterCount}>{topic.length}/200</Text>
            </View>
            {/* Ton seçici */}
            <Text style={styles.sectionTitle}>Yazı Tonu</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalList}
            >
              {toneOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.item,
                    tone === option.id && styles.itemSelected,
                  ]}
                  onPress={() => setTone(option.id)}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={
                      tone === option.id ? colors.primary : colors.textSecondary
                    }
                    style={styles.icon}
                  />
                  <Text
                    style={[
                      styles.itemLabel,
                      tone === option.id && styles.itemLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Uzunluk seçici */}
            <Text style={styles.sectionTitle}>Yazı Uzunluğu</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalList}
            >
              {lengthOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.item,
                    length === option.id && styles.itemSelected,
                  ]}
                  onPress={() => setLength(option.id)}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={
                      length === option.id
                        ? colors.primary
                        : colors.textSecondary
                    }
                    style={styles.icon}
                  />
                  <View>
                    <Text
                      style={[
                        styles.itemLabel,
                        length === option.id && styles.itemLabelSelected,
                      ]}
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
            </ScrollView>
            {/* Oluştur butonu */}
            <Button
              title="Yazı Oluştur"
              gradient
              icon={<Ionicons name="create-outline" size={24} color="#FFFFFF" />}
              onPress={generateText}
              loading={loading}
              disabled={loading || !topic.trim()}
              fluid
              containerStyle={{ marginBottom: 24 }}
              textStyle={{ marginLeft: 12 }}
            />
            {/* Loading */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Yazınız oluşturuluyor...</Text>
              </View>
            )}
            {/* Sonuç Kartı */}
            {showResult && (
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <View>
                    <Text style={styles.resultTitle}>
                      {getContentTypeLabel()} ({getLanguageLabel()})
                    </Text>
                    <Text
                      style={{ color: colors.textSecondary, ...FONTS.body5, marginTop: 0 }}
                    >
                      Ton: {getToneLabel()} | Uzunluk: {getLengthLabel()}
                    </Text>
                  </View>
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={copyToClipboard}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={shareGeneratedText}
                    >
                      <Ionicons
                        name="share-social-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setShowResult(false)}
                    >
                      <Ionicons
                        name="refresh-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <TextInput
                  style={styles.editableResultContent}
                  multiline
                  value={generatedText}
                  onChangeText={setGeneratedText}
                  editable
                  textAlignVertical="top"
                  placeholder="Üretilen metin burada görünecek..."
                />
                {/* Feedback alanı */}
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackText}>
                    Bu metin işine yaradı mı?
                  </Text>
                  <View style={styles.feedbackRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setFeedback("up");
                        setFeedbackGiven(true);
                      }}
                      disabled={feedbackGiven}
                      style={{
                        marginHorizontal: 16,
                        opacity: feedbackGiven && feedback !== "up" ? 0.5 : 1,
                      }}
                    >
                      <Ionicons
                        name="thumbs-up"
                        size={32}
                        color={
                          feedback === "up"
                            ? colors.primary
                            : colors.textSecondary
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setFeedback("down");
                        setFeedbackGiven(true);
                      }}
                      disabled={feedbackGiven}
                      style={{
                        marginHorizontal: 16,
                        opacity: feedbackGiven && feedback !== "down" ? 0.5 : 1,
                      }}
                    >
                      <Ionicons
                        name="thumbs-down"
                        size={32}
                        color={
                          feedback === "down"
                            ? colors.primary
                            : colors.textSecondary
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.feedbackRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setStarRating(star)}
                        disabled={feedbackGiven}
                      >
                        <Ionicons
                          name={starRating >= star ? "star" : "star-outline"}
                          size={28}
                          color={
                            starRating >= star
                              ? colors.primary
                              : colors.textSecondary
                          }
                          style={styles.feedbackStar}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  {feedbackGiven && (
                    <Text style={styles.feedbackThanks}>
                      Geri bildiriminiz için teşekkürler!
                    </Text>
                  )}
                </View>
              </View>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default TextGeneratorScreen;
