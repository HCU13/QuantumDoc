import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Card, Text, Badge } from "../../../components";

const QuestionsView = ({
  document,
  conversations,
  freeQuestionsCount,
  askQuestion,
  theme,
  t,
  TOKEN_COSTS,
}) => {
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Get formatted date for messages
  const getMessageDate = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const today = new Date();

    // Reset hours for today
    today.setHours(0, 0, 0, 0);

    // Create yesterday date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset hours for message date
    const messageDateNoTime = new Date(messageDate);
    messageDateNoTime.setHours(0, 0, 0, 0);

    if (messageDateNoTime.getTime() === today.getTime()) {
      return `Today, ${formatTime(messageDate)}`;
    } else if (messageDateNoTime.getTime() === yesterday.getTime()) {
      return `Yesterday, ${formatTime(messageDate)}`;
    } else {
      return `${formatDate(messageDate)}, ${formatTime(messageDate)}`;
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true);
  };

  // Handle input blur
  const handleInputBlur = () => {
    setIsFocused(false);
  };

  // Handle send question
  const handleSendQuestion = async () => {
    if (!question.trim() || sending) return;

    setSending(true);
    await askQuestion(question.trim());
    setQuestion("");
    setSending(false);
    Keyboard.dismiss();
  };

  // Document must be analyzed first
  if (document.status !== "analyzed") {
    return (
      <View style={styles.askMustAnalyzeFirst}>
        <Card style={styles.mustAnalyzeCard}>
          <View style={styles.mustAnalyzeContent}>
            <Ionicons
              name="alert-circle"
              size={40}
              color={theme.colors.warning}
            />
            <Text variant="subtitle1" style={styles.mustAnalyzeTitle}>
              Document must be analyzed first
            </Text>
            <Text
              variant="body2"
              color={theme.colors.textSecondary}
              style={styles.mustAnalyzeDesc}
            >
              Please analyze the document in the Summary tab to ask questions
              about it.
            </Text>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Free questions indicator */}
      {freeQuestionsCount > 0 && (
        <View style={styles.freeQuestionsContainer}>
          <Badge
            label={`${freeQuestionsCount} free ${
              freeQuestionsCount === 1 ? "question" : "questions"
            } left`}
            variant="info"
            size="small"
            leftIcon={
              <Ionicons
                name="information-circle"
                size={14}
                color={theme.colors.info}
              />
            }
          />
        </View>
      )}

      {/* Chat messages */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.messageContainer}>
            {/* Determine if we should show date */}
            {index === 0 ||
            getMessageDate(item.createdAt) !==
              getMessageDate(conversations[index - 1].createdAt) ? (
              <View style={styles.messageDateContainer}>
                <Text
                  variant="caption"
                  color={theme.colors.textTertiary}
                  style={styles.messageDate}
                >
                  {getMessageDate(item.createdAt)}
                </Text>
              </View>
            ) : null}

            {/* User message */}
            <View style={styles.userMessageContainer}>
              <View
                style={[
                  styles.userMessage,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  variant="body2"
                  color="#FFFFFF"
                  style={styles.messageText}
                >
                  {item.question}
                </Text>
              </View>
              <View
                style={[
                  styles.messageTail,
                  styles.userMessageTail,
                  { borderRightColor: theme.colors.primary },
                ]}
              />
            </View>

            {/* AI Response */}
            <View style={styles.aiMessageContainer}>
              <View
                style={[
                  styles.messageTail,
                  styles.aiMessageTail,
                  {
                    borderLeftColor: theme.isDark
                      ? theme.colors.card
                      : "#F0F0F0",
                  },
                ]}
              />
              <View
                style={[
                  styles.aiMessage,
                  {
                    backgroundColor: theme.isDark
                      ? theme.colors.card
                      : "#F0F0F0",
                    borderColor: item.error
                      ? theme.colors.error + "40"
                      : "transparent",
                  },
                ]}
              >
                {item.isPending ? (
                  <View style={styles.typingIndicator}>
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                    <Text
                      variant="caption"
                      color={theme.colors.textSecondary}
                      style={{ marginLeft: 8 }}
                    >
                      {t("document.thinking")}
                    </Text>
                  </View>
                ) : (
                  <Text
                    variant="body2"
                    color={item.error ? theme.colors.error : theme.colors.text}
                    style={styles.messageText}
                  >
                    {item.answer}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.conversationsList}
        inverted={false}
        ListEmptyComponent={
          <View style={styles.emptyConversation}>
            <Card
              style={styles.emptyConversationCard}
              variant={theme.isDark ? "default" : "bordered"}
              elevated={true}
            >
              <LinearGradient
                colors={[theme.colors.background, theme.colors.primary + "10"]}
                style={styles.emptyConversationGradient}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={60}
                  color={theme.colors.textSecondary}
                />
                <Text
                  variant="subtitle1"
                  color={theme.colors.text}
                  style={styles.emptyConversationText}
                >
                  Ask your first question about this document
                </Text>
                <Text
                  variant="body2"
                  color={theme.colors.textSecondary}
                  style={styles.emptyConversationDescription}
                >
                  Your first 3 questions are free. Additional questions cost
                  {" " + TOKEN_COSTS.QUESTION} tokens each.
                </Text>
              </LinearGradient>
            </Card>
          </View>
        }
      />

      {/* Chat input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: theme.isDark
                  ? theme.colors.card
                  : theme.colors.border + "20",
                borderColor: isFocused ? theme.colors.primary : "transparent",
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                },
              ]}
              placeholder={t("document.askPlaceholder")}
              placeholderTextColor={theme.colors.textSecondary}
              value={question}
              onChangeText={setQuestion}
              multiline
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: question.trim() && !sending ? 1 : 0.5,
                },
              ]}
              onPress={handleSendQuestion}
              disabled={!question.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {freeQuestionsCount <= 0 && (
            <View style={styles.tokenWarningContainer}>
              <Text variant="caption" color={theme.colors.warning}>
                <Ionicons name="key" size={12} color={theme.colors.warning} />{" "}
                {TOKEN_COSTS.QUESTION} tokens per question
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  askMustAnalyzeFirst: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  mustAnalyzeCard: {
    padding: 24,
  },
  mustAnalyzeContent: {
    alignItems: "center",
  },
  mustAnalyzeTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  mustAnalyzeDesc: {
    textAlign: "center",
    marginBottom: 24,
  },
  freeQuestionsContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  conversationsList: {
    padding: 16,
    paddingTop: 5,
    flexGrow: 1,
  },
  messageDateContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  messageDate: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(150, 150, 150, 0.1)",
    overflow: "hidden",
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: "flex-end",
    position: "relative",
    marginBottom: 2,
  },
  userMessage: {
    padding: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: "80%",
  },
  messageTail: {
    position: "absolute",
    bottom: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 8,
    borderTopColor: "transparent",
  },
  userMessageTail: {
    right: -6,
    borderLeftWidth: 6,
    borderLeftColor: "transparent",
    borderRightWidth: 6,
  },
  aiMessageContainer: {
    alignItems: "flex-start",
    position: "relative",
    marginTop: 2,
  },
  aiMessage: {
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    maxWidth: "80%",
    borderWidth: 1,
  },
  aiMessageTail: {
    left: -6,
    borderRightWidth: 6,
    borderRightColor: "transparent",
    borderLeftWidth: 6,
  },
  messageText: {
    lineHeight: 20,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  emptyConversation: {
    padding: 16,
    flex: 1,
    justifyContent: "center",
  },
  emptyConversationCard: {
    overflow: "hidden",
    borderRadius: 16,
  },
  emptyConversationGradient: {
    alignItems: "center",
    padding: 24,
  },
  emptyConversationText: {
    marginTop: 16,
    textAlign: "center",
  },
  emptyConversationDescription: {
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  tokenWarningContainer: {
    alignItems: "center",
    marginTop: 8,
  },
});

export default QuestionsView;
