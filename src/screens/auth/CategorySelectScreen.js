import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import GradientBackground from "../../components/common/GradientBackground";
import Button from "../../components/common/Button";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import ModuleCard from "../../components/explore/ModuleCard";

const { width } = Dimensions.get("window");

const MODULE_CATEGORIES = [
  {
    id: "chat",
    icon: <Ionicons name="chatbubble-ellipses-outline" size={36} color="#8A4FFF" />,
    label: "AI Chat",
    items: 1566,
  },
  {
    id: "math",
    icon: <Ionicons name="calculator-outline" size={36} color="#8A4FFF" />,
    label: "Mathematics",
    items: 658,
  },
  {
    id: "write",
    icon: <Ionicons name="create-outline" size={36} color="#8A4FFF" />,
    label: "Text Generator",
    items: 217,
  },
  {
    id: "translate",
    icon: <Ionicons name="language-outline" size={36} color="#8A4FFF" />,
    label: "Translation",
    items: 24,
  },
  {
    id: "tasks",
    icon: <Ionicons name="checkbox-outline" size={36} color="#8A4FFF" />,
    label: "Tasks",
    items: 7245,
  },
  {
    id: "notes",
    icon: <Ionicons name="document-text-outline" size={36} color="#8A4FFF" />,
    label: "Notes",
    items: 3901,
  },
];

const CategorySelectScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selected, setSelected] = useState([]);

  // Aynı modül tanımları ExploreScreen'den alındı
  const modules = [
    {
      id: "chat",
      title: t("modules.chat.title"),
      description: t("modules.chat.description"),
      icon: <Ionicons name="chatbubble-outline" size={28} color="#FFF" />,
      gradientColors: [colors.primary, colors.primaryDark],
    },
    {
      id: "math",
      title: t("modules.math.title"),
      description: t("modules.math.description"),
      icon: <Ionicons name="calculator-outline" size={28} color="#FFF" />,
      gradientColors: ["#FF7B54", "#F24C4C"],
    },
    {
      id: "write",
      title: t("modules.textGenerator.title"),
      description: t("modules.textGenerator.description"),
      icon: <Ionicons name="create-outline" size={28} color="#FFF" />,
      gradientColors: ["#4CACBC", "#1C7293"],
    },
    {
      id: "translate",
      title: t("modules.translate.title"),
      description: t("modules.translate.description"),
      icon: <Ionicons name="language-outline" size={28} color="#FFF" />,
      gradientColors: ["#7F7FD5", "#5C5CBD"],
    },
    {
      id: "tasks",
      title: t("modules.tasks"),
      description: t("modules.tasksDescription"),
      icon: <Ionicons name="checkbox-outline" size={28} color="#FFF" />,
      gradientColors: ["#FF78C4", "#E252DC"],
    },
    {
      id: "notes",
      title: t("modules.notes.title"),
      description: t("modules.notes.description"),
      icon: <Ionicons name="document-text-outline" size={28} color="#FFF" />,
      gradientColors: ["#3C9D9B", "#52DE97"],
    },
  ];

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  // 2'li grid için satır bazlı düzenleme
  const moduleRows = [];
  for (let i = 0; i < modules.length; i += 2) {
    moduleRows.push(modules.slice(i, i + 2));
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContent}>
            <Text style={styles.title}>{t('screens.categorySelect.title')}</Text>
            <Text style={styles.subtitle}>
              {t('screens.categorySelect.subtitle1')}
              {"\n"}
              {t('screens.categorySelect.subtitle2')}
            </Text>
          </View>
          <View style={styles.grid}>
            {moduleRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.row}>
                {row.map((module) => (
                  <ModuleCard
                    key={module.id}
                    title={module.title}
                    description={module.description}
                    moduleId={module.id}
                    icon={module.icon}
                    gradientColors={module.gradientColors}
                    onPress={() => handleSelect(module.id)}
                    size="medium"
                    glowing={selected.includes(module.id)}
                    containerStyle={{
                      marginHorizontal: 0,
                      width: "48%",
                      borderWidth: selected.includes(module.id) ? 3 : 1,
                      borderColor: selected.includes(module.id)
                        ? colors.primary
                        : "#f2f2f2",
                    }}
                  />
                ))}
                {row.length === 1 && <View style={{ width: "48%" }} />}
              </View>
            ))}
          </View>
          <View style={{ height: 90 }} />
        </ScrollView>
        <View style={styles.buttonWrapper}>
          <Button
            title={t('screens.categorySelect.button')}
            onPress={handleContinue}
            gradient
            fluid
            containerStyle={styles.button}
            disabled={selected.length === 0}
            size="auth"
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const CARD_SIZE = (width - SIZES.padding * 2 - 24) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: SIZES.padding,
    justifyContent: "flex-start",
    backgroundColor: "transparent",
  },
  headerContent: {
    marginTop: 18,
    marginBottom: 18,
    paddingHorizontal: SIZES.padding,
    width: '100%',
  },
  title: {
    ...FONTS.h2,
    color: "#222",
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "left",
    maxWidth: 340,
    width: '100%',
  },
  subtitle: {
    ...FONTS.body4,
    color: "#888",
    marginBottom: 8,
    textAlign: "left",
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 340,
    width: '100%',
  },
  grid: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
    paddingHorizontal: SIZES.padding,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  buttonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingBottom: 18,
    backgroundColor: 'transparent',
  },
  button: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 8,
  },
});

export default CategorySelectScreen; 