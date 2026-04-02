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
  /** "flashcard" | "math" | "exam" | "image" | "text" | "chat" */
  type?: "flashcard" | "math" | "exam" | "image" | "text" | "chat";
  /** İsteğe bağlı override mesaj */
  message?: string;
}

const MESSAGES: Record<string, string[]> = {
  flashcard: [
    "aiLoading.flashcard.0",
    "aiLoading.flashcard.1",
    "aiLoading.flashcard.2",
    "aiLoading.flashcard.3",
  ],
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

const EMOJIS: Record<string, string> = {
  flashcard: "🃏",
  math: "🔢",
  exam: "📝",
  image: "🔍",
  text: "✍️",
  chat: "💬",
};

const COLORS: Record<string, string> = {
  flashcard: "#8B5CF6",
  math:      "#3B82F6",
  exam:      "#10B981",
  image:     "#F59E0B",
  text:      "#EC4899",
  chat:      "#6366F1",
};

export const AILoadingModal: React.FC<AILoadingModalProps> = ({
  visible,
  type = "chat",
  message,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [msgIndex, setMsgIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  // Pulse animasyonu — 3 iç içe daire
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;
  const fadeMsg = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  const accentColor = COLORS[type] ?? COLORS.chat;
  const emoji = EMOJIS[type] ?? "✨";
  const msgKeys = MESSAGES[type] ?? MESSAGES.chat;

  useEffect(() => {
    if (!visible) return;

    // Sıralı pulse — dalga efekti
    const pulseFn = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1.5, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1,   duration: 900, easing: Easing.in(Easing.ease),  useNativeDriver: true }),
        ])
      );

    const p1 = pulseFn(pulse1, 0);
    const p2 = pulseFn(pulse2, 300);
    const p3 = pulseFn(pulse3, 600);

    // Dönen spinner çemberi
    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true })
    );

    p1.start(); p2.start(); p3.start(); spin.start();

    // Mesaj değiştirici
    const msgTimer = setInterval(() => {
      Animated.timing(fadeMsg, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setMsgIndex(i => (i + 1) % msgKeys.length);
        Animated.timing(fadeMsg, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    }, 2200);

    // Nokta animasyonu
    const dotTimer = setInterval(() => {
      setDotCount(d => (d % 3) + 1);
    }, 500);

    return () => {
      p1.stop(); p2.stop(); p3.stop(); spin.stop();
      clearInterval(msgTimer);
      clearInterval(dotTimer);
      pulse1.setValue(1); pulse2.setValue(1); pulse3.setValue(1); spinAnim.setValue(0);
      setMsgIndex(0);
    };
  }, [visible]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const currentMsg = message ?? t(msgKeys[msgIndex] ?? msgKeys[0]);
  const dots = ".".repeat(dotCount);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.card, {
          backgroundColor: isDark ? colors.card : "#fff",
          shadowColor: accentColor,
        }]}>

          {/* Pulse daireler */}
          <View style={styles.pulseContainer}>
            <Animated.View style={[styles.pulseRing, styles.ring3, {
              borderColor: accentColor + "18",
              transform: [{ scale: pulse3 }],
            }]} />
            <Animated.View style={[styles.pulseRing, styles.ring2, {
              borderColor: accentColor + "30",
              transform: [{ scale: pulse2 }],
            }]} />
            <Animated.View style={[styles.pulseRing, styles.ring1, {
              borderColor: accentColor + "50",
              transform: [{ scale: pulse1 }],
            }]} />

            {/* Dönen çember */}
            <Animated.View style={[styles.spinnerRing, {
              borderTopColor: accentColor,
              borderRightColor: "transparent",
              borderBottomColor: "transparent",
              borderLeftColor: "transparent",
              transform: [{ rotate }],
            }]} />

            {/* Emoji merkez */}
            <View style={[styles.emojiCircle, { backgroundColor: accentColor + "20" }]}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>
          </View>

          {/* Mesaj */}
          <Animated.Text style={[styles.message, { color: colors.textPrimary, opacity: fadeMsg }]}>
            {currentMsg}{dots}
          </Animated.Text>

          {/* Alt küçük bilgi */}
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

  /* Pulse */
  pulseContainer: {
    width: 100, height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  pulseRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
  },
  ring1: { width: 68,  height: 68  },
  ring2: { width: 82,  height: 82  },
  ring3: { width: 96,  height: 96  },
  spinnerRing: {
    position: "absolute",
    width: 68, height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
  },
  emojiCircle: {
    width: 52, height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: { fontSize: 26 },

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
