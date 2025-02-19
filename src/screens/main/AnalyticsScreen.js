// AnalyticsScreen.js
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export const AnalyticsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [tokenCount, setTokenCount] = useState(0);

  const periods = [
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
  ];

  const analyticsData = {
    documentsProcessed: 24,
    totalPages: 147,
    averageTime: "1.5",
    accuracy: 98,
    documentTypes: [
      { name: "PDF", count: 15, color: theme.colors.primary },
      { name: "Images", count: 6, color: theme.colors.secondary },
      { name: "Word", count: 3, color: theme.colors.info },
    ],
    processingData: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          data: [3, 5, 2, 8, 1, 3, 2],
        },
      ],
    },
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text
          variant="h1"
          style={[styles.headerTitle, { color: theme.colors.text }]}
        >
          Analytics
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
        >
          Document processing insights
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.tokenButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate("Premium")}
      >
        <Ionicons name="flash" size={18} color={theme.colors.warning} />
        <Text style={[styles.tokenCount, { color: theme.colors.text }]}>
          {tokenCount}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPeriodSelector = () => (
    <View
      style={[styles.periodSelector, { backgroundColor: theme.colors.surface }]}
    >
      {periods.map((period) => (
        <TouchableOpacity
          key={period.id}
          style={[
            styles.periodButton,
            selectedPeriod === period.id && {
              backgroundColor: theme.colors.primary + "15",
            },
          ]}
          onPress={() => setSelectedPeriod(period.id)}
        >
          <Text
            style={[
              styles.periodButtonText,
              {
                color:
                  selectedPeriod === period.id
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
              },
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        >
          <View
            style={[
              styles.statIcon,
              { backgroundColor: theme.colors.primary + "15" },
            ]}
          >
            <Ionicons
              name="document-text"
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {analyticsData.documentsProcessed}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Documents
          </Text>
        </View>

        <View
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        >
          <View
            style={[
              styles.statIcon,
              { backgroundColor: theme.colors.secondary + "15" },
            ]}
          >
            <Ionicons name="copy" size={24} color={theme.colors.secondary} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {analyticsData.totalPages}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Pages
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        >
          <View
            style={[
              styles.statIcon,
              { backgroundColor: theme.colors.success + "15" },
            ]}
          >
            <Ionicons name="time" size={24} color={theme.colors.success} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {analyticsData.averageTime}s
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Avg. Time
          </Text>
        </View>

        <View
          style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
        >
          <View
            style={[
              styles.statIcon,
              { backgroundColor: theme.colors.info + "15" },
            ]}
          >
            <Ionicons name="analytics" size={24} color={theme.colors.info} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {analyticsData.accuracy}%
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Accuracy
          </Text>
        </View>
      </View>
    </View>
  );

  const renderProcessingChart = () => (
    <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Processing Activity
        </Text>
        <TouchableOpacity>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={analyticsData.processingData}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => theme.colors.primary,
            labelColor: (opacity = 1) => theme.colors.textSecondary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: theme.colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </ScrollView>
    </View>
  );

  const renderDocumentTypes = () => (
    <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Document Types
        </Text>
      </View>

      <View style={styles.typesContainer}>
        {analyticsData.documentTypes.map((type, index) => (
          <View key={index} style={styles.typeRow}>
            <View style={styles.typeInfo}>
              <View
                style={[styles.typeIndicator, { backgroundColor: type.color }]}
              />
              <Text style={{ color: theme.colors.text }}>{type.name}</Text>
            </View>
            <Text style={{ color: theme.colors.textSecondary }}>
              {type.count} documents
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderUpgradeCard = () => (
    <View
      style={[styles.upgradeCard, { backgroundColor: theme.colors.surface }]}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.upgradeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.upgradeContent}>
          <View style={styles.upgradeIcon}>
            <Ionicons name="trending-up" size={32} color="white" />
          </View>
          <Text style={styles.upgradeTitle} color="white">
            Upgrade to Premium
          </Text>
          <Text style={styles.upgradeDescription} color="white">
            Get detailed analytics and unlimited document processing
          </Text>
          <Button
            title="View Plans"
            onPress={() => navigation.navigate("Premium")}
            type="secondary"
            theme={theme}
            style={styles.upgradeButton}
          />
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderPeriodSelector()}
        {renderStats()}
        {renderProcessingChart()}
        {renderDocumentTypes()}
        {renderUpgradeCard()}
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
  tokenButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    gap: 6,
  },
  tokenCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  periodSelector: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  chart: {
    marginRight: -20,
    borderRadius: 16,
  },
  typesContainer: {
    gap: 16,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  upgradeCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  upgradeGradient: {
    padding: 24,
  },
  upgradeContent: {
    alignItems: "center",
  },
  upgradeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  upgradeDescription: {
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.9,
  },
  upgradeButton: {
    minWidth: 150,
  },
});
