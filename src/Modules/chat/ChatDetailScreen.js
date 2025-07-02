import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const initialMessages = {
  1: [
    { id: 1, sender: 'user', content: 'Merhaba, bana matematik sorusu çözebilir misin?' },
    { id: 2, sender: 'ai', content: 'Tabii! Hangi soruyu çözmemi istersin?' },
    { id: 3, sender: 'user', content: '2x + 3 = 7 denklemini çöz.' },
    { id: 4, sender: 'ai', content: 'Çözüm: x = 2' },
  ],
  2: [
    { id: 1, sender: 'user', content: 'Hello! Can you translate this?' },
    { id: 2, sender: 'ai', content: 'Sure! What do you want to translate?' },
  ],
};

const ChatDetailScreen = ({ route, navigation }) => {
  const { chatId, title: initialTitle } = route.params;
  const [messages, setMessages] = useState(initialMessages[chatId] || []);
  const [input, setInput] = useState('');
  const [title, setTitle] = useState(initialTitle);
  const [editModal, setEditModal] = useState(false);
  const [newTitle, setNewTitle] = useState(initialTitle);
  const flatListRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: input,
    };
    setMessages([...messages, newMessage]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => ([
        ...prev,
        {
          id: prev.length + 1,
          sender: 'ai',
          content: 'AI cevabı: (örnek yanıt)',
        },
      ]));
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 900);
  };

  const handleEditTitle = () => {
    setTitle(newTitle.trim() || title);
    setEditModal(false);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.aiRow]}>
      <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={styles.bubbleText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onLongPress={() => setEditModal(true)}>
          <Text style={styles.header}>{title || 'Sohbet'}</Text>
        </TouchableOpacity>
        <Modal
          visible={editModal}
          transparent
          animationType="fade"
          onRequestClose={() => setEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Başlığı Düzenle</Text>
              <TextInput
                style={styles.input}
                placeholder="Sohbet başlığı"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholderTextColor={COLORS.textTertiary}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={() => setEditModal(false)}>
                  <Text style={{ color: COLORS.textSecondary }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.primary }]} onPress={handleEditTitle}>
                  <Text style={{ color: '#fff' }}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor={COLORS.textTertiary}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { marginRight: 12, padding: 4 },
  header: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  messageRow: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12 },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  bubbleText: { color: COLORS.textPrimary, fontSize: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 10, fontSize: 16, marginRight: 8, color: COLORS.textPrimary, backgroundColor: '#f9f9f9' },
  sendButton: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: COLORS.textPrimary },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
});

export default ChatDetailScreen; 