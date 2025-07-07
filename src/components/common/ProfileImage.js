import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import useTheme from "../../hooks/useTheme";

const ProfileImage = ({ 
  user, 
  size = 40, 
  style,
  showBorder = true 
}) => {
  const { colors } = useTheme();

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name) => {
    if (!name) return colors.primary;
    
    const colorArray = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
      "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
      "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA"
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colorArray[Math.abs(hash) % colorArray.length];
  };

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: showBorder ? 2 : 0,
      borderColor: colors.border,
    },
    style,
  ];

  const textStyle = [
    styles.text,
    {
      fontSize: size * 0.4,
      color: "#fff",
    },
  ];

  if (user?.profileImage) {
    return (
      <Image
        source={{ uri: user.profileImage }}
        style={containerStyle}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        containerStyle,
        {
          backgroundColor: getRandomColor(user?.name || "User"),
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <Text style={textStyle}>
        {getInitials(user?.name || "User")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "bold",
  },
});

export default ProfileImage; 