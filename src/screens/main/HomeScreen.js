// HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [tokenCount, setTokenCount] = useState(5);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      setDocuments([
        {
          id: "1",
          title: "Invoice",
          type: "PDF",
          date: "Just now",
          icon: "receipt-outline",
        },
        {
          id: "2",
          title: "Meeting Notes",
          type: "DOCX",
          date: "2h ago",
          icon: "document-text-outline",
        },
        {
          id: "3",
          title: "Resume",
          type: "PDF",
          date: "Yesterday",
          icon: "person-outline",
        },
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  const renderHeader = () => (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.headerContent}>
        <View>
          <Text
            style={[styles.welcomeText, { color: theme.colors.textSecondary }]}
          >
            Hello there 👋
          </Text>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            DocAI
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.tokenButton,
              { backgroundColor: theme.colors.primary + "15" },
            ]}
            onPress={() => navigation.navigate("Premium")}
          >
            <Ionicons name="flash" size={18} color={theme.colors.warning} />
            <Text style={[styles.tokenText, { color: theme.colors.primary }]}>
              {tokenCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileButton, { borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate("Profile")}
          >
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate("Scan")}
      >
        <View
          style={[
            styles.actionIcon,
            { backgroundColor: theme.colors.primary + "15" },
          ]}
        >
          <Ionicons
            name="scan-outline"
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <Text style={[styles.actionText, { color: theme.colors.text }]}>
          Scan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate("Documents")}
      >
        <View
          style={[
            styles.actionIcon,
            { backgroundColor: theme.colors.secondary + "15" },
          ]}
        >
          <Ionicons
            name="document-outline"
            size={24}
            color={theme.colors.secondary}
          />
        </View>
        <Text style={[styles.actionText, { color: theme.colors.text }]}>
          Upload
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate("Premium")}
      >
        <View
          style={[
            styles.actionIcon,
            { backgroundColor: theme.colors.warning + "15" },
          ]}
        >
          <Ionicons
            name="flash-outline"
            size={24}
            color={theme.colors.warning}
          />
        </View>
        <Text style={[styles.actionText, { color: theme.colors.text }]}>
          Get Tokens
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecent = () => (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeader}>
        <Text
          style={[styles.sectionTitle, { color: theme.colors.text }]}
          variant="h2"
        >
          Recent Documents
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Documents")}>
          <Text style={{ color: theme.colors.primary }}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : documents.length > 0 ? (
        <View style={styles.documentsList}>
          {documents.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={[
                styles.documentCard,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() =>
                navigation.navigate("DocumentDetail", { documentId: doc.id })
              }
            >
              <View
                style={[
                  styles.documentIcon,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Ionicons
                  name={doc.icon}
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
                  {doc.type} • {doc.date}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Ionicons
            name="document-outline"
            size={40}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            No documents yet
          </Text>
          <Button
            title="Upload Document"
            onPress={() => navigation.navigate("Documents")}
            theme={theme}
            style={styles.emptyButton}
          />
        </View>
      )}
    </View>
  );

  const renderTips = () => (
    <View style={styles.tipsSection}>
      <Text
        style={[styles.sectionTitle, { color: theme.colors.text }]}
        variant="h2"
      >
        Tips & Tricks
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tipsContainer}
      >
        <TouchableOpacity
          style={[styles.tipCard, { backgroundColor: theme.colors.primary }]}
        >
          <View style={styles.tipContent}>
            <Ionicons name="bulb-outline" size={24} color="white" />
            <Text style={styles.tipTitle} color="white">
              Scan Tips
            </Text>
            <Text style={styles.tipDescription} color="white">
              Learn how to get better document scans
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tipCard, { backgroundColor: theme.colors.secondary }]}
        >
          <View style={styles.tipContent}>
            <Ionicons name="help-buoy-outline" size={24} color="white" />
            <Text style={styles.tipTitle} color="white">
              AI Features
            </Text>
            <Text style={styles.tipDescription} color="white">
              Get the most out of AI analysis
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tipCard, { backgroundColor: theme.colors.success }]}
        >
          <View style={styles.tipContent}>
            <Ionicons name="checkmark-circle-outline" size={24} color="white" />
            <Text style={styles.tipTitle} color="white">
              First Steps
            </Text>
            <Text style={styles.tipDescription} color="white">
              Complete the onboarding guide
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {renderHeader()}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderActionButtons()}
        {renderRecent()}
        {renderTips()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tokenButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tokenText: {
    fontWeight: "600",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    width: (width - 56) / 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 160,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipsContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },
  tipCard: {
    width: 220,
    borderRadius: 16,
    overflow: "hidden",
  },
  tipContent: {
    padding: 20,
    gap: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  tipDescription: {
    fontSize: 13,
    opacity: 0.9,
  },
});
