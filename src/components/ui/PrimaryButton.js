import React from 'react';
import { Button, useTheme } from 'react-native-paper';

export default function PrimaryButton({ children, style, ...props }) {
  const theme = useTheme();
  return (
    <Button mode="contained" style={style} buttonColor={theme.colors.primary} textColor="#FFFFFF" uppercase {...props}>
      {children}
    </Button>
  );
}


