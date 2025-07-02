import React, { useState, useEffect, useRef } from "react";
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
  Share,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";

const NoteDetailScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(
    route.params?.note || {
      id: Date.now().toString(),
      title: "",
      content: "",
      category: "personal",
      color: colors.primary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    }
  );
  const [title, setTitle] = useState(route.params?.note?.title || "");
  const [content, setContent] = useState(route.params?.note?.content || "");
  const [selectedColor, setSelectedColor] = useState(
    route.params?.note?.color || colors.primary
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [originalContent, setOriginalContent] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);

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
    // Eğer not boşsa, düzenleme modunda başla
    if (!route.params?.note) {
      setIsEditing(true);
      // Odaklanma için kısa bir gecikme
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 300);
    }
  }, [route.params]);

  // Not içeriği değiştiğinde yapılacaklar
  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({
        headerRight: () => (
          <Button
            title="Kaydet"
            size="small"
            onPress={handleSave}
            containerStyle={{
              minWidth: 80,
              paddingHorizontal: 14,
              alignSelf: 'center',
              flexShrink: 1,
              marginRight: 8,
            }}
            textStyle={{
              fontWeight: '600',
              fontSize: 16,
              flexShrink: 1,
              textAlign: 'center',
              letterSpacing: 0.1,
            }}
          />
        ),
      });
    }
  }, [isEditing, title, content, selectedColor]);

  // Notu kaydet
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Hata", "Not başlığı gerekli");
      return;
    }

    // Kaydedilen notu güncelle
    const updatedNote = {
      ...note,
      title,
      content,
      color: selectedColor,
      updatedAt: new Date().toISOString(),
    };

    // Gerçek uygulamada bu veri API'ye gönderilir
    setNote(updatedNote);
    setIsEditing(false);

    // Not anasayfasına dön ve güncelleme için parametre gönder
    navigation.navigate("NotesHome", { updatedNote });
  };

  // Düzenleme modunu aç
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Notu sil
  const handleDelete = () => {
    Alert.alert("Notu Sil", "Bu notu silmek istediğinizden emin misiniz?", [
      {
        text: "İptal",
        style: "cancel",
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => {
          // Gerçek uygulamada API çağrısı yapılır
          navigation.navigate("NotesHome", { deletedNoteId: note.id });
        },
      },
    ]);
  };

  // Notu paylaş
  const handleShare = async () => {
    try {
      await Share.share({
        title: title,
        message: `${title}\n\n${content}`,
      });
    } catch (error) {
      Alert.alert("Hata", "Paylaşım sırasında bir sorun oluştu");
    }
  };

  // Not sabitle/sabitlemeyi kaldır
  const handleTogglePin = () => {
    const updatedNote = {
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    };
    setNote(updatedNote);

    // Gerçek uygulamada API çağrısı yapılır
    // Ayrıca bu değişikliği NotesHome'a bildir
    navigation.setParams({ note: updatedNote });
  };

  // AI ile not geliştirme
  const enhanceWithAI = async (type) => {
    if (tokens < 1) {
      Alert.alert(
        "Yetersiz Token",
        "Bu işlem için token gerekiyor. Daha fazla token kazanın.",
        [
          { text: "İptal", style: "cancel" },
          { text: "Token Kazan", onPress: () => navigation.navigate("Tokens") },
        ]
      );
      return;
    }
    setOriginalContent(content); // Orijinali sakla
    setIsAILoading(true);
    setShowAIOptions(false);
    setShowFeedback(false);
    setAiFeedback(null);
    try {
      await useTokens(1);
      setTimeout(() => {
        let enhancedContent = content;
        switch (type) {
          case "rewrite":
            enhancedContent = `${content}\n\n[AI tarafından yeniden yazıldı:]\n\nBu içerik daha profesyonel bir şekilde yeniden düzenlenmiştir. Cümleler daha akıcı ve anlaşılır hale getirilmiştir. Anahtar noktalar daha belirgin vurgulanmıştır.`;
            break;
          case "summarize":
            enhancedContent = `${content}\n\n[AI özeti:]\n\nBu notun özeti: anahtar noktalar ve önemli detaylar korunarak daha kısa ve öz bir formatta sunulmuştur.`;
            break;
          case "expand":
            enhancedContent = `${content}\n\n[AI tarafından genişletildi:]\n\nBu içerik daha detaylı hale getirilmiştir. Ek açıklamalar, örnekler ve bağlamsal bilgiler eklenmiştir. Konu daha kapsamlı bir şekilde ele alınmıştır.`;
            break;
          case "grammar":
            enhancedContent = `${content}\n\n[AI tarafından düzeltildi:]\n\nDilbilgisi ve yazım hataları düzeltilmiştir. Cümle yapıları optimize edilmiştir. Metin daha akıcı ve doğru hale getirilmiştir.`;
            break;
        }
        setContent(enhancedContent);
        setIsAILoading(false);
        setShowFeedback(true);
      }, 1500);
    } catch (error) {
      setIsAILoading(false);
      Alert.alert("Hata", "İçerik geliştirme sırasında bir sorun oluştu");
    }
  };

  // Orijinale dön
  const handleRestoreOriginal = () => {
    setContent(originalContent);
    setShowFeedback(false);
    setAiFeedback(null);
  };

  // Geri düğmesine basıldığında
  const handleBack = () => {
    if (isEditing && (title !== note.title || content !== note.content)) {
      Alert.alert(
        "Değişiklikleri Kaydet",
        "Yaptığınız değişiklikleri kaydetmek istiyor musunuz?",
        [
          {
            text: "Kaydetme",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
          { text: "İptal", style: "cancel" },
          { text: "Kaydet", onPress: handleSave },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const formattedDate = () => {
    const date = new Date(note.updatedAt);
    return `${date.getDate()}.${
      date.getMonth() + 1
    }.${date.getFullYear()} ${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title={isEditing ? "Notu Düzenle" : "Not Detayı"}
          showBackButton={true}
          onBackPress={handleBack}
          rightComponent={
            isEditing ? (
              <View style={{ alignItems: 'center' }}>
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
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.input, marginRight: 4 }]} onPress={handleEdit}>
                  <Ionicons name="pencil-outline" size={22} color={colors.textOnGradient} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.input }]} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={22} color={colors.textOnGradient} />
                </TouchableOpacity>
              </View>
            )
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
                  shadowColor: colors.primary + '22',
                },
              ]}
            >
              {isEditing ? (
                <>
                  <TextInput
                    ref={titleInputRef}
                    style={styles.titleInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Not başlığı..."
                    placeholderTextColor={colors.textTertiary}
                    maxLength={100}
                  />

                  <View style={styles.colorPickerContainer}>
                    <TouchableOpacity
                      style={[
                        styles.selectedColor,
                        {
                          backgroundColor: selectedColor,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setShowColorPicker(!showColorPicker)}
                    />

                    {showColorPicker && (
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
                            onPress={() => {
                              setSelectedColor(color);
                              setShowColorPicker(false);
                            }}
                          />
                        ))}
                      </View>
                    )}
                  </View>

                  <TextInput
                    ref={contentInputRef}
                    style={styles.contentInput}
                    value={content}
                    onChangeText={setContent}
                    placeholder="Not içeriği..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    textAlignVertical="top"
                  />

                  {/* AI Destekli İçerik Geliştirme */}
                  <View style={styles.aiContainer}>
                    {/* AI paneli açılır */}
                    {!isAILoading && !showFeedback && (
                      <TouchableOpacity
                        style={[
                          styles.aiButton,
                          { borderColor: colors.border, backgroundColor: colors.primary + '11' },
                        ]}
                        onPress={() => setShowAIOptions(!showAIOptions)}
                      >
                        <Ionicons
                          name="sparkles-outline"
                          size={20}
                          color={colors.primary}
                        />
                        <Text
                          style={[
                            styles.aiButtonText,
                            { color: colors.primary },
                          ]}
                        >
                          AI ile Geliştir
                        </Text>
                      </TouchableOpacity>
                    )}
                    {/* AI seçenek paneli */}
                    {showAIOptions && !isAILoading && !showFeedback && (
                      <View
                        style={[
                          styles.aiOptions,
                          { backgroundColor: colors.card, shadowColor: colors.primary + '22', borderColor: colors.border },
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.aiOption,
                            { borderBottomColor: colors.border },
                          ]}
                          onPress={() => enhanceWithAI("rewrite")}
                        >
                          <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.aiOptionText, { color: colors.textPrimary }]}>Yeniden Yaz</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Notunu daha akıcı ve profesyonel bir dille yeniden yaz.</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.aiOption,
                            { borderBottomColor: colors.border },
                          ]}
                          onPress={() => enhanceWithAI("summarize")}
                        >
                          <Ionicons name="list-outline" size={20} color={colors.primary} />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.aiOptionText, { color: colors.textPrimary }]}>Özetle</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Uzun notları kısa ve öz bir özet haline getir.</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.aiOption,
                            { borderBottomColor: colors.border },
                          ]}
                          onPress={() => enhanceWithAI("expand")}
                        >
                          <Ionicons name="book-outline" size={20} color={colors.primary} />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.aiOptionText, { color: colors.textPrimary }]}>Genişlet</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Kısa notları daha detaylı ve açıklamalı hale getir.</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.aiOption}
                          onPress={() => enhanceWithAI("grammar")}
                        >
                          <Ionicons name="checkmark-done-outline" size={20} color={colors.primary} />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.aiOptionText, { color: colors.textPrimary }]}>Düzelt</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Yazım ve dilbilgisi hatalarını düzelt.</Text>
                          </View>
                        </TouchableOpacity>
                        <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 10, textAlign: 'right' }}>
                          AI ile geliştirilen notlar bulut tabanlı olarak işlenir.
                        </Text>
                      </View>
                    )}
                    {/* AI loading */}
                    {isAILoading && (
                      <View style={[styles.aiLoadingContainer, { backgroundColor: colors.primary + '11' }]}>
                        <Text style={[styles.aiText, { color: colors.primary }]}>AI içeriği geliştiriyor...</Text>
                        <Button
                          title="İptal"
                          size="small"
                          outlined
                          onPress={() => setIsAILoading(false)}
                          containerStyle={styles.aiCancelButton}
                        />
                      </View>
                    )}
                    {/* AI feedback ve orijinale dön */}
                    {showFeedback && !isAILoading && (
                      <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                          onPress={handleRestoreOriginal}
                        >
                          <Ionicons name="arrow-undo-outline" size={18} color={colors.info} />
                          <Text style={{ color: colors.info, marginLeft: 4, fontSize: 13 }}>Orijinale Dön</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ color: colors.textSecondary, fontSize: 13, marginRight: 8 }}>Bu sonuç işine yaradı mı?</Text>
                          <TouchableOpacity onPress={() => { setAiFeedback(true); }} style={{ marginRight: 4 }}>
                            <Ionicons name="thumbs-up-outline" size={20} color={aiFeedback === true ? colors.success : colors.textTertiary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => { setAiFeedback(false); }}>
                            <Ionicons name="thumbs-down-outline" size={20} color={aiFeedback === false ? colors.warning : colors.textTertiary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.noteTitleContainer}>
                    {note.isPinned && (
                      <Ionicons
                        name="pin"
                        size={20}
                        color={selectedColor}
                        style={styles.pinIcon}
                      />
                    )}
                    <Text style={[styles.noteTitle, { color: colors.textPrimary }]}>{note.title}</Text>
                  </View>

                  <Text style={[styles.noteContent, { color: colors.textSecondary }]}>{note.content}</Text>

                  <View style={styles.noteFooter}>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: `${selectedColor}22` },
                      ]}
                    >
                      <Text
                        style={[styles.categoryText, { color: selectedColor }]}
                      >
                        {categories.find((c) => c.id === note.category)?.name ||
                          "Diğer"}
                      </Text>
                    </View>

                    <Text style={[styles.noteDate, { color: colors.textTertiary }]}>Son düzenleme: {formattedDate()}</Text>
                  </View>
                </>
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
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  noteTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  pinIcon: {
    marginRight: 8,
  },
  noteTitle: {
    ...FONTS.h3,
    flex: 1,
  },
  noteContent: {
    ...FONTS.body3,
    lineHeight: 22,
    marginBottom: 20,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryText: {
    ...FONTS.body5,
    fontWeight: "500",
  },
  noteDate: {
    ...FONTS.body5,
  },
  titleInput: {
    ...FONTS.h3,
    padding: 0,
    marginBottom: 10,
  },
  contentInput: {
    ...FONTS.body3,
    lineHeight: 22,
    padding: 0,
    minHeight: 200,
  },
  colorPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  selectedColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  colorOptions: {
    flexDirection: "row",
    marginLeft: 10,
  },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    marginRight: 0,
  },
  aiContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
  },
  aiButtonText: {
    ...FONTS.body4,
    marginLeft: 8,
    fontWeight: "500",
  },
  aiOptions: {
    marginTop: 10,
    borderRadius: SIZES.radius,
    padding: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  aiOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  aiOptionText: {
    ...FONTS.body4,
    marginLeft: 10,
  },
  aiLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
  },
  aiText: {
    ...FONTS.body4,
  },
  aiCancelButton: {
    marginLeft: 10,
  },
});

export default NoteDetailScreen;
