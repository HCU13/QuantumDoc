import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface UserInitialsProps {
  name?: string | null;
  email?: string | null;
  size?: number;
  fontSize?: number;
  isPremium?: boolean;
}

export const UserInitials: React.FC<UserInitialsProps> = ({
  name,
  email,
  size = 40,
  fontSize,
  isPremium = false,
}) => {
  const isGuest = !name && !email;

  const initials = name
    ? name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : email
    ? email[0].toUpperCase()
    : null;

  const resolvedFontSize = fontSize ?? Math.round(size * 0.38);
  const iconSize = Math.round(size * 0.52);
  const ringWidth = Math.max(2, Math.round(size * 0.07));
  const badgeSize = Math.round(size * 0.38);

  const avatar = (
    <LinearGradient
      colors={isGuest ? ["#9CA3AF", "#6B7280"] : ["#8A4FFF", "#6932E0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {isGuest ? (
        <Ionicons name="person-outline" size={iconSize} color="#FFFFFF" />
      ) : (
        <Text style={[styles.text, { fontSize: resolvedFontSize }]}>{initials}</Text>
      )}
    </LinearGradient>
  );

  if (!isPremium) return avatar;

  // Premium: altın halka + star rozet
  const outerSize = size + ringWidth * 2 + 2;
  return (
    <View style={{ width: outerSize, height: outerSize }}>
      {/* Altın gradient halka */}
      <LinearGradient
        colors={["#FFD700", "#FFA500", "#FFD700"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.ring,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            padding: ringWidth + 1,
          },
        ]}
      >
        {avatar}
      </LinearGradient>

      {/* Star rozet sağ alt */}
      <View
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            bottom: 0,
            right: 0,
          },
        ]}
      >
        <LinearGradient
          colors={["#FFD700", "#FFA500"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.badgeGradient, { borderRadius: badgeSize / 2 }]}
        >
          <Ionicons name="star" size={Math.round(badgeSize * 0.6)} color="#fff" />
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  ring: {
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
