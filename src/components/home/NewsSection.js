import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { SIZES, FONTS } from "../../constants/theme";
import useTheme from "../../hooks/useTheme";
import NewsCard from "./NewsCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 280;
const CARD_SPACING = 16;
const SIDE_PADDING = SIZES.padding;

const NewsSection = ({ data, onCardPress }) => {
  const { colors, isDark } = useTheme();
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  const styles = StyleSheet.create({
    container: {
      marginTop: 10,
      marginBottom: 16,
    },
    scrollContainer: {
      paddingLeft: SIDE_PADDING,
      paddingRight: SIDE_PADDING,
    },
    paginationContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)",
      transition: "all 0.3s",
    },
    activeDot: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
  });

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {data.map((item, index) => (
          <NewsCard
            key={item.id || index}
            title={item.title}
            description={item.description}
            icon={item.icon}
            imageUrl={item.imageUrl}
            onPress={() => onCardPress?.(item)}
            containerStyle={{
              marginRight: index === data.length - 1 ? 0 : CARD_SPACING,
              width: CARD_WIDTH,
            }}
          />
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {data.length > 1 && (
        <View style={styles.paginationContainer}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.activeDot
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default NewsSection; 