import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, Button, Card, Divider, SegmentedButtons } from 'react-native-paper';
import storage from '../utils/storage';
import calculateLichtigerScore from '../utils/scoreCalculator';
import { getSurveyDayKey } from '../utils/dayKey';
import AppText from '../components/ui/AppText';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import { useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

export default function ExportScreen() {
  const [scores, setScores] = useState([]);
  const [stools, setStools] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('complet'); // complet, 90, 30, 7
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  // Recharger les données à chaque fois qu'on navigue vers cet écran
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // Recharger les données périodiquement pour capturer les changements
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 2000); // Recharger toutes les 2 secondes

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    // Charger les scores
    const histJson = storage.getString('scoresHistory');
    const history = histJson ? JSON.parse(histJson) : [];
    setScores(history);
    console.log('📦 Export - Scores loaded:', history.length, 'scores');

    // Charger les selles
    const stoolsJson = storage.getString('dailySells');
    const stoolsData = stoolsJson ? JSON.parse(stoolsJson) : [];
    setStools(stoolsData);
    console.log('📦 Export - Stools loaded:', stoolsData.length, 'stools');

    // Charger les bilans
    const surveysJson = storage.getString('dailySurvey');
    const surveysData = surveysJson ? JSON.parse(surveysJson) : {};
    setSurveys(surveysData);
    console.log('📦 Export - Surveys loaded:', Object.keys(surveysData));
    console.log('📦 Export - Survey details:', surveysData);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBristolDescription = (score) => {
    const descriptions = {
      1: 'Type 1 — Noix dures séparées (constipation sévère)',
      2: 'Type 2 — Saucisse grumeleuse (constipation)',
      3: 'Type 3 — Saucisse fissurée (normal)',
      4: 'Type 4 — Saucisse lisse et molle (normal)',
      5: 'Type 5 — Morceaux mous (tendance diarrhéique)',
      6: 'Type 6 — Morceaux floconneux (diarrhée)',
      7: 'Type 7 — Aqueux, sans morceaux (diarrhée sévère)'
    };
    return descriptions[score] || `Type ${score}`;
  };

  const getFilteredData = () => {
    let filteredScores = [...scores];
    let filteredStools = [...stools];
    let filteredSurveys = { ...surveys };
    
    if (selectedPeriod !== 'complet' && scores.length > 0) {
      const days = parseInt(selectedPeriod);
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      
      // Filtrer les scores
      filteredScores = scores.filter(score => {
        const scoreDate = new Date(score.date);
        return scoreDate >= startDate && scoreDate <= endDate;
      });

      // Filtrer les selles pour la période (pas seulement les jours avec scores)
      filteredStools = stools.filter(stool => {
        const stoolDate = new Date(stool.timestamp);
        return stoolDate >= startDate && stoolDate <= endDate;
      });

      // Filtrer les surveys pour la période
      filteredSurveys = {};
      Object.keys(surveys).forEach(key => {
        const surveyDate = new Date(key);
        if (surveyDate >= startDate && surveyDate <= endDate) {
          filteredSurveys[key] = surveys[key];
        }
      });
    }

    return { scores: filteredScores, stools: filteredStools, surveys: filteredSurveys };
  };

  const generateHTML = () => {
    const { scores: filteredScores, stools: filteredStools, surveys: filteredSurveys } = getFilteredData();
    
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const reportPeriod = filteredScores.length > 0 ? 
      `Du ${formatDate(filteredScores[filteredScores.length - 1].date)} au ${formatDate(filteredScores[0].date)}` : 
      "Aucune donnée";

    // Calculer les statistiques pour la période sélectionnée
    const validScores = filteredScores.map(s => s.score).filter(s => s !== null);
    const averageScore = validScores.length > 0 ? 
      (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) : 'N/A';
    
    // Calculer les jours avec saignements
    const daysWithBlood = filteredScores.filter(score => {
      const dayStools = filteredStools.filter(stool => 
        new Date(stool.timestamp).toDateString() === new Date(score.date).toDateString()
      );
      return dayStools.some(stool => stool.hasBlood);
    }).length;
    const bleedingPercentage = filteredScores.length > 0 ? 
      ((daysWithBlood / filteredScores.length) * 100).toFixed(0) : 0;

    // Calculer le nombre moyen de selles par jour
    const totalStools = filteredStools.length;
    // Compter les jours uniques avec des selles
    const uniqueDaysWithStools = new Set(
      filteredStools.map(stool => new Date(stool.timestamp).toDateString())
    ).size;
    const averageStoolsPerDay = uniqueDaysWithStools > 0 ? 
      (totalStools / uniqueDaysWithStools).toFixed(1) : 'N/A';

    // Trouver le score maximum avec sa date
    const maxScoreData = validScores.length > 0 ? 
      filteredScores.find(s => s.score === Math.max(...validScores)) : null;
    const maxScoreText = maxScoreData ? 
      `${maxScoreData.score} (${formatDate(maxScoreData.date)})` : 'N/A';

    // Couleur du score moyen
    const getScoreColor = (score) => {
      if (score === 'N/A') return '#6B7280';
      const numScore = parseFloat(score);
      if (numScore < 5) return '#4CAF50'; // Vert
      if (numScore <= 10) return '#FF9800'; // Orange
      return '#F44336'; // Rouge
    };

    // Générer le tableau détaillé
    const detailedTable = filteredScores.map(score => {
      const dayStools = filteredStools.filter(stool => 
        new Date(stool.timestamp).toDateString() === new Date(score.date).toDateString()
      );
      
      const dayStoolsCount = dayStools.length;
      const nightStoolsCount = dayStools.filter(stool => {
        const hour = new Date(stool.timestamp).getHours();
        return hour >= 23 || hour < 6;
      }).length;
      
      const hasBlood = dayStools.some(stool => stool.hasBlood);
      const bloodPercentage = dayStoolsCount > 0 ? 
        ((dayStools.filter(stool => stool.hasBlood).length / dayStoolsCount) * 100).toFixed(0) : 0;
      
      const bloodText = hasBlood ? `Oui (${bloodPercentage}%)` : 'Non';
      
      // Récupérer les données du bilan quotidien
      // Important : pour l'export PDF, on cherche le survey avec la date exacte du score
      // sans appliquer la logique de reset à 7h (car le score est déjà au bon jour)
      const surveyKey = score.date; // Utiliser directement la date du score
      const survey = filteredSurveys[surveyKey];
      
      // Debug
      console.log('📊 Export PDF - Score object:', score);
      console.log('📊 Export PDF - Date from score:', score.date);
      console.log('📊 Export PDF - SurveyKey calculated:', surveyKey);
      console.log('📊 Export PDF - Survey found:', survey);
      console.log('📊 Export PDF - Available surveys:', Object.keys(filteredSurveys));
      console.log('📊 Export PDF - Checking if exists:', filteredSurveys[surveyKey]);
      
      // Traduire les valeurs
      const painMap = {
        'aucune': 'Aucune',
        'legeres': 'Légères',
        'moyennes': 'Moyennes',
        'intenses': 'Intenses'
      };
      const generalMap = {
        'parfait': 'Parfait',
        'tres_bon': 'Très bon',
        'bon': 'Bon',
        'moyen': 'Moyen',
        'mauvais': 'Mauvais',
        'tres_mauvais': 'Très mauvais'
      };
      
      const painLevel = survey?.abdominalPain ? (painMap[survey.abdominalPain] || survey.abdominalPain) : '—';
      const generalState = survey?.generalState ? (generalMap[survey.generalState] || survey.generalState) : '—';
      
      return `
        <tr>
          <td>${formatDate(score.date)}</td>
          <td style="text-align: center; font-weight: bold;">${score.score}</td>
          <td style="text-align: center;">${dayStoolsCount} / ${nightStoolsCount}</td>
          <td style="text-align: center;">${bloodText}</td>
          <td style="text-align: center;">${painLevel}</td>
          <td style="text-align: center;">${generalState}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport de Suivi RCH</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.4;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #005A9C;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #005A9C;
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header .period {
            font-size: 16px;
            color: #666;
            margin: 5px 0;
          }
          .header .generated {
            font-size: 14px;
            color: #888;
            margin: 5px 0;
          }
          .summary-section {
            background: #f8f9fa;
            border: 2px solid #005A9C;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .summary-title {
            color: #005A9C;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          .summary-card {
            background: white;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            border-left: 4px solid #005A9C;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            margin: 8px 0;
          }
          .summary-label {
            color: #666;
            font-size: 14px;
            font-weight: 500;
          }
          .details-section {
            margin-bottom: 30px;
          }
          .details-title {
            color: #005A9C;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #005A9C;
            padding-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            font-size: 14px;
          }
          th {
            background-color: #005A9C;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 13px;
          }
          td {
            padding: 10px 8px;
            border: 1px solid #ddd;
            font-size: 13px;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          tr:nth-child(odd) {
            background-color: white;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #005A9C;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .no-data {
            text-align: center;
            color: #999;
            font-style: italic;
            padding: 40px;
            background: #f8f9fa;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport de Suivi - Rectocolite Hémorragique</h1>
          <div class="period">${reportPeriod}</div>
          <div class="generated">Généré le ${currentDate}</div>
        </div>

        <div class="summary-section">
          <div class="summary-title">📊 Résumé de la Période</div>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-value" style="color: ${getScoreColor(averageScore)};">${averageScore}</div>
              <div class="summary-label">Score de Lichtiger Moyen</div>
            </div>
            <div class="summary-card">
              <div class="summary-value" style="color: #F44336;">${daysWithBlood} jours (${bleedingPercentage}%)</div>
              <div class="summary-label">Jours avec Saignements</div>
            </div>
            <div class="summary-card">
              <div class="summary-value" style="color: #005A9C;">${averageStoolsPerDay}</div>
              <div class="summary-label">Nombre de Selles Moyen</div>
            </div>
            <div class="summary-card">
              <div class="summary-value" style="color: #F44336;">${maxScoreText}</div>
              <div class="summary-label">Score Max Atteint</div>
            </div>
          </div>
        </div>

        <div class="details-section">
          <div class="details-title">📈 Historique Détaillé des Scores</div>
          ${filteredScores.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score Lichtiger</th>
                  <th>Selles (jour/nuit)</th>
                  <th>Saignement</th>
                  <th>Douleurs</th>
                  <th>État Général</th>
                </tr>
              </thead>
              <tbody>
                ${detailedTable}
              </tbody>
            </table>
          ` : '<div class="no-data">Aucune donnée disponible pour cette période</div>'}
        </div>

        <div class="footer">
          <p>Rapport généré avec l'application de suivi RCH</p>
        </div>
      </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const html = generateHTML();
      
      if (Platform.OS === 'web') {
        // Version web : ouvrir dans un nouvel onglet pour impression
        const newWindow = window.open('', '_blank');
        newWindow.document.write(html);
        newWindow.document.close();
        newWindow.print();
        
        Alert.alert(
          'Succès',
          'Le rapport s\'ouvre dans un nouvel onglet. Utilisez Ctrl+P pour l\'imprimer en PDF.',
          [{ text: 'OK' }]
        );
      } else {
        // Version native : utiliser les bibliothèques natives
        Alert.alert(
          'Fonctionnalité native',
          'La génération PDF native sera disponible dans la version mobile.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      Alert.alert(
        'Erreur',
        'Impossible de générer le rapport. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppText variant="title" style={styles.title}>Export pour Médecin</AppText>
      
      <AppCard style={styles.infoCard}>
        <AppText variant="body" style={styles.infoTitle}>📋 Rapport Médical</AppText>
        <AppText variant="body" style={styles.infoText}>
          Générez un rapport PDF complet avec vos données de suivi pour partager avec votre médecin.
        </AppText>
      </AppCard>

      <AppCard style={styles.periodCard}>
        <AppText variant="body" style={styles.periodLabel}>Période du rapport</AppText>
        <SegmentedButtons
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
          buttons={[
            { value: 'complet', label: 'Complet' },
            { value: '90', label: '90 jours' },
            { value: '30', label: '30 jours' },
            { value: '7', label: '7 jours' }
          ]}
          style={styles.segmentedButtons}
        />
      </AppCard>

      <AppCard style={styles.statsCard}>
        <AppText variant="body" style={styles.statsTitle}>📊 Données Disponibles</AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <AppText variant="headline">{getFilteredData().scores.length}</AppText>
            <AppText variant="caption">Scores calculés</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="headline">{getFilteredData().stools.length}</AppText>
            <AppText variant="caption">Selles enregistrées</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="headline">{Object.keys(getFilteredData().surveys).length}</AppText>
            <AppText variant="caption">Bilans quotidiens</AppText>
          </View>
        </View>
      </AppCard>

      <AppCard style={styles.contentCard}>
        <AppText variant="body" style={styles.contentTitle}>📄 Contenu du Rapport</AppText>
        <View style={styles.contentList}>
          <AppText variant="body">• Résumé de la période (score moyen, saignements, selles)</AppText>
          <AppText variant="body">• Historique détaillé avec scores, selles jour/nuit, saignements</AppText>
          <AppText variant="body">• Données des bilans quotidiens (douleurs, état général)</AppText>
          <AppText variant="body">• Codes couleur pour interprétation rapide</AppText>
          <AppText variant="body">• Format médical professionnel</AppText>
        </View>
      </AppCard>

      <PrimaryButton
        mode="contained"
        onPress={generatePDF}
        loading={isGenerating}
        disabled={isGenerating || getFilteredData().scores.length === 0}
        style={styles.generateButton}
        icon="file-pdf-box"
      >
        {isGenerating ? 'Génération...' : 'Générer le Rapport PDF'}
      </PrimaryButton>

      {getFilteredData().scores.length === 0 && (
        <AppCard style={styles.warningCard}>
          <AppText variant="body" style={styles.warningText}>
            ⚠️ Aucune donnée disponible pour générer un rapport. 
            Enregistrez quelques selles et bilans quotidiens pour pouvoir exporter vos données.
          </AppText>
        </AppCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    marginBottom: 16,
    textAlign: 'center'
  },
  infoCard: {
    marginBottom: 16
  },
  periodCard: {
    marginBottom: 16
  },
  periodLabel: {
    marginBottom: 8
  },
  segmentedButtons: {
    marginTop: 8
  },
  infoTitle: {
    marginBottom: 8,
    fontWeight: 'bold'
  },
  infoText: {
    lineHeight: 20
  },
  statsCard: {
    marginBottom: 16
  },
  statsTitle: {
    marginBottom: 16,
    fontWeight: 'bold'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  contentCard: {
    marginBottom: 16
  },
  contentTitle: {
    marginBottom: 12,
    fontWeight: 'bold'
  },
  contentList: {
    paddingLeft: 8
  },
  generateButton: {
    marginBottom: 16
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7'
  },
  warningText: {
    color: '#856404',
    lineHeight: 20
  }
});
