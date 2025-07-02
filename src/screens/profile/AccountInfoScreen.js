import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";

const AccountInfoScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState("Arafat Khan");
  const [email, setEmail] = useState("arafat@example.com");
  const [phone, setPhone] = useState("+90 555 123 4567");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Şifre değiştirme state'leri
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 25,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.padding,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginTop: 20,
      marginBottom: 15,
      fontWeight: "bold",
    },
    infoCard: {
      borderRadius: SIZES.radius,
      padding: 20,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoRow: {
      flexDirection: "row",
      marginBottom: 15,
      alignItems: "center",
    },
    infoLabel: {
      ...FONTS.body4,
      color: colors.textSecondary,
      width: 80,
    },
    infoValue: {
      ...FONTS.body3,
      color: colors.textPrimary,
      flex: 1,
    },
    dangerZone: {
      backgroundColor: isDark
        ? "rgba(255, 59, 48, 0.15)"
        : "rgba(255, 59, 48, 0.05)",
      borderRadius: SIZES.radius,
      padding: 20,
      marginTop: 30,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: "rgba(255, 59, 48, 0.3)",
    },
    dangerTitle: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      marginBottom: 10,
    },
    dangerText: {
      ...FONTS.body4,
      color: colors.textPrimary,
      marginBottom: 15,
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    buttonHalf: {
      width: "48%",
    },
    passwordInfoText: {
      ...FONTS.body4,
      color: colors.textSecondary,
      marginTop: 10,
      marginBottom: 15,
    },
  });

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
      Alert.alert("Başarılı", "Hesap bilgileriniz güncellendi.");
    }, 1000);
  };

  const validatePasswords = () => {
    let isValid = true;

    // Mevcut şifre kontrolü
    if (!currentPassword) {
      setCurrentPasswordError("Mevcut şifrenizi girmelisiniz");
      isValid = false;
    } else {
      setCurrentPasswordError("");
    }

    // Yeni şifre kontrolü
    if (!newPassword) {
      setNewPasswordError("Yeni şifrenizi girmelisiniz");
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError("Şifre en az 6 karakter olmalıdır");
      isValid = false;
    } else {
      setNewPasswordError("");
    }

    // Şifre tekrarı kontrolü
    if (!confirmPassword) {
      setConfirmPasswordError("Şifrenizi tekrar girmelisiniz");
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Şifreler eşleşmiyor");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleSavePassword = () => {
    if (validatePasswords()) {
      setPasswordLoading(true);
      // Simulate API call
      setTimeout(() => {
        setPasswordLoading(false);
        setIsChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi.");
      }, 1000);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hesabı Sil",
      "Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Evet, Hesabımı Sil",
          style: "destructive",
          onPress: () => {
            // Handle account deletion
            navigation.navigate("Login");
          },
        },
      ]
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        /> */}

        <Header title="Hesap Bilgileri" showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
            {isEditing ? (
              <>
                <Input
                  label="Ad Soyad"
                  value={name}
                  onChangeText={setName}
                  icon={
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />
                <Input
                  label="E-posta"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  icon={
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />
                <Input
                  label="Telefon"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  icon={
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />
                <View style={styles.buttonsContainer}>
                  <Button
                    title="İptal"
                    outlined
                    onPress={() => setIsEditing(false)}
                    containerStyle={styles.buttonHalf}
                  />
                  <Button
                    title="Kaydet"
                    gradient
                    onPress={handleSave}
                    loading={loading}
                    containerStyle={styles.buttonHalf}
                  />
                </View>
              </>
            ) : (
              <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ad Soyad:</Text>
                  <Text style={styles.infoValue}>{name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>E-posta:</Text>
                  <Text style={styles.infoValue}>{email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Telefon:</Text>
                  <Text style={styles.infoValue}>{phone}</Text>
                </View>
                <Button
                  title="Düzenle"
                  icon={
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color={colors.primary}
                    />
                  }
                  outlined
                  onPress={() => setIsEditing(true)}
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Güvenlik</Text>
            {isChangingPassword ? (
              <>
                <Input
                  label="Mevcut Şifre"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  error={currentPasswordError}
                  icon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />
                <Input
                  label="Yeni Şifre"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  error={newPasswordError}
                  icon={
                    <Ionicons
                      name="key-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />
                <Input
                  label="Yeni Şifre Tekrar"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  error={confirmPasswordError}
                  icon={
                    <Ionicons
                      name="key-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  }
                />
                <Text style={styles.passwordInfoText}>
                  Şifreniz en az 6 karakter uzunluğunda olmalıdır. Güvenliğiniz
                  için güçlü bir şifre seçmenizi öneririz.
                </Text>
                <View style={styles.buttonsContainer}>
                  <Button
                    title="İptal"
                    outlined
                    onPress={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setCurrentPasswordError("");
                      setNewPasswordError("");
                      setConfirmPasswordError("");
                    }}
                    containerStyle={styles.buttonHalf}
                  />
                  <Button
                    title="Şifreyi Değiştir"
                    gradient
                    onPress={handleSavePassword}
                    loading={passwordLoading}
                    containerStyle={styles.buttonHalf}
                  />
                </View>
              </>
            ) : (
              <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Şifre:</Text>
                  <Text style={styles.infoValue}>••••••••</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Son Giriş:</Text>
                  <Text style={styles.infoValue}>23 Nisan 2025, 14:30</Text>
                </View>
                <Button
                  title="Şifre Değiştir"
                  icon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={colors.primary}
                    />
                  }
                  outlined
                  onPress={() => setIsChangingPassword(true)}
                />
              </View>
            )}
          </View>

          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Tehlikeli Bölge</Text>
            <Text style={styles.dangerText}>
              Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak silinir ve
              geri alınamaz.
            </Text>
            <Button
              title="Hesabı Sil"
              onPress={handleDeleteAccount}
              containerStyle={{ backgroundColor: "rgba(255, 59, 48, 0.8)" }}
              textStyle={{ color: "#fff" }}
              icon={<Ionicons name="trash-outline" size={18} color="#fff" />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default AccountInfoScreen;
