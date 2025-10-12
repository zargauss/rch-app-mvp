import React from 'react';
import { Card } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function AppCard({ children, style, contentStyle, ...props }) {
  const theme = useTheme();
  return (
    <Card elevation={1} style={[styles.card, style]} {...props}>
      <Card.Content style={[{ paddingVertical: theme.spacing(1) }, contentStyle]}>
        {children}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8
  }
});


