import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from './';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View 
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface },
        style
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.primary + '15' },
        ]}
      >
        <Ionicons
          name={icon}
          size={32}
          color={theme.colors.primary}
        />
      </View>

      <Text
        style={[styles.title, { color: theme.colors.text }]}
        variant="h2"
      >
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          { color: theme.colors.textSecondary },
        ]}
      >
        {description}
      </Text>

      {action && (
        <Button
          title={action.title}
          onPress={action.onPress}
          theme={theme}
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    margin: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButton: {
    minWidth: 200,
  },
});