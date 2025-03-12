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
  ScrollView as RNScrollView,
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
import { documentApi } from "../../api/documentApi";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { tokens, TOKEN_COSTS, hasEnoughTokens } = useTokens();
  const { t } = useLocalization();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

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

      // In real implementation, this would fetch from your API
      // For UI design purposes, let's use sample data
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

  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Header component
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={
          isDark
            ? [theme.colors.primary + "80", theme.colors.background]
            : [theme.colors.primary + "40", theme.colors.background]
        }
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text variant="h2">My Documents</Text>
            <Text variant="body2" color={theme.colors.textSecondary}>
              {documents.length > 0
                ? `You have ${documents.length} document${
                    documents.length !== 1 ? "s" : ""
                  }`
                : "No documents yet"}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.tokenBadge,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
            onPress={() => navigation.navigate("TokenStore")}
          >
            <Ionicons name="key" size={16} color={theme.colors.primary} />
            <Text
              variant="body2"
              weight="semibold"
              color={theme.text}
              style={styles.tokenText}
            >
              {tokens || 15}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Animated header that appears when scrolling */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
            opacity: headerOpacity,
          },
        ]}
      >
        <View style={styles.animatedHeaderContent}>
          <Text variant="h3">My Documents</Text>
          <TouchableOpacity
            style={[
              styles.tokenBadge,
              { backgroundColor: theme.colors.primary + "20" },
            ]}
            onPress={() => navigation.navigate("TokenStore")}
          >
            <Ionicons name="key" size={16} color={theme.colors.primary} />
            <Text
              variant="body2"
              weight="semibold"
              color={theme.colors.text}
              style={styles.tokenText}
            >
              {tokens || 15}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
        },
      ]}
    >
      <RNScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabsContent}
      >
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "all" && {
              backgroundColor: theme.colors.primary + "20",
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={() => filterDocuments("all")}
        >
          <Text
            variant="body2"
            color={
              activeFilter === "all"
                ? theme.colors.text
                : theme.colors.textSecondary
            }
            weight={activeFilter === "all" ? "semibold" : "regular"}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "analyzed" && {
              backgroundColor: theme.colors.success + "20",
              borderColor: theme.colors.success,
            },
          ]}
          onPress={() => filterDocuments("analyzed")}
        >
          <Text
            variant="body2"
            color={
              activeFilter === "analyzed"
                ? theme.colors.success
                : theme.colors.textSecondary
            }
            weight={activeFilter === "analyzed" ? "semibold" : "regular"}
          >
            Analyzed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "images" && {
              backgroundColor: theme.colors.info + "20",
              borderColor: theme.colors.info,
            },
          ]}
          onPress={() => filterDocuments("images")}
        >
          <Text
            variant="body2"
            color={
              activeFilter === "images"
                ? theme.colors.info
                : theme.colors.textSecondary
            }
            weight={activeFilter === "images" ? "semibold" : "regular"}
          >
            Images
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "documents" && {
              backgroundColor: theme.colors.error + "20",
              borderColor: theme.colors.error,
            },
          ]}
          onPress={() => filterDocuments("documents")}
        >
          <Text
            variant="body2"
            color={
              activeFilter === "documents"
                ? theme.colors.error
                : theme.colors.textSecondary
            }
            weight={activeFilter === "documents" ? "semibold" : "regular"}
          >
            Documents
          </Text>
        </TouchableOpacity>
      </RNScrollView>
    </Animated.View>
  );

  // Action buttons
  const renderActionButtons = () => (
    <Animated.View
      style={[
        styles.actionButtonsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
        },
      ]}
    >
      <Card style={styles.actionButtonsCard} elevated={true}>
        <View style={styles.actionButtons}>
          <Button
            label="Upload"
            onPress={goToUpload}
            style={styles.actionButton}
            leftIcon={
              <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
            }
            gradient={true}
          />
          <View style={styles.actionButtonSpacer} />
          <Button
            label="Scan"
            onPress={goToScan}
            style={styles.actionButton}
            leftIcon={<Ionicons name="scan" size={20} color="#FFFFFF" />}
            variant="secondary"
          />
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
      <Card style={styles.emptyStateCard} elevated={true}>
        <EmptyState
          icon="document-text-outline"
          title="No Documents"
          description="Upload or scan your first document to get started"
          actionText="Upload Document"
          onAction={goToUpload}
        />
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
          style={[
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: Animated.multiply(
                    translateAnim,
                    new Animated.Value(1 + index * 0.1)
                  ),
                },
              ],
            },
          ]}
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
          {renderActionButtons()}
        </>
      }
      ListEmptyComponent={renderEmptyState}
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
        <Loading fullScreen type="logo" />
      </View>
    );
  }

  // Render content
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    position: "relative",
  },
  headerGradient: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "android" ? 70 + StatusBar.currentHeight : 70,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  animatedHeaderContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tokenBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tokenText: {
    marginLeft: 4,
  },
  filterTabsContainer: {
    marginVertical: 10,
    marginHorizontal: 16,
    marginTop: 16, // Increased margin to avoid overlap
  },
  filterTabsContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  actionButtonsContainer: {
    marginTop: 10, // Increased margin to avoid overlap
    zIndex: 1,
    marginBottom: 10, // Added bottom margin for spacing
  },
  actionButtonsCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
  },
  actionButtonSpacer: {
    width: 16,
  },
  documentList: {
    paddingBottom: 80,
  },
  documentItem: {
    marginHorizontal: 20,
    marginVertical: 6,
  },
  emptyStateContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyStateCard: {
    padding: 20,
    borderRadius: 16,
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
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    overflow: "hidden",
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
