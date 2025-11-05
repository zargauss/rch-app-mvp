import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ANIMATION_DURATION } from '../../utils/animations';

/**
 * Composant wrapper pour animer l'apparition progressive des éléments de liste
 */
export default function AnimatedListItem({ 
  children, 
  index = 0, 
  delay = 50,
  style 
}) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION.NORMAL,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION.NORMAL,
          useNativeDriver: true,
        }),
      ]).start();
    }, index * delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

