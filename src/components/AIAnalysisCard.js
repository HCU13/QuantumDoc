import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Text from "./Text";
import Card from "./Card";
import Badge from "./Badge";
import Divider from "./Divider";

/**
 * AIAnalysisCard - Displays AI analysis results
 *
 * @param {Object} analysis - Analysis data object
 * @param {string} analysisType - Type of analysis to display ('summary', 'keyPoints', 'recommendations')
 * @param {Object} style - Additional style overrides
 */
const AIAnalysisCard = ({
  analysis,
  analysisType = "summary",
  style,
  ...props
}) => {
  const [expanded, setExpanded] = useState(false);

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Get appropriate icon for analysis type
  const getAnalysisIcon = () => {
    switch (analysisType) {
      case "summary":
        return "📝";
      case "keyPoints":
        return "🔑";
      case "recommendations":
        return "💡";
      case "details":
        return "📋";
      default:
        return "📊";
    }
  };

  // Get title for analysis type
  const getAnalysisTitle = () => {
    switch (analysisType) {
      case "summary":
        return "Summary";
      case "keyPoints":
        return "Key Points";
      case "recommendations":
        return "Recommendations";
      case "details":
        return "Details";
      default:
        return "Analysis";
    }
  };

  // Get gradient colors for analysis type
  const getGradientColors = () => {
    switch (analysisType) {
      case "summary":
        return ["#5D5FEF20", "#7879F110"];
      case "keyPoints":
        return ["#61DAFB20", "#39C4E310"];
      case "recommendations":
        return ["#10B98120", "#34D39910"];
      case "details":
        return ["#8B5CF620", "#A78BFA10"];
      default:
        return ["#5D5FEF20", "#7879F110"];
    }
  };

  // Get content based on analysis type
  const renderContent = () => {
    if (!analysis) {
      return (
        <Text variant="body2" color="#64748B">
          No analysis available
        </Text>
      );
    }

    switch (analysisType) {
      case "summary":
        return (
          <Text variant="body2" style={styles.contentText}>
            {analysis.summary || "No summary available"}
          </Text>
        );
      case "keyPoints":
        if (!analysis.keyPoints || analysis.keyPoints.length === 0) {
          return (
            <Text variant="body2" color="#64748B">
              No key points available
            </Text>
          );
        }
        return (
          <View style={styles.listContainer}>
            {analysis.keyPoints.map((point, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text variant="body2" style={styles.listItemText}>
                  {point}
                </Text>
              </View>
            ))}
          </View>
        );
      case "recommendations":
        if (
          !analysis.recommendations ||
          analysis.recommendations.length === 0
        ) {
          return (
            <Text variant="body2" color="#64748B">
              No recommendations available
            </Text>
          );
        }
        return (
          <View style={styles.listContainer}>
            {analysis.recommendations.map((rec, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text variant="body2" style={styles.listItemText}>
                  {rec}
                </Text>
              </View>
            ))}
          </View>
        );
      case "details":
        return (
          <Text variant="body2" style={styles.contentText}>
            {analysis.details || "No details available"}
          </Text>
        );
      default:
        return (
          <Text variant="body2" color="#64748B">
            No content available
          </Text>
        );
    }
  };

  // Determine if content should be expandable
  const isContentExpandable = () => {
    let contentLength = 0;

    switch (analysisType) {
      case "summary":
        contentLength = analysis?.summary?.length || 0;
        break;
      case "keyPoints":
        contentLength = analysis?.keyPoints?.length || 0;
        break;
      case "recommendations":
        contentLength = analysis?.recommendations?.length || 0;
        break;
      case "details":
        contentLength = analysis?.details?.length || 0;
        break;
    }

    return (
      contentLength > 200 ||
      (Array.isArray(analysis?.[analysisType]) &&
        analysis[analysisType].length > 3)
    );
  };

  return (
    <Card
      variant="gradient"
      gradientColors={getGradientColors()}
      style={[styles.card, style]}
      {...props}
    >
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{getAnalysisIcon()}</Text>
          <Text variant="subtitle1" style={styles.title}>
            {getAnalysisTitle()}
          </Text>
        </View>

        {/* Expandable toggle */}
        {isContentExpandable() && (
          <TouchableOpacity
            onPress={toggleExpanded}
            style={styles.expandButton}
          >
            <Text style={styles.expandIcon}>{expanded ? "▼" : "▶︎"}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Divider color="#E2E8F0" />

      {/* Card Content */}
      <View
        style={[
          styles.content,
          expanded
            ? styles.expandedContent
            : isContentExpandable()
            ? styles.collapsedContent
            : {},
        ]}
      >
        {renderContent()}

        {/* Fade out effect on collapsed content */}
        {isContentExpandable() && !expanded && (
          <View style={styles.contentFade} />
        )}
      </View>

      {/* Expand button at bottom for collapsed content */}
      {isContentExpandable() && !expanded && (
        <TouchableOpacity
          onPress={toggleExpanded}
          style={styles.expandPrompt}
          activeOpacity={0.7}
        >
          <Badge label="Read more" variant="primary" size="small" />
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 0,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontWeight: "600",
  },
  expandButton: {
    padding: 4,
  },
  expandIcon: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#64748B",
  },
  content: {
    padding: 16,
    paddingTop: 8,
  },
  collapsedContent: {
    maxHeight: 100,
    overflow: "hidden",
  },
  expandedContent: {
    // No height restriction
  },
  contentFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  expandPrompt: {
    alignSelf: "center",
    marginBottom: 16,
  },
  contentText: {
    lineHeight: 22,
  },
  listContainer: {
    marginTop: 4,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    color: "#5D5FEF",
  },
  listItemText: {
    flex: 1,
    lineHeight: 20,
  },
});

export default AIAnalysisCard;
