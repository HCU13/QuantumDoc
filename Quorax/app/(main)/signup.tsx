import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { NotebookBackground } from "@/components/common/NotebookBackground";
import { BORDER_RADIUS, HIT_SLOP, SPACING } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

type StepKey =
  | "name"
  | "email"
  | "password"
  | "grade"
  | "exam"
  | "goal"
  | "birth"
  | "referral"
  | "terms";

const STEPS: StepKey[] = [
  "name",
  "email",
  "password",
  "grade",
  "exam",
  "goal",
  "birth",
  "referral",
  "terms",
];

const OPTIONAL_STEPS = new Set<StepKey>(["goal", "referral"]);

type FormState = {
  name: string;
  email: string;
  password: string;
  gradeLevel: string;
  examTarget: string;
  learningGoal: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  referralSource: string;
  acceptedTerms: boolean;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  password: "",
  gradeLevel: "",
  examTarget: "",
  learningGoal: "",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  referralSource: "",
  acceptedTerms: false,
};

function passwordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(3, score) as 0 | 1 | 2 | 3;
}

function buildBirthDate(d: string, m: string, y: string): Date | null {
  const day = parseInt(d, 10);
  const month = parseInt(m, 10);
  const year = parseInt(y, 10);
  if (!day || !month || !year) return null;
  if (year < 1900 || year > new Date().getFullYear()) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }
  return dt;
}

function ageFromDate(dt: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dt.getUTCFullYear();
  const m = now.getMonth() - dt.getUTCMonth();
  if (m < 0 || (m === 0 && now.getDate() < dt.getUTCDate())) age--;
  return age;
}

