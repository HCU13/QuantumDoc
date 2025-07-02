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
      color: colors.primary, // Mor renk
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
      color: colors.secondary, // Turuncu
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
      color: colors.success, // Yeşil
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
      color: colors.info, // Mavi
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
      color: colors.success, // Turkuaz/Yeşil
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

  const CHIP_HEIGHT = 32;
  const CategoryChip = ({ label, active, onPress }) => {
    const { colors } = useTheme();
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          height: CHIP_HEIGHT,
          paddingHorizontal: 16,
          borderRadius: 16,
          marginRight: 10,
          borderWidth: 2,
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.primary + '10' : colors.input,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: active ? colors.primary : colors.textSecondary,
            fontWeight: active ? '600' : '400',
            fontSize: 15,
            lineHeight: 20,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Not kartını render et
  const renderNoteItem = ({ item }) => {
    const date = new Date(item.updatedAt);
    const formattedDate = `${date.getDate()}.${
      date.getMonth() + 1
    }.${date.getFullYear()}`;

    return (
      <TouchableOpacity
        style={[
          styles.noteCard,
          {
            borderLeftColor: item.color,
            backgroundColor: colors.card,
          },
        ]}
        onPress={() => handleNotePress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.noteCardHeader}>
          <View style={styles.titleContainer}>
            {item.isPinned && (
              <Ionicons
                name="pin"
                size={16}
                color={colors.primary}
                style={styles.pinIcon}
              />
            )}
            <Text
              style={[styles.noteTitle, { color: colors.textPrimary }]}
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
                color={colors.info}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteNote(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.warning} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={2} ellipsizeMode="tail">
          {item.content}
        </Text>

        <View style={styles.noteCardFooter}>
          <Text style={[styles.categoryText, { color: colors.textTertiary }]}>
            {categories.find((cat) => cat.id === item.category)?.name ||
              "Diğer"}
          </Text>
          <Text style={[styles.dateText, { color: colors.textTertiary }]}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header
          title="Notlarım"
          showBackButton={true}
          rightComponent={
            <TouchableOpacity
              onPress={handleCreateNote}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 2,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.18,
                shadowRadius: 3,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          }
        />

        <View style={[styles.searchContainer, { backgroundColor: colors.input, borderColor: colors.border, borderWidth: 1 }]}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Notlarda ara..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 44, justifyContent: 'center' }}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
            renderItem={({ item }) => (
              <CategoryChip
                label={item.name}
                active={selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id)}
              />
            )}
          />
        </View>

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
              color={colors.textTertiary + '66'}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
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
    marginHorizontal: SIZES.padding,
    marginVertical: 10,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    ...FONTS.body3,
  },
  clearButton: {
    padding: 8,
  },
  notesContainer: {
    padding: SIZES.padding,
    paddingBottom: 100, // FAB için ekstra alt padding
  },
  noteCard: {
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
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
  },
  dateText: {
    ...FONTS.body5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    ...FONTS.body3,
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyButton: {
    width: 150,
  },
});

export default NotesScreen;
