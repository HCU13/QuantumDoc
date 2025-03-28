import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Text, Button, Badge } from "../../../../components";
import { useTheme } from "../../../../context/ThemeContext";

const AnalysisResultCard = ({ result, onViewDocument }) => {
  const { theme, isDark } = useTheme();

  if (!result) return null;

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View
        style={[
          styles.successIcon,
          { backgroundColor: theme.colors.success + "15" },
        ]}
      >
        <Ionicons
          name="checkmark-circle"
          size={36}
          color={theme.colors.success}
        />
      </View>

      {/* Success Title */}
      <Text
        variant="subtitle1"
        color={theme.colors.success}
        style={styles.successTitle}
      >
        Analysis Complete!
      </Text>

      {/* Result Preview */}
      {/* <View style={styles.resultPreview}>

        <View style={styles.resultSection}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="document-text"
              size={20}
              color={theme.colors.primary}
            />
            <Text variant="subtitle2" style={styles.sectionTitle}>
              Summary
            </Text>
          </View>

          <Text
            variant="body2"
            color={theme.colors.textSecondary}
            style={styles.summaryText}
            numberOfLines={3}
          >
            {result.summary}
          </Text>
        </View>


        <View style={styles.resultSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={theme.colors.info} />
            <Text variant="subtitle2" style={styles.sectionTitle}>
              Key Points
            </Text>
          </View>

          <View style={styles.keyPointsList}>
            {result.keyPoints.slice(0, 2).map((point, index) => (
              <View key={index} style={styles.keyPointItem}>
                <View
                  style={[
                    styles.pointBullet,
                    { backgroundColor: theme.colors.info + "20" },
                  ]}
                >
                  <Text style={{ color: theme.colors.info }}>{index + 1}</Text>
                </View>
                <Text
                  variant="body2"
                  style={styles.keyPointText}
                  numberOfLines={1}
                >
                  {point}
                </Text>
              </View>
            ))}

            {result.keyPoints.length > 2 && (
              <Text
                variant="caption"
                color={theme.colors.textSecondary}
                style={styles.morePoints}
              >
                +{result.keyPoints.length - 2} more points
              </Text>
            )}
          </View>
        </View>

       
        {result.topics && result.topics.length > 0 && (
          <View style={styles.topicsContainer}>
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.topicsLabel}
            >
              Topics:
            </Text>

            <View style={styles.topicsList}>
              {result.topics.map((topic, index) => (
                <Badge
                  key={index}
                  label={topic}
                  variant={
                    index % 3 === 0
                      ? "primary"
                      : index % 3 === 1
                      ? "secondary"
                      : "info"
                  }
                  size="small"
                  style={styles.topicBadge}
                />
              ))}
            </View>
          </View>
        )}
      </View> */}

      {/* View Document Button */}
      <Button
        label="View Document"
        onPress={onViewDocument}
        gradient={true}
        style={styles.viewButton}
      />

      {/* Success Message */}
      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={styles.successNote}
      >
        Your document is now available in your document library
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 16,
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    marginBottom: 24,
    textAlign: "center",
  },
  resultPreview: {
    width: "100%",
    marginBottom: 24,
  },
  resultSection: {
    marginBottom: 20,
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
    lineHeight: 20,
  },
  keyPointsList: {
    marginTop: 8,
  },
  keyPointItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pointBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  keyPointText: {
    flex: 1,
  },
  morePoints: {
    marginTop: 4,
    fontStyle: "italic",
  },
  topicsContainer: {
    marginTop: 8,
  },
  topicsLabel: {
    marginBottom: 8,
  },
  topicsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  topicBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  viewButton: {
    minWidth: 200,
    marginBottom: 16,
  },
  successNote: {
    textAlign: "center",
  },
});

export default AnalysisResultCard;
