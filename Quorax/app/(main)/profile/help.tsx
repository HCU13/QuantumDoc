import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleHeader } from "@/components/common/ModuleHeader";
import { Button } from "@/components/common/Button";
import { supabase, TABLES } from "@/services/supabase";
import { showSuccess, showError } from "@/utils/toast";
import {
  SPACING,
  BORDER_RADIUS,
  TEXT_STYLES,
  SHADOWS,
} from "@/constants/theme";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export default function HelpSupportScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high",
    category: "general",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // FAQ list from i18n
  const faqList = useMemo(() => {
    try {
      const faqs = t("profile.help.faqList", { returnObjects: true });
      // Ensure it's an array
      if (Array.isArray(faqs) && faqs.length > 0) {
        return faqs as any[];
      }
      return [];
    } catch {
      return [];
    }
  }, [t]);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  // Load tickets from Supabase
  const loadTickets = useCallback(async () => {
    if (!isLoggedIn || !user?.id) {
      setTickets([]);
      return;
    }

    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setTickets(data || []);
    } catch (error: any) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  }, [isLoggedIn, user?.id]);

  // Load tickets when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [loadTickets])
  );

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.subject.trim()) {
      newErrors.subject = t("profile.help.errors.subjectRequired");
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = t("profile.help.errors.subjectMinLength");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("profile.help.errors.messageRequired");
    } else if (formData.message.trim().length < 20) {
      newErrors.message = t("profile.help.errors.messageMinLength");
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTicket = async () => {
    if (!validateForm()) return;

    if (!isLoggedIn || !user?.id) {
      Alert.alert(
        t("common.warning"),
        t("profile.feedback.errors.loginRequired"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("auth.login.button"), onPress: () => router.push("/(main)/login" as any) },
        ]
      );
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.SUPPORT_TICKETS)
        .insert({
          user_id: user.id,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          category: formData.category,
          priority: formData.priority,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;

      showSuccess(
        t("profile.help.success.title"),
        t("profile.help.success.message")
      );

      // Reset form
      setFormData({
        subject: "",
        message: "",
        priority: "medium",
        category: "general",
      });
      setFormErrors({});
      setShowTicketForm(false);

      // Reload tickets
      await loadTickets();
    } catch (error: any) {
      console.error("Error submitting ticket:", error);
      showError(
        t("common.error"),
        error.message || t("profile.help.errors.sendError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendTicket = () => {
    if (!isLoggedIn) {
      Alert.alert(
        t("common.warning"),
        t("profile.feedback.errors.loginRequired"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("auth.login.button"), onPress: () => router.push("/(main)/login" as any) },
        ]
      );
      return;
    }
    setShowTicketForm(!showTicketForm);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Dün";
    } else if (days < 7) {
      return `${days} gün önce`;
    } else {
      return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#3B82F6";
      case "in_progress":
        return "#F59E0B";
      case "resolved":
        return "#10B981";
      case "closed":
        return "#6B7280";
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Açık";
      case "in_progress":
        return "İşlemde";
      case "resolved":
        return "Çözüldü";
      case "closed":
        return "Kapatıldı";
      default:
        return status;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ModuleHeader title={t("profile.help.title")} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          {/* Header Card */}
          <View
            style={[styles.headerCard, { backgroundColor: colors.card }, SHADOWS.small]}
          >
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {t("profile.help.howCanHelp")}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {t("profile.help.helpDescription")}
            </Text>

            <TouchableOpacity
              style={styles.supportButton}
              onPress={handleSendTicket}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary || colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.supportButtonGradient}
              >
                <View style={styles.supportButtonIcon}>
                  <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.supportButtonText}>
                  {showTicketForm ? t("profile.help.cancel") : t("profile.help.sendTicket")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Ticket Form */}
          {showTicketForm && (
            <View
              style={[
                styles.ticketForm,
                { backgroundColor: colors.card },
                SHADOWS.small,
              ]}
            >
              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                {t("profile.help.sendTicket")}
              </Text>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  {t("profile.help.subject")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.textPrimary,
                      borderColor: formErrors.subject ? colors.error : colors.borderSubtle,
                    },
                  ]}
                  placeholder={t("profile.help.subjectPlaceholder")}
                  placeholderTextColor={colors.textTertiary}
                  value={formData.subject}
                  onChangeText={(text) => {
                    setFormData({ ...formData, subject: text });
                    if (formErrors.subject) {
                      setFormErrors({ ...formErrors, subject: "" });
                    }
                  }}
                />
                {formErrors.subject && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {formErrors.subject}
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  {t("profile.help.message")}
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      color: colors.textPrimary,
                      borderColor: formErrors.message ? colors.error : colors.borderSubtle,
                    },
                  ]}
                  placeholder={t("profile.help.messagePlaceholder")}
                  placeholderTextColor={colors.textTertiary}
                  value={formData.message}
                  onChangeText={(text) => {
                    setFormData({ ...formData, message: text });
                    if (formErrors.message) {
                      setFormErrors({ ...formErrors, message: "" });
                    }
                  }}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                {formErrors.message && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {formErrors.message}
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  {t("profile.help.priority")}
                </Text>
                <View style={styles.priorityButtons}>
                  {(["low", "medium", "high"] as const).map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityButton,
                        {
                          backgroundColor:
                            formData.priority === priority
                              ? colors.primary
                              : colors.backgroundSecondary,
                          borderColor:
                            formData.priority === priority
                              ? colors.primary
                              : colors.borderSubtle,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, priority })}
                    >
                      <Text
                        style={[
                          styles.priorityButtonText,
                          {
                            color:
                              formData.priority === priority
                                ? "#FFFFFF"
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        {priority === "low"
                          ? t("profile.help.priorityLow")
                          : priority === "medium"
                          ? t("profile.help.priorityMedium")
                          : t("profile.help.priorityHigh")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={[styles.helperText, { color: colors.textTertiary }]}>
                {t("profile.help.helperText")}
              </Text>

              <Button
                label={t("profile.help.send")}
                onPress={handleSubmitTicket}
                loading={submitting}
                disabled={submitting}
              />
            </View>
          )}

          {/* Tickets History */}
          {isLoggedIn && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIconContainer,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Ionicons name="document-text" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {t("profile.help.ticketsHistory")}
                </Text>
              </View>

              {loadingTickets ? (
                <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    {t("common.loading")}
                  </Text>
                </View>
              ) : tickets.length === 0 ? (
                <View
                  style={[
                    styles.emptyContainer,
                    { backgroundColor: colors.card },
                    SHADOWS.small,
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={40}
                    color={colors.textTertiary}
                  />
                  <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                    {t("profile.help.noTickets")}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                    {t("profile.help.noTicketsSubtitle")}
                  </Text>
                </View>
              ) : (
                tickets.map((ticket) => (
                  <View
                    key={ticket.id}
                    style={[
                      styles.ticketCard,
                      { backgroundColor: colors.card },
                      SHADOWS.small,
                    ]}
                  >
                    <View style={styles.ticketHeader}>
                      <View style={styles.ticketHeaderLeft}>
                        <Text
                          style={[styles.ticketSubject, { color: colors.textPrimary }]}
                          numberOfLines={1}
                        >
                          {ticket.subject}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(ticket.status) + "20" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: getStatusColor(ticket.status) },
                            ]}
                          >
                            {getStatusLabel(ticket.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.ticketDate, { color: colors.textTertiary }]}>
                        {formatTime(ticket.created_at)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.ticketMessage, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {ticket.message}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* FAQ Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconContainer,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Ionicons name="help-circle" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t("profile.help.faq")}
              </Text>
            </View>

            {faqList.length === 0 ? (
              <View
                style={[
                  styles.emptyContainer,
                  { backgroundColor: colors.card },
                  SHADOWS.small,
                ]}
              >
                <View
                  style={[
                    styles.emptyIconContainer,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={40}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                  {t("profile.help.noFaqTitle")}
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  {t("profile.help.noFaqSubtitle")}
                </Text>
              </View>
            ) : (
              faqList.map((faq: any) => (
                <View
                  key={faq.id}
                  style={[
                    styles.faqCard,
                    { backgroundColor: colors.card },
                    SHADOWS.small,
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => toggleFAQ(faq.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqQuestion}>
                      <View
                        style={[
                          styles.faqIconContainer,
                          { backgroundColor: colors.primarySoft },
                        ]}
                      >
                        <Ionicons
                          name="help-circle-outline"
                          size={24}
                          color={colors.primary}
                        />
                      </View>

                      <View style={styles.faqContent}>
                        <Text
                          style={[styles.faqQuestionText, { color: colors.textPrimary }]}
                        >
                          {faq.question}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.faqChevron,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Ionicons
                          name={
                            expandedFAQ === faq.id ? "chevron-up" : "chevron-down"
                          }
                          size={18}
                          color={colors.textSecondary}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {expandedFAQ === faq.id && (
                    <>
                      <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
                      <View style={styles.faqAnswer}>
                        <Text
                          style={[styles.faqAnswerText, { color: colors.textSecondary }]}
                        >
                          {faq.answer}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              ))
            )}
          </View>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  headerCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  supportButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    marginTop: SPACING.xs,
  },
  supportButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  supportButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.xs,
  },
  supportButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  faqCard: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: "hidden",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  faqIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  faqContent: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  faqChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  faqAnswer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    paddingLeft: 68,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl * 2,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  ticketForm: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  formTitle: {
    ...TEXT_STYLES.titleMedium,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TEXT_STYLES.labelMedium,
    marginBottom: SPACING.xs,
    fontWeight: "600",
  },
  input: {
    ...TEXT_STYLES.bodyMedium,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    minHeight: 44,
  },
  textArea: {
    ...TEXT_STYLES.bodyMedium,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    minHeight: 120,
  },
  errorText: {
    ...TEXT_STYLES.labelSmall,
    marginTop: SPACING.xs,
    fontSize: 12,
  },
  priorityButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
  },
  priorityButtonText: {
    ...TEXT_STYLES.labelSmall,
    fontWeight: "600",
  },
  helperText: {
    ...TEXT_STYLES.bodySmall,
    marginBottom: SPACING.md,
    fontSize: 12,
    lineHeight: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  loadingText: {
    ...TEXT_STYLES.bodySmall,
  },
  ticketCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  ticketHeaderLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  ticketSubject: {
    ...TEXT_STYLES.bodyMedium,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 11,
    fontWeight: "600",
  },
  ticketDate: {
    ...TEXT_STYLES.labelSmall,
    fontSize: 11,
  },
  ticketMessage: {
    ...TEXT_STYLES.bodySmall,
    lineHeight: 18,
  },
});

