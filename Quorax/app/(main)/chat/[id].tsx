import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Bubble,
    GiftedChat,
    IMessage,
    User,
} from "react-native-gifted-chat";

import { MinimalUsageBadge } from "@/components/common/MinimalUsageBadge";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import { PremiumModal } from "@/components/common/PremiumModal";
import {
    BORDER_RADIUS,
    SHADOWS,
    SPACING,
    TEXT_STYLES,
} from "@/constants/theme";
import { useAd } from "@/contexts/AdContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase, SUPABASE_URL, TABLES } from "@/services/supabase";

export default function ChatDetailScreen() {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, user: authUser, isLoggedIn, refreshUser } = useAuth();
  const { checkUsageLimit, isPremium } = useSubscription();
  const { showAdBeforeAction } = useAd();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  const [inputText, setInputText] = useState("");
  const [inputHeight, setInputHeight] = useState(44);
  const MIN_INPUT_HEIGHT = 44;
  const MAX_INPUT_HEIGHT = 120;

  const [chatData, setChatData] = useState<{
    id: string;
    title: string;
    color: string;
  }>({
    id: id || "",
    title: t("chat.newChat"),
    color: "#8B5CF6",
  });

  // Free kullanıcı için günlük kullanım bilgisini yükle
  useEffect(() => {
    if (isLoggedIn && !isPremium && authUser?.id) {
      checkUsageLimit("chat").then((data) => {
        if (data) setUsageInfo(data);
      });
    } else if (isPremium) {
      setUsageInfo(null);
    }
  }, [isLoggedIn, isPremium, authUser?.id]);

  // Load chat data and messages
  useEffect(() => {
    if (id && isLoggedIn && authUser?.id) {
      loadChatData().then((title) => loadMessages(title));
    } else if (!isLoggedIn) {
      Alert.alert(t("modules.locked"), t("profile.loginToContinue"), [
        { text: t("common.ok"), onPress: () => router.back() },
      ]);
    }
  }, [id, isLoggedIn, authUser?.id]);

  const loadChatData = async (): Promise<string> => {
    if (!id || !authUser?.id) return "";

    try {
      const { data, error } = await supabase
        .from(TABLES.CHATS)
        .select("*")
        .eq("id", id)
        .eq("user_id", authUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setChatData({
          id: data.id,
          title: data.title,
          color: data.color || "#8B5CF6",
        });
        return data.title;
      }
    } catch (error: any) {
      console.error("Error loading chat data:", error);
      Alert.alert(
        t("common.error"),
        error.message || t("chat.errors.loadChatFailed"),
      );
    }
    return "";
  };

  const loadMessages = async (resolvedTitle?: string) => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(TABLES.MESSAGES)
        .select("*")
        .eq("chat_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // GiftedChat expects messages in descending order (newest first)
      // We load in ascending order (oldest first) and then reverse
      const formattedMessages: IMessage[] = (data || [])
        .map((msg: any) => ({
          _id: msg.id,
          text: msg.content,
          createdAt: new Date(msg.created_at),
          user: {
            _id: msg.sender_type === "user" ? 1 : 2,
            name:
              msg.sender_type === "user"
                ? profile?.display_name ||
                  profile?.full_name ||
                  authUser?.email?.split("@")[0] ||
                  t("chat.userFallback")
                : "AI Assistant",
            avatar: msg.sender_type === "user" ? undefined : "ai",
          },
        }))
        .reverse(); // Reverse to get newest first for GiftedChat

      setMessages(formattedMessages);

      // Mesaj yoksa AI karşılama mesajı gönder
      if ((data || []).length === 0) {
        sendGreeting(resolvedTitle);
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
      Alert.alert(
        t("common.error"),
        error.message || t("chat.errors.loadMessagesFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const sendGreeting = async (title?: string) => {
    if (!id || !authUser?.id) return;
    try {
      setIsTyping(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const aiResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/chat-with-claude`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: "__greeting__",
            chatId: id,
            userId: authUser.id,
            userLanguage: i18n.language || "tr",
            isGreeting: true,
            chatTitle: title || chatData.title,
          }),
        }
      );

      if (!aiResponse.ok) return;
      const aiData = await aiResponse.json();
      if (!aiData.message) return;

      const { data: aiMessageData, error: aiError } = await supabase
        .from(TABLES.MESSAGES)
        .insert({
          chat_id: id,
          user_id: authUser.id,
          content: aiData.message,
          sender_type: "assistant",
          message_type: "text",
        })
        .select()
        .single();

      if (aiError) return;

      const greetingMsg: IMessage = {
        _id: aiMessageData.id,
        text: aiData.message,
        createdAt: new Date(aiMessageData.created_at),
        user: { _id: 2, name: "AI Assistant", avatar: "ai" },
      };

      setMessages((prev) => GiftedChat.append(prev, [greetingMsg]));
    } catch (e) {
      // sessizce hata yut, greeting kritik değil
    } finally {
      setIsTyping(false);
    }
  };

  // Typing animation
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isTyping]);

  const doActualSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!id || !authUser?.id || sending || !isLoggedIn) {
        return;
      }

      const userMessage = newMessages[0];
      if (!userMessage?.text?.trim()) {
        return;
      }

      try {
        setSending(true);

        const currentDisplayName =
          profile?.display_name ||
          profile?.full_name ||
          authUser?.email?.split("@")[0] ||
          t("chat.userFallback");

        // Optimistically add user message to UI
        const optimisticUserMessage: IMessage = {
          _id: `temp-${Date.now()}`,
          text: userMessage.text.trim(),
          createdAt: new Date(),
          user: {
            _id: 1,
            name: currentDisplayName,
            avatar: undefined,
          },
        };

        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [optimisticUserMessage]),
        );

        // ✅ Check usage limit before sending message
        if (!isPremium) {
          const usage = await checkUsageLimit("chat");
          if (usage && !usage.allowed) {
            // Remove optimistic message
            setMessages((previousMessages) =>
              previousMessages.filter(
                (msg) => msg._id !== optimisticUserMessage._id,
              ),
            );
            setUsageInfo(usage);
            setShowPremiumModal(true);
            setSending(false);
            return;
          }
        }

        // Save user message to Supabase
        const { data: savedMessage, error: messageError } = await supabase
          .from(TABLES.MESSAGES)
          .insert({
            chat_id: id,
            user_id: authUser.id,
            content: userMessage.text.trim(),
            sender_type: "user",
            message_type: "text",
          })
          .select()
          .single();

        if (messageError) {
          // Remove optimistic message on error
          setMessages((previousMessages) =>
            previousMessages.filter(
              (msg) => msg._id !== optimisticUserMessage._id,
            ),
          );
          throw messageError;
        }

        // Replace optimistic message with real message
        const formattedUserMessage: IMessage = {
          _id: savedMessage.id,
          text: userMessage.text.trim(),
          createdAt: new Date(savedMessage.created_at),
          user: {
            _id: 1,
            name: currentDisplayName,
            avatar: undefined,
          },
        };

        setMessages((previousMessages) => {
          const filtered = previousMessages.filter(
            (msg) => msg._id !== optimisticUserMessage._id,
          );
          return GiftedChat.append(filtered, [formattedUserMessage]);
        });

        // Token deduction is handled by the Edge Function when AI responds
        // No need to deduct tokens here for user message

        // Update chat's last message
        await supabase
          .from(TABLES.CHATS)
          .update({
            last_message: userMessage.text.trim(),
            last_message_at: new Date().toISOString(),
          })
          .eq("id", id);

        // Show typing indicator
        setIsTyping(true);

        try {
          // Get user session for authentication
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            throw new Error("User session not found");
          }

          // Get user language from i18n
          const userLanguage = i18n.language || "tr";

          // Call AI Edge Function
          const aiResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/chat-with-claude`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                message: userMessage.text.trim(),
                chatId: id,
                userId: authUser.id,
                userLanguage: userLanguage,
                category: "tools",
              }),
            },
          );

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            let errorMessage = t("chat.errors.aiFailed");

            try {
              const errorJson = JSON.parse(errorText);
              errorMessage =
                errorJson.message || errorJson.error || errorMessage;
            } catch (e) {
              console.error("AI API Error:", errorText);
            }

            throw new Error(errorMessage);
          }

          const aiData = await aiResponse.json();

          if (aiData.error) {
            throw new Error(aiData.message || aiData.error);
          }

          const aiResponseText = aiData.message;

          // Save AI message to Supabase
          const { data: aiMessageData, error: aiError } = await supabase
            .from(TABLES.MESSAGES)
            .insert({
              chat_id: id,
              user_id: authUser.id,
              content: aiResponseText,
              sender_type: "assistant",
              message_type: "text",
            })
            .select()
            .single();

          if (aiError) {
            console.error("Error saving AI message:", aiError);
            throw aiError;
          }

          // Update chat's last message
          await supabase
            .from(TABLES.CHATS)
            .update({
              last_message: aiResponseText,
              last_message_at: new Date().toISOString(),
            })
            .eq("id", id);

          // Add AI message to local state
          const formattedAiMessage: IMessage = {
            _id: aiMessageData.id,
            text: aiResponseText,
            createdAt: new Date(aiMessageData.created_at),
            user: {
              _id: 2,
              name: "AI Assistant",
              avatar: "ai",
            },
          };

          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [formattedAiMessage]),
          );

          // Close typing indicator AFTER message is added to UI
          setIsTyping(false);

          // Free kullanıcı için kullanım bilgisini güncelle
          if (!isPremium) {
            checkUsageLimit("chat").then((data) => {
              if (data) setUsageInfo(data);
            });
          }
          await refreshUser();
        } catch (aiError: any) {
          console.error("Error getting AI response:", aiError);
          // Close typing indicator on error
          setIsTyping(false);
          Alert.alert(
            t("common.error"),
            aiError.message || t("chat.errors.aiFailed"),
          );
        } finally {
          setSending(false); // Always reset sending state
        }
      } catch (error: any) {
        console.error("Error sending message:", error);
        // Remove optimistic message if still exists
        setMessages((previousMessages) =>
          previousMessages.filter(
            (msg) => !msg._id?.toString().startsWith("temp-"),
          ),
        );
        Alert.alert(
          t("common.error"),
          error.message || t("chat.errors.sendFailed"),
        );
        setIsTyping(false);
        setSending(false);
      }
    },
    [
      id,
      authUser?.id,
      isLoggedIn,
      profile,
      refreshUser,
      i18n,
      t,
      router,
      checkUsageLimit,
      isPremium,
    ],
  );

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      showAdBeforeAction(() => doActualSend(newMessages), "chat");
    },
    [showAdBeforeAction, doActualSend],
  );

  const displayName =
    profile?.display_name ||
    profile?.full_name ||
    authUser?.email?.split("@")[0] ||
    "Kullanıcı";

  const user: User = {
    _id: 1,
    name: displayName,
    avatar: undefined,
  };

  const renderAvatar = (props: any) => {
    const { currentMessage } = props;

    if (!currentMessage || !currentMessage.user) {
      return null;
    }

    // AI Avatar
    if (currentMessage.user._id === 2 || currentMessage.user.avatar === "ai") {
      return (
        <View style={[styles.avatarContainer, styles.aiAvatarContainer]}>
          <LinearGradient
            colors={[chatData.color, `${chatData.color}CC`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiAvatarGradient}
          >
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          </LinearGradient>
        </View>
      );
    }

    // User avatar: her zaman ikon
    if (currentMessage.user._id === 1) {
      return (
        <View style={[styles.avatarContainer, styles.userAvatarContainer]}>
          <View
            style={[styles.fallbackAvatar, { backgroundColor: chatData.color }]}
          >
            <Ionicons name="person" size={18} color="#FFFFFF" />
          </View>
        </View>
      );
    }

    return null;
  };

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: chatData.color,
            marginBottom: SPACING.xs,
            marginRight: SPACING.xs,
            ...SHADOWS.small,
          },
          left: {
            backgroundColor: colors.card,
            marginBottom: SPACING.xs,
            marginLeft: SPACING.xs,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            ...SHADOWS.subtle,
          },
        }}
        textStyle={{
          right: {
            color: colors.textOnPrimary,
            fontSize: 14,
            lineHeight: 20,
          },
          left: {
            color: colors.textPrimary,
            fontSize: 14,
            lineHeight: 20,
          },
        }}
        containerStyle={{
          left: {
            marginLeft: 0,
          },
          right: {
            marginRight: 0,
          },
        }}
      />
    );
  };

  const renderFooter = () => {
    if (!isTyping) return null;

    const dot1Opacity = typingAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1, 0.3],
    });

    const dot2Opacity = typingAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.3, 1],
    });

    const dot3Opacity = typingAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.3, 0.3],
    });

    return (
      <View
        style={[
          styles.typingContainer,
          { backgroundColor: colors.card, borderColor: colors.borderSubtle },
        ]}
      >
        <View style={styles.typingContent}>
          <View
            style={[
              styles.aiAvatarSmall,
              { backgroundColor: `${chatData.color}20` },
            ]}
          >
            <LinearGradient
              colors={[chatData.color, `${chatData.color}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiAvatarGradientSmall}
            >
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.typingDots}>
            <Animated.View
              style={[
                styles.typingDot,
                { opacity: dot1Opacity, backgroundColor: colors.textSecondary },
              ]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                { opacity: dot2Opacity, backgroundColor: colors.textSecondary },
              ]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                { opacity: dot3Opacity, backgroundColor: colors.textSecondary },
              ]}
            />
          </View>
          <Text style={[styles.typingText, { color: colors.textSecondary }]}>
            {t("chat.typing")}
          </Text>
        </View>
      </View>
    );
  };

  const handleSendPress = () => {
    const text = inputText.trim();
    if (!text || sending) return;
    const message: IMessage = {
      _id: `tmp-${Date.now()}`,
      text,
      createdAt: new Date(),
      user: { _id: 1 },
    };
    setInputText("");
    setInputHeight(MIN_INPUT_HEIGHT);
    onSend([message]);
  };

  const renderInputToolbar = () => null;

  const renderCustomInput = () => (
    <View style={[styles.customInputBar, { backgroundColor: colors.background, borderTopColor: colors.borderSubtle }]}>
      <TextInput
        style={[styles.customTextInput, { backgroundColor: colors.backgroundSecondary, color: colors.textPrimary, borderColor: colors.borderSubtle, height: inputHeight }]}
        value={inputText}
        onChangeText={setInputText}
        placeholder=""
        placeholderTextColor={colors.textTertiary}
        multiline
        scrollEnabled
        editable={!sending}
        onContentSizeChange={(e) => {
          const h = e.nativeEvent.contentSize.height;
          setInputHeight(Math.min(Math.max(h + 4, MIN_INPUT_HEIGHT), MAX_INPUT_HEIGHT));
        }}
      />
      <TouchableOpacity
        style={[styles.sendButton, { backgroundColor: inputText.trim() ? chatData.color : colors.borderSubtle }]}
        onPress={handleSendPress}
        disabled={!inputText.trim() || sending}
        activeOpacity={0.8}
      >
        <Ionicons name="send" size={16} color="#fff" style={{ marginLeft: 2 }} />
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="chatbubbles-outline"
          size={64}
          color={colors.textTertiary}
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t("chat.empty.message")}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ModuleHeader
        title={chatData.title}
        modulePrimary={chatData.color}
        moduleLight={`${chatData.color}20`}
        rightAction={
          isLoggedIn && !isPremium && usageInfo ? (
            <MinimalUsageBadge
              used={usageInfo.used}
              limit={usageInfo.limit}
              modulePrimary={chatData.color}
            />
          ) : undefined
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <GiftedChat
              messages={messages}
              onSend={onSend}
              user={user}
              alwaysShowSend
              scrollToBottom
              renderAvatar={renderAvatar}
              renderBubble={renderBubble}
              renderInputToolbar={renderInputToolbar}
              renderEmpty={renderEmpty}
              renderFooter={renderFooter}
              containerStyle={styles.giftedChatContainer}
              messagesContainerStyle={styles.messagesContainer}
              minInputToolbarHeight={0}
              keyboardShouldPersistTaps="handled"
              showUserAvatar={true}
              showAvatarForEveryMessage={true}
              isTyping={isTyping}
              disabled={sending}
            />
            {renderCustomInput()}
          </>
        )}
      </KeyboardAvoidingView>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        usageInfo={usageInfo}
        moduleType="chat"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  giftedChatContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  messagesContainer: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  customInputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === "ios" ? 24 : SPACING.sm,
    gap: SPACING.sm,
  },
  customTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginBottom: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    ...TEXT_STYLES.bodyMedium,
    marginTop: SPACING.md,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  userAvatarContainer: {
    borderWidth: 2,
    borderColor: "transparent",
  },
  aiAvatarContainer: {
    borderWidth: 2,
    borderColor: "transparent",
  },
  aiAvatarGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  aiAvatarGradientSmall: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  fallbackAvatar: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  typingContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.subtle,
  },
  typingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: SPACING.sm,
    overflow: "hidden",
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.xs,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  typingText: {
    ...TEXT_STYLES.bodySmall,
    fontStyle: "italic",
    marginLeft: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
