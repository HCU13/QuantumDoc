import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { FONTS, SIZES } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";

const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  onVoicePress,
  placeholder = "AI Asistan ile konuşmak için tıklayın...",
  containerStyle,
}) => {
  const { colors, shadows, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      paddingHorizontal: SIZES.padding,
      marginVertical: 10,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? colors.gray : colors.white,
      borderRadius: SIZES.radius * 2,
      paddingHorizontal: 15,
      height: 50,
      ...shadows.light,
    },
    input: {
      flex: 1,
      ...FONTS.body3,
      color: colors.textPrimary,
      paddingVertical: 10,
    },
    searchIcon: {
      marginRight: 10,
    },
    voiceButton: {
      padding: 5,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.primary}
          style={styles.searchIcon}
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          onSubmitEditing={onSubmit}
        />

        <TouchableOpacity style={styles.voiceButton} onPress={onVoicePress}>
          <Ionicons name="mic-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchBar;
