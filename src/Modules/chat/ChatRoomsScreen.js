import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, Text, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import useTheme from "../../hooks/useTheme";
import CreateChatRoomModal from "./CreateChatRoomModal";

const dummyRooms = [
  { id: 1, title: "Kodlama Yardımı", lastMessage: "AI: Merhaba! Kodunuzu buraya yapıştırabilirsiniz. Yardımcı olabilirim!", icon: "code-slash", color: "#6C63FF" },
  { id: 2, title: "AI Notlarım", lastMessage: "AI: Not eklendi. Lütfen yeni notunuzu kontrol edin.", icon: "document-text", color: "#00BFAE" },
  { id: 3, title: "Kişisel Notlar", lastMessage: "Yeni not ekledim. Bugün çok verimli geçti, önemli noktaları kaydettim.", icon: "person", color: "#FFB300" },
  { id: 4, title: "Günlük", lastMessage: "Bugün güzel geçti. Hava çok iyiydi ve uzun bir yürüyüş yaptım.", icon: "calendar", color: "#FF5C5C" },
  { id: 5, title: "Fizik Soruları", lastMessage: "Son mesaj... Lütfen yeni sorularınızı ekleyin.", icon: "book", color: "#4ECDC4" },
  { id: 6, title: "Tarih", lastMessage: "Ders notları burada. Son eklenen notları gözden geçirdin mi?", icon: "time", color: "#A3A3A3" },
];

const getRoomIcon = (icon, color) => (
  <View style={[styles.iconCircle, { backgroundColor: color + '33' }] }>
    <Ionicons name={icon} size={22} color={color} />
  </View>
);

const getMessagePreview = (msg) => {
  if (!msg || msg.trim() === "") return "Henüz mesaj yok.";
  // 4 satırı geçmesin, yaklaşık 100 karakter
  if (msg.length > 100) return msg.slice(0, 97) + "...";
  return msg;
};

const ChatRoomsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [rooms, setRooms] = useState(dummyRooms);

  const handleRoomPress = (room) => {
    if (room.isNew) {
      setModalVisible(true);
      return;
    }
    navigation.navigate("ChatDetail", { roomId: room.id, roomTitle: room.title });
  };

  const handleCreateRoom = (title) => {
    const newRoom = {
      id: Date.now(),
      title,
      lastMessage: "",
      icon: "chatbubble-ellipses",
      color: "#6C63FF",
    };
    setRooms([newRoom, ...rooms]);
    setModalVisible(false);
  };

  // Yeni oda kartı
  const newRoomCard = {
    isNew: true,
  };

  const data = [newRoomCard, ...rooms];

  const renderItem = ({ item }) => {
    if (item.isNew) {
      return (
        <TouchableOpacity
          onPress={() => handleRoomPress(item)}
          activeOpacity={0.85}
          style={[styles.bigCard, styles.newRoomCard]}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#E5E7EB' }] }>
            <Ionicons name="add" size={26} color="#888" />
          </View>
          <Text style={styles.newRoomText}>Yeni Oda</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        onPress={() => handleRoomPress(item)}
        activeOpacity={0.85}
        style={styles.bigCard}
      >
        {getRoomIcon(item.icon, item.color)}
        <Text style={styles.bigCardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.bigCardDesc} numberOfLines={4}>{getMessagePreview(item.lastMessage)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title="Sohbet Odaları"
          rightIcon={<Ionicons name="add" size={24} color={colors.primary} />}
          onRightPress={() => setModalVisible(true)}
        />
        <FlatList
          data={data}
          keyExtractor={(item, idx) => item.isNew ? 'new' : item.id.toString()}
          renderItem={renderItem}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        />
        <CreateChatRoomModal visible={modalVisible} onClose={() => setModalVisible(false)} onCreate={handleCreateRoom} />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  bigCard: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: 'flex-start',
    minHeight: 90,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bigCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    marginTop: 2,
  },
  bigCardDesc: {
    fontSize: 11,
    color: '#888',
    lineHeight: 14,
    marginBottom: 2,
  },
  newRoomCard: {
    backgroundColor: '#fff',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newRoomText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginTop: 6,
  },
});

export default ChatRoomsScreen; 