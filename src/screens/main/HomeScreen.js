import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
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
  Loading,
  Badge,
  EmptyState,
  Card,
  Text,
  Button,
  DocumentItem,
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

      const docs = await documentApi.getUserDocuments();
      setDocuments(docs);
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
    const canUpload = hasEnoughTokens(TOKEN_COSTS.DOCUMENT_ANALYSIS);

    if (canUpload) {
      navigation.navigate("Upload");
    } else {
      Alert.alert(
        "Not Enough Tokens",
        "You need more tokens to upload and analyze documents.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Get Tokens",
            onPress: () => navigation.navigate("TokenStore"),
          },
        ]
      );
    }
  };

  // Navigate to scan screen
  const goToScan = () => {
    const canScan = hasEnoughTokens(TOKEN_COSTS.DOCUMENT_ANALYSIS);

    if (canScan) {
      navigation.navigate("Scan");
    } else {
      Alert.alert(
        "Not Enough Tokens",
        "You need more tokens to scan and analyze documents.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Get Tokens",
            onPress: () => navigation.navigate("TokenStore"),
          },
        ]
      );
    }
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
              color={theme.colors.primary}
              style={styles.tokenText}
            >
              {tokens}
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
              color={theme.colors.primary}
              style={styles.tokenText}
            >
              {tokens}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
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
            title={t("home.uploadDocument")}
            onPress={goToUpload}
            style={styles.actionButton}
            icon="cloud-upload"
            gradient={true}
          />
          <View style={styles.actionButtonSpacer} />
          <Button
            title={t("home.scanDocument")}
            onPress={goToScan}
            style={styles.actionButton}
            icon="scan"
            type="secondary"
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
      data={documents}
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {renderDocumentsList()}

      {/* Floating action button */}
      <TouchableOpacity style={[styles.fab]} onPress={goToUpload}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
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
    paddingTop: 20,
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
    height: 70,
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
  actionButtonsContainer: {
    marginTop: -20,
    zIndex: 1,
  },
  actionButtonsCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
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
