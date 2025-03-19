import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  Card,
  DocumentItem,
  EmptyState,
  Badge,
  Loading,
} from "../../../components";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useTokens } from "../../../context/TokenContext";
import RecentDocumentsList from "./components/RecentDocumentsList";
import CategoryTabs from "./components/CategoryTabs";
import HomeHeader from "./components/HomeHeader";
import DocumentService from "../../../services/documentService";

const HomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { tokens } = useTokens();

  // State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;

  // Load documents
  const loadDocuments = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else if (!refreshing) {
        setLoading(true);
      }

      // Get documents from service
      const allDocuments = await DocumentService.getDocuments(user.uid);

      // Use the actual API response instead of sample data
      if (Array.isArray(allDocuments)) {
        // Sort documents by createdAt date (newest first)
        const sortedDocuments = [...allDocuments].sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });

        // Limit to only the 3 most recent documents
        const recentDocuments = sortedDocuments.slice(0, 3);

        setDocuments(recentDocuments);
        setFilteredDocuments(recentDocuments);
      } else {
        console.error("Expected array but received:", typeof allDocuments);
        setDocuments([]);
        setFilteredDocuments([]);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter documents
  const filterDocuments = (category) => {
    setActiveCategory(category);

    if (category === "all") {
      setFilteredDocuments(documents);
      return;
    }

    if (category === "analyzed") {
      setFilteredDocuments(
        documents.filter((doc) => doc.status === "analyzed")
      );
      return;
    }

    if (category === "images") {
      setFilteredDocuments(
        documents.filter(
          (doc) =>
            doc.type?.toLowerCase().includes("image") ||
            doc.type?.toLowerCase().includes("jpg") ||
            doc.type?.toLowerCase().includes("jpeg") ||
            doc.type?.toLowerCase().includes("png")
        )
      );
      return;
    }

    if (category === "documents") {
      setFilteredDocuments(
        documents.filter(
          (doc) =>
            doc.type?.toLowerCase().includes("pdf") ||
            doc.type?.toLowerCase().includes("word") ||
            doc.type?.toLowerCase().includes("document") ||
            doc.type?.toLowerCase().includes("docx")
        )
      );
      return;
    }
  };

  // Initial animations and data loading
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadDocuments();
  }, []);

  // Update when screen focuses
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadDocuments();
    });

    return unsubscribe;
  }, [navigation]);

  // Document selection
  const handleSelectDocument = (document) => {
    navigation.navigate("DocumentDetail", { documentId: document.id });
  };

  // Navigation helpers
  const goToTokenStore = () => navigation.navigate("TokenStore");
  const goToDocumentActions = () => navigation.navigate("DocumentActions");

  // Render main content
  const renderContent = () => {
    if (loading && !refreshing) {
      return <Loading fullScreen text="Loading documents..." />;
    }

    return (
      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: Animated.multiply(
                    translateAnim,
                    new Animated.Value(1 + index * 0.1)
                  ),
                },
              ],
            }}
          >
            <DocumentItem
              document={item}
              onPress={() => handleSelectDocument(item)}
              style={styles.documentItem}
            />
          </Animated.View>
        )}
        ListHeaderComponent={
          <>
            <HomeHeader
              user={user}
              tokens={tokens}
              onTokenPress={goToTokenStore}
            />

            {/* App Overview - Quick Info Card */}
            <View style={styles.overviewContainer}>
              <Card style={styles.overviewCard}>
                <LinearGradient
                  colors={[
                    theme.colors.primary + "20",
                    theme.colors.primary + "05",
                  ]}
                  style={styles.overviewGradient}
                >
                  <View style={styles.overviewContent}>
                    <View style={styles.overviewIconRow}>
                      <View
                        style={[
                          styles.overviewIcon,
                          { backgroundColor: theme.colors.primary + "20" },
                        ]}
                      >
                        <Ionicons
                          name="analytics"
                          size={20}
                          color={theme.colors.primary}
                        />
                      </View>
                      <View
                        style={[
                          styles.overviewIcon,
                          { backgroundColor: theme.colors.info + "20" },
                        ]}
                      >
                        <Ionicons
                          name="chatbubble"
                          size={20}
                          color={theme.colors.info}
                        />
                      </View>
                      <View
                        style={[
                          styles.overviewIcon,
                          { backgroundColor: theme.colors.success + "20" },
                        ]}
                      >
                        <Ionicons
                          name="document-text"
                          size={20}
                          color={theme.colors.success}
                        />
                      </View>
                    </View>

                    <Text variant="subtitle2" style={styles.overviewTitle}>
                      Document AI Analysis
                    </Text>

                    <Text
                      variant="body2"
                      color={theme.colors.textSecondary}
                      style={styles.overviewText}
                    >
                      QuantumDoc analyzes your documents using AI to extract key
                      information, provide summaries, and answer your questions.
                    </Text>

                    <TouchableOpacity
                      style={styles.addDocButton}
                      onPress={goToDocumentActions}
                    >
                      <Text
                        variant="body2"
                        color={theme.colors.primary}
                        weight="semibold"
                      >
                        Add New Document
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={theme.colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </Card>
            </View>

            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={filterDocuments}
            />

            <View style={styles.documentsHeaderContainer}>
              <Text variant="subtitle1" style={styles.documentsHeader}>
                All Documents
              </Text>

              <Badge
                label={`${filteredDocuments.length} ${
                  filteredDocuments.length === 1 ? "item" : "items"
                }`}
                variant="primary"
                size="small"
              />
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="No documents yet"
            message="Add your first document to get started with AI-powered analysis"
            actionLabel="Add Document"
            onAction={goToDocumentActions}
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDocuments(true)}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  documentItem: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  overviewContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  overviewCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  overviewGradient: {
    width: "100%",
  },
  overviewContent: {
    padding: 20,
  },
  overviewIconRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  overviewTitle: {
    marginBottom: 8,
  },
  overviewText: {
    marginBottom: 16,
  },
  addDocButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  documentsHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  documentsHeader: {
    fontSize: 18,
  },
});

export default HomeScreen;
