// AccountSettingsScreen.js
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export const AccountSettingsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [loading, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Burada kullanıcı bilgileri güncellenir
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi");
    } catch (error) {
      Alert.alert("Hata", "Profil güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Hesap Ayarları
        </Text>
        <View style={{ width: 40 }}></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Profil Bilgileri
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Ad Soyad
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Adınız Soyadınız"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Email adresiniz"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Güvenlik
          </Text>

          <Button
            title="Şifre Değiştir"
            onPress={() => {
              /* Şifre değiştirme sayfasına yönlendirme */
              Alert.alert(
                "Bilgi",
                "Şifre değiştirme özelliği yakında eklenecek"
              );
            }}
            type="secondary"
            theme={theme}
            style={styles.button}
          />
        </View>

        <Button
          title={loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          onPress={handleSave}
          disabled={loading}
          theme={theme}
          style={styles.button}
        />

        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: theme.colors.error }]}
          onPress={() => {
            Alert.alert(
              "Hesabı Sil",
              "Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
              [
                { text: "İptal", style: "cancel" },
                {
                  text: "Hesabı Sil",
                  style: "destructive",
                  onPress: async () => {
                    await AsyncStorage.clear();
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Auth" }],
                    });
                  },
                },
              ]
            );
          }}
        >
          <Text style={{ color: theme.colors.error }}>Hesabı Sil</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    marginBottom: 16,
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 16,
  },
});