export default function SignUpScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTermsSheet, setShowTermsSheet] = useState(false);

  const slide = useRef(new Animated.Value(0)).current;

  const step = STEPS[stepIndex];
  const total = STEPS.length;
  const isOptional = OPTIONAL_STEPS.has(step);
  const isLast = stepIndex === total - 1;

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((s) => ({ ...s, [k]: v }));
    if (error) setError(null);
  };

  const validateStep = (): string | null => {
    switch (step) {
      case "name":
        if (!form.name.trim()) return t("auth.register.errors.nameRequired");
        if (form.name.trim().length < 2)
          return t("auth.register.errors.nameMinLength");
        return null;
      case "email":
        if (!form.email.trim()) return t("auth.register.errors.emailRequired");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
          return t("auth.register.errors.emailInvalid");
        return null;
      case "password":
        if (!form.password) return t("auth.register.errors.passwordRequired");
        if (form.password.length < 6)
          return t("auth.register.errors.passwordMinLength");
        return null;
      case "grade":
        if (!form.gradeLevel)
          return t("auth.register.errors.generic");
        return null;
      case "exam":
        if (!form.examTarget) return t("auth.register.errors.generic");
        return null;
      case "birth": {
        const dt = buildBirthDate(form.birthDay, form.birthMonth, form.birthYear);
        if (!dt) return t("auth.register.errors.birthDateInvalid");
        if (ageFromDate(dt) < 13)
          return t("auth.register.errors.ageTooYoung");
        return null;
      }
      case "terms":
        if (!form.acceptedTerms)
          return t("auth.register.errors.termsRequired");
        return null;
      default:
        return null;
    }
  };

  const animateTo = (dir: 1 | -1) => {
    slide.setValue(dir * 24);
    Animated.timing(slide, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const goNext = async () => {
    if (!isOptional) {
      const err = validateStep();
      if (err) {
        setError(err);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => {},
        );
        return;
      }
    }
    if (isLast) {
      await submit();
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    setStepIndex((i) => i + 1);
    animateTo(1);
  };

  const goBack = () => {
    if (stepIndex === 0) {
      router.replace("/(main)/login");
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    setStepIndex((i) => i - 1);
    setError(null);
    animateTo(-1);
  };

  const goSkip = () => {
    if (!isOptional) return;
    Haptics.selectionAsync().catch(() => {});
    setStepIndex((i) => i + 1);
    setError(null);
    animateTo(1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const birth = buildBirthDate(
        form.birthDay,
        form.birthMonth,
        form.birthYear,
      );
      const { data, error: signErr } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { full_name: form.name.trim() } },
      });
      if (signErr) {
        const msg =
          signErr.message.includes("already registered") ||
          signErr.message.includes("already exists")
            ? t("auth.register.errors.emailExists")
            : signErr.message;
        Alert.alert(t("auth.register.errors.title"), msg);
        return;
      }
      if (data.user) {
        await supabase
          .from("profiles")
          .update({
            full_name: form.name.trim(),
            display_name: form.name.trim(),
            grade_level: form.gradeLevel || null,
            exam_target: form.examTarget || null,
            learning_goal: form.learningGoal.trim() || null,
            birth_date: birth ? birth.toISOString().slice(0, 10) : null,
            referral_source: form.referralSource || null,
          })
          .eq("id", data.user.id);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        router.replace({
          pathname: "/(main)/login",
          params: { email: form.email.trim() },
        } as any);
      }
    } catch (e: any) {
      Alert.alert(t("common.error"), e?.message || t("auth.register.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const progress = (stepIndex + 1) / total;

  const pageNum = String(stepIndex + 1).padStart(2, "0");
  const totalNum = String(total).padStart(2, "0");

  return (
    <NotebookBackground cornerGlyphs={["α", "β"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Page header */}
      <View style={styles.pageHeader}>
        <Pressable
          onPress={goBack}
          hitSlop={HIT_SLOP.medium}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("auth.register.flow.back")}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.pageMeta, { color: colors.textTertiary }]}>
          — {pageNum} / {totalNum} —
        </Text>
      </View>

      {/* Slim progress underline beneath the page header */}
      <View
        style={[styles.progressTrack, { backgroundColor: colors.borderSubtle }]}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ transform: [{ translateX: slide }] }}>
            <StepBody
              step={step}
              form={form}
              update={update}
              colors={colors}
              error={error}
              t={t}
              onOpenTerms={() => setShowTermsSheet(true)}
            />
          </Animated.View>
        </ScrollView>

        {/* Bottom action bar */}
        <View
          style={[
            styles.actionBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.borderSubtle,
            },
          ]}
        >
          {isOptional && !isLast && (
            <TouchableOpacity onPress={goSkip} style={styles.skipBtn} activeOpacity={0.7}>
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                {t("auth.register.flow.skip")}
              </Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Button
              title={
                isLast
                  ? t("auth.register.flow.finish")
                  : t("auth.register.flow.next")
              }
              onPress={goNext}
              loading={loading}
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Terms Modal — same as before */}
      <Modal
        visible={showTermsSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTermsSheet(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheetContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.borderSubtle }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                {t("auth.register.termsLink")} & {t("auth.register.privacyLink")}
              </Text>
              <TouchableOpacity onPress={() => setShowTermsSheet(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[{ fontSize: 15, fontWeight: "600", marginBottom: 8 }, { color: colors.textPrimary }]}>
                {t("onboarding.aiConsentTitle")}
              </Text>
              <Text style={[{ fontSize: 14, lineHeight: 22, marginBottom: 20 }, { color: colors.textSecondary }]}>
                {t("onboarding.aiConsentBody")}
              </Text>
              <View style={[{ height: 1, marginBottom: 20 }, { backgroundColor: colors.borderSubtle }]} />
              <TouchableOpacity
                onPress={() => {
                  setShowTermsSheet(false);
                  router.push("/(main)/profile/terms");
                }}
                activeOpacity={0.7}
              >
                <Text style={[{ fontSize: 14, fontWeight: "600", textDecorationLine: "underline" }, { color: colors.primary }]}>
                  {t("auth.register.termsLink")} →
                </Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={{ padding: 20, gap: 8 }}>
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  update("acceptedTerms", true);
                  setShowTermsSheet(false);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.acceptBtnText}>
                  {t("onboarding.aiConsentAcceptButton")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ alignItems: "center", paddingTop: 4 }}
                onPress={() => setShowTermsSheet(false)}
              >
                <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
                  {t("common.close")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </NotebookBackground>
  );
}

// -----------------------------------------------------------------------------
// Step body
// -----------------------------------------------------------------------------

type StepBodyProps = {
  step: StepKey;
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  colors: any;
  error: string | null;
  t: (k: string, opts?: any) => string;
  onOpenTerms: () => void;
};

