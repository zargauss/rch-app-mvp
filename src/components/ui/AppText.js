import React from 'react';
import { Text as PaperText, useTheme } from 'react-native-paper';

export default function AppText({ variant = 'body', style, children, ...props }) {
  const theme = useTheme();
  const stylesByVariant = {
    title: theme.fonts.titleMedium,
    headline: theme.fonts.titleLarge,
    body: theme.fonts.bodyMedium,
    caption: theme.fonts.bodySmall
  };
  const textStyle = [stylesByVariant[variant] || stylesByVariant.body, { color: theme.colors.onSurface }, style];
  return (
    <PaperText style={textStyle} {...props}>
      {children}
    </PaperText>
  );
}


