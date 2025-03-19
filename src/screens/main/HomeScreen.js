import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
  RefreshControl,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useTokens } from "../../context/TokenContext";
import { Text, Card, Button, DocumentItem, Badge } from "../../components";
import documentService from "../../services/documentService";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { tokens } = useTokens();

  // State
  const [documents, setDocuments] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 120],
    extrapolate: "clamp",
  });

  // Load documents
  const loadDocuments = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else if (!refreshing) setLoading(true);

      if (user) {
        // Get user documents from service
        const userDocs = await documentService.getUserDocuments(user.uid);
        setDocuments(userDocs);

        // Get recent documents (last 3)
        setRecentDocuments(userDocs.slice(0, 3));
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter documents
  const filterDocuments = (filter) => {
    setActiveFilter(filter);

    if (filter === "all") return documents;
    if (filter === "analyzed")
      return documents.filter((doc) => doc.status === "analyzed");
    if (filter === "images")
      return documents.filter((doc) => doc.type?.includes("image"));
    if (filter === "documents")
      return documents.filter(
        (doc) =>
          doc.type?.includes("pdf") ||
          doc.type?.includes("doc") ||
          doc.type?.includes("text")
      );

    return documents;
  };

  // Initial load
  useEffect(() => {
    loadDocuments();
  }, [user]);

  // Refresh when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadDocuments();
    });
    return unsubscribe;
  }, [navigation]);

  // Handle document selection
  const handleDocumentSelect = (document) => {
    navigation.navigate("DocumentDetail", { documentId: document.id });
  };

  // Header component with gradient and user info
  const renderHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.welcomeContainer}>
              <Text variant="h3" color="#FFFFFF" style={styles.welcomeText}>
                Hello, {user?.displayName?.split(" ")[0] || "User"}
              </Text>
              <Text variant="body2" color="rgba(255,255,255,0.8)">
                {documents.length > 0
                  ? `You have ${documents.length} document${
                      documents.length !== 1 ? "s" : ""
                    }`
                  : "Start by adding a document"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.tokenBadge}
              onPress={() => navigation.navigate("TokenStore")}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.15)"]}
                style={styles.tokenGradient}
              >
                <Ionicons name="key" size={16} color="#FFFFFF" />
                <Text
                  variant="subtitle2"
                  color="#FFFFFF"
                  style={styles.tokenText}
                >
                  {tokens || 0}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => navigation.navigate("Upload")}
            >
              <Ionicons name="add" size={22} color={theme.colors.primary} />
              <Text variant="subtitle2" color={theme.colors.primary}>
                New Document
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );

  // Quick actions section
  const renderQuickActions = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500 }}
      style={styles.quickActionsContainer}
    >
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[
            styles.quickActionButton,
            { backgroundColor: theme.colors.primary + "10" },
          ]}
          onPress={() => navigation.navigate("Upload")}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="caption" style={styles.actionText}>
            Upload
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionButton,
            { backgroundColor: theme.colors.secondary + "10" },
          ]}
          onPress={() => navigation.navigate("ScanScreen")}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.secondary + "20" },
            ]}
          >
            <Ionicons
              name="scan-outline"
              size={24}
              color={theme.colors.secondary}
            />
          </View>
          <Text variant="caption" style={styles.actionText}>
            Scan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionButton,
            { backgroundColor: theme.colors.info + "10" },
          ]}
          onPress={() => navigation.navigate("TokenStore")}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.info + "20" },
            ]}
          >
            <Ionicons name="key-outline" size={24} color={theme.colors.info} />
          </View>
          <Text variant="caption" style={styles.actionText}>
            Tokens
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionButton,
            { backgroundColor: theme.colors.success + "10" },
          ]}
          onPress={() => navigation.navigate("Help")}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.success + "20" },
            ]}
          >
            <Ionicons
              name="help-outline"
              size={24}
              color={theme.colors.success}
            />
          </View>
          <Text variant="caption" style={styles.actionText}>
            Help
          </Text>
        </TouchableOpacity>
      </View>
    </MotiView>
  );

  // Recent documents section
  const renderRecentDocuments = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text variant="h3" style={styles.sectionTitle}>
          Recent Documents
        </Text>
        {documents.length > 3 && (
          <TouchableOpacity onPress={() => scrollToAllDocuments()}>
            <Text variant="body2" color={theme.colors.primary}>
              See All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {recentDocuments.length === 0 ? (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
        >
          <Card style={styles.emptyCard}>
            <View style={styles.emptyStateContent}>
              <Ionicons
                name="document-outline"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text
                variant="subtitle1"
                style={{ marginTop: 16, marginBottom: 8 }}
              >
                No recent documents
              </Text>
              <Text
                variant="body2"
                color={theme.colors.textSecondary}
                style={{ textAlign: "center", marginBottom: 16 }}
              >
                Your recently accessed documents will appear here
              </Text>
              <Button
                label="Add Document"
                onPress={() => navigation.navigate("Upload")}
                gradient={true}
                size="small"
              />
            </View>
          </Card>
        </MotiView>
      ) : (
        <View style={styles.recentDocumentsContainer}>
          {recentDocuments.map((document, index) => (
            <MotiView
              key={document.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 100, type: "timing", duration: 400 }}
              style={styles.recentDocumentItem}
            >
              <DocumentItem
                document={document}
                onPress={() => handleDocumentSelect(document)}
              />
            </MotiView>
          ))}
        </View>
      )}
    </View>
  );

  // Filter tabs for document categories
  const renderFilterTabs = () => (
    <View style={styles.filterTabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
      >
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "all" && [
              styles.activeFilterTab,
              {
                backgroundColor: theme.colors.primary + "15",
                borderColor: theme.colors.primary,
              },
            ],
          ]}
          onPress={() => setActiveFilter("all")}
        >
          <Ionicons
            name="grid-outline"
            size={16}
            color={
              activeFilter === "all"
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
          <Text
            variant="body2"
            weight={activeFilter === "all" ? "semibold" : "regular"}
            color={
              activeFilter === "all"
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
            style={styles.filterTabText}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "analyzed" && [
              styles.activeFilterTab,
              {
                backgroundColor: theme.colors.success + "15",
                borderColor: theme.colors.success,
              },
            ],
          ]}
          onPress={() => setActiveFilter("analyzed")}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={
              activeFilter === "analyzed"
                ? theme.colors.success
                : theme.colors.textSecondary
            }
          />
          <Text
            variant="body2"
            weight={activeFilter === "analyzed" ? "semibold" : "regular"}
            color={
              activeFilter === "analyzed"
                ? theme.colors.success
                : theme.colors.textSecondary
            }
            style={styles.filterTabText}
          >
            Analyzed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "images" && [
              styles.activeFilterTab,
              {
                backgroundColor: theme.colors.info + "15",
                borderColor: theme.colors.info,
              },
            ],
          ]}
          onPress={() => setActiveFilter("images")}
        >
          <Ionicons
            name="image-outline"
            size={16}
            color={
              activeFilter === "images"
                ? theme.colors.info
                : theme.colors.textSecondary
            }
          />
          <Text
            variant="body2"
            weight={activeFilter === "images" ? "semibold" : "regular"}
            color={
              activeFilter === "images"
                ? theme.colors.info
                : theme.colors.textSecondary
            }
            style={styles.filterTabText}
          >
            Images
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "documents" && [
              styles.activeFilterTab,
              {
                backgroundColor: theme.colors.error + "15",
                borderColor: theme.colors.error,
              },
            ],
          ]}
          onPress={() => setActiveFilter("documents")}
        >
          <Ionicons
            name="document-outline"
            size={16}
            color={
              activeFilter === "documents"
                ? theme.colors.error
                : theme.colors.textSecondary
            }
          />
          <Text
            variant="body2"
            weight={activeFilter === "documents" ? "semibold" : "regular"}
            color={
              activeFilter === "documents"
                ? theme.colors.error
                : theme.colors.textSecondary
            }
            style={styles.filterTabText}
          >
            Documents
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // All documents section
  const renderAllDocuments = () => {
    // Filter documents based on active filter
    const filteredDocs = documents.filter((doc) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "analyzed") return doc.status === "analyzed";
      if (activeFilter === "images") return doc.type?.includes("image");
      if (activeFilter === "documents") {
        return (
          doc.type?.includes("pdf") ||
          doc.type?.includes("doc") ||
          doc.type?.includes("text")
        );
      }
      return true;
    });

    return (
      <View style={styles.sectionContainer} id="allDocuments">
        <View style={styles.sectionHeader}>
          <Text variant="h3" style={styles.sectionTitle}>
            My Documents
          </Text>
          <Badge
            label={`${filteredDocs.length} items`}
            size="small"
            variant="secondary"
          />
        </View>

        {renderFilterTabs()}

        {filteredDocs.length === 0 ? (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 400 }}
          >
            <Card style={styles.emptyCard}>
              <View style={styles.emptyStateContent}>
                <Ionicons
                  name="folder-open-outline"
                  size={48}
                  color={theme.colors.textSecondary}
                />
                <Text
                  variant="subtitle1"
                  style={{ marginTop: 16, marginBottom: 8 }}
                >
                  {activeFilter === "all"
                    ? "No documents yet"
                    : `No ${activeFilter} documents`}
                </Text>
                <Text
                  variant="body2"
                  color={theme.colors.textSecondary}
                  style={{ textAlign: "center", marginBottom: 16 }}
                >
                  {activeFilter === "all"
                    ? "Start by uploading or scanning a document"
                    : `Documents in the "${activeFilter}" category will appear here`}
                </Text>
                {activeFilter === "all" && (
                  <Button
                    label="Add Document"
                    onPress={() => navigation.navigate("Upload")}
                    gradient={true}
                    size="small"
                  />
                )}
              </View>
            </Card>
          </MotiView>
        ) : (
          <View style={styles.allDocumentsContainer}>
            {filteredDocs.map((document, index) => (
              <MotiView
                key={document.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  delay: index * 70,
                  type: "timing",
                  duration: 300,
                }}
                style={styles.documentItemContainer}
              >
                <DocumentItem
                  document={document}
                  onPress={() => handleDocumentSelect(document)}
                />
              </MotiView>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Floating add button
  const renderFloatingButton = () => (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => navigation.navigate("Upload")}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.floatingButtonGradient}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {renderHeader()}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDocuments(true)}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderQuickActions()}
        {renderRecentDocuments()}
        {renderAllDocuments()}

        {/* Bottom padding for floating button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {renderFloatingButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 220, // Account for header height
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  headerGradient: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 40,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    marginBottom: 4,
  },
  tokenBadge: {
    borderRadius: 20,
    overflow: "hidden",
  },
  tokenGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tokenText: {
    marginLeft: 8,
  },
  searchContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  quickActionsContainer: {
    marginTop: -60,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    width: (width - 80) / 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    textAlign: "center",
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateContent: {
    alignItems: "center",
    padding: 16,
  },
  recentDocumentsContainer: {
    marginBottom: 16,
  },
  recentDocumentItem: {
    marginBottom: 12,
  },
  filterTabsContainer: {
    marginBottom: 16,
  },
  filterScrollView: {
    flexDirection: "row",
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  activeFilterTab: {
    borderWidth: 1,
  },
  filterTabText: {
    marginLeft: 6,
  },
  allDocumentsContainer: {
    marginBottom: 16,
  },
  documentItemContainer: {
    marginBottom: 12,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  floatingButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
