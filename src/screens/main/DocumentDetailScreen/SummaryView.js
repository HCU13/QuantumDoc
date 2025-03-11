import React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Card, Text, Button, AIAnalysisCard } from "../../../components";

const SummaryView = ({
  document,
  analyzing,
  analyzeDocument,
  theme,
  t,
  scrollY,
  refreshDocument,
  refreshing,
}) => {
  // Not analyzed view
  if (document.status !== "analyzed") {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshDocument}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.noAnalysisContainer}>
          <Card
            style={styles.noAnalysisCard}
            variant={theme.isDark ? "default" : "bordered"}
            elevated={true}
          >
            <LinearGradient
              colors={[theme.colors.background, theme.colors.primary + "10"]}
              style={styles.noAnalysisGradient}
            >
              <Ionicons
                name="analytics-outline"
                size={60}
                color={theme.colors.primary}
                style={styles.noAnalysisIcon}
              />
              <Text variant="subtitle1" style={styles.noAnalysisText}>
                {t("document.noAnalysis")}
              </Text>
              <Text
                variant="body2"
                color={theme.colors.textSecondary}
                style={styles.noAnalysisDescription}
              >
                Analyze this document with AI to get a summary, key points, and
                insights.
              </Text>
              <Button
                label={t("document.analyze")}
                onPress={analyzeDocument}
                loading={analyzing}
                leftIcon={
                  !analyzing && (
                    <Ionicons name="analytics" size={20} color="#FFFFFF" />
                  )
                }
                gradient={true}
                style={styles.analyzeButton}
              />

              {analyzing && (
                <View style={styles.analyzingContainer}>
                  <ActivityIndicator color={theme.colors.primary} />
                  <Text
                    variant="caption"
                    style={styles.analyzingText}
                    color={theme.colors.textSecondary}
                  >
                    {t("document.processingDocument")}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </Card>
        </View>
      </ScrollView>
    );
  }

  // When document is analyzed, show comprehensive view
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshDocument}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* All in one content card - all analysis in a single card */}
      <View style={styles.allInOneContainer}>
        <Card style={styles.allInOneCard} elevated={true}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Ionicons
              name="document-text"
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="h3" style={styles.cardTitle}>
              Document Analysis
            </Text>
          </View>

          {/* Summary Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="document"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                variant="subtitle1"
                weight="semibold"
                style={styles.sectionTitle}
              >
                Summary
              </Text>
            </View>
            <Text variant="body2" style={styles.summaryText}>
              {document.analysis.summary}
            </Text>
          </View>

          {/* Key Points Section */}
          {document.analysis.keyPoints &&
            document.analysis.keyPoints.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="list"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text
                    variant="subtitle1"
                    weight="semibold"
                    style={styles.sectionTitle}
                  >
                    Key Points
                  </Text>
                </View>
                <View style={styles.pointsList}>
                  {document.analysis.keyPoints.map((point, index) => (
                    <View key={index} style={styles.pointItem}>
                      <View style={styles.pointBullet}>
                        <Text style={styles.bulletText}>{index + 1}</Text>
                      </View>
                      <Text variant="body2" style={styles.pointText}>
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {/* Details Section */}
          {document.analysis.details && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="subtitle1"
                  weight="semibold"
                  style={styles.sectionTitle}
                >
                  Details
                </Text>
              </View>
              <Text variant="body2" style={styles.detailsText}>
                {document.analysis.details}
              </Text>
            </View>
          )}

          {/* Recommendations Section */}
          {document.analysis.recommendations &&
            document.analysis.recommendations.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="bulb"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text
                    variant="subtitle1"
                    weight="semibold"
                    style={styles.sectionTitle}
                  >
                    Recommendations
                  </Text>
                </View>
                <View style={styles.pointsList}>
                  {document.analysis.recommendations.map(
                    (recommendation, index) => (
                      <View key={index} style={styles.pointItem}>
                        <View
                          style={[
                            styles.pointBullet,
                            { backgroundColor: theme.colors.success + "20" },
                          ]}
                        >
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={theme.colors.success}
                          />
                        </View>
                        <Text variant="body2" style={styles.pointText}>
                          {recommendation}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  noAnalysisContainer: {
    padding: 16,
  },
  noAnalysisCard: {
    overflow: "hidden",
    borderRadius: 16,
  },
  noAnalysisGradient: {
    alignItems: "center",
    padding: 24,
  },
  noAnalysisIcon: {
    marginBottom: 16,
  },
  noAnalysisText: {
    textAlign: "center",
    marginBottom: 8,
  },
  noAnalysisDescription: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  analyzeButton: {
    minWidth: 180,
  },
  analyzingContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  analyzingText: {
    marginLeft: 8,
  },
  allInOneContainer: {
    padding: 16,
  },
  allInOneCard: {
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: (theme) => theme.colors.border,
  },
  cardTitle: {
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: (theme) => theme.colors.border + "50",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 8,
  },
  summaryText: {
    lineHeight: 22,
  },
  detailsText: {
    lineHeight: 22,
  },
  pointsList: {
    marginTop: 8,
  },
  pointItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  pointBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: (theme) => theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 12,
    fontWeight: "bold",
    color: (theme) => theme.colors.primary,
  },
  pointText: {
    flex: 1,
    lineHeight: 20,
  },
  alternativeContainer: {
    marginTop: 24,
  },
  altTitle: {
    marginBottom: 12,
    marginLeft: 4,
  },
  analysisCard: {
    marginBottom: 12,
  },
});

export default SummaryView;
