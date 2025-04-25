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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";

const NoteCategoriesScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [categories, setCategories] = useState([
    { id: "personal", name: "Kişisel", icon: "person-outline", count: 3 },
    { id: "work", name: "İş", icon: "briefcase-outline", count: 1 },
    { id: "ideas", name: "Fikirler", icon: "bulb-outline", count: 1 },
    {
      id: "reminders",
      name: "Hatırlatıcılar",
      icon: "alarm-outline",
      count: 1,
    },
    {
      id: "other",
      name: "Diğer",
      icon: "ellipsis-horizontal-outline",
      count: 0,
    },
  ]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Kategori seçeneği
  const availableIcons = [
    { name: "person-outline", label: "Kişi" },
    { name: "briefcase-outline", label: "İş" },
    { name: "bulb-outline", label: "Fikir" },
    { name: "alarm-outline", label: "Alarm" },
    { name: "bookmark-outline", label: "Yer İşareti" },
    { name: "book-outline", label: "Kitap" },
    { name: "cart-outline", label: "Alışveriş" },
    { name: "calendar-outline", label: "Takvim" },
    { name: "flask-outline", label: "Bilim" },
    { name: "fitness-outline", label: "Spor" },
    { name: "home-outline", label: "Ev" },
    { name: "restaurant-outline", label: "Yemek" },
    { name: "school-outline", label: "Eğitim" },
    { name: "heart-outline", label: "Sağlık" },
    { name: "airplane-outline", label: "Seyahat" },
  ];
  const [selectedIcon, setSelectedIcon] = useState("person-outline");
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Kategori ekleme
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Hata", "Kategori adı gerekli");
      return;
    }

    // Kategori adı benzersiz olmalı
    if (
      categories.some(
        (c) => c.name.toLowerCase() === newCategoryName.toLowerCase()
      )
    ) {
      Alert.alert("Hata", "Bu isimde bir kategori zaten var");
      return;
    }

    const newCategory = {
      id: `category_${Date.now()}`,
      name: newCategoryName,
      icon: selectedIcon,
      count: 0,
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    setSelectedIcon("person-outline");
    setShowAddCategory(false);
  };

  // Kategori düzenleme
  const handleStartEditing = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setSelectedIcon(category.icon);
    setShowAddCategory(true);
  };

  // Kategori güncelleme
  const handleUpdateCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Hata", "Kategori adı gerekli");
      return;
    }

    // Kategori adı benzersiz olmalı (mevcut kategori hariç)
    if (
      categories.some(
        (c) =>
          c.id !== editingCategory.id &&
          c.name.toLowerCase() === newCategoryName.toLowerCase()
      )
    ) {
      Alert.alert("Hata", "Bu isimde bir kategori zaten var");
      return;
    }

    const updatedCategories = categories.map((c) =>
      c.id === editingCategory.id
        ? { ...c, name: newCategoryName, icon: selectedIcon }
        : c
    );

    setCategories(updatedCategories);
    setNewCategoryName("");
    setSelectedIcon("person-outline");
    setShowAddCategory(false);
    setEditingCategory(null);
  };

  // Kategori silme
  const handleDeleteCategory = (category) => {
    // "Personal" ve "Work" gibi varsayılan kategorileri silmeyi engelle
    if (
      ["personal", "work", "ideas", "reminders", "other"].includes(category.id)
    ) {
      Alert.alert(
        "Uyarı",
        "Varsayılan kategoriler silinemez. Bunun yerine onları düzenleyebilirsiniz."
      );
      return;
    }

    // Eğer kategoride notlar varsa, silmeyi onaylat
    if (category.count > 0) {
      Alert.alert(
        "Kategoriyi Sil",
        `Bu kategoride ${category.count} not var. Silmek istediğinizden emin misiniz? Notlar "Diğer" kategorisine taşınacaktır.`,
        [
          {
            text: "İptal",
            style: "cancel",
          },
          {
            text: "Sil",
            style: "destructive",
            onPress: () => confirmDeleteCategory(category),
          },
        ]
      );
    } else {
      confirmDeleteCategory(category);
    }
  };

  // Kategori silme onayı
  const confirmDeleteCategory = (category) => {
    // Gerçek uygulamada, bu kategoriye ait notları "Diğer" kategorisine taşıma işlemi yapılır

    // Kategoriyi listeden kaldır
    const updatedCategories = categories.filter((c) => c.id !== category.id);
    setCategories(updatedCategories);
  };

  // Kategoriyi render et
  const renderCategoryItem = ({ item }) => (
    <Card style={styles.categoryCard}>
      <View style={styles.categoryContainer}>
        <View style={styles.categoryInfo}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${colors.primary}20` },
            ]}
          >
            <Ionicons name={item.icon} size={20} color={colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.noteCount}>
              {item.count} {item.count === 1 ? "not" : "notlar"}
            </Text>
          </View>
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleStartEditing(item)}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCategory(item)}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  // İkon seçeneğini render et
  const renderIconOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.iconOption,
        selectedIcon === item.name && styles.iconOptionSelected,
      ]}
      onPress={() => {
        setSelectedIcon(item.name);
        setShowIconPicker(false);
      }}
    >
      <Ionicons
        name={item.name}
        size={24}
        color={selectedIcon === item.name ? colors.primary : colors.textPrimary}
      />
      <Text
        style={[
          styles.iconLabel,
          selectedIcon === item.name && [
            styles.iconLabelSelected,
            { color: colors.primary },
          ],
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title="Kategoriler" showBackButton={true} />

        <View style={styles.content}>
          {/* Kategori Listesi */}
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <Text style={styles.headerText}>
                  Not kategorilerinizi yönetin
                </Text>
              </View>
            }
            ListFooterComponent={
              <View style={styles.footerContainer}>
                {!showAddCategory ? (
                  <TouchableOpacity
                    style={[styles.addButton, { borderColor: colors.border }]}
                    onPress={() => {
                      setShowAddCategory(true);
                      setEditingCategory(null);
                      setNewCategoryName("");
                      setSelectedIcon("person-outline");
                    }}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.addButtonText}>Yeni Kategori Ekle</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.addCategoryContainer}>
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Kategori Adı:</Text>
                      <TextInput
                        style={[
                          styles.formInput,
                          { borderColor: colors.border },
                        ]}
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                        placeholder="Kategori adı girin"
                        placeholderTextColor="rgba(0,0,0,0.4)"
                      />
                    </View>

                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>İkon:</Text>
                      <TouchableOpacity
                        style={[
                          styles.iconSelector,
                          { borderColor: colors.border },
                        ]}
                        onPress={() => setShowIconPicker(!showIconPicker)}
                      >
                        <Ionicons
                          name={selectedIcon}
                          size={24}
                          color={colors.textPrimary}
                        />
                        <Ionicons
                          name="chevron-down"
                          size={16}
                          color={colors.textPrimary}
                          style={styles.dropdownIcon}
                        />
                      </TouchableOpacity>
                    </View>

                    {showIconPicker && (
                      <View style={styles.iconPickerContainer}>
                        <FlatList
                          data={availableIcons}
                          renderItem={renderIconOption}
                          keyExtractor={(item) => item.name}
                          numColumns={4}
                          contentContainerStyle={styles.iconGrid}
                        />
                      </View>
                    )}

                    <View style={styles.formButtons}>
                      <TouchableOpacity
                        style={[styles.formButton, styles.cancelButton]}
                        onPress={() => {
                          setShowAddCategory(false);
                          setEditingCategory(null);
                        }}
                      >
                        <Text style={styles.cancelButtonText}>İptal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.formButton,
                          [
                            styles.saveButton,
                            { backgroundColor: colors.primary },
                          ],
                        ]}
                        onPress={
                          editingCategory
                            ? handleUpdateCategory
                            : handleAddCategory
                        }
                      >
                        <Text style={styles.saveButtonText}>
                          {editingCategory ? "Güncelle" : "Ekle"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  headerContainer: {
    marginVertical: 15,
  },
  headerText: {
    ...FONTS.body3,
    color: "white",
    opacity: 0.8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  categoryCard: {
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  categoryName: {
    ...FONTS.h4,
    color: "black",
  },
  noteCount: {
    ...FONTS.body5,
    color: "gray",
  },
  categoryActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  footerContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,

    borderStyle: "dashed",
  },
  addButtonText: {
    ...FONTS.body3,
    color: "white",
    marginLeft: 10,
  },
  addCategoryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  formLabel: {
    ...FONTS.body4,
    color: "black",
    width: 100,
  },
  formInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,

    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "white",
    color: "black",
  },
  iconSelector: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderWidth: 1,

    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  iconPickerContainer: {
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
  iconGrid: {
    alignItems: "center",
  },
  iconOption: {
    alignItems: "center",
    padding: 10,
    margin: 5,
    borderRadius: 8,
    width: 70,
  },
  iconOptionSelected: {
    backgroundColor: "rgba(138, 79, 255, 0.1)",
  },
  iconLabel: {
    ...FONTS.body5,
    color: "black",
    marginTop: 5,
    textAlign: "center",
  },
  iconLabelSelected: {
    fontWeight: "bold",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  formButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: SIZES.radius,
    flex: 1,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  cancelButtonText: {
    ...FONTS.body4,
    color: "#666",
  },
  saveButton: {},
  saveButtonText: {
    ...FONTS.body4,
    color: "white",
    fontWeight: "bold",
  },
});

export default NoteCategoriesScreen;
