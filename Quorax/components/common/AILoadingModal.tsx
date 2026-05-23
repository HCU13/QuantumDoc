import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BORDER_RADIUS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

interface AILoadingModalProps {
  visible: boolean;
  type?: "math" | "exam" | "image" | "text" | "chat";
  /** İsteğe bağlı override mesaj */
  message?: string;
}

// Per-type rotating status messages. Only the copy changes between modules —
// the animation itself is identical everywhere for a consistent feel.
const MESSAGES: Record<string, string[]> = {
  math: [
    "aiLoading.math.0",
    "aiLoading.math.1",
    "aiLoading.math.2",
  ],
  exam: [
    "aiLoading.exam.0",
    "aiLoading.exam.1",
    "aiLoading.exam.2",
  ],
  image: [
    "aiLoading.image.0",
    "aiLoading.image.1",
    "aiLoading.image.2",
  ],
  text: [
    "aiLoading.text.0",
    "aiLoading.text.1",
  ],
  chat: [
    "aiLoading.chat.0",
    "aiLoading.chat.1",
  ],
};

const COLORS: Record<string, string> = {
  math:      "#3B82F6",
  exam:      "#10B981",
  image:     "#F59E0B",
  text:      "#EC4899",
  chat:      "#6366F1",
};

const DOT_COUNT = 3;

/** A single bouncing dot — drives its own loop, offset by `delay`. */
const BouncingDot: React.FC<{ color: string; delay: number }> = ({ color, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay((DOT_COUNT - 1) * 160),
      ])
    );
    loop.start();
    return () => { loop.stop(); anim.setValue(0); };
  }, [delay]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color, transform: [{ translateY }, { scale }], opacity },
      ]}
    />
  );
};

export const AILoadingModal: React.FC<AILoadingModalProps> = ({
  visible,
  type = "chat",
  message,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [msgIndex, setMsgIndex] = useState(0);
  const fadeMsg = useRef(new Animated.Value(1)).current;

  const accentColor = COLORS[type] ?? COLORS.chat;
  const msgKeys = MESSAGES[type] ?? MESSAGES.chat;

  useEffect(() => {
    if (!visible) return;

    // Rotate the status message every couple seconds with a soft cross-fade.
    const msgTimer = setInterval(() => {
      Animated.timing(fadeMsg, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setMsgIndex(i => (i + 1) % msgKeys.length);
        Animated.timing(fadeMsg, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    }, 2200);

    return () => {
      clearInterval(msgTimer);
      setMsgIndex(0);
      fadeMsg.setValue(1);
    };
  }, [visible]);

  const currentMsg = message ?? t(msgKeys[msgIndex] ?? msgKeys[0]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.card, {
          backgroundColor: isDark ? colors.card : "#fff",
          shadowColor: accentColor,
        }]}>

          {/* Bouncing dots — same animation in every module, only the accent color varies. */}
          <View style={styles.dotsRow}>
            {Array.from({ length: DOT_COUNT }).map((_, i) => (
              <BouncingDot key={i} color={accentColor} delay={i * 160} />
            ))}
          </View>

          {/* Rotating status message */}
          <Animated.Text style={[styles.message, { color: colors.textPrimary, opacity: fadeMsg }]}>
            {currentMsg}
          </Animated.Text>

          {/* Footer hint */}
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {t("aiLoading.hint")}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xl + 8,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    gap: SPACING.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },

  /* Bouncing dots */
  dotsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 44,
    gap: 10,
    marginBottom: SPACING.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  /* Metin */
  message: {
    ...TEXT_STYLES.bodyMedium,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
    minHeight: 44,
  },
  hint: {
    ...TEXT_STYLES.bodySmall,
    textAlign: "center",
    opacity: 0.6,
  },
});
