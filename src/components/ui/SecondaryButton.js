import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppText from './AppText';
import designSystem from '../../theme/designSystem';
import { buttonPressFeedback } from '../../utils/haptics';

const { colors, spacing, borderRadius, layout } = designSystem;

export default function SecondaryButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'medium',
  style,
  ...props
}) {
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
      borderColor: colors.primary[500],
      textColor: 'info',
      iconColor: colors.primary[500],
    },
    secondary: {
      borderColor: colors.secondary[500],
      textColor: 'success',
      iconColor: colors.secondary[500],
    },
    danger: {
      borderColor: colors.health.danger.main,
      textColor: 'danger',
      iconColor: colors.health.danger.main,
    },
    neutral: {
      borderColor: colors.border.dark,
      textColor: 'secondary',
      iconColor: colors.text.secondary,
    },
    tertiary: {
      borderColor: colors.neutral[400],
      textColor: 'secondary',
      iconColor: colors.neutral[500],
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

  const buttonStyle = [
    styles.button,
    {
      height: sizeStyle.height,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      borderColor: config.borderColor,
    },
    disabled && styles.disabled,
    style,
  ];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={config.iconColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={sizeStyle.iconSize}
              color={config.iconColor}
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
              color={config.iconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </>
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={buttonStyle}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
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
    opacity: 0.4,
  },
});
