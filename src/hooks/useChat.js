import { useState, useEffect } from 'react';
import { supabase, getCurrentSession } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTokenContext } from '../contexts/TokenContext';
import { useTranslation } from 'react-i18next';
import { logActivity } from '../utils/activityLogger';
import analytics from '../services/analytics';
import { showError } from '../utils/toast';
import { MODULES } from '../constants/modules';

export const useChat = () => {
  const { i18n, t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState({});
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const { user } = useAuth();
  const { refreshTokens } = useTokenContext();

  // Chat'leri yükle
  const loadChats = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('id, title, description, icon, color, last_message, last_message_at, created_at, updated_at')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false, nullsLast: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      if (__DEV__) console.error('Chats yükleme hatası:', error);
    }
  };

  // Chat mesajlarını yükle (Pagination ile)
  const loadChatMessages = async (chatId, limit = 50, offset = 0) => {
    if (!chatId) return;

    // İlk yüklemede cache'den kontrol et
    if (offset === 0 && messages[chatId] && messages[chatId].length > 0) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const formattedMessages = data.map(msg => ({
        id: msg.id || `msg-${Date.now()}-${Math.random()}`,
        content: msg.content,
        createdAt: msg.created_at,
        sender: msg.sender_type
      }));

      if (offset === 0) {
        // İlk yükleme - replace
        setMessages(prev => ({
          ...prev,
          [chatId]: formattedMessages
        }));
      } else {
        // Pagination - append
        setMessages(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), ...formattedMessages]
        }));
      }

      return formattedMessages.length; // Kaç mesaj yüklendiğini döndür
    } catch (error) {
      if (__DEV__) console.error('Mesajlar yüklenemedi:', error);
      return 0;
    }
  };

  // Chat bilgilerini yükle
  const loadChatInfo = async (chatId) => {
    if (!chatId) return;

    // Eğer chat bilgileri zaten yüklüyse tekrar yükleme
    if (currentChat && currentChat.id === chatId) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (error) throw error;
      setCurrentChat(data);
    } catch (error) {
      if (__DEV__) console.error('Chat bilgileri yüklenemedi:', error);
    }
  };

  const sendMessage = async (chatId, message) => {
    if (!user?.id) throw new Error('Kullanıcı giriş yapmamış');

    const now = Date.now();
    const tempUserId = `temp-user-${now}`;
    const tempAiId = `temp-ai-${now}`;

    // 1. HEMEN kullanıcı mesajını ekrana ekle (Optimistic Update)
    const optimisticUserMessage = {
      id: tempUserId,
      content: message,
      createdAt: new Date(now).toISOString(),
      sender: 'user'
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), optimisticUserMessage]
    }));

    // 2. AI düşünüyor placeholder'ı ekle (1ms sonra olsun ki user mesajından sonra gelsin)
    const thinkingMessage = {
      id: tempAiId,
      content: '🤔 Düşünüyorum...',
      createdAt: new Date(now + 1).toISOString(), // +1ms sonra
      sender: 'assistant',
      isThinking: true
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), thinkingMessage]
    }));

    setLoading(true);
    try {
      // 3. Kullanıcı mesajını database'e kaydet
      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          content: message,
          sender_type: 'user',
          message_type: 'text'
        })
        .select()
        .single();

      if (userError) throw userError;

      // 4. Claude AI'dan yanıt al
      const session = await getCurrentSession();
      const userLanguage = i18n.language || 'tr'; // Uygulama dil ayarı
      
      // Modül kategorisini al (chat modülü için)
      const chatModule = MODULES.find(m => m.id === 'chat');
      const category = chatModule?.category || 'tools';

      const response = await fetch('https://fcyzxfajpolzdboyhatf.supabase.co/functions/v1/chat-with-claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          message,
          chatId,
          userId: user.id,
          userLanguage: userLanguage, // Dil bilgisini gönder
          category: category // Kategori bilgisini gönder
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Teknik hataları gizle, sadece development'ta log'la
        if (__DEV__) {
          console.error('[Chat] Edge Function Error:', response.status, errorText);
        }
        
        // Kullanıcıya genel hata mesajı göster (çeviri ile)
        showError(
          t('errors.api.title'),
          t('errors.api.message')
        );
        
        // Genel hata fırlat
        throw new Error(t('errors.api.title'));
      }

      const aiResponse = await response.json();

      // 5. AI yanıtını database'e kaydet
      const { data: aiMessage, error: aiError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          content: aiResponse.message,
          sender_type: 'assistant',
          message_type: 'text',
          metadata: aiResponse.metadata || {}
        })
        .select()
        .single();

      if (aiError) throw aiError;

      // 6. Chat'in son mesaj zamanını güncelle
      await supabase
        .from('chats')
        .update({
          last_message_at: new Date().toISOString(),
          last_message: message
        })
        .eq('id', chatId);

      // 7. Placeholder'ı gerçek AI yanıtıyla değiştir
      setMessages(prev => {
        const currentMessages = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: currentMessages.map(msg => {
            // Temp user mesajını gerçek ID ile güncelle
            if (msg.id === tempUserId) {
              return {
                ...msg,
                id: userMessage.id,
                createdAt: userMessage.created_at
              };
            }
            // Thinking placeholder'ı gerçek AI yanıtı ile değiştir
            if (msg.id === tempAiId) {
              return {
                id: aiMessage.id,
                content: aiMessage.content,
                createdAt: aiMessage.created_at,
                sender: 'assistant'
              };
            }
            return msg;
          })
        };
      });

      // 8. Chat listesini güncelle
      await loadChats();

      // 9. Analytics: AI Chat kullanımı
      await analytics.trackAIUsage('chat', {
        chatId,
        messageLength: message.length,
        tokensUsed: 1,
      });

      // 10. Token'ı refresh et (token harcamasından sonra)
      await refreshTokens();

      // NOT: Aktivite kaydı sadece createChat'te yapılıyor (her mesajda değil)

      return { userMessage, aiMessage };

    } catch (error) {
      if (__DEV__) console.error('Chat error:', error);

      // Hata durumunda placeholder'ları temizle
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).filter(msg =>
          msg.id !== tempUserId && msg.id !== tempAiId
        )
      }));

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getChatMessages = async (chatId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  };

  const createChat = async (title, description, icon = 'chatbubble-ellipses', color = '#6C63FF') => {
    if (!user?.id) throw new Error('Kullanıcı giriş yapmamış');

    const { data, error } = await supabase
      .from('chats')
      .insert({
        title,
        description,
        icon,
        color,
        user_id: user.id,
        last_message: null // Boş bırak
      })
      .select()
      .single();

    if (error) throw error;

    // Yeni chat'i current chat olarak ayarla
    setCurrentChat(data);

    // Boş mesaj listesi oluştur
    setMessages(prev => ({
      ...prev,
      [data.id]: []
    }));

    // Chat listesini güncelle
    await loadChats();

    // Aktivite kaydı oluştur (sadece yeni sohbet odası oluşturulduğunda)
    await logActivity(
      user.id,
      'chat',
      title, // Sohbet odası başlığı
      description, // Açıklama
      {
        chatId: data.id,
        tokensUsed: 0, // Henüz mesaj yok
        model: 'claude'
      }
    );

    return data;
  };

  const updateChat = async (chatId, updateData) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .update(updateData)
        .eq('id', chatId)
        .select()
        .single();

      if (error) throw error;

      // Current chat'i güncelle
      setCurrentChat(prev => ({ ...prev, ...updateData }));

      // Chat listesini güncelle
      await loadChats();

      return data;
    } catch (error) {
      if (__DEV__) console.error('Chat güncelleme hatası:', error);
      throw error;
    }
  };

  // Chat silme (tek)
  const deleteChat = async (chatId) => {
    if (!user?.id) throw new Error('Kullanıcı giriş yapmamış');

    try {
      // Önce chat ile ilgili user_activities kayıtlarını sil
      const { error: activitiesError } = await supabase
        .from('user_activities')
        .delete()
        .eq('user_id', user.id)
        .eq('metadata->>chat_id', chatId);

      if (activitiesError) {
        if (__DEV__) console.warn('User activities silme hatası:', activitiesError);
        // Bu hata kritik değil, devam et
      }

      // Chat'i sil (messages otomatik silinecek cascade ile)
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id); // Güvenlik: sadece kendi chat'ini silebilir

      if (error) throw error;

      // Local state'den sil
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[chatId];
        return newMessages;
      });

      // Chat listesini güncelle
      await loadChats();

      return true;
    } catch (error) {
      if (__DEV__) console.error('Chat silme hatası:', error);
      throw error;
    }
  };

  // Çoklu chat silme
  const deleteMultipleChats = async (chatIds) => {
    if (!user?.id) throw new Error('Kullanıcı giriş yapmamış');
    if (!chatIds || chatIds.length === 0) return;

    try {
      // Önce chat'ler ile ilgili user_activities kayıtlarını sil
      const { error: activitiesError } = await supabase
        .from('user_activities')
        .delete()
        .eq('user_id', user.id)
        .in('metadata->>chat_id', chatIds);

      if (activitiesError) {
        if (__DEV__) console.warn('User activities silme hatası:', activitiesError);
        // Bu hata kritik değil, devam et
      }

      // Chat'leri sil (messages otomatik silinecek cascade ile)
      const { error } = await supabase
        .from('chats')
        .delete()
        .in('id', chatIds)
        .eq('user_id', user.id); // Güvenlik: sadece kendi chat'lerini silebilir

      if (error) throw error;

      // Local state'den sil
      setMessages(prev => {
        const newMessages = { ...prev };
        chatIds.forEach(id => delete newMessages[id]);
        return newMessages;
      });

      // Chat listesini güncelle
      await loadChats();

      return true;
    } catch (error) {
      if (__DEV__) console.error('Çoklu chat silme hatası:', error);
      throw error;
    }
  };

  const getAIResponse = async (chatId, message) => {
    // Bu fonksiyon sendMessage içinde zaten çağrılıyor
    // Sadece interface uyumluluğu için
    return true;
  };

  // İlk yüklemede chat'leri getir
  useEffect(() => {
    if (user?.id && chats.length === 0) {
      loadChats();
    }
  }, [user?.id, chats.length]);

  return {
    messages,
    currentChat,
    chats,
    loading,
    sendMessage,
    getChatMessages,
    createChat,
    updateChat,
    deleteChat,
    deleteMultipleChats,
    getAIResponse,
    setMessages,
    loadChatMessages,
    loadChatInfo,
    loadChats
  };
};