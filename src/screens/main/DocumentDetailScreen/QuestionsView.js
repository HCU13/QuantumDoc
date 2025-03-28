import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, Badge } from "../../../components";

const QuestionsView = ({
  document,
  conversations,
  freeQuestionsCount,
  askQuestion,
  question,
  setQuestion,
  sending,
  theme,
  isDark,
  isConnected,
}) => {
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

  // Format timestamp
  const formatTimestamp = (date) => {
    if (!date) return "";
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return dateObj.toLocaleDateString();
  };

  return (
    <View style={styles.questionsContainer}>
      {/* Message List */}
      <ScrollView
        style={styles.messageList}
        contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
        inverted={conversations.length > 0}
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyChat}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text
              style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                textAlign: "center",
                marginTop: theme.spacing.lg,
                marginBottom: theme.spacing.sm,
                color: theme.colors.text,
              }}
            >
              Ask About This Document
            </Text>
            <Text
              style={{
                textAlign: "center",
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.md,
              }}
            >
              Ask questions about the content of this document to get detailed
              answers from Claude AI.
            </Text>
            {freeQuestionsCount > 0 && (
              <Badge
                label={`${freeQuestionsCount} Free Questions Remaining`}
                variant="success"
                style={{ marginTop: theme.spacing.md }}
              />
            )}
          </View>
        ) : (
          conversations.map((conv, index) => (
            <View key={conv.id || index} style={styles.messageContainer}>
              {/* User Question */}
              <View style={styles.userMessage}>
                <View
                  style={[
                    styles.userAvatar,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </View>
                <View
                  style={[
                    styles.messageBubble,
                    styles.userBubble,
                    {
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.borderRadius.lg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      { color: theme.colors.textInverted },
                    ]}
                  >
                    {conv.question}
                  </Text>
                  
                  {/* Timestamp for question */}
                  {conv.createdAt && (
                    <Text 
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.7)',
                        marginTop: 4,
                        alignSelf: 'flex-end'
                      }}
                    >
                      {formatTimestamp(conv.createdAt)}
                    </Text>
                  )}
                </View>
              </View>

              {/* AI Answer */}
              <View style={styles.aiMessage}>
                <View style={[styles.aiAvatar, { backgroundColor: fileColor }]}>
                  <Ionicons name="document-text" size={20} color="#FFFFFF" />
                </View>
                <View
                  style={[
                    styles.messageBubble,
                    styles.aiBubble,
                    {
                      backgroundColor: isDark
                        ? theme.colors.surface
                        : theme.colors.background,
                      borderRadius: theme.borderRadius.lg,
                    },
                    conv.error && {
                      backgroundColor: `${theme.colors.error}20`,
                    },
                    theme.shadows.sm,
                  ]}
                >
                  {conv.isPending ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                      />
                      <Text 
                        style={{
                          marginLeft: 10, 
                          color: theme.colors.textSecondary,
                          fontSize: 14
                        }}
                      >
                        Claude is thinking...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.messageText,
                          { color: theme.colors.text },
                          conv.error && { color: theme.colors.error },
                        ]}
                      >
                        {conv.answer || "No answer available."}
                      </Text>
                      
                      {/* AI attribution */}
                      <View style={styles.aiAttribution}>
                        <Text 
                          style={{
                            fontSize: 11,
                            color: theme.colors.textSecondary,
                          }}
                        >
                          Powered by Claude AI
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 50}
        style={[styles.inputContainer, { borderTopColor: theme.colors.border }]}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark
                  ? theme.colors.surface
                  : theme.colors.background,
                color: theme.colors.text,
                borderRadius: theme.borderRadius.round,
              },
            ]}
            placeholder="Ask a question about this document..."
            placeholderTextColor={theme.colors.textSecondary}
            value={question}
            onChangeText={setQuestion}
            multiline
            maxLength={500}
            editable={isConnected}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: question.trim() && isConnected
                  ? theme.colors.primary
                  : theme.colors.disabled,
                borderRadius: theme.borderRadius.round,
              },
            ]}
            onPress={askQuestion}
            disabled={!question.trim() || sending || !isConnected}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={theme.colors.textInverted}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Status messages */}
        {!isConnected ? (
          <Text style={[styles.statusMessage, { color: theme.colors.warning }]}>
            <Ionicons name="cloud-offline" size={14} /> You're offline. Connect to the internet to ask questions.
          </Text>
        ) : freeQuestionsCount <= 0 ? (
          <Text style={[styles.statusMessage, { color: theme.colors.info }]}>
            <Ionicons name="information-circle-outline" size={14} /> Questions now require tokens (0.2 tokens per question)
          </Text>
        ) : (
          <Text style={[styles.statusMessage, { color: theme.colors.success }]}>
            <Ionicons name="checkmark-circle-outline" size={14} /> {freeQuestionsCount} free questions remaining
          </Text>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  questionsContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  messageContainer: {
    marginBottom: 20,
  },
  userMessage: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  aiMessage: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: "#5E35B1",
  },
  aiBubble: {
    backgroundColor: "#F2F2F7",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  aiAttribution: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  // Input area
  inputContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingHorizontal: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  statusMessage: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});

export default QuestionsView;