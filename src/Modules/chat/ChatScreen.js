import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
  Alert,
} from "react-native";
import LottieView from "lottie-react-native";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Composer,
  Send,
  Avatar,
} from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import {
  SIZES,
  FONTS,
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
} from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import { useChat } from "../../hooks/useChat";
import { useTokenContext } from "../../contexts/TokenContext";
import i18n from "../../i18n/config";

const messageAnimation = require("../../../assets/animations/message.json");

const TokenInfo = ({ tokens, colors }) => (
  <View
    style={{
      minWidth: 64,
      height: 32,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
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
    }}
  >
    <Image
      source={require("../../assets/images/token.png")}
      style={{ width: 12, height: 12, marginRight: 4 }}
    />
    <Text
      style={{
        fontSize: 11,
        fontWeight: "600",
        color: colors.textPrimary,
        textAlign: "center",
      }}
    >
      {tokens}
    </Text>
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
  "#6C63FF",
  "#00BFAE",
  "#FFB300",
  "#FF5C5C",
  "#4ECDC4",
  "#A3A3A3",
  "#FF7F50",
  "#FFD700",
];

const ChatScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const {
    currentChat,
    messages,
    loading,
    sendMessage,
    getAIResponse,
    createChat,
    setMessages,
    updateChat,
    loadChatMessages,
    loadChatInfo,
  } = useChat();

  const [isTyping, setIsTyping] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [chatTitleInput, setChatTitleInput] = useState("");
  const inputRef = useRef(null);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].name);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  // Custom input text state - GiftedChat'in onChangeText'i olmadığı için
  const [inputText, setInputText] = useState('');
  const inputTextRef = useRef('');
  const composerRef = useRef(null);
  
  // inputText değiştiğinde ref'i güncelle
  useEffect(() => {
    inputTextRef.current = inputText;
  }, [inputText]);

  const { tokens, getTokenCost, loading: tokensLoading } = useTokenContext();
  const tokenCost = getTokenCost("chat");
  // remainingTokens kaldırıldı - her yerde direkt tokens gösteriliyor

  // Chat ID'yi route'dan al veya yeni oluştur
  const chatId = route.params?.chatId || currentChat?.id;

  // ChatId'ye göre doğru mesajları al
  const chatMessages = (messages && messages[chatId] ? messages[chatId] : [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    if (!chatId) {
      // Yeni sohbet oluştur
      createNewChat();
    } else {
      // Sadece chat bilgileri yoksa yükle
      if (!currentChat || currentChat.id !== chatId) {
        loadChatInfo(chatId);
      }

      // Sadece mesajlar yoksa yükle
      if (!messages[chatId] || messages[chatId].length === 0) {
        loadChatMessages(chatId);
      }
    }
  }, [chatId, currentChat, messages, loadChatMessages, loadChatInfo]);

  // Safety check: isTyping state'ini 10 saniye sonra otomatik reset et (daha hızlı recovery)
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        if (__DEV__) {
          console.warn('[ChatInput] ⚠️ isTyping state stuck for 10s, resetting...');
        }
        setIsTyping(false);
      }, 10000); // 10 saniye (daha hızlı recovery)

      return () => clearTimeout(timer);
    }
  }, [isTyping]);
  
  // Component mount olduğunda isTyping'i false yap (safety)
  useEffect(() => {
    setIsTyping(false);
  }, []);

  const createNewChat = async () => {
    try {
      const newChat = await createChat(t('chat.newChat'));
      navigation.setParams({ chatId: newChat.id });
    } catch (error) {
      if (__DEV__) console.error("Yeni sohbet oluşturulamadı:", error);
    }
  };

  const onSend = useCallback(
    async (newMessages = []) => {
      if (newMessages.length === 0) return;

      const userMessage = newMessages[0];

      // Token kontrolü - Database'den token maliyetini al
      const tokenCost = getTokenCost('chat') || 1; // Chat her mesaj 1 token
      if (tokens < tokenCost) {
        Alert.alert(
          t('chat.tokenInsufficient'),
          t('chat.tokenInsufficientMessage', { cost: tokenCost, tokens }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { 
              text: t('chat.getTokens'),
              onPress: () => navigation.navigate('Profile', { screen: 'Subscription', params: { tab: 'token' } })
            }
          ]
        );
        return;
      }

      try {
        setIsTyping(true);
        if (__DEV__) console.log('[ChatInput] Mesaj gönderiliyor, isTyping=true');

        // Mesajı gönder (AI yanıtı da otomatik gelecek)
        await sendMessage(chatId, userMessage.text);
        
        if (__DEV__) console.log('[ChatInput] Mesaj gönderildi, isTyping=false olacak');
      } catch (error) {
        if (__DEV__) {
          console.error('[ChatInput] Mesaj gönderilemedi:', error);
          console.error('[ChatInput] Hata detayı:', error.message, error.stack);
        }
      } finally {
        if (__DEV__) console.log('[ChatInput] Finally block, isTyping=false');
        setIsTyping(false);
      }
    },
    [chatId, tokens, sendMessage]
  );

  // Daha eski mesajları yükle (scroll up yapınca)
  const onLoadEarlier = useCallback(async () => {
    if (isLoadingEarlier || !hasMoreMessages || !chatId) return;

    try {
      setIsLoadingEarlier(true);
      const currentMessageCount = chatMessages.length;

      // Mevcut mesaj sayısından itibaren yeni mesajlar yükle
      const loadedCount = await loadChatMessages(
        chatId,
        50,
        currentMessageCount
      );

      // Eğer yüklenen mesaj sayısı 50'den az ise, daha fazla mesaj yok demektir
      if (loadedCount < 50) {
        setHasMoreMessages(false);
      }
    } catch (error) {
      if (__DEV__) console.error("Eski mesajlar yüklenemedi:", error);
    } finally {
      setIsLoadingEarlier(false);
    }
  }, [
    chatId,
    chatMessages.length,
    isLoadingEarlier,
    hasMoreMessages,
    loadChatMessages,
  ]);

  // Modal açıldığında mevcut başlığı inputa ata
  useEffect(() => {
    if (showOptionsModal && currentChat?.title) {
      setChatTitleInput(currentChat.title);
      setSelectedIcon(currentChat.icon || ICON_OPTIONS[0].name);
      setSelectedColor(currentChat.color || COLOR_OPTIONS[0]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [showOptionsModal, currentChat]);

  const handleSaveChatTitle = async () => {
    if (
      !chatTitleInput.trim() ||
      chatTitleInput.trim() === currentChat?.title
    ) {
      setShowOptionsModal(false);
      return;
    }

    const updateData = {
      title: chatTitleInput.trim(),
      icon: selectedIcon,
      color: selectedColor,
    };

    try {
      await updateChat(currentChat.id, updateData);
      setShowOptionsModal(false);
    } catch (error) {
      if (__DEV__) console.error("Chat güncelleme hatası:", error);
      Alert.alert(t('common.error'), t('chat.settingsUpdateError'));
    }
  };

  const renderBubble = (props) => {
    const isUser = props.currentMessage?.user?._id === 1;
    const isThinking = props.currentMessage?.isThinking;

    // AI düşünüyor göstergesi - Lottie animasyonu ile
    if (isThinking) {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 4,
            marginHorizontal: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: isDark
              ? "rgba(108, 99, 255, 0.15)"
              : "rgba(108, 99, 255, 0.08)",
            borderRadius: 18,
            borderBottomLeftRadius: 6,
            maxWidth: "75%",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LottieView
              source={messageAnimation}
              autoPlay
              loop
              style={{
                width: 48,
                height: 48,
              }}
            />
          </View>
          <Text
            style={{
              marginLeft: 8,
              fontSize: 13,
              color: colors.textSecondary,
              fontStyle: "italic",
            }}
          >
            {t('chat.thinking')}
          </Text>
        </View>
      );
    }

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
            borderRadius: 18,
            borderBottomRightRadius: 6,
            marginVertical: 2,
            marginHorizontal: 6,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            maxWidth: "75%",
          },
          left: {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
            borderRadius: 18,
            borderBottomLeftRadius: 6,
            marginVertical: 2,
            marginHorizontal: 6,
            shadowColor: colors.textPrimary,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
            maxWidth: "75%",
          },
        }}
        textStyle={{
          right: {
            color: colors.textOnPrimary,
            fontSize: 14,
            lineHeight: 18,
            fontWeight: "400",
            paddingHorizontal: 2,
          },
          left: {
            color: colors.textPrimary,
            fontSize: 14,
            lineHeight: 18,
            fontWeight: "400",
            paddingHorizontal: 2,
          },
        }}
        renderTime={() => (
          <Text
            style={{
              fontSize: 10,
              color: isUser ? "rgba(255, 255, 255, 0.6)" : colors.textTertiary,
              marginTop: 2,
              marginHorizontal: 6,
              textAlign: isUser ? "right" : "left",
            }}
          >
            {new Date(props.currentMessage.createdAt).toLocaleTimeString(
              i18n.language === 'tr' ? 'tr-TR' : 'en-US',
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </Text>
        )}
        renderTicks={() => null}
      />
    );
  };

  // InputToolbar'ı tamamen kontrollü component olarak render et
  // GiftedChat'in state'ini tamamen bypass ediyoruz
  const renderInputToolbar = useCallback((props) => {
    const handleTextChange = (text) => {
      // Loading durumunda input'u devre dışı bırak
      if (loading) return;
      
      // Sadece kendi state'imizi güncelle - GiftedChat'in onChangeText'ini çağırma
      // Çünkü GiftedChat'in state yönetimi bizimkini bozuyor
      setInputText(text);
      inputTextRef.current = text;
    };

    const handleSend = () => {
      // Loading durumunda göndermeyi engelle
      if (loading) return;
      
      // State'ten güncel değeri al - inputText her zaman güncel çünkü callback yeniden oluşturuluyor
      const textToSend = inputText.trim();
      if (textToSend && props.onSend) {
        props.onSend([{ 
          _id: Date.now(), 
          text: textToSend, 
          user: { _id: 1 },
          createdAt: new Date(),
        }]);
        // Input'u temizle
        setInputText('');
        inputTextRef.current = '';
      }
    };

    // SADECE kendi state'imizi kullan - GiftedChat'in text prop'unu TAMAMEN ignore et
    // inputText state'i kullanıyoruz çünkü callback inputText değiştiğinde yeniden oluşturuluyor
    const displayText = inputText;

    return (
      <View
        style={{
          backgroundColor: "transparent",
          borderTopWidth: 0,
          paddingHorizontal: 16,
          paddingVertical: 8,
          paddingBottom: Platform.OS === "ios" ? 16 : 12,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "center",
          minHeight: 60,
        }}
        pointerEvents="box-none"
      >
        <TextInput
          ref={composerRef}
          value={displayText}
          onChangeText={handleTextChange}
          placeholder={loading ? t('chat.aiThinkingPlaceholder') : (props.placeholder || t('chat.typeMessage'))}
          placeholderTextColor={colors.textTertiary}
          style={{
            fontSize: 14,
            lineHeight: 20,
            paddingHorizontal: 16,
            paddingVertical: Platform.OS === 'ios' ? 10 : 8,
            borderRadius: 22,
            marginRight: 8,
            minHeight: 44,
            maxHeight: 100,
            borderWidth: 1,
            flex: 1,
            color: colors.textPrimary,
            backgroundColor: loading ? colors.cardDisabled || colors.card : colors.card,
            borderColor: colors.border,
            textAlignVertical: "top",
            opacity: loading ? 0.6 : 1,
          }}
          multiline
          editable={!loading}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          returnKeyType="send"
          enablesReturnKeyAutomatically={true}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading || !inputText.trim()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: loading || !inputText.trim() ? colors.disabled || colors.textTertiary : colors.primary,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 2,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: loading ? 0 : 0.2,
            shadowRadius: 4,
            elevation: loading ? 0 : 2,
            opacity: loading || !inputText.trim() ? 0.5 : 1,
          }}
        >
          <Ionicons name="send" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    );
  }, [inputText, loading, colors.textTertiary, colors.primary, colors.white, colors.textPrimary, colors.card, colors.border, colors.disabled]);

  // textInputStyle'i useMemo ile memoize et - TextInput'ta çalışmayan prop'ları kaldır
  const textInputStyle = useMemo(() => ({
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderRadius: 22,
    marginHorizontal: 8,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    // textAlignVertical Android'de sorun yaratabilir, textInputProps'ta ayarlayalım
    // flex: 1 kaldırıldı - TextInput'ta çalışmaz ve input'u bozar
    // Dinamik renkler
    color: colors.textPrimary,
    backgroundColor: colors.card,
    borderColor: colors.border,
    shadowColor: colors.textPrimary,
    // Input'un tıklanabilir olması için önemli
    width: '100%',
  }), [colors.textPrimary, colors.card, colors.border]);

  const renderSend = (props) => {
    return (
      <Send
        {...props}
        containerStyle={{
          justifyContent: "center",
          alignItems: "center",
          alignSelf: "center",
          marginLeft: 8,
          marginBottom: 2,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Ionicons name="send" size={16} color={colors.white} />
        </View>
      </Send>
    );
  };

  const renderAvatar = (props) => {
    const isUser = props.currentMessage?.user?._id === 1;

    // Eğer kullanıcının avatar'ı varsa onu kullan
    if (props.currentMessage?.user?.avatar) {
      return (
        <Avatar
          {...props}
          imageStyle={{
            width: 24,
            height: 24,
            borderRadius: 12,
          }}
          containerStyle={{
            marginLeft: isUser ? 0 : 6,
            marginRight: isUser ? 6 : 0,
          }}
        />
      );
    }

    // Varsayılan avatar'lar için
    return (
      <Avatar
        {...props}
        imageStyle={{
          width: 24,
          height: 24,
          borderRadius: 12,
        }}
        containerStyle={{
          marginLeft: isUser ? 0 : 6,
          marginRight: isUser ? 6 : 0,
        }}
        renderAvatar={() => (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: isUser ? colors.primary : colors.secondary,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: colors.textPrimary,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Ionicons name="person" size={12} color={colors.white} />
          </View>
        )}
      />
    );
  };

  const renderActions = () => {
    return null; // + butonunu kaldır
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
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: "transparent",
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border + "20",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    backButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 0.5,
    },
    headerTitle: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: "600",
      flex: 1,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 6,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 0.5,
    },
    chatContainer: {
      flex: 1,
      backgroundColor: "transparent",
      pointerEvents: "box-none", // Container tıklanamaz ama child'lar tıklanabilir
    },
    typingIndicator: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      marginHorizontal: 12,
      marginVertical: 6,
      borderRadius: 16,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    typingDots: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 8,
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4,
    },
    typingText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      fontStyle: "italic",
      fontWeight: "400",
      fontSize: 12,
    },
    scrollToBottom: {
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
    },
    scrollToBottomButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
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
      backgroundColor: "rgba(0,0,0,0.25)",
      justifyContent: "center",
      alignItems: "center",
    },
    optionsModalContent: {
      width: "85%",
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
      fontWeight: "600",
      marginBottom: 16,
      textAlign: "left",
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
      fontWeight: "500",
      marginTop: 16,
      marginBottom: 2,
    },
    iconSelectCircle: {
      width: 38,
      height: 38,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      backgroundColor: "#F3F4F6",
    },
    colorSelectCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F3F4F6",
    },
    optionsModalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
    },
    optionsModalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 4,
    },
    optionsModalButtonCancel: {
      backgroundColor: colors.border,
    },
    optionsModalButtonSave: {
      backgroundColor: colors.primary,
    },
    optionsModalButtonTextCancel: {
      color: colors.textSecondary,
      fontWeight: "600",
      fontSize: 14,
    },
    optionsModalButtonTextSave: {
      color: colors.white,
      fontWeight: "600",
      fontSize: 14,
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
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {currentChat?.title || t('chat.aiAssistant')}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <View
              style={{
                backgroundColor: colors.primary + "15",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                marginRight: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: colors.primary,
                }}
              >
                {t('chat.tokenPerMessage')}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.card,
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: colors.border,
                marginRight: 8,
              }}
            >
              <Image
                source={require("../../assets/images/token.png")}
                style={{ width: 12, height: 12, marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                {tokens}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowOptionsModal(true)}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chatContainer} pointerEvents="box-none">
          <GiftedChat
            messages={chatMessages.map((msg) => ({
              _id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              text: msg.content,
              createdAt: new Date(msg.createdAt),
              isThinking: msg.isThinking || false,
              user: {
                _id: msg.sender === "user" ? 1 : 2,
                name:
                  msg.sender === "user"
                    ? t('chat.user')
                    : currentChat?.title || t('chat.aiAssistant'),
                avatar:
                  msg.sender === "assistant"
                    ? require("../../assets/images/logo.png")
                    : null,
              },
            }))}
            onSend={onSend}
            user={{
              _id: 1,
              name: t('chat.user'),
            }}
            renderBubble={renderBubble}
            renderInputToolbar={renderInputToolbar}
            renderAvatar={renderAvatar}
            placeholder={t('chat.typeMessage')}
            placeholderTextColor={colors.textTertiary}
            loadEarlier={false}
            infiniteScroll
            minComposerHeight={44}
            maxComposerHeight={100}
            multiline={true}
            scrollEnabled={true}
            alwaysShowSend={true}
            scrollToBottom={true}
            keyboardShouldPersistTaps="handled"
            scrollToBottomComponent={() => (
              <View style={styles.scrollToBottom}>
                <View style={styles.scrollToBottomButton}>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color={colors.white}
                  />
                </View>
              </View>
            )}
            isLoadingEarlier={isLoadingEarlier}
            disabled={false}
            renderLoading={() => (
              <View style={styles.typingIndicator}>
                <View style={styles.typingDots}>
                  <View
                    style={[
                      styles.typingDot,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.typingDot,
                      { backgroundColor: colors.primary, opacity: 0.7 },
                    ]}
                  />
                  <View
                    style={[
                      styles.typingDot,
                      { backgroundColor: colors.primary, opacity: 0.4 },
                    ]}
                  />
                </View>
                <Text style={styles.typingText}>{t('chat.aiThinking')}</Text>
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
              <Text style={styles.tokenModalTitle}>{t('chat.tokenInsufficient')}</Text>
              <Text style={styles.tokenModalText}>
                {t('chat.messages.sendTokenRequired', { cost: tokenCost })}
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
                  <Text style={{ color: colors.textPrimary }}>{t('common.cancel')}</Text>
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
                  <Text style={{ color: colors.white }}>{t('chat.getTokens')}</Text>
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
              <Text style={styles.optionsModalTitle}>
                {t('chat.settingsTitle')}
              </Text>

              {/* Başlık */}
              <Text style={styles.optionsModalLabel}>{t('chat.title')}</Text>
              <TextInput
                ref={inputRef}
                value={chatTitleInput}
                onChangeText={setChatTitleInput}
                placeholder={t('chat.chatRoomNamePlaceholder')}
                placeholderTextColor={colors.textTertiary}
                style={styles.optionsModalInput}
                maxLength={40}
                returnKeyType="done"
                onSubmitEditing={handleSaveChatTitle}
              />
              {/* İkon seçici */}
              <Text style={styles.optionsModalLabel}>İkon</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginVertical: 8 }}
              >
                {ICON_OPTIONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    onPress={() => setSelectedIcon(icon.name)}
                    style={[
                      styles.iconSelectCircle,
                      {
                        borderColor:
                          selectedIcon === icon.name
                            ? icon.color
                            : colors.border,
                        backgroundColor:
                          selectedIcon === icon.name
                            ? icon.color + "15"
                            : "transparent",
                      },
                    ]}
                  >
                    <Ionicons name={icon.name} size={20} color={icon.color} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Renk seçici */}
              <Text style={styles.optionsModalLabel}>Renk</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginVertical: 8,
                }}
              >
                {COLOR_OPTIONS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.iconSelectCircle,
                      {
                        borderColor:
                          selectedColor === color ? color : colors.border,
                        backgroundColor:
                          selectedColor === color
                            ? color + "15"
                            : "transparent",
                        marginRight: 8,
                        marginBottom: 8,
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: color,
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.optionsModalButtons}>
                <TouchableOpacity
                  onPress={() => setShowOptionsModal(false)}
                  style={[
                    styles.optionsModalButton,
                    styles.optionsModalButtonCancel,
                  ]}
                >
                  <Text style={styles.optionsModalButtonTextCancel}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveChatTitle}
                  style={[
                    styles.optionsModalButton,
                    styles.optionsModalButtonSave,
                  ]}
                >
                  <Text style={styles.optionsModalButtonTextSave}>{t('common.save')}</Text>
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
