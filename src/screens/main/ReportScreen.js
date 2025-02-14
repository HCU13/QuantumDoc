import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
const { width } = Dimensions.get("window");

export const ReportScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const navigation = useNavigation();
  const periods = [
    { id: "day", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
  ];

  const reports = [
    {
      id: "1",
      title: "Monthly Financial Summary",
      date: "Feb 14, 2024",
      type: "Financial",
      pages: 15,
      insights: 8,
      status: "completed",
      progress: 100,
    },
    {
      id: "2",
      title: "Market Analysis Report",
      date: "Feb 13, 2024",
      type: "Analytics",
      pages: 23,
      insights: 12,
      status: "in_progress",
      progress: 65,
    },
    {
      id: "3",
      title: "Customer Feedback Analysis",
      date: "Feb 12, 2024",
      type: "Research",
      pages: 18,
      insights: 15,
      status: "completed",
      progress: 100,
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text
          style={[styles.headerTitle, { color: theme.colors.text }]}
          variant="h1"
        >
          Reports & Analytics
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
        >
          View insights and analysis
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.optionsButton,
          { backgroundColor: theme.colors.surface },
        ]}
        onPress={() => {}}
      >
        <Ionicons name="options-outline" size={20} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderAnalyticsSummary = () => (
    <View style={styles.analyticsCard}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.analyticsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.analyticsHeader}>
          <Text style={styles.analyticsTitle} color="white">
            Analytics Overview
          </Text>
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                onPress={() => setSelectedPeriod(period.id)}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.id && styles.periodButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    {
                      color:
                        selectedPeriod === period.id
                          ? theme.colors.primary
                          : "white",
                    },
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue} color="white">
              24
            </Text>
            <Text style={styles.statLabel} color="white">
              Reports Generated
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue} color="white">
              147
            </Text>
            <Text style={styles.statLabel} color="white">
              Pages Analyzed
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue} color="white">
              85
            </Text>
            <Text style={styles.statLabel} color="white">
              Key Insights
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderReportCard = (report) => (
    <TouchableOpacity
      key={report.id}
      style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleSection}>
          <View
            style={[
              styles.reportTypeIcon,
              { backgroundColor: theme.colors.primary + "15" },
            ]}
          >
            <Ionicons
              name={
                report.type === "Financial"
                  ? "stats-chart"
                  : report.type === "Analytics"
                  ? "analytics"
                  : "documents"
              }
              size={20}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.reportTitleContainer}>
            <Text
              style={[styles.reportTitle, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {report.title}
            </Text>
            <Text
              style={[styles.reportMeta, { color: theme.colors.textSecondary }]}
            >
              {report.date} • {report.pages} pages
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.reportStats}>
        <View style={styles.insightSection}>
          <View style={styles.insightIcon}>
            <Ionicons name="bulb" size={16} color={theme.colors.warning} />
          </View>
          <Text style={{ color: theme.colors.text }}>
            {report.insights} Key Insights
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.border },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${report.progress}%`,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.progressText, { color: theme.colors.textSecondary }]}
          >
            {report.progress}%
          </Text>
        </View>

        <View style={styles.reportActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary + "10" },
            ]}
            onPress={() => {
              navigation.navigate("DocumentDetail", {
                params: {
                  documentId: 1,
                },
              });
            }}
          >
            <Ionicons name="eye" size={18} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary }}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.success + "10" },
            ]}
          >
            <Ionicons name="download" size={18} color={theme.colors.success} />
            <Text style={{ color: theme.colors.success }}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderAnalyticsSummary()}

        <View style={styles.reportsSection}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.text }]}
            variant="h2"
          >
            Recent Reports
          </Text>
          <View style={styles.reportsList}>
            {reports.map(renderReportCard)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  optionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  analyticsCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  analyticsGradient: {
    padding: 24,
  },
  analyticsHeader: {
    marginBottom: 24,
  },
  analyticsTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: "white",
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.9,
  },
  reportsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  reportsList: {
    gap: 16,
  },
  reportCard: {
    borderRadius: 16,
    padding: 16,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  reportTitleSection: {
    flexDirection: "row",
    flex: 1,
    marginRight: 16,
  },
  reportTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reportTitleContainer: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 12,
  },
  reportStats: {
    gap: 16,
  },
  insightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  insightIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
  reportActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
