// AccountSettingsScreen.js
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, Input } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export const AccountSettingsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 89",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Backend güncelleme işlemleri
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
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
        <Text
          style={[styles.headerTitle, { color: theme.colors.text }]}
          variant="h2"
        >
          Account Settings
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Personal Information
          </Text>

          <Input
            label="Full Name"
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, fullName: text }))
            }
            placeholder="Enter your full name"
            theme={theme}
            icon="person-outline"
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, email: text }))
            }
            placeholder="Enter your email"
            keyboardType="email-address"
            theme={theme}
            icon="mail-outline"
          />

          <Input
            label="Phone"
            value={formData.phone}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, phone: text }))
            }
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            theme={theme}
            icon="call-outline"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Security
          </Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {}}
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Ionicons
                  name="key-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={{ color: theme.colors.text }}>Change Password</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {}}
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: theme.colors.warning + "15" },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={theme.colors.warning}
                />
              </View>
              <Text style={{ color: theme.colors.text }}>
                Two-Factor Authentication
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account
          </Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {}}
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: theme.colors.error + "15" },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.error}
                />
              </View>
              <Text style={{ color: theme.colors.error }}>Delete Account</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <Button
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={saving}
          loading={saving}
          theme={theme}
          style={styles.saveButton}
        />
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  saveButton: {
    height: 50,
  },
});
