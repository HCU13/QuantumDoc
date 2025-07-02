import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import ModuleCard from "./ModuleCard";
import { useTranslation } from "react-i18next";

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
  const featuredModules = [
    {
      id: "chat",
      title: t("modules.chat"),
      description: t("modules.chatDescription"),
      icon: <Ionicons name="chatbubble-outline" size={28} color="#FFF" />,
      gradientColors: [colors.primary, colors.primaryDark],
    },
    {
      id: "math",
      title: t("modules.math"),
      description: t("modules.mathDescription"),
      icon: <Ionicons name="calculator-outline" size={28} color="#FFF" />,
      gradientColors: ["#FF7B54", "#F24C4C"],
    },
    {
      id: "write",
      title: t("modules.write"),
      description: t("modules.writeDescription"),
      icon: <Ionicons name="create-outline" size={28} color="#FFF" />,
      gradientColors: ["#4CACBC", "#1C7293"],
    },
    {
      id: "translate",
      title: t("modules.translate"),
      description: t("modules.translateDescription"),
      icon: <Ionicons name="language-outline" size={28} color="#FFF" />,
      gradientColors: ["#7F7FD5", "#5C5CBD"],
    },
  ];

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
