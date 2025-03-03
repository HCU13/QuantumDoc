import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export const BillingHistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();

  // Örnek fatura geçmişi
  const billingHistory = [
    {
      id: "1",
      date: "2024-02-23",
      type: "token_purchase",
      amount: 14.99,
      tokens: 200,
      status: "completed",
    },
    {
      id: "2",
      date: "2024-02-15",
      type: "subscription",
      amount: 29.99,
      plan: "Premium Monthly",
      status: "completed",
    },
    {
      id: "3",
      date: "2024-01-23",
      type: "token_purchase",
      amount: 4.99,
      tokens: 50,
      status: "completed",
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getIconForType = (type) => {
    switch (type) {
      case "token_purchase":
        return { name: "flash", color: theme.colors.warning };
      case "subscription":
        return { name: "star", color: theme.colors.primary };
      default:
        return { name: "card", color: theme.colors.secondary };
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text
        style={[styles.headerTitle, { color: theme.colors.text }]}
        variant="h2"
      >
        Billing History
      </Text>
      <View style={styles.backButton} />
    </View>
  );

  const renderTransactionItem = (transaction) => {
    const icon = getIconForType(transaction.type);

    return (
      <TouchableOpacity
        key={transaction.id}
        style={[
          styles.transactionItem,
          { backgroundColor: theme.colors.surface },
        ]}
        onPress={() => {
          // Fatura detaylarına git
        }}
      >
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.transactionIcon,
              { backgroundColor: icon.color + "15" },
            ]}
          >
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>

          <View style={styles.transactionInfo}>
            <Text
              style={[styles.transactionTitle, { color: theme.colors.text }]}
            >
              {transaction.type === "token_purchase"
                ? `${transaction.tokens} Tokens`
                : transaction.plan}
            </Text>
            <Text
              style={[
                styles.transactionDate,
                { color: theme.colors.textSecondary },
              ]}
            >
              {formatDate(transaction.date)}
            </Text>
          </View>
        </View>

        <View style={styles.transactionRight}>
          <Text
            style={[styles.transactionAmount, { color: theme.colors.text }]}
          >
            ${transaction.amount}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  transaction.status === "completed"
                    ? theme.colors.success + "15"
                    : theme.colors.warning + "15",
              },
            ]}
          >
            <Text
              style={{
                color:
                  transaction.status === "completed"
                    ? theme.colors.success
                    : theme.colors.warning,
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              {transaction.status.charAt(0).toUpperCase() +
                transaction.status.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: theme.colors.primary + "15" },
        ]}
      >
        <Ionicons
          name="receipt-outline"
          size={32}
          color={theme.colors.primary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Transactions Yet
      </Text>
      <Text
        style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}
      >
        Your billing history will appear here
      </Text>
      <Button
        title="Get Tokens"
        onPress={() => navigation.navigate("Premium")}
        theme={theme}
        style={styles.getTokensButton}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.content}>
        {billingHistory.length > 0
          ? billingHistory.map(renderTransactionItem)
          : renderEmptyState()}
      </ScrollView>
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
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    gap: 12,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 100,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  getTokensButton: {
    minWidth: 200,
  },
});
