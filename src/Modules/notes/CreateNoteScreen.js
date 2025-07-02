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
            <TouchableOpacity
              onPress={handleSave}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.success,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 4,
                shadowColor: colors.success,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.18,
                shadowRadius: 3,
                borderWidth: 1.5,
                borderColor: colors.success,
                opacity: !title.trim() ? 0.5 : 1,
              }}
              activeOpacity={0.8}
              disabled={!title.trim()}
            >
              <Ionicons name="checkmark-outline" size={22} color="#fff" />
            </TouchableOpacity>
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
                {
                  borderLeftColor: selectedColor,
                  borderLeftWidth: 4,
                  backgroundColor: colors.card,
                  shadowColor: colors.black,
                },
              ]}
            >
              {/* Not başlık alanı */}
              <TextInput
                ref={titleInputRef}
                style={[styles.titleInput, { color: colors.textPrimary }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Not başlığı..."
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
                returnKeyType="next"
                onSubmitEditing={() => contentInputRef.current?.focus()}
              />

              {/* Not ayarları (Renk, Kategori) */}
              <View style={styles.noteSettings}>
                {/* Renk seçimi */}
                <View style={styles.settingItem}>
                  <Text
                    style={[styles.settingLabel, { color: colors.textPrimary }]}
                  >
                    Renk:
                  </Text>
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
                    <View
                      style={[
                        styles.colorPickerContainer,
                        {
                          backgroundColor: colors.card,
                          shadowColor: colors.black,
                        },
                      ]}
                    >
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
                  <Text
                    style={[styles.settingLabel, { color: colors.textPrimary }]}
                  >
                    Kategori:
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      { backgroundColor: colors.lightGray },
                    ]}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                  >
                    {renderCategoryIcon(selectedCategory)}
                    <Text
                      style={[
                        styles.categoryButtonText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {categories.find((c) => c.id === selectedCategory)
                        ?.name || "Diğer"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Kategori seçim menüsü */}
              {showCategoryPicker && (
                <View
                  style={[
                    styles.categoryPickerContainer,
                    { backgroundColor: colors.card, shadowColor: colors.black },
                  ]}
                >
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        selectedCategory === category.id && {
                          backgroundColor: colors.primaryLight,
                        },
                      ]}
                      onPress={() => handleCategorySelect(category.id)}
                    >
                      <Ionicons
                        name={category.icon}
                        size={20}
                        color={
                          selectedCategory === category.id
                            ? colors.primary
                            : colors.textPrimary
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
                style={[styles.contentInput, { color: colors.textPrimary }]}
                value={content}
                onChangeText={setContent}
                placeholder="Not içeriği..."
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
              />

              {/* AI ile içerik oluşturma */}
              {showAIInput && (
                <View
                  style={{
                    marginTop: 18,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    overflow: 'hidden',
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 2,
                    padding: 0,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Ionicons name="sparkles" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={{ ...FONTS.body5, color: colors.primary, fontWeight: '600', fontSize: 14 }}>AI ile Not Oluştur</Text>
                  </View>
                  <View style={{ padding: 12 }}>
                    <TextInput
                      ref={aiInputRef}
                      style={{
                        ...FONTS.body5,
                        color: colors.textPrimary,
                        padding: 8,
                        minHeight: 60,
                        textAlignVertical: 'top',
                        backgroundColor: colors.input,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.border,
                        fontSize: 13,
                      }}
                      value={aiPrompt}
                      onChangeText={setAiPrompt}
                      placeholder="AI'dan ne oluşturmasını istersiniz? (örn: 'Haftalık toplantı notları', 'Proje planı', 'Alışveriş listesi')"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      maxLength={200}
                      autoFocus
                    />
                    <Text style={{ ...FONTS.body5, color: colors.textTertiary, textAlign: 'right', marginTop: 4, fontSize: 11 }}>{aiPrompt.length}/200</Text>
                    {/* Hızlı öneriler */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                      {[
                        { icon: 'calendar-outline', text: 'Toplantı Notları', prompt: 'Haftalık toplantı notları için ana başlıklar ve önemli noktalar' },
                        { icon: 'list-outline', text: 'Yapılacaklar', prompt: 'Haftalık yapılacaklar listesi için kategorilere göre görevler' },
                        { icon: 'rocket-outline', text: 'Proje Planı', prompt: 'Proje planı için aşamalar, görevler ve zaman çizelgesi' },
                        { icon: 'cart-outline', text: 'Alışveriş Listesi', prompt: 'Alışveriş listesi için kategorilere göre ürünler' },
                      ].map((item) => (
                        <TouchableOpacity
                          key={item.text}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 14,
                            marginRight: 8,
                            borderWidth: 1,
                            backgroundColor: colors.input,
                            borderColor: colors.border,
                            shadowColor: colors.black,
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.06,
                            shadowRadius: 1,
                            elevation: 1,
                          }}
                          onPress={() => setAiPrompt(item.prompt)}
                        >
                          <Ionicons name={item.icon} size={13} color={colors.primary} style={{ marginRight: 5 }} />
                          <Text style={{ ...FONTS.body5, color: colors.textPrimary, fontSize: 12 }}>{item.text}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    {/* Butonlar */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                      <Button
                        title="İptal"
                        size="small"
                        outlined
                        onPress={() => setShowAIInput(false)}
                        containerStyle={{ minWidth: 60, marginRight: 8, borderRadius: 12, paddingVertical: 6 }}
                        textStyle={{ fontSize: 13, fontWeight: '500' }}
                      />
                      <Button
                        title={isAILoading ? 'Oluşturuluyor...' : 'AI ile Oluştur'}
                        size="small"
                        onPress={generateWithAI}
                        containerStyle={{ minWidth: 110, borderRadius: 12, paddingVertical: 6 }}
                        textStyle={{ fontSize: 13, fontWeight: '600', color: colors.textOnPrimary }}
                        gradient
                        disabled={!aiPrompt.trim() || isAILoading}
                        loading={isAILoading}
                      />
                    </View>
                  </View>
                </View>
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
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  titleInput: {
    ...FONTS.h3,
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
    borderRadius: SIZES.radius,
    padding: 10,
    elevation: 5,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryButtonText: {
    ...FONTS.body4,
    marginHorizontal: 8,
  },
  categoryPickerContainer: {
    borderRadius: SIZES.radius,
    padding: 10,
    marginBottom: 15,
    elevation: 2,
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
  categoryItemText: {
    ...FONTS.body4,
    marginLeft: 10,
  },
  categoryItemTextSelected: {
    fontWeight: "bold",
  },
  contentInput: {
    ...FONTS.body3,
    lineHeight: 22,
    padding: 0,
    minHeight: 120,
  },
  saveButton: {
    marginRight: 0,
  },
  aiInputContainer: {
    marginTop: 20,
    borderRadius: SIZES.radius,
    padding: 0,
    borderWidth: 1,
    overflow: "hidden",
  },

  aiHeaderText: {
    ...FONTS.h4,
    marginLeft: 8,
  },
  aiPromptContainer: {
    padding: 16,
    marginBottom: 16,
  },
  aiPromptInput: {
    ...FONTS.body3,
    padding: 0,
    minHeight: 80,
    textAlignVertical: "top",
  },
  aiPromptCounter: {
    ...FONTS.body5,
    textAlign: "right",
    marginTop: 8,
  },
  aiButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  aiCancelButton: {
    flex: 1,
    marginRight: 10,
  },
  aiGenerateButton: {
    flex: 2,
  },
  aiSuggestionsTitle: {
    ...FONTS.body4,
    marginBottom: 12,
  },
  aiSuggestion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  aiSuggestionIcon: {
    marginRight: 8,
  },
  aiSuggestionText: {
    ...FONTS.body4,
  },
  aiButton: {
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  aiButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  aiButtonText: {
    ...FONTS.h4,
    marginLeft: 8,
  },
});

export default CreateNoteScreen;
