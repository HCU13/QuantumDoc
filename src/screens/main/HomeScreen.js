import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useTokens } from "../../context/TokenContext";
import { useLocalization } from "../../context/LocalizationContext";
import {
  Text,
  Card,
  Button,
  DocumentItem,
  EmptyState,
  Badge,
  Loading,
} from "../../components";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { tokens } = useTokens();
  const { t } = useLocalization();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
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

      // Sample data for UI display
      const sampleDocuments = [
        {
          id: "1",
          name: "Project Proposal.pdf",
          type: "application/pdf",
          size: 2500000,
          createdAt: new Date(),
          status: "analyzed",
          downloadUrl: null,
        },
        {
          id: "2",
          name: "Financial Report Q2.xlsx",
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          size: 1800000,
          createdAt: new Date(Date.now() - 86400000), // Yesterday
          status: "analyzed",
          downloadUrl: null,
        },
        {
          id: "3",
          name: "Team Meeting Notes.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 500000,
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
          status: "uploaded",
          downloadUrl: null,
        },
        {
          id: "4",
          name: "Product Diagram.jpg",
          type: "image/jpeg",
          size: 3500000,
          createdAt: new Date(Date.now() - 259200000), // 3 days ago
          status: "analyzed",
          downloadUrl: "https://source.unsplash.com/random/800x600/?document",
        },
      ];

      setDocuments(sampleDocuments);
      setFilteredDocuments(sampleDocuments);
    } catch (error) {
      console.error("Error loading documents:", error);
      Alert.alert(
        "Error",
        "Could not load your documents. Please try again later."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter documents
  const filterDocuments = (filter) => {
    setActiveFilter(filter);

    if (filter === "all") {
      setFilteredDocuments(documents);
      return;
    }

    if (filter === "analyzed") {
      setFilteredDocuments(
        documents.filter((doc) => doc.status === "analyzed")
      );
      return;
    }

    if (filter === "images") {
      setFilteredDocuments(
        documents.filter((doc) => doc.type.includes("image"))
      );
      return;
    }

    if (filter === "documents") {
      setFilteredDocuments(
        documents.filter(
          (doc) =>
            doc.type.includes("pdf") ||
            doc.type.includes("word") ||
            doc.type.includes("document")
        )
      );
      return;
    }
  };

  // Initial loading
  useEffect(() => {
    loadDocuments();

    // Start entrance animations
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

  // Navigate to upload screen
  const goToUpload = () => {
    navigation.navigate("Upload");
  };

  // Navigate to scan screen
  const goToScan = () => {
    navigation.navigate("Scan");
  };

  // Header component
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={
          isDark
            ? [theme.colors.primary + "80", theme.colors.background]
            : [theme.colors.primary, theme.colors.background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.logoContainer}>
            <Text
              style={[styles.logoText, { color: theme.colors.textInverted }]}
            >
              QuantumDoc
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.tokenButton}
              onPress={() => navigation.navigate("TokenStore")}
            >
              <View
                style={[
                  styles.tokenBadge,
                  { backgroundColor: theme.colors.text + "20" },
                ]}
              >
                <Ionicons name="key" size={14} color={theme.colors.text} />
                <Text style={[styles.tokenText, { color: theme.colors.text }]}>
                  {tokens || 0}
                </Text>
              </View>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons
                name="person-circle"
                size={28}
                color={theme.colors.text}
              />
            </TouchableOpacity> */}
          </View>
        </View>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            My Documents
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.colors.text + "CC" }]}
          >
            {documents.length > 0
              ? `${documents.length} document${
                  documents.length !== 1 ? "s" : ""
                }`
              : "No documents yet"}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  // Filter tabs
  const renderFilterTabs = () => (
    <Animated.View
      style={[
        styles.filterTabsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "all" && [
              styles.activeFilterTab,
              {
                backgroundColor: theme.colors.primary + "10",
                borderColor: theme.colors.primary + "30",
              },
            ],
            { borderColor: theme.colors.border },
          ]}
          onPress={() => filterDocuments("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === "all" && styles.activeFilterTabText,
              {
                color:
                  activeFilter === "all"
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
              },
            ]}
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
                backgroundColor: theme.colors.success + "10",
                borderColor: theme.colors.success + "30",
              },
            ],
            { borderColor: theme.colors.border },
          ]}
          onPress={() => filterDocuments("analyzed")}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === "analyzed" && styles.activeFilterTabText,
              {
                color:
                  activeFilter === "analyzed"
                    ? theme.colors.success
                    : theme.colors.textSecondary,
              },
            ]}
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
                backgroundColor: theme.colors.info + "10",
                borderColor: theme.colors.info + "30",
              },
            ],
            { borderColor: theme.colors.border },
          ]}
          onPress={() => filterDocuments("images")}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === "images" && styles.activeFilterTabText,
              {
                color:
                  activeFilter === "images"
                    ? theme.colors.info
                    : theme.colors.textSecondary,
              },
            ]}
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
                backgroundColor: theme.colors.error + "10",
                borderColor: theme.colors.error + "30",
              },
            ],
            { borderColor: theme.colors.border },
          ]}
          onPress={() => filterDocuments("documents")}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === "documents" && styles.activeFilterTabText,
              {
                color:
                  activeFilter === "documents"
                    ? theme.colors.error
                    : theme.colors.textSecondary,
              },
            ]}
          >
            Docs
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Actions card
  const renderActions = () => (
    <Animated.View
      style={[
        styles.actionsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
        },
      ]}
    >
      <Card style={styles.actionsCard}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? theme.colors.card
                  : theme.colors.surface,
              },
            ]}
            onPress={() => navigation.navigate("Upload")}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Upload File
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? theme.colors.card
                  : theme.colors.surface,
              },
            ]}
            onPress={goToScan}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: theme.colors.secondary + "20" },
              ]}
            >
              <Ionicons
                name="scan-outline"
                size={22}
                color={theme.colors.secondary}
              />
            </View>
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Scan Document
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </Animated.View>
  );

  // Empty state
  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyStateContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
        },
      ]}
    >
      <Card style={styles.emptyStateCard}>
        <View style={styles.emptyStateContent}>
          <View
            style={[
              styles.emptyStateIconContainer,
              { backgroundColor: theme.colors.primary + "10" },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={60}
              color={theme.colors.textSecondary}
            />
          </View>
          <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
            No documents yet
          </Text>
          <Text
            style={[
              styles.emptyStateDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            Upload or scan your first document to get started with AI-powered
            analysis
          </Text>
          <Button
            label="Upload Document"
            onPress={goToUpload}
            style={styles.emptyStateButton}
            gradient={true}
          />
        </View>
      </Card>
    </Animated.View>
  );

  // Document list
  const renderDocumentsList = () => (
    <Animated.FlatList
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
      contentContainerStyle={styles.documentList}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadDocuments(true)}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
      ListHeaderComponent={
        <>
          {renderHeader()}
          {renderFilterTabs()}
          {renderActions()}
        </>
      }
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={<View style={{ height: 80 }} />}
    />
  );

  if (loading && !refreshing) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />
        <Loading fullScreen text="Loading documents..." />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {renderDocumentsList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenButton: {},
  tokenBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tokenText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  profileButton: {
    padding: 2,
  },
  headerTitleContainer: {
    marginTop: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  filterTabsContainer: {
    margin: 16,
    marginTop: -15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    padding: 8,
  },
  filterTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  activeFilterTab: {
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterTabText: {
    fontWeight: "600",
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionsCard: {
    padding: 16,
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  documentList: {
    paddingBottom: 80,
  },
  documentItem: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  emptyStateContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  emptyStateCard: {
    borderRadius: 12,
  },
  emptyStateContent: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  emptyStateButton: {
    minWidth: 200,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: "hidden",
    zIndex: 10,
  },
});

export default HomeScreen;
