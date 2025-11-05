import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import designSystem from '../../theme/designSystem';

const { colors, spacing, borderRadius } = designSystem;

export default function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius: customBorderRadius,
  style,
  variant = 'default' // 'default', 'circle', 'text', 'card'
}) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case 'circle':
        return {
          width: typeof width === 'number' ? width : height,
          height: height,
          borderRadius: height / 2,
        };
      case 'text':
        return {
          width: width,
          height: height,
          borderRadius: borderRadius.sm,
        };
      case 'card':
        return {
          width: width,
          height: height,
          borderRadius: borderRadius.lg,
          padding: spacing[4],
        };
      default:
        return {
          width: width,
          height: height,
          borderRadius: customBorderRadius || borderRadius.base,
        };
    }
  };

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const variantStyles = getVariantStyles();

  return (
    <View 
      style={[
        styles.container,
        variantStyles,
        style,
        { backgroundColor: colors.background.secondary }
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={[
            colors.background.secondary,
            colors.background.primary,
            colors.background.secondary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, width: 200 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
});

