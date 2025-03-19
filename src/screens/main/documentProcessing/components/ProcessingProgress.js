import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components';
import { useTheme } from '../../../../context/ThemeContext';

const ProcessingProgress = ({ stage, progress, progressAnim }) => {
  const { theme, isDark } = useTheme();
  
  // Get stage information
  const getStageInfo = () => {
    switch (stage) {
      case 'uploading':
        return {
          title: 'Uploading Document',
          description: 'Securely transferring your document to our servers...',
          icon: 'cloud-upload',
          color: theme.colors.primary,
        };
      case 'analyzing':
        return {
          title: 'Analyzing Content',
          description: 'Our AI is reading and understanding your document...',
          icon: 'analytics',
          color: theme.colors.info,
        };
      default:
        return {
          title: 'Processing',
          description: 'Your document is being processed...',
          icon: 'hourglass',
          color: theme.colors.primary,
        };
    }
  };
  
  const stageInfo = getStageInfo();
  
  return (
    <View style={styles.container}>
      {/* Stage Icon */}
      <View style={[
        styles.stageIcon,
        { backgroundColor: stageInfo.color + '15' }
      ]}>
        <Ionicons 
          name={stageInfo.icon} 
          size={32} 
          color={stageInfo.color}
        />
      </View>
      
      {/* Stage Text */}
      <Text variant="subtitle1" style={styles.stageTitle}>
        {stageInfo.title}
      </Text>
      
      <Text
        variant="body2"
        color={theme.colors.textSecondary}
        style={styles.stageDescription}
      >
        {stageInfo.description}
      </Text>
      
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={[
          styles.progressBarBg,
          { backgroundColor: isDark ? theme.colors.card : theme.colors.border }
        ]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: stageInfo.color,
              },
            ]}
          >
            <LinearGradient
              colors={[stageInfo.color, stageInfo.color + '80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
        
        <Text
          variant="body2"
          color={theme.colors.textSecondary}
          style={styles.progressText}
        >
          {Math.round(progress)}%
        </Text>
      </View>
      
      {/* Processing Steps */}
      <View style={styles.stepsContainer}>
        <View style={styles.stepItem}>
          <View style={[
            styles.stepIcon,
            { 
              backgroundColor: stage === 'uploading' 
                ? theme.colors.primary
                : (stage === 'analyzing' || progress === 100) 
                  ? theme.colors.success 
                  : theme.colors.border
            }
          ]}>
            {(stage === 'analyzing' || progress === 100) ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : (
              <Text variant="caption" color="#FFFFFF" style={styles.stepNumber}>
                1
              </Text>
            )}
          </View>
          <Text
            variant="caption"
            color={stage === 'uploading' ? theme.colors.primary : theme.colors.textSecondary}
            weight={stage === 'uploading' ? 'semibold' : 'regular'}
          >
            Upload
          </Text>
        </View>
        
        <View style={[
          styles.stepLine,
          { 
            backgroundColor: (stage === 'analyzing' || progress === 100) 
              ? theme.colors.success 
              : theme.colors.border 
          }
        ]} />
        
        <View style={styles.stepItem}>
          <View style={[
            styles.stepIcon,
            { 
              backgroundColor: stage === 'analyzing' 
                ? theme.colors.info
                : progress === 100
                  ? theme.colors.success
                  : theme.colors.border
            }
          ]}>
            {progress === 100 ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : (
              <Text variant="caption" color="#FFFFFF" style={styles.stepNumber}>
                2
              </Text>
            )}
          </View>
          <Text
            variant="caption"
            color={stage === 'analyzing' ? theme.colors.info : theme.colors.textSecondary}
            weight={stage === 'analyzing' ? 'semibold' : 'regular'}
          >
            Analyze
          </Text>
        </View>
        
        <View style={[
          styles.stepLine,
          { backgroundColor: theme.colors.border }
        ]} />
        
        <View style={styles.stepItem}>
          <View style={[
            styles.stepIcon,
            { 
              backgroundColor: progress === 100 
                ? theme.colors.success 
                : theme.colors.border 
            }
          ]}>
            <Text variant="caption" color="#FFFFFF" style={styles.stepNumber}>
              3
            </Text>
          </View>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
          >
            Complete
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  stageIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stageTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  stageDescription: {
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressGradient: {
    width: '100%',
    height: '100%',
  },
  progressText: {
    textAlign: 'right',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepLine: {
    height: 2,
    width: 40,
  },
});

export default ProcessingProgress;