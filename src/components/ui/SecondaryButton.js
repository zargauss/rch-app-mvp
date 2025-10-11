import React from 'react';
import { Button, useTheme } from 'react-native-paper';

export default function SecondaryButton({ children, style, ...props }) {
  const theme = useTheme();
  return (
    <Button mode="outlined" style={style} textColor={theme.colors.primary} uppercase {...props}>
      {children}
    </Button>
  );
}


