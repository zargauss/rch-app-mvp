import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppCard from '../ui/AppCard';
import AppText from '../ui/AppText';
import HealthIcon from '../ui/HealthIcon';
import SkeletonCard from '../ui/SkeletonCard';
import SecondaryButton from '../ui/SecondaryButton';
import designSystem from '../../theme/designSystem';

/**
 * Section RSS - Affiche les actualités de l'AFA
 */
const RSSSection = ({ rssArticles, rssLoading, onArticlePress }) => {
  return (
    <AppCard style={styles.newsCard}>
      <View style={styles.newsHeader}>
        <HealthIcon name="report" size={28} color={designSystem.colors.primary[500]} />
        <AppText variant="h3" style={styles.newsTitle}>
          Actualités AFA
        </AppText>
      </View>
      <AppText variant="bodyMedium" style={styles.newsDescription}>
        Découvrez les dernières actualités de l'Association François Aupetit (AFA)
      </AppText>

      {rssLoading ? (
        <SkeletonCard count={3} />
      ) : rssArticles.length > 0 ? (
        <View style={styles.newsItems}>
          {rssArticles.map((article, index) => (
            <View key={index} style={styles.newsItem}>
              <View style={styles.newsItemHeader}>
                <AppText variant="label" style={styles.newsDate}>
                  {article.formattedDate}
                </AppText>
                <View style={styles.newsBadge}>
                  <AppText variant="caption" style={styles.newsBadgeText}>
                    {index === 0 ? 'Nouveau' : 'Actualité'}
                  </AppText>
                </View>
              </View>
              <AppText variant="body" style={styles.newsItemTitle}>
                {article.title}
              </AppText>
              <AppText variant="bodySmall" style={styles.newsItemExcerpt}>
                {article.description}
              </AppText>
              <TouchableOpacity
                onPress={() => onArticlePress(article.link)}
                style={styles.newsButton}
              >
                <SecondaryButton
                  onPress={() => onArticlePress(article.link)}
                  style={styles.newsButtonInner}
                  size="small"
                >
                  Lire l'article
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#4C4DDC" style={{ marginLeft: 4 }} />
                </SecondaryButton>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <AppText variant="body" style={styles.noNews}>
          Aucune actualité disponible pour le moment
        </AppText>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    marginHorizontal: designSystem.spacing[4],
    marginBottom: designSystem.spacing[4],
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
    marginBottom: designSystem.spacing[2],
  },
  newsTitle: {
    color: designSystem.colors.text.primary,
  },
  newsDescription: {
    color: designSystem.colors.text.secondary,
    marginBottom: designSystem.spacing[4],
  },
  newsItems: {
    gap: designSystem.spacing[3],
  },
  newsItem: {
    padding: designSystem.spacing[3],
    borderRadius: designSystem.borderRadius.md,
    backgroundColor: designSystem.colors.background.secondary,
    borderLeftWidth: 3,
    borderLeftColor: designSystem.colors.primary[500],
  },
  newsItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing[2],
  },
  newsDate: {
    color: designSystem.colors.text.tertiary,
  },
  newsBadge: {
    paddingHorizontal: designSystem.spacing[2],
    paddingVertical: 4,
    borderRadius: designSystem.borderRadius.sm,
    backgroundColor: designSystem.colors.primary[100],
  },
  newsBadgeText: {
    color: designSystem.colors.primary[700],
    fontWeight: '600',
  },
  newsItemTitle: {
    color: designSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: designSystem.spacing[2],
  },
  newsItemExcerpt: {
    color: designSystem.colors.text.secondary,
    marginBottom: designSystem.spacing[3],
  },
  newsButton: {
    alignSelf: 'flex-start',
  },
  newsButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noNews: {
    color: designSystem.colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: designSystem.spacing[4],
  },
});

export default RSSSection;
