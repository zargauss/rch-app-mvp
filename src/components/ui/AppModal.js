import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppCard from './AppCard';
import AppText from './AppText';
import designSystem from '../../theme/designSystem';

const { colors, spacing, borderRadius } = designSystem;
const { width, height } = Dimensions.get('window');

export default function AppModal({
  visible,
  onClose,
  title,
  children,
  maxWidth = 500,
  scrollable = true,
  showCloseButton = true,
}) {
  if (!visible) return null;

  const modalContent = (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="headlineLarge" weight="bold" style={styles.title}>
          {title}
        </AppText>
        {showCloseButton && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {scrollable ? (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.staticContent}>{children}</View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={[styles.container, { maxWidth }]}>
          <AppCard style={styles.card}>
            {modalContent}
          </AppCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: '90%',
    maxHeight: height * 0.9,
    zIndex: 1,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  content: {
    maxHeight: height * 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    flex: 1,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
  },
  scrollContent: {
    padding: spacing[5],
  },
  staticContent: {
    padding: spacing[5],
  },
});

