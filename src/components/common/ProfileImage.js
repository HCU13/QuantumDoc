import React from "react";
import { View, StyleSheet } from "react-native";
import useTheme from "../../hooks/useTheme";
import { stringToAvatar } from "../../utils/avatarUtils";
import Avatar from "@zamplyy/react-native-nice-avatar";
import { useAuth } from "../../contexts/AuthContext";

const ProfileImage = ({
  user,
  size = 40,
  style,
  showBorder = true
}) => {
  const { colors } = useTheme();
  const { currentAvatar } = useAuth();

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: showBorder ? 2 : 0,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    style,
  ];

  // Avatar'ı al
  const getAvatar = () => {
    // Önce global state'teki avatar'ı kontrol et
    if (currentAvatar) {
      return currentAvatar;
    }
    
    // Profiles tablosundan avatar_url'yi kontrol et
    if (user?.avatar_url) {
      return stringToAvatar(user.avatar_url);
    }
    
    // Eğer avatar yoksa null döndür
    return null;
  };

  const avatar = getAvatar();

  // Eğer avatar yoksa placeholder göster
  if (!avatar) {
    return (
      <View style={[containerStyle, { backgroundColor: colors.primary + '20' }]}>
        <View style={[styles.placeholder, { backgroundColor: colors.primary }]} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Avatar
        style={{ width: size, height: size }}
        {...avatar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ProfileImage; 