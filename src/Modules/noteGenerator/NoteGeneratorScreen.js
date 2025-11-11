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
import { useNoteGenerator } from "../../hooks/useNoteGenerator";
import { useAuth } from "../../contexts/AuthContext";
import { showError, showSuccess } from "../../utils/toast";
import {
  TEXT_STYLES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { COLORS } from "../../constants/colors";

const NoteGeneratorScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { tokens, getTokenCostLabel, getTokenCost } = useTokenContext();
  const { user } = useAuth();
  const { generateNote, loading: hookLoading } = useNoteGenerator();
  
  // Modül rengini al
  const moduleColor = colors.noteGeneratorPrimary || COLORS.light.noteGeneratorPrimary;
  const moduleColorLight = colors.noteGeneratorPrimaryLight || COLORS.light.noteGeneratorPrimaryLight;

  const [mode, setMode] = useState("quick"); // quick, meeting, summary, todo
  const [tokenLabel, setTokenLabel] = useState('4 token/not');
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Gelişmiş ayarlar state'leri
  const [showSettings, setShowSettings] = useState(false);
  const [noteFormat, setNoteFormat] = useState("plain"); // plain, markdown, html, json
  const [noteStyle, setNoteStyle] = useState("casual"); // academic, formal, casual, summary
  const [noteLength, setNoteLength] = useState("medium"); // short, medium, long
  const [statisticsEnabled, setStatisticsEnabled] = useState(true);
  
  // İstatistikler için state
  const [statistics, setStatistics] = useState(null); // { wordCount, charCount, readingTime }

  // Token maliyetini database'den yükle
  useEffect(() => {
    const loadTokenLabel = async () => {
      const label = await getTokenCostLabel('noteGenerator');
      if (label) {
        setTokenLabel(label);
      }
    };
    loadTokenLabel();
  }, [getTokenCostLabel]);

  const modes = [
    {
      value: "quick",
      label: t("noteGenerator.modes.quick"),
      icon: "flash-outline",
    },
    {
      value: "meeting",
      label: t("noteGenerator.modes.meeting"),
      icon: "people-outline",
    },
    {
      value: "lesson",
      label: t("noteGenerator.modes.lesson"),
      icon: "school-outline",
    },
    {
      value: "project",
      label: t("noteGenerator.modes.project"),
      icon: "folder-outline",
    },
    {
      value: "summary",
      label: t("noteGenerator.modes.summary"),
      icon: "document-text-outline",
    },
    {
      value: "todo",
      label: t("noteGenerator.modes.todo"),
      icon: "checkbox-outline",
    },
  ];

  // İstatistik hesaplama fonksiyonları
  const calculateStatistics = (text) => {
    if (!text) return null;
    
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = text.length;
    const charCountNoSpaces = text.replace(/\s/g, '').length;
    const readingTime = Math.ceil(wordCount / 200); // Ortalama 200 kelime/dakika
    
    return {
      wordCount,
      charCount,
      charCountNoSpaces,
      readingTime: readingTime > 0 ? readingTime : 1,
    };
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      showError(
        t("common.warning"),
        t("noteGenerator.errors.emptyText")
      );
      return;
    }

    // Token kontrolü
    const tokenCost = getTokenCost("noteGenerator") || 4;
    if (tokens < tokenCost) {
      showError(
        t("common.tokenInsufficient"),
        t("common.tokenInsufficientMessage", { cost: tokenCost, tokens })
      );
      return;
    }

    setLoading(true);
    try {
      const resultData = await generateNote(
        inputText, 
        mode,
        noteFormat,
        noteStyle,
        noteLength
      );

      if (resultData.success) {
        setResult(resultData.result);
        
        // İstatistikleri hesapla
        if (statisticsEnabled) {
          const stats = calculateStatistics(resultData.result);
          setStatistics(stats);
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
          err.message || t("noteGenerator.errors.generateFailed")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setResult("");
    setStatistics(null);
  };

  const handleCopy = async () => {
    if (result) {
      await Clipboard.setString(result);
      showSuccess(t("common.success"), t("noteGenerator.copied"));
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
      maxHeight: 400,
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
      marginTop: 4,
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
    statisticsContainer: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      marginTop: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statisticsTitle: {
      ...TEXT_STYLES.labelMedium,
      color: colors.textPrimary,
      fontWeight: "600",
      marginBottom: SPACING.sm,
    },
    statisticsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: SPACING.xs,
    },
    statisticsLabel: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
    },
    statisticsValue: {
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
          title={t("modules.noteGenerator.title")}
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
            <ModuleIntroCard moduleId="noteGenerator" moduleColor={moduleColor} />

            {/* Mode Switch */}
            <ModuleModeSelector
              moduleId="noteGenerator"
              moduleColor={moduleColor}
              modes={modes}
              selectedMode={mode}
              onModeChange={setMode}
              descriptionKeyPrefix="noteGenerator"
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
                  {t("noteGenerator.settings.title")}
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
                  {/* Not Formatı */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingLabelContainer}>
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color={moduleColor}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.settingLabel}>
                        {t("noteGenerator.settings.format.label")}
                      </Text>
                    </View>
                    <View style={styles.settingButtons}>
                      {["plain", "markdown", "html", "json"].map((format) => (
                        <TouchableOpacity
                          key={format}
                          style={[
                            styles.settingButton,
                            noteFormat === format && styles.settingButtonActive,
                          ]}
                          onPress={() => setNoteFormat(format)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.settingButtonText,
                              noteFormat === format && styles.settingButtonTextActive,
                            ]}
                          >
                            {t(`noteGenerator.settings.format.${format}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Not Stili */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingLabelContainer}>
                      <Ionicons
                        name="brush-outline"
                        size={16}
                        color={moduleColor}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.settingLabel}>
                        {t("noteGenerator.settings.style.label")}
                      </Text>
                    </View>
                    <View style={styles.settingButtons}>
                      {["academic", "formal", "casual", "summary"].map((style) => (
                        <TouchableOpacity
                          key={style}
                          style={[
                            styles.settingButton,
                            noteStyle === style && styles.settingButtonActive,
                          ]}
                          onPress={() => setNoteStyle(style)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.settingButtonText,
                              noteStyle === style && styles.settingButtonTextActive,
                            ]}
                          >
                            {t(`noteGenerator.settings.style.${style}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Uzunluk */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingLabelContainer}>
                      <Ionicons
                        name="resize-outline"
                        size={16}
                        color={moduleColor}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.settingLabel}>
                        {t("noteGenerator.settings.length.label")}
                      </Text>
                    </View>
                    <View style={styles.settingButtons}>
                      {["short", "medium", "long"].map((length) => (
                        <TouchableOpacity
                          key={length}
                          style={[
                            styles.settingButton,
                            noteLength === length && styles.settingButtonActive,
                          ]}
                          onPress={() => setNoteLength(length)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.settingButtonText,
                              noteLength === length && styles.settingButtonTextActive,
                            ]}
                          >
                            {t(`noteGenerator.settings.length.${length}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Not İstatistikleri */}
                  <View style={styles.settingRow}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setStatisticsEnabled(!statisticsEnabled)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          statisticsEnabled && styles.checkboxActive,
                        ]}
                      >
                        {statisticsEnabled && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={colors.textOnPrimary}
                          />
                        )}
                      </View>
                      <Text style={styles.settingLabel}>
                        {t("noteGenerator.settings.statistics.label")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {t("noteGenerator.inputLabel")}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={t("noteGenerator.inputPlaceholder")}
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
                  title={t("noteGenerator.generate")}
                  onPress={handleGenerate}
                  loading={loading || hookLoading}
                  module="noteGenerator"
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
                    {t("noteGenerator.resultLabel")}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCopy}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={20}
                      color={moduleColor}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.resultText}>
                  <ResultText
                    text={result}
                    moduleColor={moduleColor}
                  />
                </View>

                {/* İstatistikler */}
                {statisticsEnabled && statistics && (
                  <View style={styles.statisticsContainer}>
                    <Text style={styles.statisticsTitle}>
                      {t("noteGenerator.settings.statistics.label")}
                    </Text>
                    <View style={styles.statisticsRow}>
                      <Text style={styles.statisticsLabel}>
                        {t("noteGenerator.settings.statistics.wordCount")}:
                      </Text>
                      <Text style={styles.statisticsValue}>
                        {statistics.wordCount}
                      </Text>
                    </View>
                    <View style={styles.statisticsRow}>
                      <Text style={styles.statisticsLabel}>
                        {t("noteGenerator.settings.statistics.charCount")}:
                      </Text>
                      <Text style={styles.statisticsValue}>
                        {statistics.charCount}
                      </Text>
                    </View>
                    <View style={styles.statisticsRow}>
                      <Text style={styles.statisticsLabel}>
                        {t("noteGenerator.settings.statistics.readingTime")}:
                      </Text>
                      <Text style={styles.statisticsValue}>
                        {statistics.readingTime} {t("common.minute")}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default NoteGeneratorScreen;

