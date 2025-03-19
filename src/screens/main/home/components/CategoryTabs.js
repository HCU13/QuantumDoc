import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../../../../components";
import { useTheme } from "../../../../context/ThemeContext";

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
  const { theme, isDark } = useTheme();

  // Category definitions with icons and colors
  const categories = [
    {
      id: "all",
      label: "All",
      icon: "documents",
      color: theme.colors.primary,
    },
    {
      id: "analyzed",
      label: "Analyzed",
      icon: "checkmark-circle",
      color: theme.colors.success,
    },
    {
      id: "images",
      label: "Images",
      icon: "image",
      color: theme.colors.info,
    },
    {
      id: "documents",
      label: "Documents",
      icon: "document-text",
      color: theme.colors.error,
    },
  ];

  return (
    <View style={styles.container}>
      <Text variant="subtitle1" style={styles.title}>
        Categories
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                {
                  backgroundColor: isActive
                    ? category.color + "15"
                    : isDark
                    ? theme.colors.card
                    : "#F5F7FA",
                  borderColor: isActive ? category.color : "transparent",
                },
              ]}
              onPress={() => onCategoryChange(category.id)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: category.color + "20" },
                ]}
              >
                <Ionicons
                  name={category.icon}
                  size={20}
                  color={category.color}
                />
              </View>

              <Text
                style={styles.categoryLabel}
                color={isActive ? category.color : theme.colors.text}
                weight={isActive ? "semibold" : "regular"}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
  },
});

export default CategoryTabs;
