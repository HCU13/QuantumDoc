import React, { useState } from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import useTheme from "../../hooks/useTheme";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const CreateChatRoomModal = ({ visible, onClose, onCreate }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");

  const handleCreate = () => {
    if (title.trim().length > 0) {
      onCreate(title.trim());
      setTitle("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Card style={styles.container}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Oda Başlığı</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Başlık girin..."
            autoFocus
            style={{ marginBottom: 16 }}
          />
          <View style={styles.buttonRow}>
            <Button title="Oluştur" onPress={handleCreate} style={{ flex: 1, marginRight: 8 }} />
            <Button title="İptal" onPress={onClose} type="secondary" style={{ flex: 1 }} />
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
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default CreateChatRoomModal; 