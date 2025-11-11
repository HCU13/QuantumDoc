import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TEXT_STYLES, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import ProfileImage from "../../components/common/ProfileImage";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { showToast } from "../../utils/toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import userStorage from "../../utils/userStorage";
import { useLoading } from "../../contexts/LoadingContext";
import AvatarSelector from "../../components/common/AvatarSelector";
import EditProfileModal from "../../components/profile/EditProfileModal";
import ChangePasswordModal from "../../components/profile/ChangePasswordModal";
import DeleteAccountModal from "../../components/profile/DeleteAccountModal";
import { updateUserAvatar, getUserAvatar } from "../../utils/avatarUtils";
import { supabase } from "../../services/supabase";

const AccountInfoScreen = () => {
  const { user: authUser, updateAvatar } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { setLoading: setGlobalLoading } = useLoading();
  const [userData, setUserData] = useState(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
           const [currentAvatar, setCurrentAvatar] = useState(null);

  // AsyncStorage'dan kullanıcı verilerini al
  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await userStorage.getUserData();
        setUserData(data);

        // Avatar'ı yükle
        const avatar = await getUserAvatar(user.id || authUser?.id);
        setCurrentAvatar(avatar);

        // Profiles tablosundan da veri al
        if (authUser?.id) {
          const profileData = await userStorage.getProfileFromDatabase(authUser.id);
          if (profileData) {
            setUserData(prev => ({ ...prev, ...profileData }));
          }
        }
      } catch (error) {
        if (__DEV__) console.error('❌ ACCOUNT INFO: Load user data error:', error);
      }
    };

    loadUserData();
  }, []);

  // Kullanıcı verilerini birleştir
  const user = {
    name: userData?.user_full_name || authUser?.user_metadata?.full_name || t('profile.accountInfo.unknown'),
    username: userData?.user_email?.split('@')[0] || authUser?.email?.split('@')[0] || "kullanici",
    email: userData?.user_email || authUser?.email || t('profile.accountInfo.unknown'),
    phone: userData?.user_phone || authUser?.user_metadata?.phone || t('profile.accountInfo.unknown'),
    lastLogin: userData?.last_login_at ? new Date(userData.last_login_at).toLocaleString('tr-TR') : t('profile.accountInfo.unknown'),
    avatar_url: userData?.avatar_url || null, // Database'den gelen avatar
    avatar_config: userData?.avatar_config || null, // AsyncStorage'dan gelen avatar
    language: userData?.language || "tr",
    theme: userData?.theme || "light",
    subscriptionPlan: userData?.subscription_plan || "free",
    tokens: userData?.tokens || 0,
    createdAt: userData?.user_created_at ? new Date(userData.user_created_at).toLocaleDateString('tr-TR') : null,
    updatedAt: userData?.user_updated_at ? new Date(userData.user_updated_at).toLocaleDateString('tr-TR') : null,
    loginCount: userData?.login_count || 0,
    emailConfirmed: userData?.email_confirmed || false,
    phoneConfirmed: userData?.phone_confirmed || false,
    appVersion: userData?.app_version || "1.0.0",
    deviceInfo: userData?.device_info || "Unknown",
  };

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleEditAvatar = () => {
    setShowAvatarSelector(true);
  };

  const handleAvatarSelect = async (selectedAvatar) => {
    try {
      setGlobalLoading(true, t('profile.accountInfo.updating.avatar'), "profile");

      // Avatar güncelleme işlemini başlat
      const result = await updateAvatar(selectedAvatar);

      if (result) {
        // Başarılı güncelleme
        showToast("success", t('common.success'), t('profile.accountInfo.success.avatar'));

        // Mevcut avatar'ı güncelle
        setCurrentAvatar(selectedAvatar);

        // Kullanıcı verilerini yeniden yükle
        const newUserData = await userStorage.getUserData();
        setUserData(newUserData);
      }
    } catch (error) {
      if (__DEV__) console.error('❌ AVATAR: Avatar update error:', error);
      showToast("error", t('common.error'), error.message || t('profile.accountInfo.error.avatar'));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleEditSave = async (formData) => {
    try {
      setGlobalLoading(true, "Bilgiler güncelleniyor...", "profile");

      // Supabase auth metadata'yı güncelle
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          display_name: formData.name,
          phone: formData.phone,
        }
      });

      if (error) {
        throw error;
      }

      // AsyncStorage'ı güncelle
      const userData = await userStorage.getUserData();
      if (userData) {
        userData.user_full_name = formData.name;
        userData.user_phone = formData.phone;
        await userStorage.updateUserInfo(userData);
      }

      // Profiles tablosunu güncelle
      await supabase
        .from('profiles')
        .update({
          full_name: formData.name,
          display_name: formData.name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser?.id);

      setEditModalVisible(false);
      showToast("success", t('common.success'), t('profile.accountInfo.success.profile'));

      // Kullanıcı verilerini yeniden yükle
      const newUserData = await userStorage.getUserData();
      setUserData(newUserData);

    } catch (error) {
      if (__DEV__) console.error('❌ PROFILE: Update error:', error);
      showToast("error", t('common.error'), error.message || t('profile.accountInfo.error.profile'));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async (password) => {
    try {
      setGlobalLoading(true, "Hesap siliniyor...", "profile");

      // Şifre doğrulama
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authUser?.email,
        password: password
      });

      if (signInError) {
        throw new Error("Şifre hatalı");
      }

      // Hesabı sil
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser?.id);

      if (deleteError) {
        throw deleteError;
      }

      setDeleteModalVisible(false);
      showToast("success", t('common.success'), t('profile.accountInfo.success.accountDeleted'));

      // Logout yap
      setTimeout(() => {
        // AuthContext'teki logout fonksiyonunu çağır
        // Bu kısım AuthContext'ten gelen logout fonksiyonu ile yapılacak
      }, 2000);

    } catch (error) {
      if (__DEV__) console.error('❌ DELETE ACCOUNT: Error:', error);
      showToast("error", t('common.error'), error.message || t('common.error'));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handlePasswordChange = () => {
    setPasswordModalVisible(true);
  };

  const handlePasswordSave = async (formData) => {
    try {
      setGlobalLoading(true, "Şifre güncelleniyor...", "profile");

      // Şifre değiştirme
      const { error } = await supabase.auth.updateUser({
        password: formData.new
      });

      if (error) {
        throw error;
      }

      setPasswordModalVisible(false);
      showToast("success", t('common.success'), t('profile.accountInfo.success.password'));

    } catch (error) {
      if (__DEV__) console.error('❌ PASSWORD: Update error:', error);
      showToast("error", t('common.error'), error.message || t('profile.accountInfo.error.password'));
    } finally {
      setGlobalLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: SPACING.md,

    },
    profileSection: {
      alignItems: "center",
      marginVertical: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    profileImageWrapper: {
      position: "relative",
      marginBottom: SPACING.md,
      ...SHADOWS.medium,
    },
    editIconWrapper: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      borderRadius: BORDER_RADIUS.round,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.background,
      zIndex: 2,
      ...SHADOWS.small,
    },
    nameText: {
      ...TEXT_STYLES.titleLarge,
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
      textAlign: 'center',
    },
    emailText: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.small,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '50',
    },
    lastMenuItem: {
      borderBottomWidth: 0,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemText: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    menuItemSubtitle: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
    },
    chevronIcon: {
      color: colors.textSecondary,
    },
    actionsContainer: {
      marginTop: SPACING.md,
    },
    actionButton: {
      marginBottom: SPACING.sm,
    },
    dangerZone: {
      marginTop: SPACING.xl,
      padding: SPACING.md,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    dangerTitle: {
      ...TEXT_STYLES.titleSmall,
      color: '#EF4444',
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      ...SHADOWS.large,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    modalTitle: {
      ...TEXT_STYLES.titleMedium,
      color: colors.textPrimary,
    },
    closeButton: {
      padding: SPACING.xs,
    },
    modalButtonRow: {
      flexDirection: 'row',
      marginTop: SPACING.md,
      gap: SPACING.sm,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: BORDER_RADIUS.sm,
      gap: 4,
      marginTop: SPACING.xs,
      alignSelf: "flex-start",
    },
    statusText: {
      ...TEXT_STYLES.labelSmall,
      fontWeight: "500",
    },
  });

  const accountItems = [
    {
      id: "name",
      title: t('profile.accountInfo.fields.name'),
      subtitle: user.name,
      icon: "person-outline",
    },
    {
      id: "email",
      title: t('profile.accountInfo.fields.email'),
      subtitle: `${user.email} ${user.emailConfirmed ? "✓" : "⚠️"}`,
      icon: "mail-outline",
      statusColor: user.emailConfirmed ? colors.success : colors.warning,
    },
    {
      id: "phone",
      title: t('profile.accountInfo.fields.phone'),
      subtitle: user.phone,
      icon: "call-outline",
    },
    {
      id: "lastLogin",
      title: t('profile.accountInfo.fields.lastLogin'),
      subtitle: user.lastLogin,
      icon: "time-outline",
    },
    // {
    //   id: "loginCount",
    //   title: "Toplam Giriş",
    //   subtitle: `${user.loginCount} kez`,
    //   icon: "log-in-outline",
    // },
    {
      id: "createdAt",
      title: t('profile.accountInfo.fields.createdAt'),
      subtitle: user.createdAt || t('profile.accountInfo.unknown'),
      icon: "calendar-outline",
    },

  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title={t('profile.accountInfo.title')} showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profil Bölümü */}
          <View style={styles.profileSection}>
            <TouchableOpacity
              onPress={handleEditAvatar}
              accessibilityLabel={t('profile.accountInfo.editAvatar')}
              style={styles.profileImageWrapper}
              activeOpacity={0.7}
            >
              <ProfileImage user={user} size={80} showBorder={false} />
              <View style={styles.editIconWrapper}>
                <Ionicons name="happy" size={16} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.nameText}>
              {user.name}
            </Text>
            <Text style={styles.emailText}>
              {user.email}
            </Text>
          </View>

          {/* Hesap Bilgileri */}
          <View style={styles.card}>
            {accountItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.menuItem,
                  index === accountItems.length - 1 && styles.lastMenuItem,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>
                    {item.id === "email" ? (
                      <>
                        {user.email}{" "}
                        <Text style={{
                          color: user.emailConfirmed ? colors.success : colors.warning,
                          fontWeight: 'bold',
                          fontSize: 16
                        }}>
                          {user.emailConfirmed ? "✓" : "⚠️"}
                        </Text>
                      </>
                    ) : (
                      item.subtitle
                    )}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Eylem Butonları */}
          <View style={styles.actionsContainer}>
            <Button
              title={t('profile.accountInfo.editProfile')}
              onPress={handleEdit}
              gradient
              icon={<Ionicons name="pencil-outline" size={18} color="#fff" />}
              containerStyle={styles.actionButton}
            />

            <Button
              title={t('profile.accountInfo.changePassword')}
              onPress={handlePasswordChange}
              outlined
              icon={<Ionicons name="lock-closed-outline" size={18} color={colors.primary} />}
              containerStyle={styles.actionButton}
            />
          </View>

          {/* Tehlikeli Bölge */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>{t('profile.accountInfo.dangerZone')}</Text>
            <Button
              title={t('profile.accountInfo.deleteAccount')}
              onPress={handleDeleteAccount}
              icon={<Ionicons name="trash-outline" size={18} color="#fff" />}
              containerStyle={{ backgroundColor: '#EF4444' }}
              textStyle={{ color: '#fff' }}
            />
          </View>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>


        {/* Edit Profile Modal */}
        <EditProfileModal
          visible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          onSave={handleEditSave}
          initialData={{
            name: user.name,
            email: user.email,
            phone: user.phone,
          }}
        />

        {/* Change Password Modal */}
        <ChangePasswordModal
          visible={isPasswordModalVisible}
          onClose={() => setPasswordModalVisible(false)}
          onSave={handlePasswordSave}
        />

        {/* Delete Account Modal */}
        <DeleteAccountModal
          visible={isDeleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onConfirm={handleDeleteConfirm}
        />

        {/* Avatar Selector Modal */}
        <AvatarSelector
          visible={showAvatarSelector}
          onClose={() => setShowAvatarSelector(false)}
          onSelect={handleAvatarSelect}
          currentAvatar={currentAvatar}
          title={t('profile.accountInfo.selectAvatar')}
        />

      </SafeAreaView>
    </GradientBackground>
  );
};

export default AccountInfoScreen;