// NotificationScreen.js
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export const NotificationScreen = ({ navigation }) => {
  const { theme } = useTheme();

  // Örnek bildirimler
  const notifications = [
    {
      id: '1',
      type: 'token',
      title: 'Low Token Balance',
      message: 'You have 5 tokens remaining. Purchase more to continue using our services.',
      time: '2h ago',
      read: false,
    },
    {
      id: '2',
      type: 'success',
      title: 'Document Analysis Complete',
      message: 'Your document "Financial Report Q4" has been successfully analyzed.',
      time: '5h ago',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'New Feature Available',
      message: 'Try our new batch processing feature for multiple documents.',
      time: '1d ago',
      read: true,
    }
  ];

  const getIconForType = (type) => {
    switch (type) {
      case 'token':
        return { name: 'flash', color: theme.colors.warning };
      case 'success':
        return { name: 'checkmark-circle', color: theme.colors.success };
      case 'info':
        return { name: 'information-circle', color: theme.colors.info };
      default:
        return { name: 'notifications', color: theme.colors.primary };
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]} variant="h2">
        Notifications
      </Text>
      <TouchableOpacity
        style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => {}}
      >
        <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderNotification = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        { 
          backgroundColor: theme.colors.surface,
          opacity: notification.read ? 0.7 : 1,
        },
      ]}
    >
      <View style={[
        styles.notificationIcon,
        { backgroundColor: getIconForType(notification.type).color + '15' }
      ]}>
        <Ionicons
          name={getIconForType(notification.type).name}
          size={24}
          color={getIconForType(notification.type).color}
        />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text 
            style={[
              styles.notificationTitle,
              { color: theme.colors.text }
            ]}
          >
            {notification.title}
          </Text>
          <Text 
            style={[
              styles.notificationTime,
              { color: theme.colors.textSecondary }
            ]}
          >
            {notification.time}
          </Text>
        </View>

        <Text 
          style={[
            styles.notificationMessage,
            { color: theme.colors.textSecondary }
          ]}
          numberOfLines={2}
        >
          {notification.message}
        </Text>

        {notification.type === 'token' && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary + '15' }
            ]}
            onPress={() => navigation.navigate('Premium')}
          >
            <Text style={{ color: theme.colors.primary }}>Get Tokens</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[
        styles.emptyIcon,
        { backgroundColor: theme.colors.primary + '15' }
      ]}>
        <Ionicons 
          name="notifications" 
          size={32} 
          color={theme.colors.primary} 
        />
      </View>
      <Text 
        style={[
          styles.emptyTitle,
          { color: theme.colors.text }
        ]}
      >
        No Notifications
      </Text>
      <Text 
        style={[
          styles.emptyDescription,
          { color: theme.colors.textSecondary }
        ]}
      >
        You're all caught up! Check back later for updates.
      </Text>
    </View>
  );

  return (
    <SafeAreaView 
      style={[
        styles.container,
        { backgroundColor: theme.colors.background }
      ]}
      edges={['top']}
    >
      {renderHeader()}
      
      <ScrollView contentContainerStyle={styles.content}>
        {notifications.length > 0 ? (
          notifications.map(renderNotification)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
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
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 100,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});