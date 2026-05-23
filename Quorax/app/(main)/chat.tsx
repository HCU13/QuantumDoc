import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { PremiumModal } from "@/components/common/PremiumModal";
import {
  HapticPressable,
  InlineFilterChip,
  MinimalHeader,
  MiniFAB,
  SoftSurface,
  SwipeableRow,
} from "@/components/v2";
import { RADIUS_V2, SPACING_V2, TYPE_V2 } from "@/constants/theme";
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
  last_message_at?: string;
}

const CHAT_COLORS = [
  "#8B5CF6", "#10B981", "#3B82F6", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#A855F7",
];

type Filter = "all" | "recent";

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { checkUsageLimit, isPremium, logUsage } = useSubscription();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(CHAT_COLORS[0]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (isLoggedIn && user?.id) loadChats();
    else {
      setChats([]);
      setLoading(false);
    }
  }, [isLoggedIn, user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn && user?.id) {
        loadChats();
        if (!isPremium) {
          checkUsageLimit("chat").then((d) => d && setUsageInfo(d)).catch(() => {});
        } else setUsageInfo(null);
      }
    }, [isLoggedIn, user?.id, isPremium]),
  );

  const loadChats = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(TABLES.CHATS)
        .select("*")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      setChats(
        (data || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          color: c.color || CHAT_COLORS[0],
          lastMessage: c.last_message || undefined,
          last_message_at: c.last_message_at,
        })),
      );
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("chat.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    if (!newChatTitle.trim() || !user?.id) return;
    try {
      setCreating(true);
      if (!isPremium) {
        const usage = await checkUsageLimit("chat");
        if (usage?.allowed === false) {
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
      await logUsage("chat", "create_chat", 0, 0, {
        chat_id: data.id,
        chat_title: newChatTitle.trim(),
      });
      setNewChatTitle("");
      setShowNewChatModal(false);
      await loadChats();
      router.push(`/(main)/chat/${data.id}`);
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("chat.errors.createFailed"));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteChat = (chatId: string, chatTitle: string) => {
    Alert.alert(
      t("chat.delete.title"),
      t("chat.delete.message", { title: chatTitle }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const { error: aErr } = await supabase
                .from(TABLES.USER_ACTIVITIES)
                .delete()
                .eq("user_id", user!.id)
                .eq("activity_type", "chat")
                .filter("metadata->>chatId", "eq", chatId);
              if (aErr) showWarning(t("common.warning"), t("chat.delete.activitiesDeleteWarning"));
              const { error } = await supabase
                .from(TABLES.CHATS)
                .delete()
                .eq("id", chatId)
                .eq("user_id", user!.id);
              if (error) throw error;
              setChats((prev) => prev.filter((c) => c.id !== chatId));
            } catch (error: any) {
              Alert.alert(t("common.error"), error.message || t("chat.delete.error"));
            }
          },
        },
      ],
    );
  };

  const filtered = useMemo(() => {
    if (filter === "recent") {
      const week = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      return chats.filter(
        (c) => c.last_message_at && now - new Date(c.last_message_at).getTime() < week,
      );
    }
    return chats;
  }, [chats, filter]);

  return (
    <SoftSurface tone="module" moduleColor={colors.moduleChatPrimary}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <MinimalHeader
        title={t("modules.chat.title")}
        subtitle={
          !isPremium && usageInfo
            ? t("home.usageFormat", {
                defaultValue: "{{remaining}} left today",
                remaining: usageInfo.limit - usageInfo.used,
              })
            : undefined
        }
        accent={colors.moduleChatPrimary}
      />

      <InlineFilterChip<Filter>
        accent={colors.moduleChatPrimary}
        options={[
          { value: "all", label: t("chat.filter.all", { defaultValue: "All" }), count: chats.length },
          { value: "recent", label: t("chat.filter.recent", { defaultValue: "Recent" }) },
        ]}
        selected={filter}
        onChange={setFilter}
      />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.moduleChatPrimary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {t("chat.empty.title")}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t("chat.empty.description")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: SPACING_V2.sm }} />}
            renderItem={({ item }) => (
              <SwipeableRow
                rightAction={{
                  icon: "trash-outline",
                  color: colors.error || "#EF4444",
                  onPress: () => handleDeleteChat(item.id, item.title),
                }}
                onPress={() => router.push(`/(main)/chat/${item.id}`)}
              >
                <View style={styles.itemRow}>
                  <View style={[styles.iconWrap, { backgroundColor: `${item.color}1A` }]}>
                    <Ionicons name={DEFAULT_CHAT_ICON} size={18} color={item.color} />
                  </View>
                  <View style={styles.itemText}>
                    <Text numberOfLines={1} style={[styles.title, { color: colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    {item.lastMessage ? (
                      <Text numberOfLines={1} style={[styles.preview, { color: colors.textSecondary }]}>
                        {item.lastMessage}
                      </Text>
                    ) : null}
                    {item.last_message_at ? (
                      <Text style={[styles.time, { color: colors.textTertiary }]}>
                        {new Date(item.last_message_at).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </SwipeableRow>
            )}
          />
        )}

        <MiniFAB
          icon="add"
          color={colors.moduleChatPrimary}
          onPress={() => setShowNewChatModal(true)}
        />
      </View>

      <Modal
        visible={showNewChatModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {t("chat.newChatModal.title")}
                </Text>
                <HapticPressable
                  haptic="light"
                  onPress={() => setShowNewChatModal(false)}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </HapticPressable>
              </View>

              <ScrollView style={styles.modalBody}>
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

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    {t("chat.newChatModal.colorLabel")}
                  </Text>
                  <View style={styles.colorGrid}>
                    {CHAT_COLORS.map((color) => (
                      <HapticPressable
                        haptic="selection"
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                          styles.colorOption,
                          {
                            backgroundColor: color,
                            borderColor:
                              selectedColor === color ? colors.textPrimary : "transparent",
                            borderWidth: selectedColor === color ? 3 : 0,
                          },
                        ]}
                      >
                        {selectedColor === color ? (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        ) : null}
                      </HapticPressable>
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

      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        moduleType="chat"
        usageInfo={usageInfo}
      />
    </SoftSurface>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: SPACING_V2.lg, paddingTop: SPACING_V2.sm },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING_V2.xl,
    gap: SPACING_V2.md,
  },
  emptyTitle: { ...TYPE_V2.title, marginTop: SPACING_V2.md },
  emptyDesc: { ...TYPE_V2.body, textAlign: "center" },
  list: { paddingBottom: 120, paddingTop: SPACING_V2.xs },
  itemRow: { flexDirection: "row", alignItems: "center", gap: SPACING_V2.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS_V2.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: "600", letterSpacing: -0.1 },
  preview: { fontSize: 13, fontWeight: "400" },
  time: { fontSize: 11, marginTop: 2, fontWeight: "500" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: RADIUS_V2.lg,
    borderTopRightRadius: RADIUS_V2.lg,
    maxHeight: "90%",
    paddingBottom: SPACING_V2.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING_V2.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: { ...TYPE_V2.title },
  modalBody: { padding: SPACING_V2.lg },
  inputGroup: { marginBottom: SPACING_V2.lg },
  inputLabel: { ...TYPE_V2.label, marginBottom: SPACING_V2.sm, fontSize: 13 },
  input: {
    fontSize: 15,
    padding: SPACING_V2.md,
    borderRadius: RADIUS_V2.sm,
    borderWidth: 1,
  },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING_V2.sm },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: RADIUS_V2.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  modalFooter: {
    flexDirection: "row",
    gap: SPACING_V2.md,
    padding: SPACING_V2.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
});
