import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

/**
 * Bold full-bleed brand gradient backdrop for auth screens.
 * Revolut/Cash App dialect: one strong brand surface, no decoration.
 */
export const AuthBackground: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});
