// src/screens/home/HomeScreen.js
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import HomeHeader from "../../components/home/HomeHeader";
import SearchBar from "../../components/home/SearchBar";
import QuickActions from "../../components/home/QuickActions";
import RecentActivity from "../../components/home/RecentActivity";
import BubbleFeature from "../../components/home/BubbleFeature";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import { useToken } from "../../contexts/TokenContext";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { colors } = useTheme();
  const { tokens } = useToken();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
    },
    personalAssistantContainer: {
      paddingHorizontal: SIZES.padding,
      marginVertical: 20,
    },
    robotCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: SIZES.radius * 2,
      padding: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    robotImage: {
      width: 80,
      height: 80,
      marginRight: 15,
    },
    robotTextContainer: {
      flex: 1,
    },
    robotTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginBottom: 5,
      fontWeight: "bold",
    },
    robotDescription: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      opacity: 0.8,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginTop: 10,
      marginBottom: 20,
      textAlign: "center",
      fontWeight: "bold",
      textShadowColor: "rgba(0,0,0,0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    bubblesContainer: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    startChatButton: {
      marginHorizontal: SIZES.padding,
      marginBottom: 20,
    },
  });

  // Örnek son aktiviteler veri seti
  const recentActivities = [
    {
      id: "1",
      title: "Matematik Sorusu",
      description: "x²+5x+6=0 denklemini çöz",
      time: "1s önce",
      type: "math",
    },
    {
      id: "2",
      title: "İngilizce Çeviri",
      description: "Türkçe metni İngilizceye çevir",
      time: "3s önce",
      type: "translate",
    },
    {
      id: "3",
      title: "Toplantı Notu",
      description: "Proje planlaması hakkında not",
      time: "5s önce",
      type: "note",
    },
  ];

  // Modül veya hızlı erişim butonu tıklandığında
  const handleModulePress = (module) => {
    console.log(`Modül tıklandı: ${module.id}`);

    // Modüle özgü ekranlara yönlendir
    switch (module.id) {
      case "chat":
        navigation.navigate("Chat");
        break;
      case "math":
        navigation.navigate("Math");
        break;
      case "write":
        navigation.navigate("Text");
        break;
      case "translate":
        navigation.navigate("Translate");
        break;
      case "tasks":
        navigation.navigate("Notes");
        break;
      case "assistant":
        navigation.navigate("Chat");
        break;
      default:
        // Varsayılan olarak explore sayfasına yönlendir
        navigation.navigate("Notes");
    }
  };

  // Son aktivite öğesi tıklandığında
  const handleActivityPress = (activity) => {
    console.log(`Aktivite tıklandı: ${activity.id}`);
    navigation.navigate("Activity");
  };

  // Arama sorgusu gönderildiğinde
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log(`Arama yapıldı: ${searchQuery}`);
      navigation.navigate("Chat", { initialQuery: searchQuery });
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

        <HomeHeader
          username="Arafat"
          onProfilePress={() => navigation.navigate("Profile")}
          onSettingsPress={() => navigation.navigate("Settings")}
          navigation={navigation}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearch}
            onVoicePress={() =>
              navigation.navigate("Chat", { voiceMode: true })
            }
            placeholder="AI Asistan ile konuşmak için tıklayın..."
          />

          {/* Kişisel AI Asistan Kartı */}
          <View style={styles.personalAssistantContainer}>
            <TouchableOpacity
              style={styles.robotCard}
              onPress={() => handleModulePress({ id: "assistant" })}
              activeOpacity={0.9}
            >
              <Image
                source={require("../../assets/images/robot.png")}
                style={styles.robotImage}
              />
              <View style={styles.robotTextContainer}>
                <Text style={styles.robotTitle}>AI Asistan</Text>
                <Text style={styles.robotDescription}>
                  Sorularınızı yanıtlamak için hazır!
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* <Button
            title="Sohbet Başlat"
            neon
            icon={
              <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
            }
            fluid
            glow
            onPress={() => navigation.navigate("Chat")}
            containerStyle={styles.startChatButton}
          /> */}

          {/* Öne Çıkan Baloncuk Butonlar */}
          {/* <Text style={styles.sectionTitle}>Öne Çıkan Özellikler</Text>

          <View style={styles.bubblesContainer}>
            <BubbleFeature
              title="AI Sohbet"
              icon={
                <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
              }
              onPress={() => handleModulePress({ id: "chat" })}
              glowing={true}
            />
            <BubbleFeature
              title="Matematik"
              icon={<Ionicons name="calculator" size={30} color="#fff" />}
              onPress={() => handleModulePress({ id: "math" })}
              glowing={true}
            />
          </View> */}

          <QuickActions onActionPress={handleModulePress} />

          {/* Son Aktiviteler Bölümü */}
          <RecentActivity
            data={recentActivities}
            onItemPress={handleActivityPress}
            onSeeAllPress={() => navigation.navigate("Activity")}
          />

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default HomeScreen;