const StepBody: React.FC<StepBodyProps> = ({
  step,
  form,
  update,
  colors,
  error,
  t,
  onOpenTerms,
}) => {
  const Title: React.FC<{ title: string; subtitle: string }> = ({
    title,
    subtitle,
  }) => (
    <View style={styles.titleWrap}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
  );

  const ErrorText = () =>
    error ? (
      <Text style={[styles.errorBanner, { color: colors.error }]}>{error}</Text>
    ) : null;

  switch (step) {
    case "name":
      return (
        <>
          <Title
            title={t("auth.register.flow.nameTitle")}
            subtitle={t("auth.register.flow.nameSubtitle")}
          />
          <Input
            value={form.name}
            onChangeText={(v) => update("name", v)}
            placeholder={t("auth.register.namePlaceholder")}
            autoCapitalize="words"
            icon="person-outline"
          />
          <ErrorText />
        </>
      );

    case "email":
      return (
        <>
          <Title
            title={t("auth.register.flow.emailTitle")}
            subtitle={t("auth.register.flow.emailSubtitle")}
          />
          <Input
            value={form.email}
            onChangeText={(v) => update("email", v)}
            placeholder={t("auth.register.emailPlaceholder")}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
          />
          <ErrorText />
        </>
      );

    case "password": {
      const strength = passwordStrength(form.password);
      const strengthLabel =
        strength === 0
          ? ""
          : strength === 1
            ? t("auth.register.flow.passwordStrengthWeak")
            : strength === 2
              ? t("auth.register.flow.passwordStrengthMedium")
              : t("auth.register.flow.passwordStrengthStrong");
      const strengthColor =
        strength === 1
          ? colors.error
          : strength === 2
            ? "#E0A800"
            : colors.primary;
      return (
        <>
          <Title
            title={t("auth.register.flow.passwordTitle")}
            subtitle={t("auth.register.flow.passwordSubtitle")}
          />
          <Input
            value={form.password}
            onChangeText={(v) => update("password", v)}
            placeholder={t("auth.register.passwordPlaceholder")}
            secureTextEntry
            icon="lock-closed-outline"
          />
          {form.password.length > 0 && (
            <View style={styles.strengthRow}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        i < strength ? strengthColor : colors.borderSubtle,
                    },
                  ]}
                />
              ))}
              <Text style={[styles.strengthLabel, { color: strengthColor }]}>
                {strengthLabel}
              </Text>
            </View>
          )}
          <ErrorText />
        </>
      );
    }

    case "grade": {
      const opts: { value: string; label: string; icon: any }[] = [
        { value: "middle", label: t("auth.register.flow.gradeMiddle"), icon: "school-outline" },
        { value: "high_9", label: t("auth.register.flow.gradeHigh9"), icon: "school-outline" },
        { value: "high_10", label: t("auth.register.flow.gradeHigh10"), icon: "school-outline" },
        { value: "high_11", label: t("auth.register.flow.gradeHigh11"), icon: "school-outline" },
        { value: "high_12", label: t("auth.register.flow.gradeHigh12"), icon: "school-outline" },
        { value: "university", label: t("auth.register.flow.gradeUniversity"), icon: "library-outline" },
        { value: "other", label: t("auth.register.flow.gradeOther"), icon: "ellipsis-horizontal" },
      ];
      return (
        <>
          <Title
            title={t("auth.register.flow.gradeTitle")}
            subtitle={t("auth.register.flow.gradeSubtitle")}
          />
          <OptionGrid
            options={opts}
            value={form.gradeLevel}
            onChange={(v) => update("gradeLevel", v)}
            colors={colors}
          />
          <ErrorText />
        </>
      );
    }

    case "exam": {
      const opts = [
        { value: "lgs", label: t("auth.register.flow.examLgs"), icon: "ribbon-outline" as any },
        { value: "yks", label: t("auth.register.flow.examYks"), icon: "ribbon-outline" as any },
        { value: "kpss", label: t("auth.register.flow.examKpss"), icon: "ribbon-outline" as any },
        { value: "none", label: t("auth.register.flow.examNone"), icon: "remove-circle-outline" as any },
        { value: "other", label: t("auth.register.flow.examOther"), icon: "ellipsis-horizontal" as any },
      ];
      return (
        <>
          <Title
            title={t("auth.register.flow.examTitle")}
            subtitle={t("auth.register.flow.examSubtitle")}
          />
          <OptionGrid
            options={opts}
            value={form.examTarget}
            onChange={(v) => update("examTarget", v)}
            colors={colors}
          />
          <ErrorText />
        </>
      );
    }

    case "goal":
      return (
        <>
          <Title
            title={t("auth.register.flow.goalTitle")}
            subtitle={t("auth.register.flow.goalSubtitle")}
          />
          <Input
            value={form.learningGoal}
            onChangeText={(v) => update("learningGoal", v)}
            placeholder={t("auth.register.flow.goalPlaceholder")}
            autoCapitalize="sentences"
            multiline
            icon="sparkles-outline"
          />
          <ErrorText />
        </>
      );

    case "birth":
      return (
        <>
          <Title
            title={t("auth.register.flow.birthTitle")}
            subtitle={t("auth.register.flow.birthSubtitle")}
          />
          <View style={styles.birthRow}>
            <BirthInput
              value={form.birthDay}
              onChangeText={(v) => update("birthDay", v.replace(/\D/g, "").slice(0, 2))}
              placeholder={t("auth.register.flow.birthDay")}
              colors={colors}
            />
            <BirthInput
              value={form.birthMonth}
              onChangeText={(v) => update("birthMonth", v.replace(/\D/g, "").slice(0, 2))}
              placeholder={t("auth.register.flow.birthMonth")}
              colors={colors}
            />
            <BirthInput
              value={form.birthYear}
              onChangeText={(v) => update("birthYear", v.replace(/\D/g, "").slice(0, 4))}
              placeholder={t("auth.register.flow.birthYear")}
              colors={colors}
              wide
            />
          </View>
          <ErrorText />
        </>
      );

    case "referral": {
      const opts = [
        { value: "app_store", label: t("auth.register.flow.refAppStore"), icon: "logo-apple-appstore" as any },
        { value: "social", label: t("auth.register.flow.refSocial"), icon: "share-social-outline" as any },
        { value: "friend", label: t("auth.register.flow.refFriend"), icon: "people-outline" as any },
        { value: "search", label: t("auth.register.flow.refSearch"), icon: "search-outline" as any },
        { value: "ad", label: t("auth.register.flow.refAd"), icon: "megaphone-outline" as any },
        { value: "other", label: t("auth.register.flow.refOther"), icon: "ellipsis-horizontal" as any },
      ];
      return (
        <>
          <Title
            title={t("auth.register.flow.referralTitle")}
            subtitle={t("auth.register.flow.referralSubtitle")}
          />
          <OptionGrid
            options={opts}
            value={form.referralSource}
            onChange={(v) => update("referralSource", v)}
            colors={colors}
          />
          <ErrorText />
        </>
      );
    }

    case "terms":
      return (
        <>
          <Title
            title={t("auth.register.flow.termsTitle")}
            subtitle={t("auth.register.flow.termsSubtitle")}
          />
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => {
              if (!form.acceptedTerms) onOpenTerms();
              else update("acceptedTerms", false);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: form.acceptedTerms
                    ? colors.primary
                    : "transparent",
                  borderColor: form.acceptedTerms
                    ? colors.primary
                    : colors.borderSubtle,
                },
              ]}
            >
              {form.acceptedTerms && (
                <Ionicons name="checkmark" size={13} color="#fff" />
              )}
            </View>
            <View style={styles.termsTextWrap}>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                {t("auth.register.termsPrefix")}
              </Text>
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                {t("auth.register.termsLink")}
              </Text>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                {t("auth.register.termsAnd")}
              </Text>
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                {t("auth.register.privacyLink")}
              </Text>
            </View>
          </TouchableOpacity>
          <ErrorText />
        </>
      );
  }
};

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

