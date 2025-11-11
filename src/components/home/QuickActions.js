import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FONTS, SIZES, TEXT_STYLES, SPACING } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import ModuleCard from "../explore/ModuleCard";
import { useTranslation } from "react-i18next";
import { MODULES } from "../../constants/modules";
import { useNavigation } from "@react-navigation/native";
import { useTokenContext } from '../../contexts/TokenContext';
import { useFavoriteModules } from '../../hooks/useFavoriteModules';

const QuickActions = ({ onActionPress, containerStyle }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { getTokenCost } = useTokenContext();
  const { favoriteModules, loading: favoritesLoading } = useFavoriteModules();
  const styles = StyleSheet.create({
    container: {
      width: "100%",
      marginVertical: SPACING.xs,
    },
    titleContainer: {
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.xs,
    },
    title: {
      ...TEXT_STYLES.titleLarge,
      color: colors.textOnGradient,
    },
    scrollContainer: {
      paddingHorizontal: SPACING.md,
    },
    cardsContainer: {
      paddingVertical: SPACING.xs,
    },
  });

  // Sadece favori modülleri göster (tüm favoriler, showQuickArea filtresi yok)
  const quickActions = useMemo(() => {
    if (favoritesLoading) {
      return [];
    }

    if (favoriteModules.length === 0) {
      return [];
    }

    // Favori modüllerden sadece enabled olanları göster (showQuickArea filtresi yok)
    return MODULES.filter((m) => 
      m.enabled && 
      favoriteModules.includes(m.id)
    );
  }, [favoriteModules, favoritesLoading]);

  // Eğer favori modül yoksa hiçbir şey gösterme
  if (quickActions.length === 0 && !favoritesLoading) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t("home.quickAccess")}</Text>
      </View>

      <View style={styles.scrollContainer}>
        <View style={styles.cardsContainer}>
          {quickActions.map((action) => {
            // Database'den token maliyetini al
            const tokenCost = getTokenCost(action.id) || action.tokenCost;
            return (
              <ModuleCard
                key={action.id}
                moduleId={action.id}
                title={t(action.titleKey)}
                description={t(action.descriptionKey)}
                icon={action.icon}
                gradientColors={action.gradientColors}
                tokenCost={tokenCost}
                tokenCostRange={action.tokenCostRange}
                onPress={() => {
                  if (action.route && navigation) {
                    navigation.navigate(action.route);
                  } else if (onActionPress) {
                    onActionPress(action);
                  }
                }}
                size="medium"
                containerStyle={{ marginBottom: SPACING.xs }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default QuickActions;
