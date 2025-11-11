import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { TEXT_STYLES, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../../components/common/GradientBackground";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";
import HomeHeader from "../../components/home/HomeHeader";
import ActivityItem from "../../components/common/ActivityItem";
import { MODULES } from "../../constants/modules";
import { useActivity } from "../../hooks/useActivity";
import { useTranslation } from "react-i18next";
import Skeleton from "../../components/common/Skeleton";

const CategoryFilter = ({ categories, selectedCategory, onCategorySelect }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: SPACING.md,
      marginTop: SPACING.md,
      marginBottom: SPACING.md,
    },
    scrollContainer: {
      flexDirection: "row",
    },
    filterButton: {
      height: 32,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.md,
      marginRight: SPACING.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
    },
    filterButtonText: {
      ...TEXT_STYLES.labelSmall,
      color: colors.textOnGradient,
      marginLeft: SPACING.xs,
    },
    filterButtonTextActive: {
      color: colors.textOnPrimary,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === item.id && styles.filterButtonActive,
            ]}
            onPress={() => onCategorySelect(item.id)}
          >
            <Ionicons
              name={item.icon}
              size={14}
              color={
                selectedCategory === item.id
                  ? colors.textOnPrimary
                  : colors.textOnGradient
              }
            />
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === item.id && styles.filterButtonTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const ActivityScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { activities, loading, hasMore, filterByCategory, loadMore, refresh, clearAllActivities, deleteActivity, deleteMultipleActivities } = useActivity();
  
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [groupByDate, setGroupByDate] = useState(true);

  // Tarih bazlı gruplandırma helper - useCallback ile optimize et
  const groupActivitiesByDate = useCallback((activityList) => {
    if (!groupByDate) return { all: activityList };

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    };

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() - 7);
      const thisMonth = new Date(today);
      thisMonth.setMonth(thisMonth.getMonth() - 1);

      activityList.forEach(activity => {
        if (!activity.created_at) return;
        
        try {
          const activityDate = new Date(activity.created_at);
          // Geçersiz tarih kontrolü
          if (isNaN(activityDate.getTime())) return;
          
          if (activityDate >= today) {
            groups.today.push(activity);
          } else if (activityDate >= yesterday) {
            groups.yesterday.push(activity);
          } else if (activityDate >= thisWeek) {
            groups.thisWeek.push(activity);
          } else if (activityDate >= thisMonth) {
            groups.thisMonth.push(activity);
          } else {
            groups.older.push(activity);
          }
        } catch (e) {
          // Tarih parsing hatası - activity'yi atla
          if (__DEV__) console.warn('Activity date parsing error:', e);
        }
      });
    } catch (e) {
      // Hata durumunda tüm aktiviteleri 'all' grubuna ekle
      if (__DEV__) console.warn('Group activities by date error:', e);
      return { all: activityList };
    }

    return groups;
  }, [groupByDate]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
    },
    listContainer: {
      paddingHorizontal: SPACING.md,
    },
    emptyContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: SPACING.xl,
      paddingHorizontal: SPACING.lg,
    },
    emptyText: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textOnGradient,
      textAlign: "center",
      marginBottom: SPACING.lg,
    },
    noResults: {
      ...TEXT_STYLES.bodyMedium,
      color: colors.textOnGradient,
      textAlign: "center",
      marginTop: SPACING.lg,
      fontStyle: "italic",
    },
  });

  // Aktivite tiplerine göre filtreler - modules.js'den otomatik al
  const filters = useMemo(() => {
    const baseFilters = [
      { id: "all", name: t('activity.filters.all'), icon: "apps-outline" },
    ];
    
    // MODULES'den aktivite tipi olan modülleri filtre olarak ekle
    const activityModules = MODULES.filter(m => 
      ['chat', 'math', 'textEditor', 'imageAnalyzer', 'noteGenerator'].includes(m.id)
    );
    
    const moduleFilters = activityModules.map(module => {
      // Translation key kontrolü - önce activity.filters'da ara, yoksa modules.title kullan
      const filterKey = `activity.filters.${module.id}`;
      const moduleTitleKey = module.titleKey;
      
      return {
        id: module.id,
        name: t(filterKey) !== filterKey ? t(filterKey) : t(moduleTitleKey),
        icon: module.icon,
      };
    });
    
    return [...baseFilters, ...moduleFilters];
  }, [t]);

  // Filtre değiştiğinde kategoriye göre filtrele
  useEffect(() => {
    filterByCategory(selectedFilter);
  }, [selectedFilter]);

  // Refresh işlemi
  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Aktivite geçmişini temizle
  const handleClearActivities = () => {
    Alert.alert(
      t('activity.clear.title'),
      t('activity.clear.message'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('activity.clear.confirm'),
          style: "destructive",
          onPress: async () => {
            try {
              const success = await clearAllActivities();
              if (success) {
                Alert.alert(t('common.success'), t('activity.clear.success'));
              } else {
                Alert.alert(t('common.error'), t('activity.clear.error'));
              }
            } catch (error) {
              Alert.alert(t('common.error'), t('activity.clear.error'));
            }
          },
        },
      ]
    );
  };

  // Aktiviteleri UI formatına çevir ve tarih bazlı grupla - useMemo ile optimize et
  const groupedActivities = useMemo(() => {
    try {
      return groupActivitiesByDate(activities);
    } catch (e) {
      // Hata durumunda boş grup döndür
      if (__DEV__) console.warn('Group activities error:', e);
      return { all: activities };
    }
  }, [activities, groupActivitiesByDate]);
  
  const groupedKeys = useMemo(() => 
    Object.keys(groupedActivities).filter(key => groupedActivities[key].length > 0),
    [groupedActivities]
  );

  // Tek aktivite silme
  const handleDeleteActivity = async (activityId, activityType) => {
    Alert.alert(
      t('activity.delete.title'),
      t('activity.delete.message'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            const success = await deleteActivity(activityId, activityType);
            if (success) {
              // Başarılı toast gösterilebilir
            } else {
              Alert.alert(t('common.error'), t('activity.delete.error'));
            }
          },
        },
      ]
    );
  };

  // Seçim modu toggle
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedActivities([]);
  };

  // Aktivite seç/seçimi kaldır
  const handleToggleSelect = (activityId) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  // Tümünü seç/seçimi kaldır
  const handleSelectAll = () => {
    if (selectedActivities.length === activities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(activities.map(a => a.id));
    }
  };

  // Seçili aktiviteleri sil
  const handleDeleteSelected = () => {
    if (selectedActivities.length === 0) return;

    Alert.alert(
      t('activity.deleteMultiple.title'),
      t('activity.deleteMultiple.message', { count: selectedActivities.length }),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            const success = await deleteMultipleActivities(selectedActivities);
            if (success) {
              setSelectedActivities([]);
              setSelectionMode(false);
              // Başarılı toast gösterilebilir
            } else {
              Alert.alert(t('common.error'), t('activity.deleteMultiple.error'));
            }
          },
        },
      ]
    );
  };

  // Aktivite öğesi tıklandığında - Detay genişletme için
  const handleActivityPress = (activity) => {
    // ActivityItem içinde zaten handle ediliyor
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <HomeHeader
          navigation={navigation}
          showProfileImage={false}
          title={selectionMode ? `${selectedActivities.length} ${t('activity.selected')}` : t("activity.title")}
          subtitle={selectionMode ? t("activity.selectionMode") : t("activity.subtitle")}
          rightButton={
            selectionMode ? (
              <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
                {selectedActivities.length > 0 && (
                  <TouchableOpacity
                    onPress={handleDeleteSelected}
                    style={{
                      backgroundColor: '#ef4444',
                      borderRadius: BORDER_RADIUS.md,
                      padding: SPACING.xs,
                      marginRight: SPACING.xs,
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="trash"
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleSelectAll}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.xs,
                    marginRight: SPACING.xs,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={selectedActivities.length === activities.length ? "square" : "checkbox"}
                    size={20}
                    color={colors.textOnGradient}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleSelectionMode}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.xs,
                    marginRight: SPACING.sm,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={colors.textOnGradient}
                  />
                </TouchableOpacity>
              </View>
            ) : activities.length > 0 ? (
              <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
                <TouchableOpacity
                  onPress={toggleSelectionMode}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.xs,
                    marginRight: SPACING.xs,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="checkbox-outline"
                    size={20}
                    color={colors.textOnGradient}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleClearActivities}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.xs,
                    marginRight: SPACING.sm,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.textOnGradient}
                  />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />

        <View style={styles.contentContainer}>
          <CategoryFilter
            categories={filters}
            selectedCategory={selectedFilter}
            onCategorySelect={setSelectedFilter}
          />

          <View style={styles.listContainer}>
            {loading && activities.length === 0 ? (
              // Loading Skeleton
              <View style={{ paddingTop: SPACING.md }}>
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: BORDER_RADIUS.md,
                      marginBottom: SPACING.xs,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    {/* Header */}
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      padding: SPACING.sm,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border + '20',
                    }}>
                      <Skeleton circle width={32} height={32} style={{ marginRight: SPACING.sm }} />
                      <View style={{ flex: 1 }}>
                        <Skeleton width="70%" height={16} style={{ marginBottom: 4 }} />
                        <Skeleton width="50%" height={13} />
                      </View>
                      <Skeleton width={60} height={24} borderRadius={BORDER_RADIUS.sm} />
                    </View>
                    {/* Content */}
                    <View style={{ padding: SPACING.sm, paddingTop: SPACING.xs }}>
                      <Skeleton width="90%" height={13} style={{ marginBottom: 4 }} />
                      <Skeleton width="75%" height={13} />
                    </View>
                  </View>
                ))}
              </View>
            ) : activities.length > 0 ? (
              groupByDate && groupedKeys.length > 0 ? (
                <FlatList
                  data={groupedKeys}
                  keyExtractor={(key) => key}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 130 }}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      tintColor={colors.primary}
                      colors={[colors.primary]}
                    />
                  }
                  renderItem={({ item: groupKey }) => {
                    const groupActivities = groupedActivities[groupKey];
                    const groupLabels = {
                      today: t('activity.groups.today'),
                      yesterday: t('activity.groups.yesterday'),
                      thisWeek: t('activity.groups.thisWeek'),
                      thisMonth: t('activity.groups.thisMonth'),
                      older: t('activity.groups.older'),
                    };

                    return (
                      <View style={{ marginBottom: SPACING.md }}>
                        <Text style={{
                          ...TEXT_STYLES.titleSmall,
                          color: colors.textOnGradient,
                          marginBottom: SPACING.sm,
                          paddingHorizontal: SPACING.xs,
                          fontWeight: '700',
                        }}>
                          {groupLabels[groupKey]} ({groupActivities.length})
                        </Text>
                        {groupActivities.map((activity) => (
                          <ActivityItem
                            key={activity.id}
                            item={activity}
                            onPress={handleActivityPress}
                            onDelete={handleDeleteActivity}
                            onSelect={handleToggleSelect}
                            isSelected={selectedActivities.includes(activity.id)}
                            isSelectionMode={selectionMode}
                          />
                        ))}
                      </View>
                    );
                  }}
                  nestedScrollEnabled={false}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={() => null}
                />
              ) : (
                <FlatList
                  data={activities}
                  renderItem={({ item }) => (
                    <ActivityItem
                      item={item}
                      onPress={handleActivityPress}
                      onDelete={handleDeleteActivity}
                      onSelect={handleToggleSelect}
                      isSelected={selectedActivities.includes(item.id)}
                      isSelectionMode={selectionMode}
                    />
                  )}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 130 }}
                  nestedScrollEnabled={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      tintColor={colors.primary}
                      colors={[colors.primary]}
                    />
                  }
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={() => null}
                />
              )
            ) : (
              <View style={styles.emptyContainer}>
                {selectedFilter !== "all" ? (
                  <>
                    <Text style={styles.noResults}>
                      {t("activity.noCategoryResults")}
                    </Text>
                    <Button
                      title={t("activity.showAllActivities")}
                      onPress={() => setSelectedFilter("all")}
                      outlined
                      containerStyle={{ marginTop: 15 }}
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.emptyText}>
                      {t("activity.emptyState")}
                    </Text>
                    <Button
                      title={t("activity.startChat")}
                      onPress={() => navigation.navigate("Chat")}
                      neon
                      icon={
                        <Ionicons
                          name="chatbubble-ellipses"
                          size={20}
                          color="#fff"
                        />
                      }
                    />
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default ActivityScreen;