// HomeScreen.js
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [tokenCount, setTokenCount] = useState(0);

  // Örnek döküman verisi
  const recentDocuments = [
    {
      id: "1",
      title: "Financial Report Q4",
      type: "PDF",
      date: "2h ago",
      status: "analyzed",
      pages: 12,
      insights: 8,
    },
    {
      id: "2",
      title: "Business Proposal",
      type: "DOCX",
      date: "5h ago",
      status: "pending",
      pages: 8,
      insights: 0,
    },
    {
      id: "3",
      title: "Meeting Notes",
      type: "PDF",
      date: "Yesterday",
      status: "analyzed",
      pages: 3,
      insights: 4,
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
          Welcome back 👋
        </Text>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          John Doe
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Profile", {
              screen: "Notifications",
            })
          }
          style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={theme.colors.text}
          />
          <View
            style={[styles.badge, { backgroundColor: theme.colors.primary }]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={[
            styles.avatarButton,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTokenSection = () => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Profile", { screen: "Premium" })}
      style={[styles.tokenCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.tokenInfo}>
        <Ionicons name="flash" size={24} color={theme.colors.warning} />
        <Text style={[styles.tokenCount, { color: theme.colors.text }]}>
          {tokenCount} tokens available
        </Text>
      </View>
      <Text style={[styles.tokenHint, { color: theme.colors.textSecondary }]}>
        Tap to get more tokens
      </Text>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text
        variant="h2"
        style={[styles.sectionTitle, { color: theme.colors.text }]}
      >
        Quick Actions
      </Text>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate("Scan")}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.primary + "15" },
            ]}
          >
            <Ionicons name="scan" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            Scan Document
          </Text>
          <Text
            style={[
              styles.actionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            Scan and process instantly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate("Documents")}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.secondary + "15" },
            ]}
          >
            <Ionicons
              name="cloud-upload"
              size={24}
              color={theme.colors.secondary}
            />
          </View>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            Upload Files
          </Text>
          <Text
            style={[
              styles.actionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            Process documents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate("Analytics")}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.success + "15" },
            ]}
          >
            <Ionicons name="analytics" size={24} color={theme.colors.success} />
          </View>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            View Analytics
          </Text>
          <Text
            style={[
              styles.actionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            See your insights
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentDocuments = () => (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeader}>
        <Text
          variant="h2"
          style={[styles.sectionTitle, { color: theme.colors.text }]}
        >
          Recent Documents
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Documents")}>
          <Text style={{ color: theme.colors.primary }}>See All</Text>
        </TouchableOpacity>
      </View>

      {recentDocuments.map((doc) => (
        <TouchableOpacity
          key={doc.id}
          style={[
            styles.documentCard,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() =>
            navigation.navigate("Documents", {
              screen: "DocumentDetail",
              params: { documentId: doc.id },
            })
          }
        >
          <View style={styles.documentHeader}>
            <View
              style={[
                styles.documentIcon,
                { backgroundColor: theme.colors.primary + "15" },
              ]}
            >
              <Ionicons
                name={doc.type === "PDF" ? "document-text" : "document"}
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.documentInfo}>
              <Text
                style={[styles.documentTitle, { color: theme.colors.text }]}
              >
                {doc.title}
              </Text>
              <Text
                style={[
                  styles.documentMeta,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {doc.type} • {doc.pages} pages • {doc.date}
              </Text>
            </View>
          </View>
          {doc.status === "analyzed" && (
            <View
              style={[
                styles.insightBadge,
                { backgroundColor: theme.colors.success + "15" },
              ]}
            >
              <Ionicons name="bulb" size={16} color={theme.colors.success} />
              <Text
                style={[styles.insightText, { color: theme.colors.success }]}
              >
                {doc.insights} insights found
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {renderHeader()}
        {renderTokenSection()}
        {renderQuickActions()}
        {renderRecentDocuments()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
  },
  tokenCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  tokenCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  tokenHint: {
    fontSize: 14,
  },
  quickActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  actionGrid: {
    gap: 16,
  },
  actionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
  },
  recentSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  documentCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 13,
  },
  insightBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  insightText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
