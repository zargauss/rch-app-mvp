import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from './AppText';
import designSystem from '../../theme/designSystem';

/**
 * FAB Speed Dial avec animation en éventail
 * Affiche 3 actions secondaires autour du bouton principal
 */
const SpeedDialFAB = ({ onStoolPress, onSymptomPress, onNotePress }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Animations pour chaque bulle
  const animation1 = useRef(new Animated.Value(0)).current;
  const animation2 = useRef(new Animated.Value(0)).current;
  const animation3 = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      // Ouvrir en éventail avec animation séquentielle
      Animated.parallel([
        Animated.spring(animation1, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(animation2, {
          toValue: 1,
          friction: 6,
          tension: 40,
          delay: 50,
          useNativeDriver: true,
        }),
        Animated.spring(animation3, {
          toValue: 1,
          friction: 6,
          tension: 40,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.spring(rotation, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fermer
      Animated.parallel([
        Animated.spring(animation1, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(animation2, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(animation3, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(rotation, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    setTimeout(() => {
      action();
    }, 200);
  };

  // Rotation du +
  const rotationInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Position et opacité pour chaque bulle (disposition en éventail)
  const getAnimatedStyle = (animation, angle) => {
    const distance = 80; // Distance du centre

    return {
      opacity: animation,
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -distance * Math.sin(angle * Math.PI / 180)],
          }),
        },
        {
          translateX: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -distance * Math.cos(angle * Math.PI / 180)],
          }),
        },
        {
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      ],
    };
  };

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      {isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleOpen}
          style={StyleSheet.absoluteFill}
        >
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />
        </TouchableOpacity>
      )}

      {/* Actions secondaires */}
      <View style={styles.actionsContainer}>
        {/* Note - En haut à gauche (135°) */}
        <Animated.View style={[styles.secondaryAction, getAnimatedStyle(animation1, 135)]}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => handleAction(onNotePress)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="note-text-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <AppText variant="labelSmall" style={styles.label}>
            Note
          </AppText>
        </Animated.View>

        {/* Symptôme - En haut (90°) */}
        <Animated.View style={[styles.secondaryAction, getAnimatedStyle(animation2, 90)]}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: '#DC2626' }]}
            onPress={() => handleAction(onSymptomPress)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <AppText variant="labelSmall" style={styles.label}>
            Symptôme
          </AppText>
        </Animated.View>

        {/* Selle - En haut à droite (45°) */}
        <Animated.View style={[styles.secondaryAction, getAnimatedStyle(animation3, 45)]}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: '#4C4DDC' }]}
            onPress={() => handleAction(onStoolPress)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="toilet" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <AppText variant="labelSmall" style={styles.label}>
            Selle
          </AppText>
        </Animated.View>
      </View>

      {/* Bouton principal */}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={toggleOpen}
        activeOpacity={0.9}
      >
        <Animated.View
          style={{
            transform: [{ rotate: rotationInterpolate }],
          }}
        >
          <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 80,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  actionsContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    position: 'absolute',
    alignItems: 'center',
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.shadows.lg,
    marginBottom: 4,
  },
  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: designSystem.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.shadows.xl,
    elevation: 8,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default SpeedDialFAB;
