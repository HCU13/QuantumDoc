import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { TEXT_STYLES, SPACING, BORDER_RADIUS, SHADOWS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { MODULES } from "../../constants/modules";

const ActivityItem = ({ item, onPress, onDelete, onToggleDetail, isSelected, onSelect, isSelectionMode }) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // modules.js'den modül bilgilerini al
  const getModuleInfo = (type) => {
    // Activity type'ı module ID'ye map et
    const typeToModuleId = {
      chat: "chat",
      math: "math",
      textEditor: "textEditor",
      imageAnalyzer: "imageAnalyzer",
      noteGenerator: "noteGenerator",
      write: "textEditor", // Eski mapping
      translate: "textEditor", // Eski mapping
      note: "noteGenerator", // Eski mapping
    };
    
    const moduleId = typeToModuleId[type] || type;
    const module = MODULES.find(m => m.id === moduleId);
    
    return module || null;
  };

  // Görsel URL'lerini modules.js'den al
  const getModuleImage = (type) => {
    const module = getModuleInfo(type);
    return module?.decorativeImage || null;
  };

  // Fonksiyonları modules.js'den otomatik al
  function getTypeColor(type, opacity = 1) {
    const module = getModuleInfo(type);
    if (module && module.gradientColors && module.gradientColors[0]) {
      // Hex color'ı rgba'ya çevir
      const hex = module.gradientColors[0].replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // Fallback: Eski renkler
    const typeColors = {
      chat: `rgba(138, 79, 255, ${opacity})`,
      math: `rgba(16, 185, 129, ${opacity})`,
      default: `rgba(150, 150, 150, ${opacity})`,
    };
    return typeColors[type] || typeColors["default"];
  }

  function getTypeIcon(type) {
    const module = getModuleInfo(type);
    if (module && module.icon) {
      return module.icon;
    }
    // Fallback: Eski iconlar
    const icons = {
      chat: "chatbubble-ellipses-outline",
      math: "calculator-outline",
      default: "ellipsis-horizontal",
    };
    return icons[type] || icons["default"];
  }

  function getIconColor(type) {
    const module = getModuleInfo(type);
    if (module && module.gradientColors && module.gradientColors[0]) {
      return module.gradientColors[0];
    }
    // Fallback: Eski renkler
    const iconColors = {
      chat: "#8A4FFF",
      math: "#10B981",
      default: "#999999",
    };
    return iconColors[type] || iconColors["default"];
  }

  // Kategori bilgisini al
  function getCategory(type) {
    const module = getModuleInfo(type);
    return module?.category || null;
  }

  // Icon background color'ı hesapla - useMemo ile optimize et
  const iconBgColor = useMemo(() => getTypeColor(item.type, 0.2), [item.type]);

  // StyleSheet.create() her render'da çağrılmasın - useMemo ile optimize et
  const styles = useMemo(() => StyleSheet.create({
    itemContainer: {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.md,
      marginBottom: SPACING.xs,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      ...SHADOWS.small,
    },
    itemHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '20',
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: BORDER_RADIUS.md,
      alignItems: "center",
      justifyContent: "center",
      marginRight: SPACING.sm,
    },
    contentContainer: {
      flex: 1,
    },
    title: {
      ...TEXT_STYLES.titleSmall,
      color: colors.textPrimary,
      marginBottom: 2,
      fontWeight: '600',
    },
    description: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + '15',
      paddingHorizontal: SPACING.xs,
      paddingVertical: 4,
      borderRadius: BORDER_RADIUS.sm,
    },
    time: {
      ...TEXT_STYLES.labelSmall,
      color: colors.primary,
      marginLeft: SPACING.xs,
      fontWeight: '600',
    },
    itemContent: {
      height: 200,
      padding: SPACING.sm,
      paddingTop: SPACING.xs,
      paddingBottom: SPACING.sm,
    },
    scrollViewContainer: {
      flex: 1,
    },
    contentText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    itemContainerSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.primary + '10',
    },
    itemContainerExpanded: {
      marginBottom: SPACING.sm,
    },
    itemContentCollapsed: {
      maxHeight: 0,
      overflow: 'hidden',
      paddingTop: 0,
      paddingBottom: 0,
    },
    checkboxContainer: {
      marginRight: SPACING.sm,
      justifyContent: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: BORDER_RADIUS.sm,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    deleteAction: {
      backgroundColor: '#ef4444',
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      borderRadius: BORDER_RADIUS.md,
      marginBottom: SPACING.xs,
    },
    deleteActionContent: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
    metadataContainer: {
      marginTop: SPACING.sm,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border + '30',
    },
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    metadataText: {
      ...TEXT_STYLES.bodySmall,
      color: colors.textSecondary,
      marginLeft: SPACING.xs,
    },
    moduleImage: {
      width: 20,
      height: 20,
    },
  }), [colors, iconBgColor]);

  const handleToggleDetail = () => {
    // LayoutAnimation removed to prevent native crash
    // FlatList scroll ile çakışmaması için setTimeout kullan
    setTimeout(() => {
      setIsExpanded(!isExpanded);
      if (onToggleDetail) onToggleDetail(item, !isExpanded);
    }, 0);
  };

  const handlePress = () => {
    if (isSelectionMode) {
      if (onSelect) onSelect(item.id);
    } else {
      handleToggleDetail();
      if (onPress) onPress(item);
    }
  };

  // Swipe to delete geçici olarak devre dışı
  // const renderRightActions = (progress, dragX) => {
  //   const scale = dragX.interpolate({
  //     inputRange: [-100, 0],
  //     outputRange: [1, 0],
  //     extrapolate: 'clamp',
  //   });

  //   if (!onDelete) return null;

  //   return (
  //     <TouchableOpacity
  //       style={styles.deleteAction}
  //       onPress={() => {
  //         if (onDelete) onDelete(item.id, item.activity_type || item.type);
  //       }}
  //       activeOpacity={0.9}
  //     >
  //       <Animated.View style={[styles.deleteActionContent, { transform: [{ scale }] }]}>
  //         <Ionicons name="trash" size={20} color="#fff" />
  //       </Animated.View>
  //     </TouchableOpacity>
  //   );
  // };

  const itemContent = (
    <View
      style={[
        styles.itemContainer,
        isSelected && styles.itemContainerSelected,
        isExpanded && styles.itemContainerExpanded,
      ]}
    >
      <TouchableOpacity
        style={styles.itemHeader}
        onPress={handlePress}
        activeOpacity={isSelectionMode ? 1 : 0.9}
      >
        {isSelectionMode && (
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => onSelect && onSelect(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>
        )}
        
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          {/* Görsel varsa göster, yoksa icon göster */}
          {getModuleImage(item.type) ? (
            <Image
              source={
                typeof getModuleImage(item.type) === "number"
                  ? getModuleImage(item.type)
                  : typeof getModuleImage(item.type) === "string" && getModuleImage(item.type)
                  ? { uri: getModuleImage(item.type) }
                  : null
              }
              style={styles.moduleImage}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name={getTypeIcon(item.type)} size={18} color={getIconColor(item.type)} />
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={isExpanded ? 0 : 1}>
            {item.title}
          </Text>
          {/* Kapalı durumda description gösterilmez - sadece açık durumda AI cevabı gösterilir */}
        </View>

        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={12} color={colors.primary} />
          <Text style={styles.time}>{item.time}</Text>
          {!isSelectionMode && (
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.textSecondary}
              style={{ marginLeft: SPACING.xs }}
            />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.itemContent}>
          <ScrollView 
            style={styles.scrollViewContainer}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: SPACING.xs }}
          >
            {/* Description'ı genişletilmiş kısımda göster */}
            {item.description && (
              <Text style={styles.contentText}>
                {item.description}
              </Text>
            )}
            {item.metadata && (
              <View style={styles.metadataContainer}>
                {item.metadata.tokensUsed !== undefined && (
                  <View style={styles.metadataRow}>
                    <Ionicons name="flash-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.metadataText}>
                      {t('activity.details.tokensUsed', { count: item.metadata.tokensUsed })}
                    </Text>
                  </View>
                )}
                {item.created_at && (() => {
                  try {
                    const date = new Date(item.created_at);
                    // Geçersiz tarih kontrolü
                    if (isNaN(date.getTime())) return null;
                    
                    return (
                      <View style={styles.metadataRow}>
                        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.metadataText}>
                          {date.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    );
                  } catch (e) {
                    // Date parsing hatası native crash'e neden olmasın
                    if (__DEV__) console.warn('Date parsing error:', e);
                    return null;
                  }
                })()}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );

  // Swipe-to-delete geçici olarak devre dışı - native crash'i önlemek için
  // if (onDelete && !isSelectionMode) {
  //   return (
  //     <Swipeable renderRightActions={renderRightActions}>
  //       {itemContent}
  //     </Swipeable>
  //   );
  // }

  return itemContent;
};

export default ActivityItem;
