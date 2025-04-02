import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  DocumentItem,
  EmptyState,
  Badge,
  Loading,
} from "../../components";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import DocumentService from "../../services/documentService";
import CategoryTabs from "./home/components/CategoryTabs";

const AllDocumentsScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { isConnected } = useApp();

  // State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;

  // Load documents - TÜM belgeleri yükler (sınırlama olmadan)
  const loadDocuments = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else if (!refreshing) {
        setLoading(true);
      }

      // Get documents from service
      const allDocuments = await DocumentService.getDocuments(user.uid);

      // Use the actual API response
      if (Array.isArray(allDocuments)) {
        // Sort documents by createdAt date (newest first)
        const sortedDocuments = [...allDocuments].sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });

        setDocuments(sortedDocuments);
        setFilteredDocuments(sortedDocuments);
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

  // Render main content
  const renderContent = () => {
    if (loading && !refreshing) {
      return <Loading fullScreen text="Belgeler yükleniyor..." />;
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
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text variant="h2">Tüm Belgeler</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Ağ durumu bildirimi */}
            {!isConnected && (
              <View style={styles.offlineCard}>
                <View style={styles.offlineContent}>
                  <Ionicons name="cloud-offline" size={24} color="#F59E0B" />
                  <Text variant="body2" style={styles.offlineText}>
                    Çevrimdışı modasınız. Bazı özellikler sınırlı olabilir.
                  </Text>
                </View>
              </View>
            )}

            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={filterDocuments}
            />

            <View style={styles.documentsHeaderContainer}>
              <Text variant="subtitle1" style={styles.documentsHeader}>
                Belgeler
              </Text>

              <Badge
                label={`${filteredDocuments.length} ${
                  filteredDocuments.length === 1 ? "belge" : "belge"
                }`}
                variant="primary"
                size="small"
              />
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="Henüz belge yok"
            message="AI destekli analiz için ilk belgenizi ekleyin"
            actionLabel="Belge Ekle"
            onAction={() => navigation.navigate("DocumentActions")}
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
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      {renderContent()}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: StatusBar.currentHeight || 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 40,
  },
  documentItem: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  documentsHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  documentsHeader: {
    fontWeight: "600",
  },
  offlineCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  offlineContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  offlineText: {
    marginLeft: 8,
    color: "#92400E",
  },
});

export default AllDocumentsScreen; 