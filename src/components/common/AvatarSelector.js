import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { genConfig } from '@zamplyy/react-native-nice-avatar';
import Avatar from '@zamplyy/react-native-nice-avatar';

const { width } = Dimensions.get('window');

const AvatarSelector = ({ 
  visible, 
  onClose, 
  onSelect, 
  currentAvatar = genConfig(),
  title = "Avatar Seç"
}) => {
  const theme = useTheme();
  const { colors } = theme || {};
  const { t } = useTranslation();


  const handleSelectAvatar = (avatar) => {
    onSelect(avatar);
    onClose();
  };

  // Mevcut avatar'ı parse et
           const currentAvatarObj = typeof currentAvatar === 'string'
           ? JSON.parse(currentAvatar)
           : currentAvatar;



  const renderAvatars = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.avatarsContainer}
    >
      <View style={styles.avatarsGrid}>
        {Array.from({ length: 24 }, (_, index) => {
          const avatar = genConfig({ seed: index });
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.avatarItem,
                {
                  backgroundColor: JSON.stringify(currentAvatarObj) === JSON.stringify(avatar)
                    ? colors?.primary || '#6C63FF'
                    : colors?.card || '#FFFFFF',
                  borderColor: JSON.stringify(currentAvatarObj) === JSON.stringify(avatar)
                    ? colors?.primary || '#6C63FF'
                    : colors?.border || '#E5E5E5'
                }
              ]}
              onPress={() => handleSelectAvatar(avatar)}
            >
              <Avatar
                style={{ width: 40, height: 40 }}
                {...avatar}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors?.background || '#F5F5F5' }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors?.border || '#E5E5E5' }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors?.text || '#000000'} />
          </TouchableOpacity>
                      <Text style={[styles.title, { color: colors?.text || '#000000' }]}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Avatars Grid */}
        {renderAvatars()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },

  avatarsContainer: {
    padding: 16,
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarItem: {
    width: (width - 64) / 6,
    height: (width - 64) / 6,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

});

export default AvatarSelector;
