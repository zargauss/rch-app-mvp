import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from './AppText';
import designSystem from '../../theme/designSystem';
import { usePressAnimation } from '../../utils/animations';
import { buttonPressFeedback } from '../../utils/haptics';

const { colors, spacing, borderRadius, shadows, gradients, layout } = designSystem;

export default function PrimaryButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'medium',
  outlined = false,
  style,
  ...props
}) {
  const { scaleAnim, handlePressIn, handlePressOut } = usePressAnimation();

  const handlePress = (e) => {
    if (!disabled && !loading) {
      buttonPressFeedback();
    }
    if (onPress) {
      onPress(e);
    }
  };

  const variantConfig = {
    primary: {
      gradient: gradients.primary,
      textColor: outlined ? 'info' : 'inverse',
      borderColor: colors.primary[500],
      iconColor: colors.primary[500],
    },
    secondary: {
      gradient: gradients.secondary,
      textColor: outlined ? 'success' : 'inverse',
      borderColor: colors.secondary[500],
      iconColor: colors.secondary[500],
    },
    success: {
      gradient: gradients.excellent,
      textColor: outlined ? 'success' : 'inverse',
      borderColor: colors.health.excellent.main,
      iconColor: colors.health.excellent.main,
    },
    warning: {
      gradient: gradients.warning,
      textColor: outlined ? 'warning' : 'inverse',
      borderColor: colors.health.moderate.main,
      iconColor: colors.health.moderate.main,
    },
    danger: {
      gradient: gradients.danger,
      textColor: outlined ? 'danger' : 'inverse',
      borderColor: colors.health.danger.main,
      iconColor: colors.health.danger.main,
    },
    info: {
      gradient: gradients.info,
      textColor: outlined ? 'info' : 'inverse',
      borderColor: colors.primary[500],
      iconColor: colors.primary[500],
    },
    neutral: {
      gradient: [colors.neutral[300], colors.neutral[400]],
      textColor: outlined ? 'secondary' : 'inverse',
      borderColor: colors.border.dark,
      iconColor: colors.text.secondary,
    },
  };

  const sizeConfig = {
    small: {
      height: 40,
      paddingHorizontal: spacing[4],
      fontSize: 'bodySmall',
      iconSize: 18,
    },
    medium: {
      height: layout.buttonHeight,
      paddingHorizontal: spacing[5],
      fontSize: 'body',
      iconSize: 20,
    },
    large: {
      height: 56,
      paddingHorizontal: spacing[6],
      fontSize: 'bodyLarge',
      iconSize: 24,
    },
  };

  const config = variantConfig[variant];
  const sizeStyle = sizeConfig[size];

  // Styles internes pour le gradient/contenu
  const innerButtonStyle = [
    styles.button,
    {
      height: sizeStyle.height,
      paddingHorizontal: sizeStyle.paddingHorizontal,
    },
    outlined && {
      backgroundColor: colors.background.tertiary,
      borderWidth: 1.5,
      borderColor: config.borderColor,
    },
    disabled && styles.disabled,
  ];

  // Style du container (pour flex, width, etc.)
  const containerStyle = style;

  const iconColor = outlined ? config.iconColor : colors.text.inverse;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={sizeStyle.iconSize}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <AppText
            variant={sizeStyle.fontSize}
            color={config.textColor}
            weight="semiBold"
            numberOfLines={1}
          >
            {children}
          </AppText>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={sizeStyle.iconSize}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </>
  );

  if (outlined) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={1}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        style={containerStyle}
        {...props}
      >
        <Animated.View style={{ transform: disabled ? [] : [{ scale: scaleAnim }], flex: 1 }}>
          <View style={innerButtonStyle}>
            {content}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={1}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      style={containerStyle}
      {...props}
    >
      <Animated.View style={{ transform: disabled ? [] : [{ scale: scaleAnim }], flex: 1 }}>
        <LinearGradient
          colors={disabled ? [colors.neutral[300], colors.neutral[400]] : config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={innerButtonStyle}
        >
          {content}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md, // Augmenté de base (12px) à md (16px)
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
  disabled: {
    opacity: 0.6,
  },
});
