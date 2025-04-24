// src/screens/activity/ActivityScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import TokenDisplay from "../../components/common/TokenDisplay";
import SearchBar from "../../components/home/SearchBar";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";

const ActivityItem = ({ item, onPress }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    itemContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderRadius: SIZES.radius,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
      overflow: "hidden",
    },
    itemHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: getTypeColor(item.type, 0.3),
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    contentContainer: {
      flex: 1,
    },
    title: {
      ...FONTS.h4,
      color: colors.textOnGradient,
      marginBottom: 4,
      fontWeight: "bold",
    },
    description: {
      ...FONTS.body5,
      color: colors.textOnGradient,
      opacity: 0.7,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
    },
    time: {
      ...FONTS.body5,
      color: colors.textOnGradient,
      opacity: 0.7,
      marginLeft: 5,
    },
    itemContent: {
      padding: 15,
    },
    contentText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
    },
  });

  // Aktivite tipine göre renkler ve ikonlar
  function getTypeColor(type, opacity = 1) {
    const colors = {
      chat: `rgba(138, 79, 255, ${opacity})`,
      math: `rgba(242, 76, 76, ${opacity})`,
      write: `rgba(76, 172, 188, ${opacity})`,
      translate: `rgba(95, 92, 189, ${opacity})`,
      note: `rgba(82, 222, 151, ${opacity})`,
      task: `rgba(226, 82, 220, ${opacity})`,
      voice: `rgba(255, 106, 136, ${opacity})`,
      default: `rgba(150, 150, 150, ${opacity})`,
    };

    return colors[type] || colors["default"];
  }

  function getTypeIcon(type) {
    const icons = {
      chat: "chatbubble-ellipses-outline",
      math: "calculator-outline",
      write: "create-outline",
      translate: "language-outline",
      note: "document-text-outline",
      task: "checkbox-outline",
      voice: "volume-high-outline",
      default: "ellipsis-horizontal",
    };

    return icons[type] || icons["default"];
  }

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.itemHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={getTypeIcon(item.type)} size={22} color="#fff" />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {item.description}
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.textOnGradient}
          />
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.contentText} numberOfLines={2}>
          {item.content || item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ActivityScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    contentContainer: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SIZES.padding,
      paddingTop: 10,
      paddingBottom: 15,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      ...FONTS.h2,
      color: colors.textOnGradient,
      fontWeight: "bold",
      textShadowColor: "rgba(0,0,0,0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    subtitle: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      opacity: 0.8,
      marginTop: 5,
    },
    filterContainer: {
      flexDirection: "row",
      paddingHorizontal: SIZES.padding,
      marginTop: 10,
      marginBottom: 10,
    },
    filterButton: {
      height: 36,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 18,
      marginRight: 8,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: "rgba(255, 255, 255, 0.5)",
    },
    filterButtonText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      marginLeft: 5,
    },
    filterButtonTextActive: {
      color: colors.textOnPrimary,
      fontWeight: "bold",
    },
    emptyContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: 30,
      paddingHorizontal: 20,
    },
    emptyText: {
      ...FONTS.body3,
      color: colors.textOnGradient,
      textAlign: "center",
      marginBottom: 20,
    },
    noResults: {
      ...FONTS.body3,
      color: colors.textOnGradient,
      textAlign: "center",
      marginTop: 20,
      fontStyle: "italic",
    },
    listContainer: {
      paddingHorizontal: SIZES.padding,
    },
  });

  // Örnek aktiviteler
  const allActivities = [
    {
      id: "1",
      title: "Matematik Sorusu",
      description: "x²+5x+6=0 denklemini çöz",
      time: "1s önce",
      type: "math",
      content:
        "Denklem: x²+5x+6=0\nÇözüm adımları:\n1. x²+5x+6=0\n2. (x+2)(x+3)=0\n3. x=-2 veya x=-3",
    },
    {
      id: "2",
      title: "İngilizce Çeviri",
      description: "Türkçe metni İngilizceye çevir",
      time: "3s önce",
      type: "translate",
      content:
        'Türkçe: "Yapay zeka günümüzde hayatımızın her alanında kullanılıyor."\n\nİngilizce: "Artificial intelligence is used in every aspect of our lives today."',
    },
    {
      id: "3",
      title: "Toplantı Notu",
      description: "Proje planlaması hakkında not",
      time: "5s önce",
      type: "note",
      content:
        "Proje Planlaması Toplantı Notları:\n- Yeni UI tasarımı 2 hafta içinde tamamlanacak\n- Backend API güncellemeleri Mayıs sonuna kadar bitecek\n- Test süreci Haziran başında başlayacak",
    },
    {
      id: "4",
      title: "AI Sohbet",
      description: "Kuantum bilgisayarlar hakkında konuşma",
      time: "1g önce",
      type: "chat",
      content:
        'Soru: "Kuantum bilgisayarlar nasıl çalışır?"\n\nCevap: "Kuantum bilgisayarlar, kuantum mekaniğinin süperpozisyon ve dolanıklık gibi özelliklerini kullanarak klasik bilgisayarlardan çok daha hızlı hesaplama yapabilir..."',
    },
    {
      id: "5",
      title: "Yazı Üretme",
      description: "Blog yazısı taslağı",
      time: "2g önce",
      type: "write",
      content:
        "AI Teknolojilerinin İş Dünyasına Etkisi\n\nGiriş: Yapay zeka, günümüzde şirketlerin rekabet avantajı sağlamasında kritik bir rol oynamaktadır...",
    },
  ];

  const [selectedFilter, setSelectedFilter] = useState("all");
  const filters = [
    { id: "all", name: "Tümü", icon: "apps-outline" },
    { id: "chat", name: "Sohbet", icon: "chatbubble-outline" },
    { id: "math", name: "Matematik", icon: "calculator-outline" },
    { id: "write", name: "Yazı", icon: "create-outline" },
  ];

  // Filtreleme ve arama
  const filteredActivities = allActivities
    .filter(
      (activity) => selectedFilter === "all" || activity.type === selectedFilter
    )
    .filter(
      (activity) =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (activity.content &&
          activity.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Aktivite öğesi tıklandığında
  const handleActivityPress = (activity) => {
    console.log(`Aktivite tıklandı: ${activity.id}`);

    // Aktiviteye özgü ekranlara yönlendir
    switch (activity.type) {
      case "chat":
        navigation.navigate("Chat", { activity });
        break;
      case "math":
        navigation.navigate("MathSolver", { activity });
        break;
      case "translate":
        navigation.navigate("TranslateDetail", { activity });
        break;
      case "note":
        navigation.navigate("NotesDetail", { activity });
        break;
      case "write":
        navigation.navigate("TextGenerator", { activity });
        break;
      default:
        console.log(`${activity.type} için henüz ekran oluşturulmadı`);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        /> */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Aktiviteler</Text>
            <Text style={styles.subtitle}>Geçmiş etkileşimleriniz</Text>
          </View>

          <TokenDisplay
            size="small"
            showPlus={false}
            onPress={() => navigation.navigate("Tokens")}
          />
        </View>

        <View style={styles.contentContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Aktivitelerde ara..."
          />

          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.id && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.id)}
                >
                  <Ionicons
                    name={filter.icon}
                    size={16}
                    color={
                      selectedFilter === filter.id
                        ? colors.textOnPrimary
                        : colors.textOnGradient
                    }
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedFilter === filter.id &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {filter.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.listContainer}>
            {filteredActivities.length > 0 ? (
              <FlatList
                data={filteredActivities}
                renderItem={({ item }) => (
                  <ActivityItem item={item} onPress={handleActivityPress} />
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 130 }}
              />
            ) : (
              <View style={styles.emptyContainer}>
                {searchQuery || selectedFilter !== "all" ? (
                  <>
                    <Text style={styles.noResults}>
                      Arama sonucunda aktivite bulunamadı
                    </Text>
                    <Button
                      title="Tüm Aktiviteleri Göster"
                      onPress={() => {
                        setSearchQuery("");
                        setSelectedFilter("all");
                      }}
                      outlined
                      containerStyle={{ marginTop: 15 }}
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.emptyText}>
                      Henüz hiç aktiviteniz yok. AI asistanı kullanmaya
                      başlayın!
                    </Text>
                    <Button
                      title="Sohbet Başlat"
                      onPress={() => navigation.navigate("Chat")}
                      neon
                      icon={
                        <Ionicons
                          name="chatbubble-ellipses"
                          size={20}
                          color="#fff"
                        />
                      }
                    />
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ActivityScreen;
