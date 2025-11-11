import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TEXT_STYLES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import useTheme from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

/**
 * AI cevaplarını profesyonel ve okunabilir şekilde gösteren component
 * Markdown benzeri formatları parse eder ve uygun stillerle gösterir
 */
const ResultText = ({ text, moduleColor, style }) => {
  const { colors, isDark } = useTheme();

  // Metni parse et ve formatla
  const parseText = (content) => {
    if (!content) return [];

    const lines = content.split('\n');
    const parsedLines = [];
    let currentParagraph = [];
    let inList = false;

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Boş satır - paragraf sonu
      if (!trimmedLine) {
        if (currentParagraph.length > 0) {
          parsedLines.push({
            type: 'paragraph',
            content: currentParagraph.join(' ').trim(),
          });
          currentParagraph = [];
        }
        if (inList) {
          inList = false;
        }
        return;
      }

      // Başlık tespiti (#, ##, ### formatında)
      const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
      
      if (headingMatch) {
        if (currentParagraph.length > 0) {
          parsedLines.push({
            type: 'paragraph',
            content: currentParagraph.join(' ').trim(),
          });
          currentParagraph = [];
        }
        
        const headingText = headingMatch[2].replace(/\*\*/g, '').trim();
        const level = headingMatch[1].length;

        parsedLines.push({
          type: 'heading',
          content: headingText,
          level,
        });
        return;
      }

      // Liste item (•, -, *, 1., 2. gibi)
      const listMatch = trimmedLine.match(/^([•\-\*]|\d+[\.\)])\s+(.+)$/);
      if (listMatch) {
        if (currentParagraph.length > 0 && !inList) {
          parsedLines.push({
            type: 'paragraph',
            content: currentParagraph.join(' ').trim(),
          });
          currentParagraph = [];
        }

        parsedLines.push({
          type: 'listItem',
          content: listMatch[2].trim(),
        });
        inList = true;
        return;
      }

      // Normal metin - paragrafa ekle
      currentParagraph.push(trimmedLine);
      if (inList) {
        inList = false;
      }
    });

    // Kalan paragrafı ekle
    if (currentParagraph.length > 0) {
      parsedLines.push({
        type: 'paragraph',
        content: currentParagraph.join(' ').trim(),
      });
    }

    return parsedLines;
  };

  const parsedContent = parseText(text);
  const primaryColor = moduleColor || colors.primary;

  const renderLine = (item, index) => {
    switch (item.type) {
      case 'heading':
        return (
          <View 
            key={index} 
            style={[
              styles.headingContainer,
              { borderBottomColor: primaryColor + '30' }
            ]}
          >
            <Text
              style={[
                styles.headingText,
                {
                  color: primaryColor,
                  fontSize: item.level === 1 ? 18 : item.level === 2 ? 16 : 14,
                },
              ]}
            >
              {item.content}
            </Text>
          </View>
        );

      case 'listItem':
        return (
          <View key={index} style={styles.listItemContainer}>
            <Ionicons
              name="ellipse"
              size={6}
              color={primaryColor}
              style={styles.listBullet}
            />
            <Text style={[styles.listItemText, { color: colors.textPrimary }]}>
              {item.content}
            </Text>
          </View>
        );

      case 'paragraph':
        // Bold text parse et (**text**)
        const parts = item.content.split(/(\*\*[^*]+\*\*)/g);
        return (
          <View key={index} style={styles.paragraphContainer}>
            <Text style={[styles.paragraphText, { color: colors.textPrimary }]}>
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.replace(/\*\*/g, '');
                  return (
                    <Text
                      key={partIndex}
                      style={[
                        styles.boldText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {boldText}
                    </Text>
                  );
                }
                return part;
              })}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      ...style,
    },
    headingContainer: {
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
      paddingBottom: SPACING.xs,
      borderBottomWidth: 1,
    },
    headingText: {
      ...TEXT_STYLES.titleSmall,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    paragraphContainer: {
      marginBottom: SPACING.sm,
    },
    paragraphText: {
      ...TEXT_STYLES.bodyMedium,
      lineHeight: 22,
      fontSize: 14,
      letterSpacing: 0.1,
    },
    boldText: {
      fontWeight: '600',
    },
    listItemContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: SPACING.xs,
      paddingLeft: SPACING.xs,
    },
    listBullet: {
      marginTop: 8,
      marginRight: SPACING.xs,
    },
    listItemText: {
      ...TEXT_STYLES.bodyMedium,
      flex: 1,
      lineHeight: 22,
      fontSize: 14,
      letterSpacing: 0.1,
    },
  });

  // Eğer parse edilen içerik yoksa, düz metin göster
  if (parsedContent.length === 0) {
    return (
      <Text style={[styles.paragraphText, { color: colors.textPrimary }, style]}>
        {text}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {parsedContent.map((item, index) => renderLine(item, index))}
    </View>
  );
};

export default ResultText;

