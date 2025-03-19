import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../../../../components";
import { useTheme } from "../../../../context/ThemeContext";

const ProcessingHeader = ({ title, onBack }) => {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.backButton,
          { backgroundColor: isDark ? theme.colors.card : "rgba(0,0,0,0.05)" },
        ]}
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
      </TouchableOpacity>

      <Text variant="h3" style={styles.title}>
        {title}
      </Text>

      <View style={styles.rightPlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginTop: 50,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  rightPlaceholder: {
    width: 36,
  },
});

export default ProcessingHeader;
