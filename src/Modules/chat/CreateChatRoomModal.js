import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useTranslation } from "react-i18next";

// Icon ve renk seçenekleri
const ICON_OPTIONS = [
  { name: 'chatbubble-ellipses', color: '#6C63FF' },
  { name: 'chatbubble', color: '#FF6B6B' },
  { name: 'chatbubbles', color: '#4ECDC4' },
  { name: 'chatbox', color: '#45B7D1' },
  { name: 'chatbox-ellipses', color: '#96CEB4' },
  { name: 'chatbubble-outline', color: '#FFEAA7' },
  { name: 'chatbubble-ellipses-outline', color: '#DDA0DD' },
  { name: 'chatbox-outline', color: '#98D8C8' },
];

const COLOR_OPTIONS = [
  '#6C63FF', '#FF6B6B', '#4ECDC4', '#45B7D1', 
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#82E0AA'
];

const CreateChatRoomModal = ({ visible, onClose, onCreate, loading = false }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].name);
  const [selectedColor, setSelectedColor] = useState(ICON_OPTIONS[0].color);

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('chat.messages.createError'));
      return;
    }
    
    if (title.trim().length < 3) {
      Alert.alert(t('common.error'), t('chat.messages.createMinLength'));
      return;
    }

    onCreate(title.trim(), t('chat.newChatRoomDescription'), selectedIcon, selectedColor);
    setTitle("");
    setSelectedIcon(ICON_OPTIONS[0].name);
    setSelectedColor(ICON_OPTIONS[0].color);
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setSelectedIcon(ICON_OPTIONS[0].name);
      setSelectedColor(ICON_OPTIONS[0].color);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Card style={styles.container}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('chat.newRoom')}</Text>
          
          {/* Başlık */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('chat.roomTitle')}</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder={t('chat.roomTitlePlaceholder')}
            autoFocus
            style={{ marginBottom: 16 }}
            editable={!loading}
          />
          
          {/* İkon seçici */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('chat.selectIcon')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
            {ICON_OPTIONS.map((icon) => (
              <TouchableOpacity
                key={icon.name}
                onPress={() => setSelectedIcon(icon.name)}
                style={[
                  styles.iconSelectCircle,
                  { 
                    borderColor: selectedIcon === icon.name ? icon.color : colors.border,
                    backgroundColor: selectedIcon === icon.name ? icon.color + '15' : 'transparent'
                  }
                ]}
              >
                <Ionicons name={icon.name} size={20} color={icon.color} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Renk seçici */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('chat.selectColor')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
            {COLOR_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorSelectCircle,
                  { 
                    borderColor: selectedColor === color ? color : colors.border,
                    backgroundColor: selectedColor === color ? color + '15' : 'transparent',
                    marginRight: 8,
                    marginBottom: 8
                  }
                ]}
              >
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: color }} />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.buttonRow}>
            <Button 
              title={loading ? t('chat.creating') : t('chat.create')} 
              onPress={handleCreate} 
              style={{ flex: 1, marginRight: 8 }}
              disabled={loading}
              loading={loading}
            />
            <Button 
              title={t('chat.cancel')} 
              onPress={handleClose} 
              type="secondary" 
              style={{ flex: 1 }}
              disabled={loading}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 16,
    padding: 24,
    alignItems: "stretch",
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  iconSelectCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
  },
  colorSelectCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});

export default CreateChatRoomModal; 