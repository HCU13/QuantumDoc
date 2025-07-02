import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

const initialChats = [
  {
    id: 1,
    title: 'Matematik',
    lastMessage: 'Çözüm için aşağıdaki adımları izleyebilirsin...',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Çeviri',
    lastMessage: 'İngilizce çevirisi: "How are you?"',
    updatedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
];

const ChatHistoryScreen = () => {
  const [chats, setChats] = useState(initialChats);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const navigation = useNavigation();

  const handleNewChat = () => {
    setModalVisible(true);
  };

  const handleCreateChat = () => {
    const title = newTitle.trim() || `Sohbet #${chats.length + 1}`;
    const newId = chats.length ? Math.max(...chats.map(c => c.id)) + 1 : 1;
    setChats([
      {
        id: newId,
        title,
        lastMessage: 'Henüz mesaj yok.',
        updatedAt: new Date().toISOString(),
      },
      ...chats,
    ]);
    setNewTitle('');
    setModalVisible(false);
  };

  const handleDeleteChat = (id) => {
    Alert.alert('Sohbeti Sil', 'Bu sohbeti silmek istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => setChats(chats.filter(c => c.id !== id)) },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ChatDetail', { chatId: item.id, title: item.title })}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => handleDeleteChat(item.id)}>
          <Ionicons name="trash" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardMessage} numberOfLines={1}>{item.lastMessage}</Text>
      <Text style={styles.cardDate}>{new Date(item.updatedAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Sohbetler</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNewChat}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={chats}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Hiç sohbet yok.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Sohbet Oluştur</Text>
            <TextInput
              style={styles.input}
              placeholder="Sohbet başlığı"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholderTextColor={COLORS.textTertiary}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={{ color: COLORS.textSecondary }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.primary }]} onPress={handleCreateChat}>
                <Text style={{ color: '#fff' }}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  addButton: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 8, elevation: 2 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  cardMessage: { color: COLORS.textSecondary, marginTop: 6 },
  cardDate: { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: COLORS.textPrimary },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 16, color: COLORS.textPrimary, backgroundColor: '#f9f9f9' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
});

export default ChatHistoryScreen; 