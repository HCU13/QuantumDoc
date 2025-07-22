import { useState, useCallback, useEffect } from 'react';

export const useChat = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // useAuth importu kaldırıldı

  // Mock chat data
  const mockChats = [
    {
      id: 1,
      title: "Matematik Yardımı",
      lastMessage: "x²+5x+6=0 denklemini çöz",
      updatedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      userId: 1
    },
    {
      id: 2,
      title: "İngilizce Çeviri",
      lastMessage: "Bu metni İngilizceye çevir",
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      userId: 1
    },
    {
      id: 3,
      title: "Kod Yazma Yardımı",
      lastMessage: "React hook'ları nasıl kullanılır?",
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      userId: 1
    }
  ];

  const mockMessages = {
    1: [
      {
        id: 1,
        chatId: 1,
        sender: "user",
        content: "x²+5x+6=0 denklemini çöz",
        createdAt: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 2,
        chatId: 1,
        sender: "assistant",
        content: "Bu denklemi çözmek için önce faktörlere ayıralım:\n\nx²+5x+6 = (x+2)(x+3)\n\nBu durumda x = -2 veya x = -3 olur.",
        createdAt: new Date(Date.now() - 240000).toISOString()
      }
    ],
    2: [
      {
        id: 3,
        chatId: 2,
        sender: "user",
        content: "Bu metni İngilizceye çevir",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 4,
        chatId: 2,
        sender: "assistant",
        content: "Hangi metni çevirmemi istiyorsunuz? Lütfen çevirmek istediğiniz metni paylaşın.",
        createdAt: new Date(Date.now() - 3540000).toISOString()
      }
    ],
    3: [
      {
        id: 5,
        chatId: 3,
        sender: "user",
        content: "React hook'ları nasıl kullanılır?",
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 6,
        chatId: 3,
        sender: "assistant",
        content: "React hook'ları fonksiyonel bileşenlerde state ve lifecycle yönetimi için kullanılır. En yaygın hook'lar:\n\n- useState: State yönetimi\n- useEffect: Side effects\n- useContext: Context kullanımı\n- useRef: DOM referansları",
        createdAt: new Date(Date.now() - 7140000).toISOString()
      }
    ]
  };

  const mockChatRooms = [
    {
      id: 1,
      title: "Genel Sohbet",
      description: "Genel konular için sohbet odası",
      createdAt: new Date().toISOString(),
      userId: 1
    },
    {
      id: 2,
      title: "Teknik Destek",
      description: "Teknik sorunlar için destek odası",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      userId: 1
    }
  ];

  const fetchChats = useCallback(async () => {
    // if (!token || authLoading) return; // Removed useAuth
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock chat fetch
      setChats(mockChats);
    } catch (err) {
      setError('Sohbetler yüklenemedi');
      console.error('Chat fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  const createChat = useCallback(async (title) => {
    // if (!token) return; // Removed useAuth
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock chat creation
      const newChat = {
        id: Date.now(),
        title,
        lastMessage: null,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId: 1
      };
      
      setChats(prev => [newChat, ...prev]);
      setMessages(prev => ({ ...prev, [newChat.id]: [] }));
      
      return newChat;
    } catch (err) {
      setError('Sohbet oluşturulamadı');
      console.error('Chat creation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  const deleteChat = useCallback(async (chatId) => {
    // if (!token) return; // Removed useAuth
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock chat deletion
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[chatId];
        return newMessages;
      });
      
      return { success: true };
    } catch (err) {
      setError('Sohbet silinemedi');
      console.error('Chat deletion error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  const fetchMessages = useCallback(async (chatId) => {
    // if (!token || authLoading) return; // Removed useAuth
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock messages fetch
      const chatMessages = mockMessages[chatId] || [];
      setMessages(prev => ({ ...prev, [chatId]: chatMessages }));
      
      return chatMessages;
    } catch (err) {
      setError('Mesajlar yüklenemedi');
      console.error('Messages fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  const sendMessage = useCallback(async (chatId, content) => {
    // if (!token) return; // Removed useAuth
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock message sending
      const newMessage = {
        id: Date.now(),
        chatId,
        sender: "user",
        content,
        createdAt: new Date().toISOString()
      };
      
      // Add user message
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMessage]
      }));
      
      // Update chat last message
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, lastMessage: content, updatedAt: new Date().toISOString() }
          : chat
      ));
      
      return newMessage;
    } catch (err) {
      setError('Mesaj gönderilemedi');
      console.error('Message sending error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  const getAIResponse = useCallback(async (chatId, userMessage) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock AI response
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          chatId,
          sender: "assistant",
          content: "Bu bir mock AI yanıtıdır. Gerçek API entegrasyonu ile değiştirilecek.",
          createdAt: new Date().toISOString()
        };
        
        setMessages(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), aiResponse]
        }));
      }, 1000);
      
      return { success: true };
    } catch (err) {
      setError('AI yanıtı alınamadı');
      console.error('AI response error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  const fetchChatRooms = useCallback(async () => {
    // if (!token || authLoading) return; // Removed useAuth
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock chat rooms fetch
      setChatRooms(mockChatRooms);
    } catch (err) {
      setError('Sohbet odaları yüklenemedi');
      console.error('Chat rooms fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  const createChatRoom = useCallback(async (roomData) => {
    // if (!token) return; // Removed useAuth
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock chat room creation
      const newRoom = {
        id: Date.now(),
        ...roomData,
        createdAt: new Date().toISOString(),
        userId: 1
      };
      
      setChatRooms(prev => [newRoom, ...prev]);
      
      return newRoom;
    } catch (err) {
      setError('Sohbet odası oluşturulamadı');
      console.error('Chat room creation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  const addMessageToRoom = useCallback(async (roomId, messageData) => {
    // if (!token) return; // Removed useAuth
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock message addition to room
      const newMessage = {
        id: Date.now(),
        roomId,
        ...messageData,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), newMessage]
      }));
      
      return newMessage;
    } catch (err) {
      setError('Mesaj eklenemedi');
      console.error('Message addition error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  const fetchMessagesForRoom = useCallback(async (roomId) => {
    // if (!token || authLoading) return; // Removed useAuth
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock room messages fetch
      const roomMessages = mockMessages[roomId] || [];
      setMessages(prev => ({ ...prev, [roomId]: roomMessages }));
      
      return roomMessages;
    } catch (err) {
      setError('Oda mesajları yüklenemedi');
      console.error('Room messages fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  const updateChat = useCallback(async (chatId, updateData) => {
    // if (!token) return; // Removed useAuth
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock chat update
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, ...updateData, updatedAt: new Date().toISOString() }
          : chat
      ));
      
      return { success: true };
    } catch (err) {
      setError('Sohbet güncellenemedi');
      console.error('Chat update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Removed useAuth

  useEffect(() => {
    // if (token && !authLoading) { // Removed useAuth
      fetchChats();
      fetchChatRooms();
    // } // Removed useAuth
  }, [fetchChats, fetchChatRooms]); // Removed useAuth

  return {
    chats,
    messages,
    chatRooms,
    loading,
    error,
    fetchChats,
    createChat,
    deleteChat,
    fetchMessages,
    sendMessage,
    getAIResponse,
    fetchChatRooms,
    createChatRoom,
    addMessageToRoom,
    fetchMessagesForRoom,
    updateChat,
  };
}; 