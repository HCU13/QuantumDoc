import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";

const CreateNoteScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors.primary);
  const [selectedCategory, setSelectedCategory] = useState("personal");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAIInput, setShowAIInput] = useState(false);

  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const aiInputRef = useRef(null);

  // Renk seçenekleri
  const colorOptions = [
    colors.primary,
    colors.secondary,
    colors.success,
    colors.warning,
    colors.info,
    "#FF6B6B", // Kırmızı
    "#7971EA", // Mor
    "#5ABD8C", // Yeşil
  ];

  // Kategori seçenekleri
  const categories = [
    { id: "personal", name: "Kişisel", icon: "person-outline" },
    { id: "work", name: "İş", icon: "briefcase-outline" },
    { id: "ideas", name: "Fikirler", icon: "bulb-outline" },
    { id: "reminders", name: "Hatırlatıcılar", icon: "alarm-outline" },
    { id: "other", name: "Diğer", icon: "ellipsis-horizontal-outline" },
  ];

  useEffect(() => {
    // Başlangıçta başlık alanına odaklan
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 300);
  }, []);

  // Notu kaydet
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Hata", "Not başlığı gerekli");
      return;
    }

    // Yeni not objesi
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      category: selectedCategory,
      color: selectedColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };

    // NotesHome ekranına dön ve yeni not bilgisini ilet
    navigation.navigate("NotesHome", { newNote });
  };

  // Kategori seçimi
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategoryPicker(false);
  };

  // Renk seçimi
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  // AI ile içerik oluşturma
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      Alert.alert("Hata", "AI'a bir istek yazmalısınız");
      return;
    }

    // Token kontrolü
    if (tokens < 2) {
      Alert.alert(
        "Yetersiz Token",
        "AI ile içerik oluşturmak için 2 token gerekiyor. Daha fazla token kazanın.",
        [
          { text: "İptal", style: "cancel" },
          { text: "Token Kazan", onPress: () => navigation.navigate("Tokens") },
        ]
      );
      return;
    }

    setIsAILoading(true);

    try {
      // Gerçek uygulamada API çağrısı yapılır
      // AI ile içerik oluşturmayı simüle edelim
      await useTokens(2); // 2 token kullan

      setTimeout(() => {
        // AI yanıtını simüle et
        const aiResponse = generateAIResponse(aiPrompt);

        // Eğer başlık boşsa, uygun bir başlık öner
        if (!title.trim()) {
          const suggestedTitle =
            aiPrompt.split(" ").slice(0, 3).join(" ") + "...";
          setTitle(suggestedTitle);
        }

        // İçeriği güncelle
        setContent(aiResponse);
        setIsAILoading(false);
        setShowAIInput(false);

        // İçerik alanına odaklan
        setTimeout(() => {
          contentInputRef.current?.focus();
        }, 300);
      }, 2000);
    } catch (error) {
      console.log("AI generate error:", error);
      setIsAILoading(false);
      Alert.alert("Hata", "İçerik oluşturma sırasında bir sorun oluştu");
    }
  };

  // AI yanıtını simüle eden fonksiyon
  const generateAIResponse = (prompt) => {
    // Basit bir AI yanıt simülasyonu
    const responses = [
      `# ${prompt}\n\nBu konuda düşüncelerim şunlar:\n\n1. Öncelikle, bu konu hakkında temel bilgiler edinmek önemli\n2. Farklı perspektiflerden bakarak bütünsel bir anlayış geliştirmek faydalı\n3. Pratik uygulamaları araştırmak ve denemek gerek\n\nDaha detaylı incelemem gereken noktalar:\n- Güncel kaynaklar ve araştırmalar neler?\n- Uzman görüşleri nasıl?\n- Hangi alternatif yaklaşımlar var?`,

      `# Not: ${prompt}\n\n${prompt} hakkında önemli noktalar:\n\n- Bu konu modern hayatımızda giderek daha fazla önem kazanıyor\n- Başarılı olmanın anahtarı sürekli öğrenme ve adaptasyon\n- Doğru kaynaklardan bilgi edinmek ve eleştirel düşünmek çok önemli\n\nYapılacaklar:\n1. Konuyla ilgili daha fazla araştırma yap\n2. Uygulamalı örnekleri incele\n3. Bir eylem planı oluştur\n4. İlerlemeyi düzenli olarak değerlendir`,

      `# ${prompt} Üzerine Düşünceler\n\nBu konuyu şu açılardan değerlendirmek gerekir:\n\n## Güçlü Yanlar\n- Yenilikçi yaklaşım\n- Geniş uygulama alanı\n- Maliyet etkin çözümler\n\n## Zorluklar\n- Teknik engeller\n- Kullanım karmaşıklığı\n- Adaptasyon süreci\n\n## Fırsatlar\n- Yeni işbirlikleri\n- Teknolojik gelişmeler\n- Pazar potansiyeli`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Kategori simgesini render et
  const renderCategoryIcon = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return (
      <Ionicons
        name={category?.icon || "help-circle-outline"}
        size={20}
        color={isDark ? colors.white : "#333"}
      />
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="Yeni Not"
          showBackButton={true}
          rightComponent={
            <Button
              title="Kaydet"
              size="small"
              onPress={handleSave}
              containerStyle={styles.saveButton}
              disabled={!title.trim()}
            />
          }
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex1}
          keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.noteContainer,
                { borderLeftColor: selectedColor, borderLeftWidth: 4 },
              ]}
            >
              {/* Not başlık alanı */}
              <TextInput
                ref={titleInputRef}
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Not başlığı..."
                placeholderTextColor="rgba(0,0,0,0.4)"
                maxLength={100}
                returnKeyType="next"
                onSubmitEditing={() => contentInputRef.current?.focus()}
              />

              {/* Not ayarları (Renk, Kategori) */}
              <View style={styles.noteSettings}>
                {/* Renk seçimi */}
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Renk:</Text>
                  <TouchableOpacity
                    style={[
                      styles.colorButton,
                      {
                        backgroundColor: selectedColor,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setShowColorPicker(!showColorPicker)}
                  />

                  {showColorPicker && (
                    <View style={styles.colorPickerContainer}>
                      <View style={styles.colorOptions}>
                        {colorOptions.map((color) => (
                          <TouchableOpacity
                            key={color}
                            style={[
                              styles.colorOption,
                              {
                                backgroundColor: color,
                                borderColor: colors.border,
                              },
                            ]}
                            onPress={() => handleColorSelect(color)}
                          />
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* Kategori seçimi */}
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Kategori:</Text>
                  <TouchableOpacity
                    style={styles.categoryButton}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                  >
                    {renderCategoryIcon(selectedCategory)}
                    <Text style={styles.categoryButtonText}>
                      {categories.find((c) => c.id === selectedCategory)
                        ?.name || "Diğer"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={isDark ? colors.white : "#333"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Kategori seçim menüsü */}
              {showCategoryPicker && (
                <View style={styles.categoryPickerContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        selectedCategory === category.id &&
                          styles.categoryItemSelected,
                      ]}
                      onPress={() => handleCategorySelect(category.id)}
                    >
                      <Ionicons
                        name={category.icon}
                        size={20}
                        color={
                          selectedCategory === category.id
                            ? colors.primary
                            : isDark
                            ? colors.white
                            : "#333"
                        }
                      />
                      <Text
                        style={[
                          styles.categoryItemText,
                          selectedCategory === category.id && [
                            styles.categoryItemTextSelected,
                            { color: colors.primary },
                          ],
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Not içerik alanı */}
              <TextInput
                ref={contentInputRef}
                style={styles.contentInput}
                value={content}
                onChangeText={setContent}
                placeholder="Not içeriği..."
                placeholderTextColor="rgba(0,0,0,0.4)"
                multiline
                textAlignVertical="top"
              />

              {/* AI ile içerik oluşturma */}
              {showAIInput ? (
                <View
                  style={[
                    styles.aiInputContainer,
                    { borderColor: colors.border },
                  ]}
                >
                  <View style={styles.aiPromptContainer}>
                    <TextInput
                      ref={aiInputRef}
                      style={styles.aiPromptInput}
                      value={aiPrompt}
                      onChangeText={setAiPrompt}
                      placeholder="AI'dan ne oluşturmasını istersiniz?"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      multiline
                      maxLength={200}
                      autoFocus
                    />
                    <Text style={styles.aiPromptCounter}>
                      {aiPrompt.length}/200
                    </Text>
                  </View>

                  <View style={styles.aiButtonsContainer}>
                    <Button
                      title="İptal"
                      size="small"
                      outlined
                      onPress={() => setShowAIInput(false)}
                      containerStyle={styles.aiCancelButton}
                    />
                    <Button
                      title="AI ile Oluştur"
                      size="small"
                      onPress={generateWithAI}
                      containerStyle={styles.aiGenerateButton}
                      disabled={!aiPrompt.trim() || isAILoading}
                      loading={isAILoading}
                    />
                  </View>

                  <View style={styles.aiSuggestions}>
                    <Text style={styles.aiSuggestionsTitle}>Öneriler:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <TouchableOpacity
                        style={[
                          styles.aiSuggestion,
                          { borderColor: colors.border },
                        ]}
                        onPress={() => setAiPrompt("Toplantı notları")}
                      >
                        <Text
                          style={[
                            styles.aiSuggestionText,
                            { color: colors.primary },
                          ]}
                        >
                          Toplantı notları
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.aiSuggestion,
                          { borderColor: colors.border },
                        ]}
                        onPress={() =>
                          setAiPrompt("Haftalık yapılacaklar listesi")
                        }
                      >
                        <Text
                          style={[
                            styles.aiSuggestionText,
                            { color: colors.primary },
                          ]}
                        >
                          Haftalık yapılacaklar
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.aiSuggestion,
                          { borderColor: colors.border },
                        ]}
                        onPress={() => setAiPrompt("Proje planı")}
                      >
                        <Text
                          style={[
                            styles.aiSuggestionText,
                            { color: colors.primary },
                          ]}
                        >
                          Proje planı
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.aiSuggestion,
                          { borderColor: colors.border },
                        ]}
                        onPress={() => setAiPrompt("Alışveriş listesi")}
                      >
                        <Text
                          style={[
                            styles.aiSuggestionText,
                            { color: colors.primary },
                          ]}
                        >
                          Alışveriş listesi
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.aiButton, { borderColor: colors.border }]}
                  onPress={() => setShowAIInput(true)}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.aiButtonText, { color: colors.primary }]}
                  >
                    AI ile Not Oluştur
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  noteContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  titleInput: {
    ...FONTS.h3,
    color: "#000",
    padding: 0,
    marginBottom: 15,
  },
  noteSettings: {
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  settingLabel: {
    ...FONTS.body4,
    color: "#333",
    width: 70,
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
  },
  colorPickerContainer: {
    position: "absolute",
    top: 30,
    left: 70,
    zIndex: 10,
    backgroundColor: "white",
    borderRadius: SIZES.radius,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  colorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 180,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
    borderWidth: 1,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryButtonText: {
    ...FONTS.body4,
    color: "#333",
    marginHorizontal: 8,
  },
  categoryPickerContainer: {
    backgroundColor: "white",
    borderRadius: SIZES.radius,
    padding: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: SIZES.radius,
  },
  categoryItemSelected: {
    backgroundColor: "rgba(138, 79, 255, 0.1)",
  },
  categoryItemText: {
    ...FONTS.body4,
    color: "#333",
    marginLeft: 10,
  },
  categoryItemTextSelected: {
    fontWeight: "bold",
  },
  contentInput: {
    ...FONTS.body3,
    color: "#333",
    lineHeight: 22,
    padding: 0,
    minHeight: 120,
  },
  saveButton: {
    marginRight: 0,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(138, 79, 255, 0.15)",
    padding: 12,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
  },
  aiButtonText: {
    ...FONTS.body4,

    marginLeft: 10,
    fontWeight: "500",
  },
  aiInputContainer: {
    marginTop: 20,
    backgroundColor: "rgba(138, 79, 255, 0.08)",
    borderRadius: SIZES.radius,
    padding: 15,
    borderWidth: 1,
  },
  aiPromptContainer: {
    backgroundColor: "white",
    borderRadius: SIZES.radius,
    padding: 10,
    marginBottom: 10,
  },
  aiPromptInput: {
    ...FONTS.body3,
    color: "#333",
    padding: 0,
    minHeight: 80,
    textAlignVertical: "top",
  },
  aiPromptCounter: {
    ...FONTS.body5,
    color: "#999",
    textAlign: "right",
    marginTop: 5,
  },
  aiButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  aiCancelButton: {
    flex: 1,
    marginRight: 10,
  },
  aiGenerateButton: {
    flex: 2,
  },
  aiSuggestions: {
    marginTop: 5,
  },
  aiSuggestionsTitle: {
    ...FONTS.body4,
    color: "#333",
    marginBottom: 8,
  },
  aiSuggestion: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
  },
  aiSuggestionText: {
    ...FONTS.body4,
  },
});

export default CreateNoteScreen;
