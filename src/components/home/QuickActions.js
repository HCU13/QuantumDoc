import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import ModuleCard from "../explore/ModuleCard";
import { useTranslation } from "react-i18next";

const QuickActions = ({ onActionPress, containerStyle }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      marginVertical: 10,
    },
    titleContainer: {
      paddingHorizontal: SIZES.padding,
      marginBottom: 10,
    },
    title: {
      ...FONTS.h3,
      color: colors.textOnGradient,
      fontWeight: "bold",
    },
    scrollContainer: {
      paddingHorizontal: SIZES.padding - 8, // 8px, kart içindeki marginHorizontal'ı dengelemek için
    },
    cardsContainer: {
      flexDirection: "row",
      paddingVertical: 10,
    },
  });

  // Modüller ve özellikleri
  const quickActions = [
    // {
    //   id: "chat",
    //   title: "AI Sohbet",
    //   icon: <Ionicons name="chatbubble-outline" size={24} color="#FFF" />,
    //   gradientColors: [colors.primary, colors.primaryDark],
    // },
    {
      id: "math",
      title: t("modules.math.title"),
      description: t("modules.math.description"),
      icon: <Ionicons name="calculator-outline" size={24} color="#FFF" />,
      gradientColors: ["#FF7B54", "#F24C4C"],
    },
    {
      id: "write",
      title: t("modules.write"),
      description: t("modules.writeDescription"),
      icon: <Ionicons name="create-outline" size={24} color="#FFF" />,
      gradientColors: ["#4CACBC", "#1C7293"],
    },
    {
      id: "translate",
      title: t("modules.translate.title"),
      description: t("modules.translateDescription"),
      icon: <Ionicons name="language-outline" size={24} color="#FFF" />,
      gradientColors: ["#7F7FD5", "#5C5CBD"],
    },
    {
      id: "notes",
      title: t("modules.notes.title"),
      description: t("modules.notesDescription"),
      icon: <Ionicons name="document-text-outline" size={24} color="#FFF" />,
      gradientColors: ["#3C9D9B", "#52DE97"],
    },
    {
      id: "tasks",
      title: t("modules.tasks"),
      description: t("modules.tasksDescription"),
      icon: <Ionicons name="checkbox-outline" size={24} color="#FFF" />,
      gradientColors: ["#FF78C4", "#E252DC"],
    },
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t("home.quickAccess")}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.cardsContainer}>
          {quickActions.map((action) => (
            <ModuleCard
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.icon}
              gradientColors={action.gradientColors}
              onPress={() => onActionPress(action)}
              size="medium"
              containerStyle={{ marginHorizontal: 4, width: 160 }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default QuickActions;
