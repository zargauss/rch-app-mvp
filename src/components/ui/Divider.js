import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import designSystem from '../../theme/designSystem';

const { colors, spacing } = designSystem;

export default function Divider({ 
  text,
  style,
  marginVertical = spacing[4],
}) {
  if (text) {
    return (
      <View style={[styles.container, { marginVertical }, style]}>
        <View style={styles.line} />
        <AppText variant="label" color="tertiary" style={styles.text}>
          {text}
        </AppText>
        <View style={styles.line} />
      </View>
    );
  }

  return (
    <View 
      style={[
        styles.simpleLine, 
        { marginVertical },
        style,
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.medium,
  },
  text: {
    marginHorizontal: spacing[3],
    letterSpacing: 0.5,
  },
  simpleLine: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing[4],
  },
});

