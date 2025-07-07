import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { API_ENDPOINTS } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export const useChat = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const { loading, error, get, post, put, delete: del } = useApi();
  const { token, loading: authLoading } = useAuth();

  // Sohbetleri getir
  const fetchChats = useCallback(async () => {
    if (!token || authLoading) return;
    try {
      const data = await get(API_ENDPOINTS.GET_CHATS, token);
      setChats(data);
    } catch (error) {
      console.error('Sohbetler getirilemedi:', error);
    }
  }, [get, token, authLoading]);

  // Yeni sohbet oluştur
  const createChat = useCallback(async (title = 'Yeni Sohbet') => {
    if (!token) throw new Error('Token gerekli');
    try {
      const newChat = await post(API_ENDPOINTS.CREATE_CHAT, { title }, token);
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (error) {
      console.error('Sohbet oluşturulamadı:', error);
      throw error;
    }
  }, [post, token]);

  // Sohbet sil
  const deleteChat = useCallback(async (chatId) => {
    if (!token) throw new Error('Token gerekli');
    try {
      await del(API_ENDPOINTS.DELETE_CHAT.replace(':id', chatId), token);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // Eğer silinen sohbet aktifse, aktif sohbeti temizle
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Sohbet silinemedi:', error);
      throw error;
    }
  }, [del, token, currentChat]);

  // Mesajları getir
  const fetchMessages = useCallback(async (chatId) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const data = await get(API_ENDPOINTS.GET_MESSAGES.replace(':id', chatId), token);
      setMessages(data);
      return data;
    } catch (error) {
      console.error('Mesajlar getirilemedi:', error);
      throw error;
    }
  }, [get, token]);

  // Mesaj gönder
  const sendMessage = useCallback(async (chatId, content, sender = 'user') => {
    if (!token) throw new Error('Token gerekli');
    try {
      const messageData = {
        content,
        sender,
        timestamp: new Date().toISOString()
      };

      const newMessage = await post(
        API_ENDPOINTS.SEND_MESSAGE.replace(':id', chatId),
        messageData,
        token
      );

      // Mesajları güncelle
      setMessages(prev => [...prev, newMessage]);

      // Sohbet listesini güncelle
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, lastMessage: content, updatedAt: new Date().toISOString() }
          : chat
      ));

      return newMessage;
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
      throw error;
    }
  }, [post, token]);

  // AI yanıtı al
  const getAIResponse = useCallback(async (chatId, userMessage) => {
    if (!token) throw new Error('Token gerekli');
    try {
      // Önce kullanıcı mesajını gönder
      await sendMessage(chatId, userMessage, 'user');

      // AI yanıtını al
      const aiResponse = await post('/chat/ai-response', {
        chatId,
        message: userMessage
      }, token);

      // AI yanıtını gönder
      await sendMessage(chatId, aiResponse.reply, 'ai');

      return aiResponse;
    } catch (error) {
      console.error('AI yanıtı alınamadı:', error);
      throw error;
    }
  }, [sendMessage, post, token]);

  // Chat room'ları getir
  const fetchChatRooms = useCallback(async () => {
    if (!token || authLoading) return;
    try {
      const data = await get(API_ENDPOINTS.GET_CHAT_ROOMS, token);
      return data;
    } catch (error) {
      console.error('Chat room\'lar getirilemedi:', error);
      throw error;
    }
  }, [get, token, authLoading]);

  // Yeni chat room oluştur
  const createChatRoom = useCallback(async (roomData) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const newRoom = await post(API_ENDPOINTS.CREATE_CHAT_ROOM, roomData, token);
      return newRoom;
    } catch (error) {
      console.error('Chat room oluşturulamadı:', error);
      throw error;
    }
  }, [post, token]);

  // Chat room'a mesaj ekle
  const addMessageToRoom = useCallback(async (roomId, messageData) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const newMessage = await post(
        API_ENDPOINTS.ADD_MESSAGE_TO_ROOM.replace(':id', roomId),
        messageData,
        token
      );
      return newMessage;
    } catch (error) {
      console.error('Mesaj eklenemedi:', error);
      throw error;
    }
  }, [post, token]);

  // Chat room mesajlarını getir
  const getMessagesForRoom = useCallback(async (roomId) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const data = await get(API_ENDPOINTS.GET_MESSAGES_FOR_ROOM.replace(':id', roomId), token);
      return data;
    } catch (error) {
      console.error('Chat room mesajları getirilemedi:', error);
      throw error;
    }
  }, [get, token]);

  // Sohbet seç
  const selectChat = useCallback(async (chat) => {
    setCurrentChat(chat);
    await fetchMessages(chat.id);
  }, [fetchMessages]);

  // Sohbet başlığını güncelle
  const updateChatTitle = useCallback(async (chatId, newTitle) => {
    if (!token) throw new Error('Token gerekli');
    try {
      const updatedChat = await put(
        API_ENDPOINTS.UPDATE_CHAT.replace(':id', chatId),
        { title: newTitle },
        token
      );
      
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? updatedChat : chat
      ));
      
      if (currentChat?.id === chatId) {
        setCurrentChat(updatedChat);
      }
      
      return updatedChat;
    } catch (error) {
      console.error('Sohbet başlığı güncellenemedi:', error);
      throw error;
    }
  }, [put, token, currentChat]);

  // İlk yükleme - sadece token varsa
  useEffect(() => {
    if (token && !authLoading) {
      fetchChats();
    }
  }, [fetchChats, token, authLoading]);

  return {
    chats,
    currentChat,
    messages,
    loading,
    error,
    fetchChats,
    createChat,
    deleteChat,
    fetchMessages,
    sendMessage,
    getAIResponse,
    selectChat,
    updateChatTitle,
    fetchChatRooms,
    createChatRoom,
    addMessageToRoom,
    getMessagesForRoom,
  };
}; 