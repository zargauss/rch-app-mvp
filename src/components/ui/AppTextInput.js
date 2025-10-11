import React from 'react';
import { TextInput, useTheme } from 'react-native-paper';

export default function AppTextInput(props) {
  const theme = useTheme();
  return (
    <TextInput
      mode="outlined"
      outlineColor={theme.colors.outline}
      activeOutlineColor={theme.colors.primary}
      {...props}
    />
  );
}


