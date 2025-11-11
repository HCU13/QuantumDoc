import React, { useState, useEffect } from "react";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../contexts/AuthContext";
import useTheme from "../../hooks/useTheme";
import { Alert, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TEXT_STYLES, SPACING, BORDER_RADIUS } from "../../constants/theme";
import CreateChatRoomModal from "./CreateChatRoomModal";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";

const ChatRoomsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const {
    chats,
    loading,
    createChat,
    loadChats,
    deleteChat,
    deleteMultipleChats,
  } = useChat();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  
  // Loading states
  const [deletingChat, setDeletingChat] = useState(null); // chatId being deleted
  const [deletingMultiple, setDeletingMultiple] = useState(false);

  // Chat'leri yükle
  useEffect(() => {
    if (user?.id) {
      loadChats();
    }
  }, [user?.id, loadChats]);

  const handleRoomPress = (room) => {
    if (room.isNew) {
      setModalVisible(true);
      return;
    }

    // Seçim modundaysa checkbox toggle
    if (selectionMode) {
      toggleSelectChat(room.id);
      return;
    }

    navigation.navigate("ChatDetail", {
      chatId: room.id,
      roomTitle: room.title,
      onMessageSent: () => loadChats(), // Chat listesini güncelle
    });
  };

  // Tek chat silme
  const handleDeleteChat = async (chatId) => {
    Alert.alert(
      t('chat.messages.deleteTitle'),
      t('chat.messages.deleteMessage'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingChat(chatId);
              await deleteChat(chatId);
              Alert.alert(t('common.success'), t('chat.messages.deleteSuccess'));
            } catch (error) {
              Alert.alert(t('common.error'), t('chat.messages.deleteError'));
            } finally {
              setDeletingChat(null);
            }
          },
        },
      ]
    );
  };

  // Çoklu silme
  const handleDeleteSelected = async () => {
    if (selectedChats.length === 0) return;

    Alert.alert(
      t('chat.messages.deleteMultipleTitle'),
      t('chat.messages.deleteMultipleMessage', { count: selectedChats.length }),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingMultiple(true);
              await deleteMultipleChats(selectedChats);
              setSelectedChats([]);
              setSelectionMode(false);
              Alert.alert(t('common.success'), t('chat.messages.deleteMultipleSuccess', { count: selectedChats.length }));
            } catch (error) {
              Alert.alert(t('common.error'), t('chat.messages.deleteError'));
            } finally {
              setDeletingMultiple(false);
            }
          },
        },
      ]
    );
  };

  // Chat seçimi toggle
  const toggleSelectChat = (chatId) => {
    setSelectedChats((prev) => {
      if (prev.includes(chatId)) {
        return prev.filter((id) => id !== chatId);
      } else {
        return [...prev, chatId];
      }
    });
  };

  // Tümünü seç/kaldır
  const toggleSelectAll = () => {
    if (selectedChats.length === chats.length) {
      setSelectedChats([]);
    } else {
      setSelectedChats(chats.map((chat) => chat.id));
    }
  };

  // Seçim modunu iptal et
  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedChats([]);
  };

  const handleCreateRoom = async (title, description, icon, color) => {
    try {
      const newChat = await createChat(title, description, icon, color);
      setModalVisible(false);

      // Yeni chat'e git
      navigation.navigate("ChatDetail", {
        chatId: newChat.id,
        roomTitle: newChat.title,
        onMessageSent: () => loadChats(), // Chat listesini güncelle
      });
    } catch (error) {
      if (__DEV__) console.error("Chat oluşturma hatası:", error);
      Alert.alert("Hata", "Sohbet odası oluşturulamadı");
    }
  };

  // "Yeni Oda" kartını sadece hiç chat yoksa göster
  const data = chats.length === 0 ? [{ isNew: true }] : chats;

  const renderItem = ({ item }) => {
    if (item.isNew) {
      return (
        <TouchableOpacity
          onPress={() => handleRoomPress(item)}
          activeOpacity={0.8}
          style={[styles.newRoomCard, { borderColor: colors.border }]}
        >
          <View
            style={[styles.iconCircle, { backgroundColor: colors.background }]}
          >
            <Ionicons name="add" size={20} color={colors.textSecondary} />
          </View>
          <Text style={[styles.newRoomText, { color: colors.textSecondary }]}>
            {t('chat.newRoom')}
          </Text>
        </TouchableOpacity>
      );
    }
    const isSelected = selectedChats.includes(item.id);

    return (
      <View style={styles.roomCardWrapper}>
        <TouchableOpacity
          onPress={() => handleRoomPress(item)}
          onLongPress={() => {
            setSelectionMode(true);
            toggleSelectChat(item.id);
          }}
          activeOpacity={0.8}
          style={[
            styles.roomCard,
            {
              backgroundColor: colors.card,
              borderColor: isSelected ? colors.primary : colors.border,
              borderWidth: isSelected ? 2 : 1,
            },
          ]}
        >
          {/* Checkbox (seçim modunda) */}
          {selectionMode && (
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : "transparent",
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            </View>
          )}

          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: item.color + "10" },
              ]}
            >
              <Ionicons
                name={item.icon || "chatbubble-ellipses"}
                size={18}
                color={item.color || colors.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[styles.roomTitle, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.lastMessage, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.last_message || t('chat.messages.noMessage')}
              </Text>
              <Text
                style={[styles.lastMessageTime, { color: colors.textTertiary }]}
                numberOfLines={1}
              >
                {item.last_message_at
                  ? new Date(item.last_message_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : new Date(item.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                      day: "2-digit",
                      month: "2-digit",
                    })}
              </Text>
            </View>

            {/* Silme butonu (normal modda) */}
            {!selectionMode && (
              <TouchableOpacity
                onPress={() => handleDeleteChat(item.id)}
                style={styles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={deletingChat === item.id}
              >
                {deletingChat === item.id ? (
                  <ActivityIndicator size="small" color={colors.error || "#FF3B30"} />
                ) : (
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.error || "#FF3B30"}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView
        style={{ flex: 1, paddingTop: Platform.OS === "ios" ? 0 : -10 }}
      >
        <Header
          title={
            selectionMode ? t('chat.messages.selectedCount', { count: selectedChats.length }) : t('chat.title')
          }
          showBackButton={!selectionMode}
          leftIcon={
            selectionMode ? (
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            ) : null
          }
          onLeftPress={selectionMode ? cancelSelection : null}
          rightIcon={
            selectionMode ? null : (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                {chats.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSelectionMode(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )
          }
        />

        {/* Seçim modu toolbar */}
        {selectionMode && (
          <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.toolbarButton, { backgroundColor: colors.card }]}
              onPress={toggleSelectAll}
            >
              <Ionicons
                name={
                  selectedChats.length === chats.length
                    ? "checkbox"
                    : "square-outline"
                }
                size={20}
                color={colors.primary}
              />
              <Text
                style={[
                  styles.toolbarButtonText,
                  { color: colors.textPrimary },
                ]}
              >
                {selectedChats.length === chats.length
                  ? t('chat.messages.deselectAll')
                  : t('chat.messages.selectAll')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toolbarButton,
                styles.deleteToolbarButton,
                {
                  backgroundColor: colors.card,
                  opacity: selectedChats.length === 0 || deletingMultiple ? 0.5 : 1,
                },
              ]}
              onPress={handleDeleteSelected}
              disabled={selectedChats.length === 0 || deletingMultiple}
            >
              {deletingMultiple ? (
                <ActivityIndicator size="small" color={colors.error || "#FF3B30"} />
              ) : (
                <Ionicons
                  name="trash"
                  size={20}
                  color={colors.error || "#FF3B30"}
                />
              )}
              <Text
                style={[
                  styles.toolbarButtonText,
                  { color: colors.error || "#FF3B30" },
                ]}
              >
                {deletingMultiple ? t('chat.deleting') : t('chat.messages.deleteWithCount', { count: selectedChats.length })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={data}
          keyExtractor={(item, idx) => (item.isNew ? `new-${idx}` : item.id)}
          renderItem={renderItem}
          numColumns={1}
          contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          refreshing={loading}
          onRefresh={loadChats}
        />

        <CreateChatRoomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCreate={handleCreateRoom}
          loading={loading}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  roomCardWrapper: {
    position: "relative",
  },
  roomCard: {
    backgroundColor: "#fff",
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    minHeight: 64,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  roomTitle: {
    ...TEXT_STYLES.titleSmall,
    marginBottom: 2,
  },
  lastMessage: {
    ...TEXT_STYLES.bodySmall,
  },
  lastMessageTime: {
    ...TEXT_STYLES.bodySmall,
    fontSize: 10,
    marginTop: 2,
  },
  deleteButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  checkboxContainer: {
    position: "absolute",
    left: SPACING.xs,
    top: SPACING.xs,
    zIndex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SPACING.sm,
    borderBottomWidth: 1,
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deleteToolbarButton: {
    marginLeft: "auto",
  },
  toolbarButtonText: {
    ...TEXT_STYLES.bodySmall,
    marginLeft: SPACING.xs,
    fontWeight: "600",
  },
  newRoomCard: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: SPACING.xs,
  },
  newRoomText: {
    ...TEXT_STYLES.titleSmall,
    fontWeight: "500",
  },
});

export default ChatRoomsScreen;
