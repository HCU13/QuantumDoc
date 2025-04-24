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

const ChatScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { tokens, useTokens } = useToken();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [remainingTokens, setRemainingTokens] = useState(tokens);
  const [costPerMessage, setCostPerMessage] = useState(1); // Token cost per message

  // If there's an initial query passed through navigation
  const initialQuery = route?.params?.initialQuery || "";

  // Define input background color - will be used for both input and SafeAreaView
  const inputBackgroundColor = isDark ? colors.card : colors.white;

  useEffect(() => {
    setRemainingTokens(tokens);

    // Welcome message
    setMessages([
      {
        _id: 1,
        text: "Merhaba! Ben AI asistanınız. Size nasıl yardımcı olabilirim?",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "AI Asistan",
          avatar: require("../../assets/images/robot.png"),
        },
      },
    ]);

    // If there's an initial query, send it after a short delay
    if (initialQuery) {
      setTimeout(() => {
        handleInitialQuery(initialQuery);
      }, 1000);
    }
  }, []);

  const handleInitialQuery = (query) => {
    const userMessage = {
      _id: messages.length + 1,
      text: query,
      createdAt: new Date(),
      user: {
        _id: 1,
      },
    };

    onSend([userMessage]);
  };

  const onSend = useCallback(
    (messages = []) => {
      // Add user message to chat
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );

      // Simulate AI typing
      simulateTyping();

      // Check if user has enough tokens
      if (remainingTokens < costPerMessage) {
        setTimeout(() => {
          const notEnoughTokensMessage = {
            _id: Math.random().toString(),
            text: "Üzgünüm, yeterli tokenınız kalmadı. Daha fazla token kazanarak sohbete devam edebilirsiniz.",
            createdAt: new Date(),
            user: {
              _id: 2,
              name: "AI Asistan",
              avatar: require("../../assets/images/robot.png"),
            },
          };
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [notEnoughTokensMessage])
          );
          setIsTyping(false);
        }, 1500);
        return;
      }

      // Reduce tokens
      setRemainingTokens((prev) => prev - costPerMessage);
      useTokens(costPerMessage);

      // Generate AI response with delay for realism
      setTimeout(() => {
        const aiMessage = {
          _id: Math.random().toString(),
          text: generateAIResponse(messages[0].text),
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "AI Asistan",
            avatar: require("../../assets/images/robot.png"),
          },
        };

        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [aiMessage])
        );
        setIsTyping(false);
      }, 2000);
    },
    [remainingTokens]
  );

  const simulateTyping = () => {
    setIsTyping(true);
  };

  // Dummy AI response generator - would be replaced with actual API call
  const generateAIResponse = (userMessage) => {
    const responses = [
      "Bu konuda size yardımcı olabilirim. Daha fazla bilgi verebilir misiniz?",
      "İlginç bir soru. Biraz düşünmeme izin verin...",
      "Kesinlikle! İşte bu konuda bildiklerim...",
      "Anladım. Size bu konuda yardımcı olmak için ne yapabilirim?",
      "Bu soruyu yanıtlamak için biraz araştırma yaptım. İşte bulduklarım...",
      "Harika bir soru! İşte cevabım...",
      "Bu konuyu analiz ettim ve şu sonuçlara ulaştım...",
      "Bunu sormakla iyi yaptınız. Size detaylı bir açıklama yapmama izin verin...",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

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
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: inputBackgroundColor,
          borderTopColor: colors.border,
          paddingHorizontal: 10,
          marginBottom: 0, // Remove bottom margin to connect with SafeAreaView
        }}
        primaryStyle={{ alignItems: "center" }}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send
        {...props}
        disabled={
          props.text.trim().length === 0 || remainingTokens < costPerMessage
        }
        containerStyle={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: 4,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor:
              props.text.trim().length === 0 ? colors.gray : colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="send"
            size={20}
            color={
              props.text.trim().length === 0
                ? colors.textTertiary
                : colors.white
            }
          />
        </View>
      </Send>
    );
  };

  const renderAvatar = (props) => {
    return (
      <Avatar
        {...props}
        containerStyle={{ left: { borderWidth: 0 }, right: { borderWidth: 0 } }}
        imageStyle={{ left: { borderWidth: 0 }, right: { borderWidth: 0 } }}
      />
    );
  };

  const renderFooter = () => {
    if (isTyping) {
      return (
        <View style={styles.typingContainer}>
          <View
            style={[
              styles.typingBubble,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : colors.card,
              },
            ]}
          >
            <Text style={[styles.typingText, { color: colors.textSecondary }]}>
              AI düşünüyor...
            </Text>
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View
                style={[
                  styles.dot,
                  { backgroundColor: colors.primary, marginHorizontal: 3 },
                ]}
              />
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradientContainer: {
      flex: 1,
    },
    chatContainer: {
      flex: 1,
    },
    bottomSafeArea: {
      backgroundColor: inputBackgroundColor, // Match input background color
    },
    topBar: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    tokenContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
    },
    tokenText: {
      ...FONTS.body4,
      color: colors.textOnGradient,
      marginLeft: 5,
    },
    tokenIcon: {
      width: 16,
      height: 16,
    },
    typingContainer: {
      padding: 10,
    },
    typingBubble: {
      borderRadius: 15,
      paddingHorizontal: 12,
      paddingVertical: 8,
      maxWidth: "70%",
      flexDirection: "row",
      alignItems: "center",
    },
    typingText: {
      ...FONTS.body4,
      marginRight: 10,
    },
    dotsContainer: {
      flexDirection: "row",
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      opacity: 0.7,
    },
    messageContainer: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 16,
      padding: 15,
      marginBottom: 10,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
      }),
    },
    button: {
      borderRadius: 12,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 4,
          backgroundColor: colors.primary,
        },
      }),
    },
    inputContainer: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 16,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(255, 255, 255, 0.9)",
        },
      }),
    },
  });

  const renderHeader = () => (
    <View style={styles.topBar}>
      <View style={styles.tokenContainer}>
        <Image
          source={require("../../assets/images/token.png")}
          style={styles.tokenIcon}
        />
        <Text style={styles.tokenText}>
          {remainingTokens} / {tokens} token
        </Text>
      </View>
    </View>
  );

  return (
    <GradientBackground style={styles.container}>
      <SafeAreaView />
      <Header title="AI Sohbet" showBackButton />
      {renderHeader()}
      <View style={styles.chatContainer}>
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: 1,
          }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
          renderAvatar={renderAvatar}
          renderFooter={renderFooter}
          alwaysShowSend
          scrollToBottom
          scrollToBottomComponent={() => (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="chevron-down" size={24} color={colors.primary} />
            </View>
          )}
          placeholder="Mesajınızı yazın..."
          textInputStyle={{
            color: colors.textPrimary,
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : colors.white,
            borderRadius: 20,
            paddingHorizontal: 12,
            marginRight: 5,
            marginLeft: 0,
            marginTop: 5,
            ...FONTS.body3,
          }}
          minInputToolbarHeight={60}
        />
        <SafeAreaView style={styles.bottomSafeArea} />
      </View>
    </GradientBackground>
  );
};

export default ChatScreen;
