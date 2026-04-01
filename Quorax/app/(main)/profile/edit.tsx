import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import { UserInitials } from "@/components/common/UserInitials";
import { BORDER_RADIUS, SHADOWS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/services/supabase";
import { showSuccess } from "@/utils/toast";

export default function EditProfileScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile, updateProfile, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (profile || user) {
      setFormData({
        name: profile?.full_name || profile?.display_name || "",
        email: user?.email || "",
        phone: profile?.phone || "",
      });
    }
  }, [profile, user]);

  useEffect(() => {
    Animated.timing(passwordAnim, {
      toValue: showPassword ? 1 : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [showPassword]);

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = t("profile.edit.errors.nameRequired");
    if (!formData.email.trim()) newErrors.email = t("auth.register.errors.emailRequired");
    else if (!validateEmail(formData.email)) newErrors.email = t("auth.register.errors.emailInvalid");
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const result = await updateProfile({
        full_name: formData.name.trim(),
        display_name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
      });
      if (!result.success) {
        Alert.alert(t("common.error"), result.error || t("profile.edit.errors.updateFailed"));
        return;
      }
      showSuccess(t("common.success"), t("profile.edit.success"));
      await refreshUser();
      router.back();
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("profile.edit.errors.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!passwordData.current.trim()) newErrors.current = t("profile.edit.password.errors.currentRequired");
    if (!passwordData.new.trim()) newErrors.new = t("profile.edit.password.errors.newRequired");
    else if (passwordData.new.length < 6) newErrors.new = t("auth.login.errors.passwordMinLength");
    if (!passwordData.confirm.trim()) newErrors.confirm = t("profile.edit.password.errors.confirmRequired");
    else if (passwordData.new !== passwordData.confirm) newErrors.confirm = t("profile.edit.password.errors.passwordsDontMatch");
    setPasswordErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setPasswordLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: passwordData.current,
      });
      if (signInError) {
        setPasswordErrors({ current: t("profile.edit.password.errors.currentInvalid") });
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: passwordData.new });
      if (error) throw error;
      Alert.alert(t("common.success"), t("profile.edit.password.success"));
      setPasswordData({ current: "", new: "", confirm: "" });
      setShowPassword(false);
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("profile.edit.password.errors.updateFailed"));
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ModuleHeader title={t("profile.edit.title")} />
        <View style={styles.center}>
          <Ionicons name="lock-closed" size={48} color={colors.textTertiary} />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>
            {t("profile.edit.loginRequired")}
          </Text>
        </View>
      </View>
    );
  }

  const passwordHeight = passwordAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 380] });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ModuleHeader title={t("profile.edit.title")} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Initials */}
        <View style={styles.hero}>
          <UserInitials name={formData.name} email={formData.email} size={72} />
          <Text style={[styles.heroName, { color: colors.textPrimary }]}>
            {formData.name || t("profile.guest")}
          </Text>
        </View>

        {/* Form card */}
        <View style={[styles.card, { backgroundColor: colors.card }, SHADOWS.small]}>
          <Input
            label={t("profile.edit.fields.name")}
            value={formData.name}
            onChangeText={(v) => { setFormData({ ...formData, name: v }); setErrors({ ...errors, name: "" }); }}
            placeholder={t("profile.edit.placeholders.name")}
            icon="person-outline"
            error={errors.name}
            autoCapitalize="words"
          />

          <Input
            label={t("profile.edit.fields.email")}
            value={formData.email}
            onChangeText={(v) => { setFormData({ ...formData, email: v }); setErrors({ ...errors, email: "" }); }}
            placeholder={t("profile.edit.placeholders.email")}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            error={errors.email}
            editable={false}
            containerStyle={{ opacity: 0.55 }}
          />

          <Input
            label={t("profile.edit.fields.phone")}
            value={formData.phone}
            onChangeText={(v) => { setFormData({ ...formData, phone: v }); setErrors({ ...errors, phone: "" }); }}
            placeholder={t("profile.edit.placeholders.phone")}
            keyboardType="phone-pad"
            icon="call-outline"
            error={errors.phone}
          />
        </View>

        <Button
          title={t("profile.edit.save")}
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          fullWidth
          icon="checkmark-circle-outline"
          style={styles.saveBtn}
        />

        {/* Şifre değiştir */}
        <TouchableOpacity
          style={[styles.passwordRow, { backgroundColor: colors.card, borderColor: colors.borderSubtle }, SHADOWS.small]}
          onPress={() => { setShowPassword(!showPassword); if (showPassword) { setPasswordData({ current: "", new: "", confirm: "" }); setPasswordErrors({}); } }}
          activeOpacity={0.7}
        >
          <View style={[styles.passwordIcon, { backgroundColor: showPassword ? "#EF444420" : colors.primarySoft }]}>
            <Ionicons name={showPassword ? "close-circle-outline" : "lock-closed-outline"} size={18} color={showPassword ? colors.error : colors.primary} />
          </View>
          <Text style={[styles.passwordRowText, { color: colors.textPrimary }]}>
            {t("profile.edit.changePassword")}
          </Text>
          <Ionicons name={showPassword ? "chevron-up" : "chevron-down"} size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        <Animated.View style={{ maxHeight: passwordHeight, overflow: "hidden" }}>
          {showPassword && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderSubtle, borderWidth: 1 }, SHADOWS.small]}>
              <Input label={t("profile.edit.password.fields.current")} value={passwordData.current} onChangeText={(v) => { setPasswordData({ ...passwordData, current: v }); setPasswordErrors({ ...passwordErrors, current: "" }); }} placeholder={t("profile.edit.password.placeholders.current")} icon="lock-closed-outline" secureTextEntry error={passwordErrors.current} />
              <Input label={t("profile.edit.password.fields.new")} value={passwordData.new} onChangeText={(v) => { setPasswordData({ ...passwordData, new: v }); setPasswordErrors({ ...passwordErrors, new: "" }); }} placeholder={t("profile.edit.password.placeholders.new")} icon="lock-open-outline" secureTextEntry error={passwordErrors.new} />
              <Input label={t("profile.edit.password.fields.confirm")} value={passwordData.confirm} onChangeText={(v) => { setPasswordData({ ...passwordData, confirm: v }); setPasswordErrors({ ...passwordErrors, confirm: "" }); }} placeholder={t("profile.edit.password.placeholders.confirm")} icon="checkmark-circle-outline" secureTextEntry error={passwordErrors.confirm} />
              <Button title={t("profile.edit.password.save")} onPress={handlePasswordSave} loading={passwordLoading} disabled={passwordLoading} fullWidth icon="checkmark" style={{ marginTop: SPACING.xs }} />
            </View>
          )}
        </Animated.View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingTop: SPACING.md },
  hero: { alignItems: "center", paddingVertical: SPACING.lg, gap: SPACING.sm },
  heroName: { ...TEXT_STYLES.titleMedium, fontWeight: "700" },
  card: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.sm },
  saveBtn: { marginBottom: SPACING.md },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  passwordIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  passwordRowText: { ...TEXT_STYLES.bodyMedium, fontWeight: "600", flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: SPACING.md },
  centerText: { fontSize: 16, textAlign: "center" },
});
