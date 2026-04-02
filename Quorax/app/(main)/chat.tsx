import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { MinimalUsageBadge } from "@/components/common/MinimalUsageBadge";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import { PremiumModal } from "@/components/common/PremiumModal";
import { BORDER_RADIUS, SHADOWS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase, TABLES } from "@/services/supabase";
import { showWarning } from "@/utils/toast";

const DEFAULT_CHAT_ICON = "chatbubble-ellipses" as const;

interface Chat {
  id: string;
  title: string;
  color: string;
  lastMessage?: string;
  lastMessageTime?: string;
  last_message_at?: string;
}

const CHAT_COLORS = [
  "#8B5CF6", "#10B981", "#3B82F6", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#A855F7",
];


export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile, isLoggedIn } = useAuth();
  const { checkUsageLimit, isPremium, logUsage } = useSubscription();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(CHAT_COLORS[0]);

  // Load chats from Supabase
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      loadChats();
    } else {
      setChats([]);
      setLoading(false);
    }
  }, [isLoggedIn, user?.id]);

  // Refresh chats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn && user?.id) {
        loadChats();
        if (!isPremium) {
          checkUsageLimit('chat').then((data) => {
            if (data) setUsageInfo(data);
          }).catch(() => {});
        } else {
          setUsageInfo(null);
        }
      }
    }, [isLoggedIn, user?.id, isPremium])
  );

  // Free kullanıcı için günlük kullanım bilgisini ilk yükleme
  useEffect(() => {
    if (isLoggedIn && !isPremium && user?.id) {
      checkUsageLimit('chat').then((data) => {
        if (data) setUsageInfo(data);
      }).catch(() => {});
    } else if (isPremium) {
      setUsageInfo(null);
    }
  }, [isLoggedIn, isPremium, user?.id]);


  const loadChats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(TABLES.CHATS)
        .select("*")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false, nullsLast: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedChats: Chat[] = (data || []).map((chat: any) => ({
        id: chat.id,
        title: chat.title,
        color: chat.color || CHAT_COLORS[0],
        lastMessage: chat.last_message || undefined,
        lastMessageTime: chat.last_message_at || undefined,
        last_message_at: chat.last_message_at,
      }));

      setChats(formattedChats);
    } catch (error: any) {
      console.error("Error loading chats:", error);
      Alert.alert(t("common.error"), error.message || t("chat.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    if (!newChatTitle.trim() || !user?.id) return;

    try {
      setCreating(true);

      // ✅ Check usage limit before creating chat
      if (!isPremium) {
        const usage = await checkUsageLimit('chat');
        if (usage && !usage.allowed) {
          setUsageInfo(usage);
          setShowPremiumModal(true);
          setCreating(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from(TABLES.CHATS)
        .insert({
          user_id: user.id,
          title: newChatTitle.trim(),
          color: selectedColor,
          last_message: t("chat.newChatStarted"),
        })
        .select()
        .single();

      if (error) throw error;

      // Log usage for chat creation
      await logUsage('chat', 'create_chat', 0, 0, {
        chat_id: data.id,
        chat_title: newChatTitle.trim(),
      });

      // Log activity
      await supabase.from(TABLES.USER_ACTIVITIES).insert({
        user_id: user.id,
        activity_type: "chat",
        title: t("chat.newChatStarted"),
        description: newChatTitle.trim(),
        metadata: {
          chatId: data.id,
          chatTitle: newChatTitle.trim(),
        },
      });

    setNewChatTitle("");
    setShowNewChatModal(false);
      
      // Refresh chat list to show the new chat
      await loadChats();
      
      router.push(`/(main)/chat/${data.id}`);
    } catch (error: any) {
      console.error("Error creating chat:", error);
      Alert.alert(t("common.error"), error.message || t("chat.errors.createFailed"));
    } finally {
      setCreating(false);
    }
  };

  const handleChatPress = (chat: Chat) => {
    router.push(`/(main)/chat/${chat.id}`);
  };

  const handleDeleteChat = async (chatId: string, chatTitle: string) => {
    Alert.alert(
      t("chat.delete.title"),
      t("chat.delete.message", { title: chatTitle }),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingChatId(chatId);

              // Delete related user_activities
              const { error: activitiesError } = await supabase
                .from(TABLES.USER_ACTIVITIES)
                .delete()
                .eq("user_id", user!.id)
                .eq("activity_type", "chat")
                .filter("metadata->>chatId", "eq", chatId);

              if (activitiesError) {
                console.warn("Error deleting related activities:", activitiesError);
                showWarning(t("common.warning"), t("chat.delete.activitiesDeleteWarning"));
              }

              // Delete chat (messages will be deleted automatically via CASCADE)
              const { error } = await supabase
                .from(TABLES.CHATS)
                .delete()
                .eq("id", chatId)
                .eq("user_id", user!.id);

              if (error) throw error;

              // Remove from local state
              setChats((prev) => prev.filter((chat) => chat.id !== chatId));

              Alert.alert(
                t("common.success"),
                t("chat.delete.success")
              );
            } catch (error: any) {
              console.error("Error deleting chat:", error);
              Alert.alert(
                t("common.error"),
                error.message || t("chat.delete.error")
              );
            } finally {
              setDeletingChatId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <StatusBar style={isDark ? "light" : "dark"} />

      <ModuleHeader
        title={t("modules.chat.title")}
        modulePrimary={colors.moduleChatPrimary}
        moduleLight={colors.moduleChatLight}
        onBackPress={() => router.canDismiss() ? router.dismiss() : router.replace("/(main)")}
        rightAction={
          isLoggedIn && !isPremium && usageInfo ? (
            <MinimalUsageBadge
              used={usageInfo.used}
              limit={usageInfo.limit}
              modulePrimary={colors.moduleChatPrimary}
            />
          ) : undefined
        }
      />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !isLoggedIn ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="lock-closed-outline"
              size={64}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {t("modules.locked")}
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              {t("profile.loginToContinue")}
            </Text>
            <Button
              title={t("profile.login")}
              onPress={() => router.push("/(main)/login")}
              style={{ marginTop: SPACING.lg }}
              modulePrimary={colors.primary}
            />
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {t("chat.empty.title")}
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              {t("chat.empty.description")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chatItem,
                  { backgroundColor: colors.card },
                  SHADOWS.subtle,
                ]}
                onPress={() => handleChatPress(item)}
                activeOpacity={0.7}
                disabled={deletingChatId === item.id}
              >
                {/* Left accent bar */}
                <View style={[styles.accentBar, { backgroundColor: item.color }]} />

                {/* Icon */}
                <View style={[styles.chatIconContainer, { backgroundColor: `${item.color}18` }]}>
                  <Ionicons name={DEFAULT_CHAT_ICON} size={22} color={item.color} />
                </View>

                {/* Text content */}
                <View style={styles.chatInfo}>
                  <Text style={[styles.chatTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.lastMessage && (
                    <Text style={[styles.chatLastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.lastMessage}
                    </Text>
                  )}
                  {item.last_message_at && (
                    <Text style={[styles.chatTime, { color: colors.textTertiary }]}>
                      {new Date(item.last_message_at).toLocaleDateString(undefined, {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </Text>
                  )}
                </View>

                {/* Right actions */}
                <View style={styles.chatActions}>
                  <TouchableOpacity
                    style={[styles.deleteBtn, { backgroundColor: `${colors.error || "#EF4444"}15` }]}
                    onPress={() => handleDeleteChat(item.id, item.title)}
                    disabled={deletingChatId === item.id}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {deletingChatId === item.id ? (
                      <ActivityIndicator size="small" color={colors.error || "#EF4444"} />
                    ) : (
                      <Ionicons name="trash-outline" size={16} color={colors.error || "#EF4444"} />
                    )}
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} style={{ marginLeft: SPACING.xs }} />
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.chatList}
          />
        )}

        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.moduleChatPrimary,
            },
            SHADOWS.small,
          ]}
          onPress={() => setShowNewChatModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={colors.textOnPrimary} />
        </TouchableOpacity>
      </View>

      {/* New Chat Modal */}
      <Modal
        visible={showNewChatModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
              },
              SHADOWS.small,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {t("chat.newChatModal.title")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowNewChatModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Title Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                  {t("chat.newChatModal.titleLabel")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.textPrimary,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                  placeholder={t("chat.newChatModal.titlePlaceholder")}
                  placeholderTextColor={colors.textTertiary}
                  value={newChatTitle}
                  onChangeText={setNewChatTitle}
                />
              </View>

              {/* Color Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                  {t("chat.newChatModal.colorLabel")}
                </Text>
                <View style={styles.colorGrid}>
                  {CHAT_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        {
                          backgroundColor: color,
                          borderColor: selectedColor === color ? colors.textPrimary : "transparent",
                          borderWidth: selectedColor === color ? 3 : 0,
                        },
                      ]}
                      onPress={() => setSelectedColor(color)}
                      activeOpacity={0.7}
                    >
                      {selectedColor === color && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                variant="secondary"
                title={t("common.cancel")}
                onPress={() => setShowNewChatModal(false)}
              />
              <Button
                variant="primary"
                title={t("chat.newChatModal.create")}
                onPress={handleCreateChat}
                disabled={!newChatTitle.trim() || creating}
                loading={creating}
                modulePrimary={colors.moduleChatPrimary}
              />
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        moduleType="chat"
        usageInfo={usageInfo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  fab: {
    position: "absolute",
    right: SPACING.xl,
    bottom: SPACING.xl + SPACING.md,
    width: 64,
    height: 64,
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    ...TEXT_STYLES.titleMedium,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    ...TEXT_STYLES.bodyMedium,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },
  chatList: {
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: "hidden",
    paddingVertical: SPACING.md,
    paddingRight: SPACING.md,
  },
  accentBar: {
    width: 4,
    height: "60%",
    borderRadius: 2,
    marginHorizontal: SPACING.sm,
    alignSelf: "center",
  },
  chatIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
    flexShrink: 0,
  },
  chatInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  chatTitle: {
    ...TEXT_STYLES.titleSmall,
    marginBottom: 2,
  },
  chatLastMessage: {
    ...TEXT_STYLES.bodySmall,
    marginBottom: 2,
  },
  chatTime: {
    fontSize: 11,
    marginTop: 1,
  },
  chatActions: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "90%",
    paddingBottom: SPACING.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    ...TEXT_STYLES.titleLarge,
    fontWeight: "600",
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TEXT_STYLES.labelMedium,
    marginBottom: SPACING.sm,
  },
  input: {
    ...TEXT_STYLES.bodyMedium,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  modalFooter: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
