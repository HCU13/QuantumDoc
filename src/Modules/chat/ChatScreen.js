import React, { useState, useCallback, useEffect } from "react";
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
import { useToken } from "../../contexts/TokenContext";
import { useChat } from "../../hooks/useChat";

const TokenInfo = ({ tokens, remainingTokens, colors }) => (
  <View style={{
    minWidth: 56,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
    shadowColor: 'transparent',
  }}>
    <Image source={require('../../assets/images/token.png')} style={{ width: 14, height: 14, marginRight: 5 }} />
    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }}>{remainingTokens}</Text>
  </View>
);

const ChatScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const { 
    currentChat, 
    messages, 
    loading, 
    sendMessage, 
    getAIResponse 
  } = useChat();

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const tokenCost = 1; // Her mesaj için token maliyeti
  const remainingTokens = tokens - tokenCost;

  // Chat ID'yi route'dan al veya yeni oluştur
  const chatId = route.params?.chatId || currentChat?.id;

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
      
      // Token kullan
      await useTokens(tokenCost);
      
      // AI yanıtını al
      await getAIResponse(chatId, userMessage.text);
      
    } catch (error) {
      console.error("Mesaj gönderilemedi:", error);
    } finally {
      setIsTyping(false);
    }
  }, [chatId, remainingTokens, sendMessage, getAIResponse, useTokens]);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
          },
          left: {
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : colors.card,
          },
        }}
        textStyle={{
          right: {
            color: colors.textOnPrimary,
          },
          left: {
            color: colors.textPrimary,
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    const inputBackgroundColor = isDark ? colors.card : colors.white;
    
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: inputBackgroundColor,
          borderTopColor: colors.border,
          paddingHorizontal: 10,
          marginBottom: 0,
        }}
        primaryStyle={{ alignItems: "center" }}
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
          marginLeft: 10,
        }}
      >
        <Ionicons
          name="send"
          size={24}
          color={remainingTokens >= 0 ? colors.primary : colors.textTertiary}
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
          width: 32,
          height: 32,
          borderRadius: 16,
        }}
        containerStyle={{
          marginLeft: isUser ? 0 : 8,
          marginRight: isUser ? 8 : 0,
        }}
        renderAvatar={() => (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: isUser ? colors.primary : colors.secondary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name={isUser ? "person" : "robot"}
              size={16}
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
      paddingVertical: 10,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerTitle: {
      ...FONTS.h3,
      color: colors.textPrimary,
      marginLeft: 10,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
    },
    chatContainer: {
      flex: 1,
    },
    typingIndicator: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    typingText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      fontStyle: "italic",
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
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chatContainer}>
          <GiftedChat
            messages={messages.map(msg => ({
              _id: msg.id || Math.random().toString(),
              text: msg.content,
              createdAt: new Date(msg.createdAt),
              user: {
                _id: msg.sender === 'user' ? 1 : 2,
                name: msg.sender === 'user' ? 'Sen' : 'AI Asistan',
              },
            }))}
            onSend={onSend}
            user={{
              _id: 1,
            }}
            renderBubble={renderBubble}
            renderInputToolbar={renderInputToolbar}
            renderSend={renderSend}
            renderAvatar={renderAvatar}
            placeholder="Mesajınızı yazın..."
            textInputStyle={{
              color: colors.textPrimary,
              fontSize: 16,
            }}
            alwaysShowSend={true}
            scrollToBottom={true}
            infiniteScroll={true}
            isLoadingEarlier={loading}
            renderLoading={() => (
              <View style={styles.typingIndicator}>
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
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ChatScreen;
