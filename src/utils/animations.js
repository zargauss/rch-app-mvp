import { Animated, Easing } from 'react-native';
import React from 'react';

/**
 * Système d'animations réutilisables pour l'application
 */

// Durées standardisées
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 400,
  VERY_SLOW: 600,
};

// Courbes d'animation
export const EASING = {
  EASE_OUT: Easing.out(Easing.ease),
  EASE_IN: Easing.in(Easing.ease),
  EASE_IN_OUT: Easing.inOut(Easing.ease),
  SPRING: Easing.elastic(1),
  BOUNCE: Easing.bounce,
};

/**
 * Animation de fade (opacité)
 */
export const fadeIn = (animValue, duration = ANIMATION_DURATION.NORMAL, callback) => {
  return Animated.timing(animValue, {
    toValue: 1,
    duration,
    easing: EASING.EASE_OUT,
    useNativeDriver: true,
  }).start(callback);
};

export const fadeOut = (animValue, duration = ANIMATION_DURATION.NORMAL, callback) => {
  return Animated.timing(animValue, {
    toValue: 0,
    duration,
    easing: EASING.EASE_IN,
    useNativeDriver: true,
  }).start(callback);
};

/**
 * Animation de scale (zoom)
 */
export const scaleIn = (animValue, duration = ANIMATION_DURATION.NORMAL, callback) => {
  return Animated.timing(animValue, {
    toValue: 1,
    duration,
    easing: EASING.EASE_OUT,
    useNativeDriver: true,
  }).start(callback);
};

export const scaleOut = (animValue, duration = ANIMATION_DURATION.NORMAL, callback) => {
  return Animated.timing(animValue, {
    toValue: 0,
    duration,
    easing: EASING.EASE_IN,
    useNativeDriver: true,
  }).start(callback);
};

/**
 * Animation de slide (translation)
 */
export const slideInUp = (animValue, distance = 50, duration = ANIMATION_DURATION.NORMAL, callback) => {
  return Animated.timing(animValue, {
    toValue: 0,
    duration,
    easing: EASING.EASE_OUT,
    useNativeDriver: true,
  }).start(callback);
};

export const slideOutDown = (animValue, distance = 50, duration = ANIMATION_DURATION.NORMAL, callback) => {
  return Animated.timing(animValue, {
    toValue: distance,
    duration,
    easing: EASING.EASE_IN,
    useNativeDriver: true,
  }).start(callback);
};

/**
 * Animation combinée fade + scale pour modales
 */
export const fadeScaleIn = (fadeAnim, scaleAnim, duration = ANIMATION_DURATION.NORMAL, callback) => {
  return Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      easing: EASING.EASE_OUT,
      useNativeDriver: true,
    }),
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }),
  ]).start(callback);
};

export const fadeScaleOut = (fadeAnim, scaleAnim, duration = ANIMATION_DURATION.NORMAL, callback) => {
  return Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration,
      easing: EASING.EASE_IN,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration,
      easing: EASING.EASE_IN,
      useNativeDriver: true,
    }),
  ]).start(callback);
};

/**
 * Animation de press pour les cartes/boutons
 */
export const pressIn = (animValue, callback) => {
  return Animated.spring(animValue, {
    toValue: 0.95,
    tension: 300,
    friction: 10,
    useNativeDriver: true,
  }).start(callback);
};

export const pressOut = (animValue, callback) => {
  return Animated.spring(animValue, {
    toValue: 1,
    tension: 300,
    friction: 10,
    useNativeDriver: true,
  }).start(callback);
};

/**
 * Animation de pulse (pour les notifications)
 */
export const pulse = (animValue, callback) => {
  return Animated.sequence([
    Animated.timing(animValue, {
      toValue: 1.1,
      duration: ANIMATION_DURATION.FAST,
      easing: EASING.EASE_OUT,
      useNativeDriver: true,
    }),
    Animated.timing(animValue, {
      toValue: 1,
      duration: ANIMATION_DURATION.FAST,
      easing: EASING.EASE_IN,
      useNativeDriver: true,
    }),
  ]).start(callback);
};

/**
 * Animation de shake (pour les erreurs)
 */
export const shake = (animValue, callback) => {
  const shakeValues = [0, -10, 10, -10, 10, -5, 5, 0];
  const animations = shakeValues.map((value, index) => {
    return Animated.timing(animValue, {
      toValue: value,
      duration: 50,
      delay: index * 50,
      useNativeDriver: true,
    });
  });
  
  return Animated.sequence(animations).start(callback);
};

/**
 * Animation de skeleton loading (shimmer)
 */
export const shimmer = (animValue, callback) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 0,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ])
  ).start(callback);
};

/**
 * Hook React pour animation de modale
 */
export const useModalAnimation = (visible) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const overlayFade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      fadeScaleIn(fadeAnim, scaleAnim, ANIMATION_DURATION.NORMAL);
      fadeIn(overlayFade, ANIMATION_DURATION.NORMAL);
    } else {
      fadeScaleOut(fadeAnim, scaleAnim, ANIMATION_DURATION.FAST);
      fadeOut(overlayFade, ANIMATION_DURATION.FAST);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return { fadeAnim, scaleAnim, overlayFade };
};

/**
 * Hook React pour animation de press
 */
export const usePressAnimation = () => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    pressIn(scaleAnim);
  };

  const handlePressOut = () => {
    pressOut(scaleAnim);
  };

  return { scaleAnim, handlePressIn, handlePressOut };
};

export default {
  fadeIn,
  fadeOut,
  scaleIn,
  scaleOut,
  slideInUp,
  slideOutDown,
  fadeScaleIn,
  fadeScaleOut,
  pressIn,
  pressOut,
  pulse,
  shake,
  shimmer,
  ANIMATION_DURATION,
  EASING,
};

