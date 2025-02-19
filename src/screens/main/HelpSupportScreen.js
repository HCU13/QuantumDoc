// HelpSupportScreen.js
import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "../../components/common";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export const HelpSupportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [query, setQuery] = useState("");

  // Örnek SSS
  const faqs = [
    {
      id: "1",
      question: "How do tokens work?",
      answer:
        "Tokens are used for document analysis. Each analysis consumes one token. You get a free token when you sign up, and you can purchase more tokens from the Premium section.",
      category: "tokens",
    },
    {
      id: "2",
      question: "What file types are supported?",
      answer:
        "We currently support PDF, JPG, PNG, and DOC file formats. Files must be under 10MB in size.",
      category: "technical",
    },
    {
      id: "3",
      question: "How accurate is the AI analysis?",
      answer:
        "Our AI system maintains a 98% accuracy rate for document analysis. Results are verified using multiple verification layers.",
      category: "technical",
    },
    {
      id: "4",
      question: "Is my data secure?",
      answer:
        "Yes, we use end-to-end encryption and follow strict security protocols. Your documents are automatically deleted after processing.",
      category: "security",
    },
  ];

  const supportOptions = [
    {
      id: "chat",
      title: "Live Chat",
      description: "Chat with our support team",
      icon: "chatbubbles",
      color: theme.colors.primary,
    },
    {
      id: "email",
      title: "Email Support",
      description: "Get help via email",
      icon: "mail",
      color: theme.colors.secondary,
    },
    {
      id: "docs",
      title: "Documentation",
      description: "Read our user guides",
      icon: "book",
      color: theme.colors.success,
    },
  ];

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
        Help & Support
      </Text>
      <View style={styles.backButton} />
    </View>
  );

  const renderSearch = () => (
    <View
      style={[
        styles.searchContainer,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        placeholder="Search for help..."
        placeholderTextColor={theme.colors.textSecondary}
        value={query}
        onChangeText={setQuery}
      />
    </View>
  );

  const renderSupportOptions = () => (
    <View style={styles.supportSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Contact Support
      </Text>

      <View style={styles.supportGrid}>
        {supportOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.supportCard,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => {}}
          >
            <View
              style={[
                styles.supportIcon,
                { backgroundColor: option.color + "15" },
              ]}
            >
              <Ionicons name={option.icon} size={24} color={option.color} />
            </View>
            <Text style={[styles.supportTitle, { color: theme.colors.text }]}>
              {option.title}
            </Text>
            <Text
              style={[
                styles.supportDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFaqs = () => (
    <View style={styles.faqSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Frequently Asked Questions
      </Text>

      {faqs.map((faq) => (
        <TouchableOpacity
          key={faq.id}
          style={[styles.faqItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => setSelectedFaq(selectedFaq === faq.id ? null : faq.id)}
        >
          <View style={styles.faqHeader}>
            <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>
              {faq.question}
            </Text>
            <Ionicons
              name={selectedFaq === faq.id ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.textSecondary}
            />
          </View>

          {selectedFaq === faq.id && (
            <Text
              style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}
            >
              {faq.answer}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContactForm = () => (
    <View style={styles.contactSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Send us a Message
      </Text>

      <View
        style={[styles.contactForm, { backgroundColor: theme.colors.surface }]}
      >
        <TextInput
          style={[
            styles.messageInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.background,
            },
          ]}
          placeholder="Type your message here..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Button
          title="Send Message"
          onPress={() => {}}
          theme={theme}
          style={styles.sendButton}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.content}>
        {renderSearch()}
        {renderSupportOptions()}
        {renderFaqs()}
        {renderContactForm()}
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
    gap: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 24,
  },
  supportSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  supportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  supportCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  supportDescription: {
    fontSize: 13,
    textAlign: "center",
  },
  faqSection: {
    gap: 12,
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  contactSection: {
    gap: 16,
  },
  contactForm: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  messageInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    height: 120,
  },
  sendButton: {
    height: 48,
  },
});
