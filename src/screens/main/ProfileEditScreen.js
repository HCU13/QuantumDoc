import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { showToast } from "../../utils/toast";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebase/FirebaseConfig";
import { Text, Input, Button, Card, Divider, Loading } from "../../components";

const ProfileEditScreen = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLocalization();
  const { section = "profile" } = route.params || {};

  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState(section);

  useEffect(() => {
    // Set active section from route params
    if (section) {
      setActiveSection(section);
    }
  }, [section]);

  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = {};

    if (!displayName.trim()) {
      newErrors.displayName = t("auth.nameRequired") || "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = t("auth.emailRequired") || "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth.invalidEmail") || "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword =
        t("profile.currentPasswordRequired") || "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword =
        t("auth.passwordRequired") || "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword =
        t("auth.passwordTooShort") || "Password must be at least 6 characters";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword =
        t("auth.passwordsDoNotMatch") || "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update profile information
  const handleUpdateProfile = async () => {
    if (validateProfileForm()) {
      try {
        setLoading(true);
        const auth = FIREBASE_AUTH;
        const currentUser = auth.currentUser;

        if (!currentUser) {
          throw new Error("User not authenticated");
        }

        // Update display name in Firebase Auth
        await updateProfile(currentUser, { displayName });

        // Update email if changed
        if (email !== currentUser.email) {
          await updateEmail(currentUser, email);
        }

        // Update Firestore document
        await updateDoc(doc(FIRESTORE_DB, "users", currentUser.uid), {
          displayName,
          email,
          updatedAt: serverTimestamp(),
        });

        showToast(
          "success",
          t("profile.profileUpdated") || "Profile updated successfully"
        );

        // Wait for toast to show before navigating
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      } catch (error) {
        console.error("Error updating profile:", error);
        let errorMessage = "Profile update failed";

        if (error.code === "auth/requires-recent-login") {
          errorMessage = "Please log in again to update your profile";
        } else if (error.code === "auth/email-already-in-use") {
          errorMessage = "Email is already in use";
        }

        setErrors({ general: errorMessage });
        showToast("error", errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (validatePasswordForm()) {
      try {
        setLoading(true);
        const auth = FIREBASE_AUTH;
        const currentUser = auth.currentUser;

        if (!currentUser) {
          throw new Error("User not authenticated");
        }

        // Reauthenticate user first (required for sensitive operations)
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );

        await reauthenticateWithCredential(currentUser, credential);

        // Update password
        await updatePassword(currentUser, newPassword);

        // Clear form fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        showToast(
          "success",
          t("profile.passwordChanged") || "Password changed successfully"
        );

        // Wait for toast to show before navigating
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      } catch (error) {
        console.error("Error changing password:", error);
        let errorMessage = "Password change failed";

        if (error.code === "auth/wrong-password") {
          errorMessage = "Current password is incorrect";
          setErrors({ currentPassword: errorMessage });
        } else if (error.code === "auth/requires-recent-login") {
          errorMessage = "Please log in again to change your password";
          setErrors({ general: errorMessage });
        } else {
          setErrors({ general: errorMessage });
        }

        showToast("error", errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Render header with back button
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={[
          styles.backButton,
          { backgroundColor: isDark ? theme.colors.card : "#F1F5F9" },
        ]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text variant="h3" style={styles.headerTitle}>
        {activeSection === "profile"
          ? t("profile.editProfile") || "Edit Profile"
          : t("profile.changePassword") || "Change Password"}
      </Text>
      <View style={{ width: 40 }} />
    </View>
  );

  // Render section tabs
  const renderTabs = () => (
    <View
      style={[styles.tabContainer, { borderBottomColor: theme.colors.border }]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          activeSection === "profile" && {
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary,
          },
        ]}
        onPress={() => setActiveSection("profile")}
      >
        <Ionicons
          name="person"
          size={20}
          color={
            activeSection === "profile"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
          style={styles.tabIcon}
        />
        <Text
          variant="body2"
          weight={activeSection === "profile" ? "semibold" : "regular"}
          color={
            activeSection === "profile"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        >
          {t("profile.profileInfo") || "Profile Info"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeSection === "password" && {
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary,
          },
        ]}
        onPress={() => setActiveSection("password")}
      >
        <Ionicons
          name="lock-closed"
          size={20}
          color={
            activeSection === "password"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
          style={styles.tabIcon}
        />
        <Text
          variant="body2"
          weight={activeSection === "password" ? "semibold" : "regular"}
          color={
            activeSection === "password"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        >
          {t("profile.password") || "Password"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render profile edit form
  const renderProfileForm = () => (
    <Card style={styles.formCard}>
      {errors.general && (
        <View style={styles.errorContainer}>
          <Text variant="body2" color={theme.colors.error}>
            {errors.general}
          </Text>
        </View>
      )}

      <Input
        label={t("profile.displayName") || "Display Name"}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="John Doe"
        error={!!errors.displayName}
        errorText={errors.displayName}
        leftIcon={
          <Ionicons name="person" size={20} color={theme.colors.primary} />
        }
        style={styles.input}
      />

      <Input
        label={t("auth.email") || "Email"}
        value={email}
        onChangeText={setEmail}
        placeholder="email@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!errors.email}
        errorText={errors.email}
        leftIcon={
          <Ionicons name="mail" size={20} color={theme.colors.primary} />
        }
        style={styles.input}
      />

      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={styles.noteText}
      >
        {t("profile.emailChangeNote") ||
          "If you change your email, you'll need to verify the new email address."}
      </Text>

      <Button
        label={t("common.save") || "Save Changes"}
        onPress={handleUpdateProfile}
        loading={loading}
        gradient={true}
        style={styles.saveButton}
      />
    </Card>
  );

  // Render password change form
  const renderPasswordForm = () => (
    <Card style={styles.formCard}>
      {errors.general && (
        <View style={styles.errorContainer}>
          <Text variant="body2" color={theme.colors.error}>
            {errors.general}
          </Text>
        </View>
      )}

      <Input
        label={t("profile.currentPassword") || "Current Password"}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="••••••••"
        secureTextEntry
        error={!!errors.currentPassword}
        errorText={errors.currentPassword}
        leftIcon={
          <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
        }
        style={styles.input}
      />

      <Divider style={styles.divider} />

      <Input
        label={t("profile.newPassword") || "New Password"}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="••••••••"
        secureTextEntry
        error={!!errors.newPassword}
        errorText={errors.newPassword}
        leftIcon={
          <Ionicons name="key" size={20} color={theme.colors.primary} />
        }
        style={styles.input}
      />

      <Input
        label={t("profile.confirmPassword") || "Confirm New Password"}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="••••••••"
        secureTextEntry
        error={!!errors.confirmPassword}
        errorText={errors.confirmPassword}
        leftIcon={
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.primary}
          />
        }
        style={styles.input}
      />

      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={styles.noteText}
      >
        {t("profile.passwordRequirements") ||
          "Password must be at least 6 characters long and include a mix of letters and numbers for better security."}
      </Text>

      <Button
        label={t("profile.changePassword") || "Change Password"}
        onPress={handleChangePassword}
        loading={loading}
        gradient={true}
        style={styles.saveButton}
      />
    </Card>
  );

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <Loading text={t("common.loading")} fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderTabs()}

          <View style={styles.formContainer}>
            {activeSection === "profile"
              ? renderProfileForm()
              : renderPasswordForm()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
  },
  headerTitle: {
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  tabIcon: {
    marginRight: 6,
  },
  formContainer: {
    padding: 16,
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    marginBottom: 20,
  },
  divider: {
    marginVertical: 16,
  },
  noteText: {
    marginBottom: 20,
    fontStyle: "italic",
  },
  saveButton: {
    marginTop: 8,
  },
});

export default ProfileEditScreen;
