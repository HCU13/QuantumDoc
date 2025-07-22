import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Keyboard,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
  Avatar,
} from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useChat } from "../../hooks/useChat";

const TokenInfo = ({ tokens, remainingTokens, colors }) => (
  <View style={{
    minWidth: 64,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  }}>
    <Image source={require('../../assets/images/token.png')} style={{ width: 12, height: 12, marginRight: 4 }} />
    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' }}>{remainingTokens}</Text>
  </View>
);

const ICON_OPTIONS = [
  { name: "chatbubble-ellipses", color: "#6C63FF" },
  { name: "code-slash", color: "#00BFAE" },
  { name: "document-text", color: "#FFB300" },
  { name: "person", color: "#FF5C5C" },
  { name: "calendar", color: "#4ECDC4" },
  { name: "book", color: "#A3A3A3" },
  { name: "bulb", color: "#FF7F50" },
  { name: "star", color: "#FFD700" },
];
const COLOR_OPTIONS = [
  "#6C63FF", "#00BFAE", "#FFB300", "#FF5C5C", "#4ECDC4", "#A3A3A3", "#FF7F50", "#FFD700"
];

const ChatScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { 
    currentChat, 
    messages, 
    loading, 
    sendMessage, 
    getAIResponse,
    createChat,
    setMessages,
    updateChat
  } = useChat();

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [chatTitleInput, setChatTitleInput] = useState("");
  const [chatDescInput, setChatDescInput] = useState("");
  const inputRef = useRef(null);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].name);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const tokenCost = 1; // Her mesaj için token maliyeti
  const tokens = 100; // Mock token count
  const remainingTokens = tokens - tokenCost;

  // Chat ID'yi route'dan al veya yeni oluştur
  const chatId = route.params?.chatId || currentChat?.id;
  
  // ChatId'ye göre doğru mesajları al
  const chatMessages = (messages[chatId] || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    if (!chatId) {
      // Yeni sohbet oluştur
      createNewChat();
    }
  }, [chatId]);

  const createNewChat = async () => {
    try {
      const newChat = await createChat("Yeni Sohbet");
      navigation.setParams({ chatId: newChat.id });
    } catch (error) {
      console.error("Yeni sohbet oluşturulamadı:", error);
    }
  };

  const onSend = useCallback(async (messages = []) => {
    if (messages.length === 0) return;

    const userMessage = messages[0];
    
    // Token kontrolü
    if (remainingTokens < 0) {
      setShowTokenModal(true);
      return;
    }

    try {
      setIsTyping(true);
      
      // Kullanıcı mesajını gönder
      await sendMessage(chatId, userMessage.text, 'user');
      
      // AI yanıtını al
      await getAIResponse(chatId, userMessage.text);
      
    } catch (error) {
      console.error("Mesaj gönderilemedi:", error);
    } finally {
      setIsTyping(false);
    }
  }, [chatId, remainingTokens, sendMessage, getAIResponse]);

  // Modal açıldığında mevcut başlığı inputa ata
  useEffect(() => {
    if (showOptionsModal && currentChat?.title) {
      setChatTitleInput(currentChat.title);
      setChatDescInput(currentChat.description || "");
      setSelectedIcon(currentChat.icon || ICON_OPTIONS[0].name);
      setSelectedColor(currentChat.color || COLOR_OPTIONS[0]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [showOptionsModal, currentChat]);

  const handleSaveChatTitle = async () => {
    if (!chatTitleInput.trim() || chatTitleInput.trim() === currentChat?.title) {
      setShowOptionsModal(false);
      return;
    }
    const updateData = { title: chatTitleInput.trim(), icon: selectedIcon, color: selectedColor };
    if (chatDescInput.trim()) {
      updateData.description = chatDescInput.trim();
    }
    await updateChat(currentChat.id, updateData);
    setShowOptionsModal(false);
  };

  const renderBubble = (props) => {
    const isUser = props.currentMessage?.user?._id === 1;
    
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
            borderRadius: 20,
            borderBottomRightRadius: 4,
            marginVertical: 2,
            marginHorizontal: 8,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          },
          left: {
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : colors.card,
            borderRadius: 20,
            borderBottomLeftRadius: 4,
            marginVertical: 2,
            marginHorizontal: 8,
            shadowColor: colors.textPrimary,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          },
        }}
        textStyle={{
          right: {
            color: colors.textOnPrimary,
            fontSize: 16,
            lineHeight: 22,
            fontWeight: '400',
          },
          left: {
            color: colors.textPrimary,
            fontSize: 16,
            lineHeight: 22,
            fontWeight: '400',
          },
        }}
        renderTime={() => null}
        renderTicks={() => null}
      />
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: 'transparent', // Beyaz arka planı kaldır
          borderTopWidth: 0,
          paddingHorizontal: 8,
          paddingVertical: 4,
          paddingBottom: Platform.OS === 'ios' ? 12 : 8, // Alt kenara daha yakın
          marginBottom: 0,
          elevation: 0,
          shadowOpacity: 0,
        }}
        primaryStyle={{
          alignItems: "center",
          minHeight: 40,
          maxHeight: 80,
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send
        {...props}
        containerStyle={{
          justifyContent: "center",
          alignItems: "center",
          alignSelf: "center",
          marginLeft: 8,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: remainingTokens >= 0 ? colors.primary : colors.border,
          shadowOpacity: 0,
          elevation: 0,
        }}
      >
        <Ionicons
          name="send"
          size={18}
          color={remainingTokens >= 0 ? colors.white : colors.textTertiary}
        />
      </Send>
    );
  };

  const renderAvatar = (props) => {
    const isUser = props.currentMessage?.user?._id === 1;
    
    return (
      <Avatar
        {...props}
        imageStyle={{
          width: 36,
          height: 36,
          borderRadius: 18,
        }}
        containerStyle={{
          marginLeft: isUser ? 0 : 12,
          marginRight: isUser ? 12 : 0,
        }}
        renderAvatar={() => (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isUser ? colors.primary : colors.secondary,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: colors.textPrimary,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Ionicons
              name={isUser ? "person" : "robot"}
              size={18}
              color={colors.white}
            />
          </View>
        )}
      />
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SIZES.padding,
      paddingVertical: 12,
      backgroundColor: 'transparent',
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    headerTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
      marginLeft: 12,
      fontWeight: '600',
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    chatContainer: {
      flex: 1,
    },
    typingIndicator: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    typingText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      fontStyle: "italic",
      marginLeft: 8,
    },
    tokenModal: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    tokenModalContent: {
      backgroundColor: colors.card,
      borderRadius: SIZES.radius,
      padding: 20,
      margin: 20,
      alignItems: "center",
    },
    tokenModalTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
      marginBottom: 10,
      textAlign: "center",
    },
    tokenModalText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 22,
    },
    tokenModalButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
    },
    optionsModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionsModalContent: {
      width: '85%',
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 24,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 6,
    },
    optionsModalTitle: {
      ...FONTS.h4,
      color: colors.textPrimary,
      fontWeight: '600',
      marginBottom: 16,
      textAlign: 'left',
    },
    optionsModalInput: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.textPrimary,
      fontSize: 16,
    },
    optionsModalCancelBtn: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor: colors.border,
      marginRight: 8,
    },
    optionsModalSaveBtn: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    optionsModalLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
      marginTop: 16,
      marginBottom: 2,
    },
    iconSelectCircle: {
      width: 38,
      height: 38,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      backgroundColor: '#F3F4F6',
    },
    colorSelectCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F3F4F6',
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {currentChat?.title || "AI Asistan"}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TokenInfo tokens={tokens} remainingTokens={remainingTokens} colors={colors} />
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowOptionsModal(true)}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chatContainer}>
          <GiftedChat
            messages={chatMessages.map(msg => ({
              _id: msg.id || Math.random().toString(),
              text: msg.content,
              createdAt: new Date(msg.createdAt),
              user: {
                _id: msg.sender === 'user' ? 1 : 2,
                name: msg.sender === 'user' ? 'Sen' : 'AI Asistan',
              },
            }))}
            onSend={(messages = []) => {
              onSend(messages);
              setInputText(""); // Mesaj gönderince input temizlensin
            }}
            user={{
              _id: 1,
            }}
            renderBubble={renderBubble}
            renderInputToolbar={renderInputToolbar}
            renderSend={renderSend}
            renderAvatar={renderAvatar}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={colors.textTertiary}
            textInputStyle={{
              color: colors.textPrimary,
              fontSize: 17,
              lineHeight: 22,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: colors.card,
              borderRadius: 16,
              marginHorizontal: 0,
              minHeight: 56,
              maxHeight: 78,
              borderWidth: 1,
              borderColor: colors.border,
              shadowOpacity: 0,
              elevation: 0,
              textAlignVertical: 'center',
            }}
            minComposerHeight={56}
            maxComposerHeight={78}
            multiline={true}
            scrollEnabled={true}
            alwaysShowSend={true}
            scrollToBottom={true}
            scrollToBottomComponent={() => (
              <View style={{ alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                <Ionicons name="chevron-down" size={20} color={colors.primary} />
              </View>
            )}
            isLoadingEarlier={loading}
            renderLoading={() => (
              <View style={styles.typingIndicator}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  marginRight: 4,
                }} />
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  marginRight: 4,
                  opacity: 0.7,
                }} />
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  opacity: 0.4,
                }} />
                <Text style={styles.typingText}>AI düşünüyor...</Text>
              </View>
            )}
          />
        </View>

        {/* Token Modal */}
        <Modal
          visible={showTokenModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTokenModal(false)}
        >
          <View style={styles.tokenModal}>
            <View style={styles.tokenModalContent}>
              <Text style={styles.tokenModalTitle}>Yetersiz Token</Text>
              <Text style={styles.tokenModalText}>
                Bu mesajı göndermek için {tokenCost} token gerekiyor. 
                Daha fazla token kazanmak için token sayfanıza gidin.
              </Text>
              <View style={styles.tokenModalButtons}>
                <TouchableOpacity
                  onPress={() => setShowTokenModal(false)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: SIZES.radius,
                    backgroundColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.textPrimary }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowTokenModal(false);
                    navigation.navigate("Tokens");
                  }}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: SIZES.radius,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: colors.white }}>Token Al</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Options Modal */}
        <Modal
          visible={showOptionsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsModalOverlay}>
            <View style={styles.optionsModalContent}>
              <Text style={styles.optionsModalTitle}>Sohbet Odası İsmini Değiştir</Text>
              <TextInput
                ref={inputRef}
                value={chatTitleInput}
                onChangeText={setChatTitleInput}
                placeholder="Yeni sohbet adı"
                placeholderTextColor={colors.textTertiary}
                style={styles.optionsModalInput}
                maxLength={40}
                returnKeyType="done"
                onSubmitEditing={handleSaveChatTitle}
              />
              <TextInput
                value={chatDescInput}
                onChangeText={setChatDescInput}
                placeholder="Açıklama (isteğe bağlı)"
                placeholderTextColor={colors.textTertiary}
                style={[styles.optionsModalInput, { marginTop: 12 }]}
                maxLength={80}
                multiline
              />
              {/* Icon seçici */}
              <Text style={styles.optionsModalLabel}>İkon Seç</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                {ICON_OPTIONS.map((icon, idx) => (
                  <TouchableOpacity
                    key={icon.name}
                    onPress={() => { setSelectedIcon(icon.name); setSelectedColor(icon.color); }}
                    style={[
                      styles.iconSelectCircle,
                      { borderColor: selectedIcon === icon.name ? icon.color : '#E5E7EB', backgroundColor: icon.color + '22' }
                    ]}
                  >
                    <Ionicons name={icon.name} size={22} color={icon.color} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Renk seçici */}
              <Text style={styles.optionsModalLabel}>Renk Seç</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
                {COLOR_OPTIONS.map((color, idx) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorSelectCircle,
                      { borderColor: selectedColor === color ? color : '#E5E7EB', backgroundColor: color + '22', marginRight: 10, marginBottom: 8 }
                    ]}
                  >
                    <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: color }} />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                <TouchableOpacity onPress={() => setShowOptionsModal(false)} style={styles.optionsModalCancelBtn}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveChatTitle} style={styles.optionsModalSaveBtn}>
                  <Text style={{ color: colors.white, fontWeight: '600' }}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ChatScreen;