const OptionGrid: React.FC<{
  options: { value: string; label: string; icon: any }[];
  value: string;
  onChange: (v: string) => void;
  colors: any;
}> = ({ options, value, onChange, colors }) => {
  return (
    <View style={styles.gridWrap}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(opt.value);
            }}
            style={({ pressed }) => [
              styles.gridItem,
              {
                backgroundColor: selected ? colors.primary + "15" : colors.card,
                borderColor: selected ? colors.primary : colors.borderSubtle,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons
              name={opt.icon}
              size={20}
              color={selected ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.gridLabel,
                {
                  color: selected ? colors.primary : colors.textPrimary,
                  fontWeight: selected ? "700" : "500",
                },
              ]}
            >
              {opt.label}
            </Text>
            {selected && (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.primary}
                style={{ marginLeft: "auto" }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const BirthInput: React.FC<{
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  colors: any;
  wide?: boolean;
}> = ({ value, onChangeText, placeholder, colors, wide }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.birthCell,
        {
          flex: wide ? 1.4 : 1,
          backgroundColor: colors.card,
          borderColor: focused ? colors.primary : colors.borderSubtle,
          borderWidth: focused ? 2 : 1,
        },
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType="number-pad"
        style={{ color: colors.textPrimary, fontSize: 16, textAlign: "center", padding: 0 }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  pageMeta: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.5,
    fontVariant: ["tabular-nums"],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md + 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    height: 3,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  titleWrap: { marginBottom: 28 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, lineHeight: 22 },

  errorBanner: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },

  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: "600", marginLeft: 6 },

  gridWrap: { gap: 10 },
  gridItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  gridLabel: { fontSize: 15 },

  birthRow: { flexDirection: "row", gap: 10 },
  birthCell: {
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
  },
  termsTextWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  termsText: { fontSize: 14, lineHeight: 22 },
  termsLink: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
    textDecorationLine: "underline",
  },

  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 8 },
  skipText: { fontSize: 15, fontWeight: "600" },

  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    minHeight: 400,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 20,
    borderBottomWidth: 1,
  },
  sheetTitle: { flex: 1, fontSize: 15, fontWeight: "600" },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    padding: 14,
  },
  acceptBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
