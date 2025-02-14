import React from "react";
import { View, StyleSheet, useWindowDimensions, Image } from "react-native";
import { Text } from "../common/Text";

export const OnboardingItem = ({ item, t, theme }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <Image
        source={item.image}
        style={[styles.image, { width: width * 0.8, resizeMode: "contain" }]}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t(item.title)}
        </Text>
        <Text style={[styles.description, { color: theme.colors.text }]}>
          {t(item.description)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    flex: 0.7,
    justifyContent: "center",
  },
  content: {
    flex: 0.3,
  },
  title: {
    fontWeight: "800",
    fontSize: 28,
    marginBottom: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  description: {
    fontWeight: "300",
    textAlign: "center",
    paddingHorizontal: 40,
    fontSize: 16,
  },
});
