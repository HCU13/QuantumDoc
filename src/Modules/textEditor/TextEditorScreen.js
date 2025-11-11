import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import ModuleIntroCard from "../../components/common/ModuleIntroCard";
import ModuleModeSelector from "../../components/common/ModuleModeSelector";
import ResultText from "../../components/common/ResultText";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useTokenContext } from "../../contexts/TokenContext";
import { useTextEditor } from "../../hooks/useTextEditor";
import { useAuth } from "../../contexts/AuthContext";
import { showError, showSuccess, showInfo } from "../../utils/toast";
import {
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { COLORS } from "../../constants/colors";

const TextEditorScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { tokens, getTokenCostLabel, getTokenCost } = useTokenContext();
  const { user } = useAuth();
  const { processText, loading: hookLoading } = useTextEditor();

  // Modül rengini al
  const moduleColor =
    colors.textEditorPrimary || COLORS.light.textEditorPrimary;
  const moduleColorLight =
    colors.textEditorPrimaryLight || COLORS.light.textEditorPrimaryLight;

  const [mode, setMode] = useState("fix"); // fix, summarize, email, tone, length
  const [tokenLabel, setTokenLabel] = useState("3 token/işlem");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Email mode için özel state'ler
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTone, setEmailTone] = useState("professional"); // professional, casual, formal, friendly

  // Gelişmiş ayarlar state'leri
  const [showSettings, setShowSettings] = useState(false);
  const [targetAudience, setTargetAudience] = useState("general"); // children, teen, professional, academic, general
  const [outputFormat, setOutputFormat] = useState("plain"); // plain, markdown, html, json, xml
  const [academicStyle, setAcademicStyle] = useState("none"); // none, apa, mla, chicago
  const [toneAnalysisEnabled, setToneAnalysisEnabled] = useState(false);
  const [readabilityScoreEnabled, setReadabilityScoreEnabled] = useState(true);

  // Sonuç için metadata
  const [resultMetadata, setResultMetadata] = useState(null); // { readabilityBefore, readabilityAfter, toneBefore, toneAfter, readingTime }

  // Token maliyetini database'den yükle
  useEffect(() => {
    const loadTokenLabel = async () => {
      const label = await getTokenCostLabel("textEditor");
      if (label) {
        setTokenLabel(label);
      }
    };
    loadTokenLabel();
  }, [getTokenCostLabel]);

  const modes = [
    {
      value: "fix",
      label: t("textEditor.modes.grammarCheck"),
      icon: "checkmark-circle-outline",
    },
    {
      value: "summarize",
      label: t("textEditor.modes.summarize"),
      icon: "document-text-outline",
    },
    {
      value: "email",
      label: t("textEditor.modes.emailWriting"),
      icon: "mail-outline",
    },
    {
      value: "tone",
      label: t("textEditor.modes.toneAdjustment"),
      icon: "color-palette-outline",
    },
    {
      value: "length",
      label: t("textEditor.modes.lengthOptimization"),
      icon: "resize-outline",
    },
  ];

  const handleProcess = async () => {
    if (!inputText.trim()) {
      showError(t("common.warning"), t("textEditor.errors.emptyText"));
      return;
    }

    // Token kontrolü
    const tokenCost = getTokenCost("textEditor") || 3;
    if (tokens < tokenCost) {
      showError(
        t("common.tokenInsufficient"),
        t("common.tokenInsufficientMessage", { cost: tokenCost, tokens })
      );
      return;
    }

    setLoading(true);
    try {
      const resultData = await processText(
        inputText,
        mode,
        mode === "email" ? emailTo : null,
        mode === "email" ? emailSubject : null,
        mode === "email" ? emailTone : null,
        targetAudience,
        outputFormat,
        academicStyle,
        toneAnalysisEnabled,
        readabilityScoreEnabled
      );

      if (resultData.success) {
        setResult(resultData.result);
        // Metadata varsa kaydet (okunabilirlik skoru, ton analizi vb.)
        if (resultData.metadata) {
          setResultMetadata(resultData.metadata);
        } else {
          setResultMetadata(null);
        }
      }
    } catch (err) {
      if (err.message === "INSUFFICIENT_TOKENS") {
        showError(
          t("common.tokenInsufficient"),
          t("common.tokenInsufficientMessage", { cost: tokenCost, tokens })
        );
      } else {
        showError(
          t("common.error"),
          err.message || t("textEditor.errors.processFailed")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setResult("");
    setResultMetadata(null);
  };

  const handleCopy = async () => {
    if (result) {
      await Clipboard.setString(result);
      showSuccess(t("common.success"), t("textEditor.copied"));
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 0,
    },
    content: {
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm,
      flex: 1,
    },
    inputContainer: {
      marginBottom: SPACING.md,
    },
    inputLabel: {
      ...TEXT_STYLES.labelMedium,
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
    },
    textInput: {
      backgroundColor: colors.input,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      ...TEXT_STYLES.bodyMedium,
      color: colors.textPrimary,
      minHeight: 150,
      maxHeight: 400, // Daha büyük input alanı
      textAlignVertical: "top",
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultContainer: {
      marginBottom: SPACING.md,
    },
    resultLabel: {
      ...TEXT_STYLES.labelMedium,
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
    },
    resultText: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.lg,
      minHeight: 120,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    actionButton: {
      flex: 1,
    },
    iconButton: {
      width: 48,
      height: 48,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    emailInputsContainer: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emailInputRow: {
      marginBottom: SPACING.sm,
    },
    emailLabel: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    emailInput: {
      backgroundColor: colors.input,
      borderRadius: BORDER_RADIUS.sm,
      padding: SPACING.sm,
      ...TEXT_STYLES.bodySmall,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toneButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.xs,
    },
    toneButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.sm,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toneButtonActive: {
      backgroundColor: moduleColor,
      borderColor: moduleColor,
    },
    toneButtonText: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textSecondary,
    },
    toneButtonTextActive: {
      color: colors.textOnPrimary,
      fontWeight: "600",
    },
    settingsContainer: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.sm + 2,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.sm,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.xs,
      top: 3,
    },
    settingsTitle: {
      ...TEXT_STYLES.labelMedium,
      color: colors.textPrimary,
    },
    settingsContent: {
      marginTop: SPACING.sm,
    },
    settingRow: {
      marginBottom: SPACING.sm,
    },
    settingLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.xs + 2,
    },
    settingLabel: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textPrimary,
      fontWeight: "500",
      fontSize: 13,
    },
    settingDescription: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: SPACING.xs + 2,
      opacity: 0.5,
    },
    settingButtons: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 2,
    },
    settingButton: {
      paddingHorizontal: SPACING.sm + 2,
      paddingVertical: 6,
      borderRadius: BORDER_RADIUS.sm,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingButtonActive: {
      backgroundColor: moduleColor,
      borderColor: moduleColor,
    },
    settingButtonText: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textSecondary,
    },
    settingButtonTextActive: {
      color: colors.textOnPrimary,
      fontWeight: "600",
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkboxLabelContainer: {
      flex: 1,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: SPACING.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxActive: {
      backgroundColor: moduleColor,
      borderColor: moduleColor,
    },
    metadataContainer: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      marginTop: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metadataTitle: {
      ...TEXT_STYLES.labelMedium,
      color: colors.textPrimary,
      fontWeight: "600",
      marginBottom: SPACING.sm,
    },
    metadataRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: SPACING.xs,
    },
    metadataLabel: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
    },
    metadataValue: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textPrimary,
      fontWeight: "600",
    },
  });

  return (
    <GradientBackground mode="default">
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />

        <Header
          title={t("modules.textEditor.title")}
          showBackButton={true}
          alignLeft={true}
          rightComponent={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: 160,
              }}
            >
              <View
                style={{
                  backgroundColor: moduleColor + "15",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                  marginRight: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: moduleColor,
                  }}
                >
                  {tokenLabel}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginRight: 8,
                }}
              >
                <Image
                  source={require("../../assets/images/token.png")}
                  style={{ width: 12, height: 12, marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: colors.textPrimary,
                  }}
                >
                  {tokens}
                </Text>
              </View>
            </View>
          }
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Intro Card */}
            <ModuleIntroCard moduleId="textEditor" moduleColor={moduleColor} />

            {/* Mode Switch */}
            <ModuleModeSelector
              moduleId="textEditor"
              moduleColor={moduleColor}
              modes={modes}
              selectedMode={mode}
              onModeChange={setMode}
              descriptionKeyPrefix="textEditor"
            />

            {/* Gelişmiş Ayarlar */}
            <View style={styles.settingsContainer}>
              <TouchableOpacity
                style={styles.settingsHeader}
                onPress={() => setShowSettings(!showSettings)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.settingsTitle}>
                  {t("textEditor.settings.title")}
                </Text>
                <Ionicons
                  name={showSettings ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.textSecondary}
                  pointerEvents="none"
                />
              </TouchableOpacity>

              {showSettings && (
                <View style={styles.settingsContent}>
                  {/* Hedef Kitle */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingLabelContainer}>
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color={moduleColor}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.settingLabel}>
                        {t("textEditor.settings.targetAudience.label")}
                      </Text>
                    </View>
                    <View style={styles.settingButtons}>
                      {[
                        "general",
                        "children",
                        "teen",
                        "professional",
                        "academic",
                      ].map((audience) => (
                        <TouchableOpacity
                          key={audience}
                          style={[
                            styles.settingButton,
                            targetAudience === audience &&
                              styles.settingButtonActive,
                          ]}
                          onPress={() => setTargetAudience(audience)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.settingButtonText,
                              targetAudience === audience &&
                                styles.settingButtonTextActive,
                            ]}
                          >
                            {t(
                              `textEditor.settings.targetAudience.${audience}`
                            )}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Çıktı Formatı */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingLabelContainer}>
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color={moduleColor}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.settingLabel}>
                        {t("textEditor.settings.format.label")}
                      </Text>
                    </View>
                    <View style={styles.settingButtons}>
                      {["plain", "markdown", "html", "json", "xml"].map(
                        (format) => (
                          <TouchableOpacity
                            key={format}
                            style={[
                              styles.settingButton,
                              outputFormat === format &&
                                styles.settingButtonActive,
                            ]}
                            onPress={() => setOutputFormat(format)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.settingButtonText,
                                outputFormat === format &&
                                  styles.settingButtonTextActive,
                              ]}
                            >
                              {t(`textEditor.settings.format.${format}`)}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Akademik Stil */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingLabelContainer}>
                      <Ionicons
                        name="school-outline"
                        size={16}
                        color={moduleColor}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.settingLabel}>
                        {t("textEditor.settings.academicStyle.label")}
                      </Text>
                    </View>
                    <View style={styles.settingButtons}>
                      {["none", "apa", "mla", "chicago"].map((style) => (
                        <TouchableOpacity
                          key={style}
                          style={[
                            styles.settingButton,
                            academicStyle === style &&
                              styles.settingButtonActive,
                          ]}
                          onPress={() => setAcademicStyle(style)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.settingButtonText,
                              academicStyle === style &&
                                styles.settingButtonTextActive,
                            ]}
                          >
                            {t(`textEditor.settings.academicStyle.${style}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Ton Analizi */}
                  <View style={styles.settingRow}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() =>
                        setToneAnalysisEnabled(!toneAnalysisEnabled)
                      }
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          toneAnalysisEnabled && styles.checkboxActive,
                        ]}
                      >
                        {toneAnalysisEnabled && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={colors.textOnPrimary}
                          />
                        )}
                      </View>
                      <View style={styles.checkboxLabelContainer}>
                        <Text style={styles.settingLabel}>
                          {t("textEditor.settings.toneAnalysis.label")}
                        </Text>
                        <Text style={styles.settingDescription}>
                          {t("textEditor.settings.toneAnalysis.description")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.divider} />

                  {/* Okunabilirlik Skoru */}
                  <View style={styles.settingRow}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() =>
                        setReadabilityScoreEnabled(!readabilityScoreEnabled)
                      }
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          readabilityScoreEnabled && styles.checkboxActive,
                        ]}
                      >
                        {readabilityScoreEnabled && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={colors.textOnPrimary}
                          />
                        )}
                      </View>
                      <Text style={styles.settingLabel}>
                        {t("textEditor.settings.readabilityScore.label")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Email Mode - Özel Inputlar */}
            {mode === "email" && (
              <View style={styles.emailInputsContainer}>
                <View style={styles.emailInputRow}>
                  <Text style={styles.emailLabel}>
                    {t("textEditor.email.to")}:
                  </Text>
                  <TextInput
                    style={styles.emailInput}
                    placeholder={t("textEditor.email.toPlaceholder")}
                    placeholderTextColor={colors.textTertiary}
                    value={emailTo}
                    onChangeText={setEmailTo}
                  />
                </View>
                <View style={styles.emailInputRow}>
                  <Text style={styles.emailLabel}>
                    {t("textEditor.email.subject")}:
                  </Text>
                  <TextInput
                    style={styles.emailInput}
                    placeholder={t("textEditor.email.subjectPlaceholder")}
                    placeholderTextColor={colors.textTertiary}
                    value={emailSubject}
                    onChangeText={setEmailSubject}
                  />
                </View>
                <View style={styles.emailInputRow}>
                  <Text style={styles.emailLabel}>
                    {t("textEditor.email.tone")}:
                  </Text>
                  <View style={styles.toneButtons}>
                    {["professional", "casual", "formal", "friendly"].map(
                      (tone) => (
                        <TouchableOpacity
                          key={tone}
                          style={[
                            styles.toneButton,
                            emailTone === tone && styles.toneButtonActive,
                          ]}
                          onPress={() => setEmailTone(tone)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.toneButtonText,
                              emailTone === tone && styles.toneButtonTextActive,
                            ]}
                          >
                            {t(`textEditor.email.tones.${tone}`)}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {mode === "email"
                  ? t("textEditor.email.messageLabel")
                  : mode === "fix"
                  ? t("textEditor.inputLabelGrammar")
                  : mode === "summarize"
                  ? t("textEditor.inputLabelSummarize")
                  : mode === "tone"
                  ? t("textEditor.inputLabelTone")
                  : mode === "length"
                  ? t("textEditor.inputLabelLength")
                  : t("textEditor.inputLabel")}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  mode === "email"
                    ? t("textEditor.email.messagePlaceholder")
                    : mode === "fix"
                    ? t("textEditor.inputPlaceholderGrammar")
                    : mode === "summarize"
                    ? t("textEditor.inputPlaceholderSummarize")
                    : mode === "tone"
                    ? t("textEditor.inputPlaceholderTone")
                    : mode === "length"
                    ? t("textEditor.inputPlaceholderLength")
                    : t("textEditor.inputPlaceholder")
                }
                placeholderTextColor={colors.textTertiary}
                multiline
                value={inputText}
                onChangeText={setInputText}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <View style={styles.actionButton}>
                <Button
                  title={t("textEditor.process")}
                  onPress={handleProcess}
                  loading={loading || hookLoading}
                  module="textEditor"
                />
              </View>
              {inputText.length > 0 && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleClear}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={colors.error}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Result Area */}
            {result ? (
              <>
                <View style={styles.resultContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: SPACING.xs,
                    }}
                  >
                    <Text style={styles.resultLabel}>
                      {t("textEditor.resultLabel")}
                    </Text>
                    <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
                      <Ionicons
                        name="copy-outline"
                        size={20}
                        color={moduleColor}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.resultText}>
                    <ResultText text={result} moduleColor={moduleColor} />
                  </View>
                </View>

                {/* Okunabilirlik Skoru ve Metadata */}
                {readabilityScoreEnabled && resultMetadata && (
                  <View style={styles.metadataContainer}>
                    <Text style={styles.metadataTitle}>
                      {t("textEditor.settings.readabilityScore.label")}
                    </Text>

                    {resultMetadata.readabilityBefore !== undefined && (
                      <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>
                          {t("textEditor.settings.readabilityScore.before")}:
                        </Text>
                        <Text style={styles.metadataValue}>
                          {resultMetadata.readabilityBefore?.toFixed(1) ||
                            "N/A"}
                        </Text>
                      </View>
                    )}

                    {resultMetadata.readabilityAfter !== undefined && (
                      <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>
                          {t("textEditor.settings.readabilityScore.after")}:
                        </Text>
                        <Text style={styles.metadataValue}>
                          {resultMetadata.readabilityAfter?.toFixed(1) || "N/A"}
                        </Text>
                      </View>
                    )}

                    {resultMetadata.readingTime && (
                      <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>
                          {t(
                            "textEditor.settings.readabilityScore.readingTime"
                          )}
                          :
                        </Text>
                        <Text style={styles.metadataValue}>
                          {resultMetadata.readingTime}
                        </Text>
                      </View>
                    )}

                    {toneAnalysisEnabled && resultMetadata.toneBefore && (
                      <>
                        <View
                          style={[
                            styles.metadataRow,
                            { marginTop: SPACING.sm },
                          ]}
                        >
                          <Text style={styles.metadataLabel}>
                            {t("textEditor.settings.toneAnalysis.currentTone")}:
                          </Text>
                          <Text style={styles.metadataValue}>
                            {resultMetadata.toneBefore}
                          </Text>
                        </View>
                        {resultMetadata.toneAfter && (
                          <View style={styles.metadataRow}>
                            <Text style={styles.metadataLabel}>
                              {t(
                                "textEditor.settings.toneAnalysis.suggestedTone"
                              )}
                              :
                            </Text>
                            <Text style={styles.metadataValue}>
                              {resultMetadata.toneAfter}
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                )}
              </>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default TextEditorScreen;
