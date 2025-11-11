import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import useTheme from '../../hooks/useTheme';

const Skeleton = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style,
  circle = false 
}) => {
  const { colors, isDark } = useTheme();
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const shimmerTranslate = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const containerStyle = {
    width: circle ? height : width,
    height,
    borderRadius: circle ? height / 2 : borderRadius,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  };

  return (
    <View style={[containerStyle, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: shimmerOpacity,
            transform: [{ translateX: shimmerTranslate }],
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.15)' 
              : 'rgba(255, 255, 255, 0.8)',
          },
        ]}
      />
    </View>
  );
};

export default Skeleton;

