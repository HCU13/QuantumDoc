import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";

const NotesScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { tokens } = useToken();
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Simüle edilmiş kategoriler
  const categories = [
    { id: "all", name: "Tümü" },
    { id: "personal", name: "Kişisel" },
    { id: "work", name: "İş" },
    { id: "ideas", name: "Fikirler" },
    { id: "reminders", name: "Hatırlatıcılar" },
  ];

  // Simüle edilmiş not verileri
  const dummyNotes = [
    {
      id: "1",
      title: "Alışveriş Listesi",
      content: "Ekmek, süt, yumurta, meyve, sebze almayı unutma.",
      category: "personal",
      color: "#9B4DFF", // Mor renk
      createdAt: "2025-04-15T10:30:00",
      updatedAt: "2025-04-15T10:30:00",
      isPinned: true,
    },
    {
      id: "2",
      title: "Toplantı Notları",
      content:
        "Pazartesi günü yapılacak toplantı için hazırlık yapılacak. Ana gündem maddeleri: Proje durumu, hedefler, kaynaklar.",
      category: "work",
      color: "#FF9D55", // Turuncu
      createdAt: "2025-04-13T15:45:00",
      updatedAt: "2025-04-14T09:15:00",
      isPinned: false,
    },
    {
      id: "3",
      title: "Uygulama Fikri",
      content:
        "Yapay zeka destekli bir üretkenlik uygulaması. Kullanıcıların günlük görevleri ve hedefleri daha etkili bir şekilde yönetmelerine yardımcı olacak.",
      category: "ideas",
      color: "#52DE97", // Yeşil
      createdAt: "2025-04-10T20:20:00",
      updatedAt: "2025-04-12T14:30:00",
      isPinned: true,
    },
    {
      id: "4",
      title: "Yapılacaklar",
      content:
        "Elektrik faturasını öde, randevularını kontrol et, projeyi bitir, ailenle görüntülü konuşma yap",
      category: "reminders",
      color: "#4A6FA5", // Mavi
      createdAt: "2025-04-08T11:10:00",
      updatedAt: "2025-04-08T11:10:00",
      isPinned: false,
    },
    {
      id: "5",
      title: "Kitap Önerileri",
      content:
        "Okumak için: Sapiens, Algoritmalar, Veri Bilimi El Kitabı, Derin Öğrenme",
      category: "personal",
      color: "#4ECDC4", // Turkuaz
      createdAt: "2025-04-05T09:45:00",
      updatedAt: "2025-04-07T16:20:00",
      isPinned: false,
    },
  ];

  useEffect(() => {
    // Gerçek bir uygulamada bu veriler API'den veya yerel depolama alanından gelir
    setNotes(dummyNotes);
  }, []);

  useEffect(() => {
    // Notları filtrele
    let result = [...notes];

    // Kategoriye göre filtrele
    if (selectedCategory !== "all") {
      result = result.filter((note) => note.category === selectedCategory);
    }

    // Arama sorgusuna göre filtrele
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    // Öncelikle sabitlenmiş notları göster
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Sabitlenmemişler için tarihe göre sırala (yeniden eskiye)
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    setFilteredNotes(result);
  }, [notes, searchQuery, selectedCategory]);

  // Not detayını göster
  const handleNotePress = (note) => {
    navigation.navigate("NoteDetail", { note });
  };

  // Yeni not oluştur
  const handleCreateNote = () => {
    navigation.navigate("CreateNote");
  };

  // Notu sil
  const handleDeleteNote = (noteId) => {
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
          const updatedNotes = notes.filter((note) => note.id !== noteId);
          setNotes(updatedNotes);
        },
      },
    ]);
  };

  // Notu sabitle/sabitlemeyi kaldır
  const handleTogglePin = (noteId) => {
    const updatedNotes = notes.map((note) =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    );
    setNotes(updatedNotes);
  };

  // Not kartını render et
  const renderNoteItem = ({ item }) => {
    const date = new Date(item.updatedAt);
    const formattedDate = `${date.getDate()}.${
      date.getMonth() + 1
    }.${date.getFullYear()}`;

    return (
      <TouchableOpacity
        style={[styles.noteCard, { borderLeftColor: item.color }]}
        onPress={() => handleNotePress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.noteCardHeader}>
          <View style={styles.titleContainer}>
            {item.isPinned && (
              <Ionicons
                name="pin"
                size={16}
                color="#fff"
                style={styles.pinIcon}
              />
            )}
            <Text
              style={styles.noteTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleTogglePin(item.id)}
            >
              <Ionicons
                name={item.isPinned ? "pin" : "pin-outline"}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteNote(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.noteContent} numberOfLines={2} ellipsizeMode="tail">
          {item.content}
        </Text>

        <View style={styles.noteCardFooter}>
          <Text style={styles.categoryText}>
            {categories.find((cat) => cat.id === item.category)?.name ||
              "Diğer"}
          </Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Kategori butonu render et
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        { borderColor: colors.border },
        selectedCategory === item.id && [
          styles.categoryButtonActive,
          { borderColor: colors.border },
        ],
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item.id && styles.categoryButtonTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="Notlarım"
          showBackButton={true}
          rightComponent={
            <TouchableOpacity
              onPress={() => navigation.navigate("NoteCategories")}
              style={styles.headerButton}
            >
              <Ionicons name="options-outline" size={24} color="#fff" />
            </TouchableOpacity>
          }
        />

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#fff"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Notlarda ara..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={categories}
          horizontal
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />

        {filteredNotes.length > 0 ? (
          <FlatList
            data={filteredNotes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notesContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={80}
              color="rgba(255, 255, 255, 0.4)"
            />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Aramanızla eşleşen not bulunamadı"
                : "Henüz not eklenmemiş"}
            </Text>
            <Button
              title="Not Ekle"
              icon={<Ionicons name="add-outline" size={20} color="#fff" />}
              onPress={handleCreateNote}
              containerStyle={styles.emptyButton}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateNote}
          activeOpacity={0.8}
        >
          <View style={styles.fabContent}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: SIZES.padding,
    marginVertical: 10,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: "#fff",
    ...FONTS.body3,
  },
  clearButton: {
    padding: 8,
  },
  categoriesContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
  },
  categoryButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  categoryButtonText: {
    ...FONTS.body4,
    color: "#fff",
  },
  categoryButtonTextActive: {
    fontWeight: "bold",
  },
  notesContainer: {
    padding: SIZES.padding,
    paddingBottom: 100, // FAB için ekstra alt padding
  },
  noteCard: {
    backgroundColor: "#1A1A1A", // Koyu arka plan
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  noteCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pinIcon: {
    marginRight: 4,
  },
  noteTitle: {
    ...FONTS.h4,
    color: "#fff",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 5,
    marginLeft: 8,
  },
  noteContent: {
    ...FONTS.body4,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
  },
  noteCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  categoryText: {
    ...FONTS.body5,
    color: "rgba(255, 255, 255, 0.5)",
  },
  dateText: {
    ...FONTS.body5,
    color: "rgba(255, 255, 255, 0.5)",
  },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#9B4DFF", // Mor renk
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabContent: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    ...FONTS.body3,
    color: "#fff",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyButton: {
    width: 150,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
});

export default NotesScreen;
