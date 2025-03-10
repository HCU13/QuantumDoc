// src/screens/main/HomeScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useTokens } from "../../context/TokenContext";
import { useLocalization } from "../../context/LocalizationContext";
import { Text } from "../../components/Text";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { DocumentItem } from "../../components/DocumentItem";
import { EmptyState } from "../../components/EmptyState";
import { Loading } from "../../components/Loading";
import { Badge } from "../../components/Badge";
import { documentApi } from "../../api/documentApi";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { tokens, hasEnoughTokens, TOKEN_COSTS } = useTokens();
  const { t } = useLocalization();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentDocs, setRecentDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Start entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Header animations based on scroll
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [height * 0.22, height * 0.12],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: "clamp",
  });

  const headerTextOpacity = scrollY.interpolate({
    inputRange: [0, 30, 50],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [80, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Load documents
  const loadDocuments = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else if (!refreshing) {
        setLoading(true);
      }

      const docs = await documentApi.getUserDocuments();
      setDocuments(docs);

      // Set recent documents (3 most recent)
      setRecentDocs(docs.slice(0, 3));
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial loading
  useEffect(() => {
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

  // Navigate to upload screen
  const goToUpload = () => {
    const canUpload = hasEnoughTokens(TOKEN_COSTS.DOCUMENT_ANALYSIS);

    if (canUpload) {
      navigation.navigate("Upload");
    } else {
      navigation.navigate("TokenStore");
    }
  };

  // Navigate to scan screen
  const goToScan = () => {
    const canScan = hasEnoughTokens(TOKEN_COSTS.DOCUMENT_ANALYSIS);

    if (canScan) {
      navigation.navigate("Scan");
    } else {
      navigation.navigate("TokenStore");
    }
  };

  // Compact header view when scrolled
  const renderCompactHeader = () => (
    <Animated.View
      style={[
        styles.compactHeader,
        {
          backgroundColor: theme.colors.background,
          opacity: compactHeaderOpacity,
          borderBottomColor: theme.colors.border,
          shadowColor: isDark ? "transparent" : "#000",
        },
      ]}
    >
      <Text variant="h4">DocAI</Text>

      <TouchableOpacity
        style={[
          styles.tokenBadgeCompact,
          { backgroundColor: theme.colors.primary + "20" },
        ]}
        onPress={() => navigation.navigate("TokenStore")}
      >
        <Ionicons name="key" size={16} color={theme.colors.primary} />
        <Text
          variant="body2"
          weight="semibold"
          color={theme.colors.primary}
          style={styles.tokenTextCompact}
        >
          {tokens}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Full header with user greeting and token display
  const renderExpandedHeader = () => (
    <Animated.View style={[styles.expandedHeader, { height: headerHeight }]}>
      <LinearGradient
        colors={
          isDark
            ? [theme.colors.background, theme.colors.card]
            : [theme.colors.primary + "10", theme.colors.background]
        }
        style={styles.headerGradient}
      >
        <Animated.View
          style={[styles.headerContent, { opacity: headerTextOpacity }]}
        >
          <View>
            <Text variant="h2">
              {t("home.welcome")}
              {user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
            </Text>
            <Text variant="subtitle2" color={theme.colors.textSecondary}>
              {documents.length > 0
                ? t("home.recentDocuments")
                : t("home.noDocuments")}
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
              color={theme.colors.primary}
              style={styles.tokenText}
            >
              {tokens}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );

  // Action buttons for document upload and scan
  const renderActionButtons = () => (
    <Animated.View
      style={[
        styles.actionButtons,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Button
        title={t("home.uploadDocument")}
        onPress={goToUpload}
        style={styles.actionButton}
        icon="cloud-upload"
        gradient={true}
      />
      <Button
        title={t("home.scanDocument")}
        onPress={goToScan}
        style={styles.actionButton}
        icon="scan"
        type="secondary"
      />
    </Animated.View>
  );

  // Recent documents horizontal scrollview
  const renderRecentDocuments = () => {
    if (recentDocs.length === 0) return null;

    return (
      <Animated.View
        style={[
          styles.recentDocsSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text variant="subtitle1" weight="semibold" style={styles.sectionTitle}>
          Recent Documents
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentDocsContent}
        >
          {recentDocs.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.recentDocCard}
              onPress={() => handleSelectDocument(doc)}
            >
              <View
                style={[
                  styles.recentDocIcon,
                  { backgroundColor: theme.colors.primary + "15" },
                ]}
              >
                <Ionicons
                  name={getDocumentTypeIcon(doc)}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text
                variant="caption"
                numberOfLines={2}
                style={styles.recentDocTitle}
              >
                {doc.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  // Empty state when no documents
  const renderEmpty = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <EmptyState
        icon="document-text-outline"
        title={t("home.noDocuments")}
        description="Upload or scan your first document to get started"
        actionText={t("home.uploadDocument")}
        onAction={goToUpload}
      />
    </Animated.View>
  );

  // Helper function to get document icon
  const getDocumentTypeIcon = (document) => {
    const type = document.type?.toLowerCase() || "";

    if (type.includes("pdf")) return "document-text";
    if (type.includes("image")) return "image";
    if (type.includes("word") || type.includes("doc")) return "document";
    return "document-outline";
  };

  // Main document list
  const renderDocumentList = () => (
    <Animated.View
      style={[
        styles.documentsSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text variant="subtitle1" weight="semibold">
          {t("home.myDocuments")}
        </Text>
        <Text variant="body2" color={theme.colors.textSecondary}>
          {documents.length} documents
        </Text>
      </View>

      {documents.map((doc) => (
        <DocumentItem
          key={doc.id}
          document={doc}
          onPress={() => handleSelectDocument(doc)}
          style={styles.documentItem}
        />
      ))}
    </Animated.View>
  );

  if (loading && !refreshing) {
    return <Loading fullScreen type="logo" iconName="document-text" />;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {renderCompactHeader()}
      {renderExpandedHeader()}

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDocuments(true)}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.card}
          />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.contentContainer}>
          {renderActionButtons()}

          {documents.length > 0 ? (
            <>
              {renderRecentDocuments()}
              {renderDocumentList()}
            </>
          ) : (
            renderEmpty()
          )}
        </View>
      </Animated.ScrollView>

      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
        onPress={goToUpload}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: height * 0.22, // Match initial header height
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  expandedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: "hidden",
  },
  headerGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  compactHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 2,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
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
  tokenBadgeCompact: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tokenTextCompact: {
    marginLeft: 4,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  recentDocsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  recentDocsContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  recentDocCard: {
    width: 80,
    marginRight: 12,
    alignItems: "center",
  },
  recentDocIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  recentDocTitle: {
    textAlign: "center",
    width: "100%",
  },
  documentsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  documentItem: {
    marginVertical: 6,
    marginHorizontal: 0,
  },
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});

export default HomeScreen;
