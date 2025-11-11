import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import useTheme from "../../hooks/useTheme";
import SupportTicketModal from "../../components/common/SupportTicketModal";
import { useTranslation } from "react-i18next";

const HelpSupportScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // FAQ'ları i18n'den al
  const faqList = useMemo(() => {
    return t('profile.help.faqList', { returnObjects: true }) || [];
  }, [t]);

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    headerCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    supportButton: {
      borderRadius: 12,
      overflow: "hidden",
      marginTop: 8,
    },
    supportButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 14,
    },
    supportButtonIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    supportButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    faqCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    faqQuestion: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    faqIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.primary + "10",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    faqContent: {
      flex: 1,
      marginRight: 8,
    },
    faqQuestionText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
      lineHeight: 20,
    },
    faqChevron: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    faqAnswer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingLeft: 68,
    },
    faqAnswerText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    emptyContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + "10",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Header title={t('profile.help.title')} onBackPress={() => navigation.goBack()} />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>{t('profile.help.faq')}</Text>
          </View>

          {faqList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={40}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.emptyText}>{t('profile.help.noFaqTitle')}</Text>
              <Text style={styles.emptySubtext}>
                {t('profile.help.noFaqSubtitle')}
              </Text>
            </View>
          ) : (
            faqList.map((faq) => (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  onPress={() => toggleFAQ(faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestion}>
                    <View style={styles.faqIconContainer}>
                      <Ionicons
                        name="help-circle-outline"
                        size={24}
                        color={colors.primary}
                      />
                    </View>

                    <View style={styles.faqContent}>
                      <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    </View>

                    <View style={styles.faqChevron}>
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
                    <View style={styles.divider} />
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  </>
                )}
              </View>
            ))
          )}
        </View>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            {t('profile.help.howCanHelp')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('profile.help.helpDescription')}
          </Text>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => setShowSupportModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.supportButtonGradient}
            >
              <View style={styles.supportButtonIcon}>
                <Ionicons
                  name="chatbubble-ellipses"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.supportButtonText}>
                {t('profile.help.sendTicket')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Support Modal */}
      <SupportTicketModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        onSuccess={() => {
          setShowSupportModal(false);
        }}
      />
      </SafeAreaView>
    </GradientBackground>
  );
};

export default HelpSupportScreen;
