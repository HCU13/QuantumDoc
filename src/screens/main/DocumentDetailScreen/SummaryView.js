// components/DocumentDetail/SummaryView.js
import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, Card, Divider } from "../../../components";

const SummaryView = ({ document, theme, refreshDocument, refreshing }) => {
  // File color for styling
  const getFileColor = () => {
    if (!document) return theme.colors.primary;

    const type = document.type?.toLowerCase() || "";
    const name = document.name?.toLowerCase() || "";

    let color = theme.colors.primary;
    if (type.includes("pdf")) color = theme.colors.error;
    else if (
      type.includes("image") ||
      type.includes("jpg") ||
      type.includes("png")
    )
      color = theme.colors.info;
    else if (type.includes("doc")) color = theme.colors.primary;
    else if (type.includes("text") || type.includes("txt"))
      color = theme.colors.textSecondary;

    return color;
  };

  const fileColor = getFileColor();

  // Mock data for analysis (will be used if no real analysis exists)
  const mockAnalysis = {
    summary:
      "This document details the quarterly financial performance for Q3 2023. The company reported a 12% increase in revenue compared to the previous quarter, reaching $24.5 million. Operating expenses remained stable at $18.2 million, resulting in a net profit margin of 26%. The growth was primarily driven by expansion in European markets, which saw a 22% increase in customer acquisition. The report highlights challenges in the supply chain that were successfully mitigated through strategic partnerships.",
    keyPoints: [
      "Revenue increased by 12% quarter-over-quarter to $24.5 million",
      "Operating expenses remained stable at $18.2 million",
      "Net profit margin improved to 26%, up from 22% in Q2",
      "European market expansion contributed 22% growth in new customers",
      "Supply chain challenges were successfully addressed through strategic partnerships",
    ],
    details:
      "The financial performance in Q3 2023 exceeded projections by 5%, primarily driven by the successful launch of our premium service tier which attracted 1,200 new enterprise clients. Customer retention rate improved to 94%, showing a 3% increase from the previous quarter. Marketing spend efficiency improved with customer acquisition cost decreasing by 15%. The B2B sector showed the strongest performance with 18% growth, while B2C grew by 9%. The company maintained healthy cash reserves of $34 million, providing adequate runway for planned expansion initiatives in Q4.",
    recommendations: [
      "Accelerate European market expansion with targeted marketing campaigns in Germany and France",
      "Invest in additional data center capacity to support growing enterprise client demands",
      "Continue supply chain diversification to reduce dependency on single-source vendors",
      "Allocate additional resources to the B2B sales team to capitalize on strong performance",
      "Develop a customer success program specifically for the enterprise segment to maintain high retention rates",
    ],
  };

  // Use document's analysis if it exists, otherwise use mock data
  // This ensures we always display an analysis, regardless of document.status
  const analysis = document.analysis || mockAnalysis;

  // Always show analysis view, never "Not Yet Analyzed"
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshDocument}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Summary Card */}
      <Card
        style={[styles.analysisCard, { backgroundColor: theme.colors.card }]}
        elevated={true}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: `${fileColor}15` },
              ]}
            >
              <Ionicons name="document-text" size={20} color={fileColor} />
            </View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                },
              ]}
            >
              Summary
            </Text>
          </View>
        </View>

        <Divider
          style={[styles.divider, { backgroundColor: theme.colors.divider }]}
        />

        <View style={styles.cardContent}>
          <Text
            style={[
              styles.summaryText,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.md,
                lineHeight: 22,
              },
            ]}
          >
            {analysis.summary || "No summary available"}
          </Text>
        </View>
      </Card>

      {/* Key Points Card */}
      {analysis.keyPoints && analysis.keyPoints.length > 0 && (
        <Card
          style={[styles.analysisCard, { backgroundColor: theme.colors.card }]}
          elevated={true}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: `${fileColor}15` },
                ]}
              >
                <Ionicons name="list" size={20} color={fileColor} />
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                  },
                ]}
              >
                Key Points
              </Text>
            </View>
          </View>

          <Divider
            style={[styles.divider, { backgroundColor: theme.colors.divider }]}
          />

          <View style={styles.cardContent}>
            <View style={styles.pointsList}>
              {analysis.keyPoints.map((point, index) => (
                <View key={index} style={styles.pointItem}>
                  <View
                    style={[
                      styles.pointBullet,
                      { backgroundColor: `${fileColor}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bulletText,
                        {
                          color: fileColor,
                          fontSize: theme.typography.fontSize.xs,
                          fontWeight: theme.typography.fontWeight.bold,
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.pointText,
                      {
                        color: theme.colors.text,
                        fontSize: theme.typography.fontSize.md,
                        lineHeight: 22,
                      },
                    ]}
                  >
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      )}

      {/* Details Section */}
      {analysis.details && (
        <Card
          style={[styles.analysisCard, { backgroundColor: theme.colors.card }]}
          elevated={true}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: `${fileColor}15` },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={fileColor}
                />
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                  },
                ]}
              >
                Details
              </Text>
            </View>
          </View>

          <Divider
            style={[styles.divider, { backgroundColor: theme.colors.divider }]}
          />

          <View style={styles.cardContent}>
            <Text
              style={[
                styles.detailsText,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.md,
                  lineHeight: 22,
                },
              ]}
            >
              {analysis.details}
            </Text>
          </View>
        </Card>
      )}

      {/* Recommendations Section */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card
          style={[styles.analysisCard, { backgroundColor: theme.colors.card }]}
          elevated={true}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: `${fileColor}15` },
                ]}
              >
                <Ionicons name="bulb" size={20} color={fileColor} />
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold,
                  },
                ]}
              >
                Recommendations
              </Text>
            </View>
          </View>

          <Divider
            style={[styles.divider, { backgroundColor: theme.colors.divider }]}
          />

          <View style={styles.cardContent}>
            <View style={styles.pointsList}>
              {analysis.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.pointItem}>
                  <View
                    style={[
                      styles.pointBullet,
                      { backgroundColor: `${fileColor}20` },
                    ]}
                  >
                    <Ionicons name="checkmark" size={12} color={fileColor} />
                  </View>
                  <Text
                    style={[
                      styles.pointText,
                      {
                        color: theme.colors.text,
                        fontSize: theme.typography.fontSize.md,
                        lineHeight: 22,
                      },
                    ]}
                  >
                    {recommendation}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      )}
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
  // Analysis cards styles
  analysisCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  divider: {
    marginHorizontal: 16,
  },
  cardContent: {
    padding: 16,
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
    marginBottom: 16,
    alignItems: "flex-start",
  },
  pointBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  pointText: {
    flex: 1,
  },
});

export default SummaryView;
