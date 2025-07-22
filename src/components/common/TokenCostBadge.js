import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";

const TokenCostBadge = ({ cost = 0, premium = false, style }) => {
  const { colors } = useTheme();
  const bgColor = premium ? colors.primary : colors.lightGray || '#F5F5F7';
  const iconColor = premium ? colors.white : colors.textSecondary;
  const textColor = premium ? colors.white : colors.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      <Ionicons name="diamond-outline" size={14} color={iconColor} style={{ marginRight: 6 }} />
      <Text style={[styles.text, { color: textColor }]}>{cost} token</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: {
    ...FONTS.body5,
    fontWeight: "600",
    fontSize: 12,
  },
});

export default TokenCostBadge; 