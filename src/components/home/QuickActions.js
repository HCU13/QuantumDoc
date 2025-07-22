import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import ModuleCard from "../explore/ModuleCard";
import { useTranslation } from "react-i18next";
import { MODULES } from "../../constants/modules";
import { useNavigation } from "@react-navigation/native";
const QuickActions = ({ onActionPress, containerStyle }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
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
  const quickActions = MODULES.filter((m) => m.enabled && m.showQuickArea);

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
              title={t(action.titleKey)}
              description={t(action.descriptionKey)}
              icon={action.icon}
              gradientColors={action.gradientColors}
              tokenCost={action.tokenCost}
              canAfford={true} // Removed tokens >= (action.tokenCost || 0)
              onPress={() => {
                if (action.route && navigation) {
                  navigation.navigate(action.route);
                } else if (onActionPress) {
                  onActionPress(action);
                }
              }}
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
