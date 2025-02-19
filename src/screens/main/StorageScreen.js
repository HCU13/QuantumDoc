// StorageScreen.js
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export const StorageScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedItems, setSelectedItems] = useState([]);

  // Örnek depolama bilgileri
  const storageInfo = {
    total: 5, // GB
    used: 2.4,
    available: 2.6,
  };

  // Örnek döküman kategorileri
  const categories = [
    {
      id: "pdf",
      name: "PDF Documents",
      icon: "document-text",
      size: "1.2 GB",
      count: 45,
      color: theme.colors.primary,
    },
    {
      id: "images",
      name: "Scanned Images",
      icon: "image",
      size: "800 MB",
      count: 128,
      color: theme.colors.secondary,
    },
    {
      id: "reports",
      name: "Analysis Reports",
      icon: "analytics",
      size: "400 MB",
      count: 24,
      color: theme.colors.success,
    },
  ];

  const handleClearData = () => {
    Alert.alert(
      "Clear Data",
      "Are you sure you want to delete selected items? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Silme işlemi burada yapılacak
            setSelectedItems([]);
          },
        },
      ]
    );
  };

  const renderHeader = () => (
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
        Storage
      </Text>
      {selectedItems.length > 0 ? (
        <TouchableOpacity
          style={[
            styles.clearButton,
            { backgroundColor: theme.colors.error + "15" },
          ]}
          onPress={handleClearData}
        >
          <Ionicons name="trash" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}
    </View>
  );

  const renderStorageOverview = () => (
    <View
      style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.storageHeader}>
        <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>
          Storage Usage
        </Text>
        <TouchableOpacity
          style={[
            styles.upgradeButton,
            { backgroundColor: theme.colors.primary + "15" },
          ]}
          onPress={() => navigation.navigate("Premium")}
        >
          <Text style={{ color: theme.colors.primary }}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[styles.progressBar, { backgroundColor: theme.colors.border }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${(storageInfo.used / storageInfo.total) * 100}%`,
              },
            ]}
          />
        </View>
        <View style={styles.storageInfo}>
          <Text style={[styles.usedStorage, { color: theme.colors.text }]}>
            {storageInfo.used} GB used
          </Text>
          <Text
            style={[styles.totalStorage, { color: theme.colors.textSecondary }]}
          >
            of {storageInfo.total} GB
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <Text
        style={[styles.sectionTitle, { color: theme.colors.text }]}
        variant="h2"
      >
        File Categories
      </Text>

      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => {}}
        >
          <View style={styles.categoryLeft}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: category.color + "15" },
              ]}
            >
              <Ionicons name={category.icon} size={24} color={category.color} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                {category.name}
              </Text>
              <Text
                style={[
                  styles.categoryMeta,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {category.count} files • {category.size}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsSection}>
      <Text
        style={[styles.sectionTitle, { color: theme.colors.text }]}
        variant="h2"
      >
        Quick Actions
      </Text>

      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => {}}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.primary + "15" },
            ]}
          >
            <Ionicons
              name="cloud-upload"
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            Backup Data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => {}}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.warning + "15" },
            ]}
          >
            <Ionicons name="archive" size={24} color={theme.colors.warning} />
          </View>
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            Archive Files
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, { backgroundColor: theme.colors.surface }]}
          onPress={handleClearData}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.error + "15" },
            ]}
          >
            <Ionicons name="trash" size={24} color={theme.colors.error} />
          </View>
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            Clear Cache
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => {}}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.success + "15" },
            ]}
          >
            <Ionicons name="download" size={24} color={theme.colors.success} />
          </View>
          <Text style={[styles.actionText, { color: theme.colors.text }]}>
            Download All
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.content}>
        {renderStorageOverview()}
        {renderCategories()}
        {renderActions()}
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    gap: 24,
  },
  overviewCard: {
    padding: 16,
    borderRadius: 12,
  },
  storageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  upgradeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  storageInfo: {
    flexDirection: "row",
    gap: 4,
  },
  usedStorage: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalStorage: {
    fontSize: 14,
  },
  categoriesSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryInfo: {
    gap: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryMeta: {
    fontSize: 13,
  },
  actionsSection: {
    gap: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionItem: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
