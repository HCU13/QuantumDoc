import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import ModuleCard from "./ModuleCard";
import { useTranslation } from "react-i18next";
import { MODULES } from '../../constants/modules';

const FeaturedModules = ({ onModulePress, containerStyle }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      paddingHorizontal: SIZES.padding,
      marginVertical: 10,
    },
    titleContainer: {
      marginBottom: 10,
    },
    title: {
      ...FONTS.h3,
      color: colors.textPrimary,
    },
    modulesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
  });

  // Öne çıkan modüller
  const featuredModules = MODULES.filter(m => m.enabled);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t("home.featuredModules")}</Text>
      </View>

      <View style={styles.modulesContainer}>
        {featuredModules.map((module) => (
          <ModuleCard
            key={module.id}
            title={module.title}
            description={module.description}
            icon={module.icon}
            gradientColors={module.gradientColors}
            onPress={() => onModulePress(module)}
          />
        ))}
      </View>
    </View>
  );
};

export default FeaturedModules;
