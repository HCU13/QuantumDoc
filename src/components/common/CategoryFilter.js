import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { TEXT_STYLES, SPACING, BORDER_RADIUS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";

const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategorySelect,
  containerStyle,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      paddingHorizontal: SPACING.md,
      marginTop: SPACING.sm,
      marginBottom: SPACING.sm,
  
    },
    filterButton: {
      height: 32,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.md,
      marginRight: SPACING.xs,
      borderWidth: 1,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
    },
    filterButtonText: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textOnGradient,
    },
    filterButtonTextWithIcon: {
      marginLeft: SPACING.xs,
    },
    filterButtonTextActive: {
      color: colors.textOnPrimary,
      fontWeight: "600",
    },
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, containerStyle]}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            [styles.filterButton, { borderColor: colors.border }],
            selectedCategory === category.id && [
              styles.filterButtonActive,
              { borderColor: colors.border },
            ],
          ]}
          onPress={() => onCategorySelect(category.id)}
        >
          {category.icon && (
            <Ionicons
              name={category.icon}
              size={14}
              color={
                selectedCategory === category.id
                  ? colors.textOnPrimary
                  : colors.textOnGradient
              }
            />
          )}
          <Text
            style={[
              styles.filterButtonText,
              category.icon && styles.filterButtonTextWithIcon,
              selectedCategory === category.id && styles.filterButtonTextActive,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CategoryFilter;
