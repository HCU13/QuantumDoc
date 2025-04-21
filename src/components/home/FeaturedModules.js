import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import ModuleCard from "./ModuleCard";

const FeaturedModules = ({ onModulePress, containerStyle }) => {
  const { colors } = useTheme();

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
      title: "AI Sohbet",
      description: "Chat AI ile konuşun",
      icon: <Ionicons name="chatbubble-outline" size={28} color="#FFF" />,
      gradientColors: [colors.primary, colors.primaryDark],
    },
    {
      id: "math",
      title: "Matematik",
      description: "Sorularınızı çözün",
      icon: <Ionicons name="calculator-outline" size={28} color="#FFF" />,
      gradientColors: ["#FF7B54", "#F24C4C"],
    },
    {
      id: "write",
      title: "Yazı Üretici",
      description: "Metin oluşturun",
      icon: <Ionicons name="create-outline" size={28} color="#FFF" />,
      gradientColors: ["#4CACBC", "#1C7293"],
    },
    {
      id: "translate",
      title: "Çeviri",
      description: "Metinleri çevirin",
      icon: <Ionicons name="language-outline" size={28} color="#FFF" />,
      gradientColors: ["#7F7FD5", "#5C5CBD"],
    },
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Öne Çıkan Özellikler</Text>
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
