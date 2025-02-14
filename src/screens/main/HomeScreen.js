import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const todayStats = {
    documentsAnalyzed: 5,
    pagesProcessed: 42,
    timeSaved: '2.5'
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
          Good Morning 👋
        </Text>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          John Doe
        </Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => {}}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.avatarButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image 
            source={{ uri: 'https://i.pravatar.cc/100' }} 
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity 
        style={[styles.mainAction, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Documents')}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'transparent']}
          style={styles.mainActionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.mainActionContent}>
            <View style={styles.mainActionIcon}>
              <Ionicons name="scan-outline" size={32} color="white" />
            </View>
            <Text style={styles.mainActionTitle} color="white">
              Scan Document
            </Text>
            <Text style={styles.mainActionSubtitle} color="white">
              Upload and analyze instantly
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.secondaryActions}>
        <TouchableOpacity 
          style={[styles.secondaryAction, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Documents')}
        >
          <View style={[styles.secondaryActionIcon, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="folder-open" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.secondaryActionTitle, { color: theme.colors.text }]}>
            My Documents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryAction, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('Reports')}
        >
          <View style={[styles.secondaryActionIcon, { backgroundColor: theme.colors.secondaryLight }]}>
            <Ionicons name="analytics" size={24} color={theme.colors.secondary} />
          </View>
          <Text style={[styles.secondaryActionTitle, { color: theme.colors.text }]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTodayStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Today's Activity
        </Text>
        <TouchableOpacity>
          <Text style={{ color: theme.colors.primary }}>View Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <Card theme={theme} style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="document-text" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {todayStats.documentsAnalyzed}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Documents
          </Text>
        </Card>

        <Card theme={theme} style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: theme.colors.secondaryLight }]}>
            <Ionicons name="copy" size={24} color={theme.colors.secondary} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {todayStats.pagesProcessed}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pages
          </Text>
        </Card>

        <Card theme={theme} style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: theme.colors.success + '20' }]}>
            <Ionicons name="time" size={24} color={theme.colors.success} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {todayStats.timeSaved}h
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Time Saved
          </Text>
        </Card>
      </View>
    </View>
  );

  const renderRecentDocuments = () => (
    <View style={styles.recentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Recent Documents
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Documents')}>
          <Text style={{ color: theme.colors.primary }}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentScroll}
      >
        {[1, 2, 3].map((item) => (
          <TouchableOpacity 
            key={item}
            style={[styles.recentCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.recentCardHeader}>
              <View style={[styles.docIconBg, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="document-text" size={20} color={theme.colors.primary} />
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text 
              numberOfLines={2} 
              style={[styles.docTitle, { color: theme.colors.text }]}
            >
              Financial Report Q4 2024
            </Text>
            <Text style={[styles.docMeta, { color: theme.colors.textSecondary }]}>
              PDF • 12 pages
            </Text>
            <View style={styles.docFooter}>
              <Text style={[styles.docDate, { color: theme.colors.textSecondary }]}>
                2h ago
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}>
                <Text style={[styles.statusText, { color: theme.colors.success }]}>
                  Analyzed
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView 
      edges={['top']} 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {renderHeader()}
        {renderQuickActions()}
        {renderTodayStats()}
        {renderRecentDocuments()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  mainAction: {
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  mainActionGradient: {
    padding: 24,
  },
  mainActionContent: {
    alignItems: 'center',
  },
  mainActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainActionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  mainActionSubtitle: {
    opacity: 0.9,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryActionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  recentContainer: {
    marginTop: 24,
  },
  recentScroll: {
    paddingRight: 20,
  },
  recentCard: {
    width: width * 0.7,
    marginRight: 16,
    padding: 16,
    borderRadius: 16,
  },
  recentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  docIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  docMeta: {
    fontSize: 12,
    marginBottom: 12,
  },
  docFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});