import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal } from "react-native";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import ProfileImage from "../../components/common/ProfileImage";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Ionicons } from "@expo/vector-icons";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import CustomToast, { showToast } from "../../components/common/CustomToast";
import { useTranslation } from "react-i18next";

const AccountInfoScreen = () => {
  // Mock kullanıcı verisi
  const [user, setUser] = useState({
    name: "Test Kullanıcı",
    username: "kullaniciadi",
    email: "test@example.com",
    phone: "+90 555 555 55 55",
    lastLogin: "2024-07-07 13:45",
    profileImage: null, // Varsa url
  });
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [editData, setEditData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
  });
  const [errors, setErrors] = useState({});
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleEditPhoto = () => {
    // Profil fotoğrafı düzenleme işlemi
    // ...
  };

  const handleEdit = () => {
    setEditData({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
    setErrors({});
    setEditModalVisible(true);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!editData.name.trim()) newErrors.name = t('profile.nameRequired');
    if (!editData.username.trim()) newErrors.username = t('profile.usernameRequired');
    if (!editData.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(editData.email)) newErrors.email = t('profile.emailInvalid');
    if (!editData.phone.trim()) newErrors.phone = t('profile.phoneRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setUser((prev) => ({ ...prev, ...editData }));
      setEditModalVisible(false);
      setLoading(false);
      showToast({ type: "success", title: t('common.success'), message: t('profile.editSuccess') });
    }, 1200);
  };

  const handleCancel = () => {
    setEditModalVisible(false);
  };

  const handleDeleteAccount = () => {
    setDeletePassword("");
    setDeleteError("");
    setDeleteModalVisible(true);
  };
  const handleDeleteConfirm = () => {
    if (!deletePassword.trim()) {
      setDeleteError("Şifrenizi girin");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDeleteModalVisible(false);
      showToast({ type: "success", title: "Hesap Silindi", message: "Hesabınız başarıyla silindi." });
      // Burada logout veya yönlendirme işlemi yapılabilir
    }, 1200);
  };
  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const handlePasswordChange = () => {
    setPasswordData({ current: "", new: "", confirm: "" });
    setPasswordErrors({});
    setPasswordModalVisible(true);
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.current.trim()) newErrors.current = "Mevcut şifre zorunlu";
    if (!passwordData.new.trim() || passwordData.new.length < 6) newErrors.new = "Yeni şifre en az 6 karakter olmalı";
    if (passwordData.new !== passwordData.confirm) newErrors.confirm = "Şifreler eşleşmiyor";
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSave = () => {
    if (!validatePassword()) return;
    setLoading(true);
    setTimeout(() => {
      setPasswordModalVisible(false);
      setLoading(false);
      showToast({ type: "success", title: "Başarılı", message: "Şifre güncellendi." });
    }, 1200);
  };

  const handlePasswordCancel = () => {
    setPasswordModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Hesap Bilgileri" />
      <ScrollView contentContainerStyle={{ padding: SIZES.padding }}>
        <Card style={styles.infoCard}>
          <View style={styles.profileSection}>
            <TouchableOpacity
              onPress={handleEditPhoto}
              accessibilityLabel="Profil fotoğrafını düzenle"
              style={styles.profileImageWrapper}
              activeOpacity={0.7}
            >
              <ProfileImage user={user} size={90} showBorder style={styles.profileImage} />
              <View style={styles.editIconWrapper}>
                <Ionicons name="pencil" size={18} color={colors.white} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="at-outline" size={18} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Kullanıcı Adı</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>@{user.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Ad Soyad</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>{user.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.label, { color: colors.textSecondary }]}>E-posta</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Telefon</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>{user.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Son Giriş</Text>
            <Text style={[styles.value, { color: colors.textPrimary }]}>{user.lastLogin}</Text>
          </View>
        </Card>
        <Button
          title="Düzenle"
          onPress={handleEdit}
          size="large"
          fluid
          aria-label="Hesap bilgilerini düzenle"
          containerStyle={{ marginTop: 20 }}
        />
        <Button
          title="Şifreyi Değiştir"
          onPress={handlePasswordChange}
          size="large"
          fluid
          aria-label="Şifreyi değiştir"
          containerStyle={{ marginTop: 10 }}
        />
        <Button
          title="Hesabı Sil"
          onPress={handleDeleteAccount}
          size="large"
          fluid
          aria-label="Hesabı sil"
          containerStyle={{ marginTop: 10, marginBottom: 30, backgroundColor: '#EF4444' }}
          textStyle={{ color: '#fff' }}
        />
        <Modal
          visible={isEditModalVisible}
          animationType="fade"
          transparent
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('profile.editTitle')}</Text>
                <TouchableOpacity onPress={handleCancel} accessibilityLabel={t('common.cancel')} style={styles.closeButton}>
                  <Ionicons name="close" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <Input
                label={t('profile.editName')}
                value={editData.name}
                onChangeText={(v) => handleInputChange("name", v)}
                error={errors.name}
                autoCapitalize="words"
                icon={<Ionicons name="person-outline" size={20} color="#8A4FFF" />}
              />
              <Input
                label={t('profile.editUsername')}
                value={editData.username}
                onChangeText={(v) => handleInputChange("username", v)}
                error={errors.username}
                autoCapitalize="none"
                icon={<Ionicons name="at-outline" size={20} color="#8A4FFF" />}
              />
              <Input
                label={t('profile.editEmail')}
                value={editData.email}
                onChangeText={(v) => handleInputChange("email", v)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Ionicons name="mail-outline" size={20} color="#8A4FFF" />}
              />
              <Input
                label={t('profile.editPhone')}
                value={editData.phone}
                onChangeText={(v) => handleInputChange("phone", v)}
                error={errors.phone}
                keyboardType="phone-pad"
                icon={<Ionicons name="call-outline" size={20} color="#8A4FFF" />}
              />
              <View style={styles.modalButtonRow}>
                <Button
                  title={loading ? t('common.loading') : t('profile.save')}
                  onPress={handleSave}
                  fluid
                  disabled={loading}
                  aria-label={t('profile.save')}
                />
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={isPasswordModalVisible}
          animationType="slide"
          transparent
          onRequestClose={handlePasswordCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Şifreyi Değiştir</Text>
                <TouchableOpacity onPress={handlePasswordCancel} accessibilityLabel="Kapat" style={styles.closeButton}>
                  <Ionicons name="close" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <Input
                label="Mevcut Şifre"
                value={passwordData.current}
                onChangeText={(v) => handlePasswordInputChange("current", v)}
                error={passwordErrors.current}
                secureTextEntry
                autoCapitalize="none"
              />
              <Input
                label="Yeni Şifre"
                value={passwordData.new}
                onChangeText={(v) => handlePasswordInputChange("new", v)}
                error={passwordErrors.new}
                secureTextEntry
                autoCapitalize="none"
              />
              <Input
                label="Yeni Şifre (Tekrar)"
                value={passwordData.confirm}
                onChangeText={(v) => handlePasswordInputChange("confirm", v)}
                error={passwordErrors.confirm}
                secureTextEntry
                autoCapitalize="none"
              />
              <View style={styles.modalButtonRow}>
                <Button
                  title="İptal"
                  onPress={handlePasswordCancel}
                  outlined
                  fluid
                  containerStyle={{ marginRight: 8 }}
                  aria-label="Şifre değişikliğini iptal et"
                />
                <Button
                  title={loading ? "Kaydediliyor..." : "Kaydet"}
                  onPress={handlePasswordSave}
                  fluid
                  disabled={loading}
                  aria-label="Şifreyi kaydet"
                />
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={isDeleteModalVisible}
          animationType="fade"
          transparent
          onRequestClose={handleDeleteCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.danger || '#EF4444' }]}>Hesabı Sil</Text>
                <TouchableOpacity onPress={handleDeleteCancel} accessibilityLabel="Kapat" style={styles.closeButton}>
                  <Ionicons name="close" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={{ color: colors.textPrimary, marginBottom: 12, textAlign: 'center' }}>
                Hesabınızı silmek üzeresiniz. Devam etmek için şifrenizi girin.
              </Text>
              <Input
                label="Şifre"
                value={deletePassword}
                onChangeText={setDeletePassword}
                error={deleteError}
                secureTextEntry
                autoCapitalize="none"
              />
              <View style={styles.modalButtonRow}>
                <Button
                  title="İptal"
                  onPress={handleDeleteCancel}
                  outlined
                  fluid
                  containerStyle={{ marginRight: 8 }}
                  aria-label="Silme işlemini iptal et"
                />
                <Button
                  title={loading ? "Siliniyor..." : "Hesabı Sil"}
                  onPress={handleDeleteConfirm}
                  fluid
                  disabled={loading}
                  containerStyle={{ backgroundColor: '#EF4444' }}
                  textStyle={{ color: '#fff' }}
                  aria-label="Hesabı sil"
                />
              </View>
            </View>
          </View>
        </Modal>
        <CustomToast />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImageWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    // Ekstra stil gerekirse
  },
  editIconWrapper: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: '#8A4FFF',
    borderRadius: 12,
    padding: 2,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  nameText: {
    ...FONTS.h2,
    fontWeight: "bold",
    marginBottom: 2,
  },
  infoCard: {
    marginTop: 10,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  infoIcon: {
    marginRight: 8,
  },
  label: {
    ...FONTS.body4,
    fontWeight: "500",
    minWidth: 100,
  },
  value: {
    ...FONTS.body4,
    fontWeight: "bold",
    textAlign: "right",
    flex: 1,
  },
  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    ...FONTS.h3,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
});

export default AccountInfoScreen;