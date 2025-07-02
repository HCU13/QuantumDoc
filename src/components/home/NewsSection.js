import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import NewsCard from "./NewsCard";

const NewsSection = ({ data, onCardPress }) => {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginTop: 30,
      marginBottom: 16,
    },
    scrollContainer: {
      paddingLeft: SIZES.padding,
      paddingRight: 8,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {data.map((item, index) => (
          <NewsCard
            key={item.id || index}
            title={item.title}
            description={item.description}
            icon={item.icon}
            gradientColors={item.gradientColors}
            badge={item.badge}
            imageUrl={item.imageUrl}
            onPress={() => onCardPress?.(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default NewsSection; 