import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, Button, Card, Divider, SegmentedButtons } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import storage from '../utils/storage';
import calculateLichtigerScore from '../utils/scoreCalculator';
import { getSurveyDayKey } from '../utils/dayKey';
import AppText from '../components/ui/AppText';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import EmptyState from '../components/ui/EmptyState';
import { useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import designSystem from '../theme/designSystem';

export default function ExportScreen() {
  const [scores, setScores] = useState([]);
  const [stools, setStools] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [ibdiskHistory, setIbdiskHistory] = useState([]);
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

    // Charger les traitements
    const treatmentsJson = storage.getString('treatments');
    const treatmentsData = treatmentsJson ? JSON.parse(treatmentsJson) : [];
    setTreatments(treatmentsData);
    console.log('📦 Export - Treatments loaded:', treatmentsData.length, 'treatments');

    // Charger les questionnaires IBDisk
    const ibdiskJson = storage.getString('ibdiskHistory');
    const ibdiskData = ibdiskJson ? JSON.parse(ibdiskJson) : [];
    setIbdiskHistory(ibdiskData);
    console.log('📦 Export - IBDisk loaded:', ibdiskData.length, 'questionnaires');
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
    let filteredTreatments = [...treatments];
    let filteredIbdisk = [...ibdiskHistory];
    
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

      // Filtrer les traitements pour la période
      filteredTreatments = treatments.filter(treatment => {
        const treatmentDate = new Date(treatment.timestamp);
        return treatmentDate >= startDate && treatmentDate <= endDate;
      });
    }

    return { scores: filteredScores, stools: filteredStools, surveys: filteredSurveys, treatments: filteredTreatments, ibdisk: filteredIbdisk };
  };

  const generateHTML = () => {
    const { scores: filteredScores, stools: filteredStools, surveys: filteredSurveys, treatments: filteredTreatments, ibdisk: filteredIbdisk } = getFilteredData();
    
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

    // Créer une liste de tous les jours avec des données (scores OU selles)
    const allDates = new Set();
    filteredScores.forEach(score => allDates.add(score.date));
    filteredStools.forEach(stool => {
      const date = new Date(stool.timestamp);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      allDates.add(dateStr);
    });
    
    // Trier les dates (plus récentes en premier)
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));
    
    // Générer le tableau détaillé
    const detailedTable = sortedDates.map(dateStr => {
      // Trouver le score pour ce jour
      const scoreEntry = filteredScores.find(s => s.date === dateStr);
      const score = scoreEntry ? scoreEntry.score : '—';
      
      const dayStools = filteredStools.filter(stool => 
        new Date(stool.timestamp).toDateString() === new Date(dateStr).toDateString()
      );
      
      // Compter les selles nocturnes (23h-6h)
      const nightStoolsCount = dayStools.filter(stool => {
        const hour = new Date(stool.timestamp).getHours();
        return hour >= 23 || hour < 6;
      }).length;
      
      // Compter les selles de jour (6h-23h)
      const dayOnlyStoolsCount = dayStools.filter(stool => {
        const hour = new Date(stool.timestamp).getHours();
        return hour >= 6 && hour < 23;
      }).length;
      
      const hasBlood = dayStools.some(stool => stool.hasBlood);
      const totalStoolsCount = dayStools.length; // Total pour le calcul du pourcentage de sang
      const bloodPercentage = totalStoolsCount > 0 ? 
        ((dayStools.filter(stool => stool.hasBlood).length / totalStoolsCount) * 100).toFixed(0) : 0;
      
      const bloodText = hasBlood ? `Oui (${bloodPercentage}%)` : 'Non';
      
      // Récupérer les données du bilan quotidien
      // Important : pour l'export PDF, on cherche le survey avec la date exacte
      // sans appliquer la logique de reset à 7h (car le score est déjà au bon jour)
      const surveyKey = dateStr; // Utiliser directement la date
      const survey = filteredSurveys[surveyKey];
      
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
      const incontinence = survey?.fecalIncontinence === 'oui' ? 'Oui' : (survey?.fecalIncontinence === 'non' ? 'Non' : '—');
      
      // Format de date DD/MM/YYYY
      const [year, month, day] = dateStr.split('-');
      const shortDate = `${day}/${month}/${year}`;
      
      return `
        <tr>
          <td>${shortDate}</td>
          <td style="text-align: center; font-weight: bold;">${score}</td>
          <td style="text-align: center;">${dayOnlyStoolsCount} / ${nightStoolsCount}</td>
          <td style="text-align: center;">${bloodText}</td>
          <td style="text-align: center;">${incontinence}</td>
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
            padding: 15px;
            color: #333;
            line-height: 1.3;
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
            font-size: 11px;
          }
          th {
            background-color: #005A9C;
            color: white;
            padding: 10px 6px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
          }
          td {
            padding: 8px 6px;
            border: 1px solid #ddd;
            font-size: 11px;
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
          <div class="summary-title">Résumé de la Période</div>
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
          <div class="details-title">Historique Détaillé des Scores</div>
          ${filteredScores.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Lichtiger</th>
                  <th>Selles (J/N)</th>
                  <th>Sang</th>
                  <th>Incontinence</th>
                  <th>Douleurs</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                ${detailedTable}
              </tbody>
            </table>
          ` : '<div class="no-data">Aucune donnée disponible pour cette période</div>'}
        </div>

        <div class="details-section">
          <div class="details-title">Historique des Traitements</div>
          ${filteredTreatments.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Date et heure</th>
                  <th>Nom du traitement</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTreatments.sort((a, b) => b.timestamp - a.timestamp).map(treatment => {
                  const date = new Date(treatment.timestamp);
                  const dateStr = date.toLocaleDateString('fr-FR');
                  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  return `
                    <tr>
                      <td>${dateStr} à ${timeStr}</td>
                      <td style="font-weight: 600;">${treatment.name}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : '<div class="no-data">Aucun traitement enregistré pour cette période</div>'}
        </div>

        <div style="page-break-after: always;"></div>

        <div class="details-section" style="page-break-inside: avoid;">
          <div class="details-title">Dernier IBDisk</div>
          ${filteredIbdisk.length > 0 ? `
            ${(() => {
              const latestIbdisk = filteredIbdisk.sort((a, b) => b.timestamp - a.timestamp)[0];
              const answers = latestIbdisk.answers;
              const date = new Date(latestIbdisk.timestamp);
              const dateStr = date.toLocaleDateString('fr-FR');
              
              // Calculer le score moyen
              const scores = Object.values(answers);
              const averageScore = scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : 0;
              
              // Définir les questions pour le graphique
              const questions = [
                { key: 'abdominal_pain', label: 'Douleur abdominale', shortLabel: 'Douleur' },
                { key: 'bowel_regulation', label: 'Régulation défécation', shortLabel: 'Régulation' },
                { key: 'social_life', label: 'Vie sociale', shortLabel: 'Social' },
                { key: 'professional_activities', label: 'Activités professionnelles', shortLabel: 'Activités' },
                { key: 'sleep', label: 'Sommeil', shortLabel: 'Sommeil' },
                { key: 'energy', label: 'Énergie', shortLabel: 'Énergie' },
                { key: 'stress_anxiety', label: 'Stress et anxiété', shortLabel: 'Stress' },
                { key: 'self_image', label: 'Image de soi', shortLabel: 'Image' },
                { key: 'intimate_life', label: 'Vie intime', shortLabel: 'Intime' },
                { key: 'joint_pain', label: 'Douleur articulaire', shortLabel: 'Articulaire' }
              ];
              
              // Générer le graphique SVG
              const chartSize = 320;
              const center = chartSize / 2;
              const radius = chartSize / 2 - 45;
              const maxValue = 10;
              
              // Calculer les points du graphique
              const getPoints = () => {
                return questions.map((question, index) => {
                  const value = answers[question.key] || 0;
                  const angle = (index * 2 * Math.PI) / questions.length - Math.PI / 2;
                  const distance = (value / maxValue) * radius;
                  const x = center + distance * Math.cos(angle);
                  const y = center + distance * Math.sin(angle);
                  const color = value <= 3 ? '#10B981' : value <= 6 ? '#F59E0B' : '#EF4444';
                  return { x, y, value, color, label: question.shortLabel };
                });
              };
              
              const points = getPoints();
              const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
              
              // Générer les axes
              const axes = questions.map((question, index) => {
                const angle = (index * 2 * Math.PI) / questions.length - Math.PI / 2;
                const x2 = center + radius * Math.cos(angle);
                const y2 = center + radius * Math.sin(angle);
                return { x1: center, y1: center, x2, y2, label: question.shortLabel, angle };
              });
              
              // Générer les cercles de grille
              const gridCircles = [0.2, 0.4, 0.6, 0.8, 1.0].map(factor => ({
                cx: center,
                cy: center,
                r: radius * factor
              }));
              
              return `
                <div style="page-break-inside: avoid;">
                  <div style="margin-bottom: 12px; text-align: center;">
                    <h3 style="margin: 0; color: #2D3748; font-size: 16px;">Questionnaire IBDisk du ${dateStr}</h3>
                    <p style="margin: 5px 0; color: #64748B; font-size: 13px;">Score moyen : <strong>${averageScore}/10</strong></p>
                  </div>
                  
                  <div style="text-align: center; margin: 15px 0;">
                    <svg width="${chartSize}" height="${chartSize}" style="border: 1px solid #E2E8F0; border-radius: 8px; background: white;">
                      <!-- Cercles de grille -->
                      ${gridCircles.map(circle => `
                        <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" 
                                fill="none" stroke="#E2E8F0" stroke-width="1"/>
                      `).join('')}
                      
                      <!-- Axes -->
                      ${axes.map(axis => `
                        <line x1="${axis.x1}" y1="${axis.y1}" x2="${axis.x2}" y2="${axis.y2}" 
                              stroke="#CBD5E1" stroke-width="1"/>
                        <text x="${axis.x2 + 15 * Math.cos(axis.angle)}" 
                              y="${axis.y2 + 15 * Math.sin(axis.angle)}" 
                              text-anchor="middle" dominant-baseline="middle" 
                              font-size="12" font-weight="600" fill="#64748B">
                          ${axis.label}
                        </text>
                      `).join('')}
                      
                      <!-- Polygone des données -->
                      <polygon points="${polygonPoints}" 
                               fill="rgba(100, 116, 139, 0.1)" 
                               stroke="#64748B" stroke-width="2"/>
                      
                      <!-- Points de données -->
                      ${points.map((point, index) => `
                        <circle cx="${point.x}" cy="${point.y}" r="6" 
                                fill="${point.color}" stroke="#FFFFFF" stroke-width="2"/>
                        <text x="${point.x}" y="${point.y - 15}" 
                              text-anchor="middle" font-size="10" font-weight="600" 
                              fill="${point.color}">
                          ${point.value}
                        </text>
                      `).join('')}
                    </svg>
                  </div>
                  
                  <div style="margin-top: 12px; padding: 10px; background-color: #F8FAFB; border-radius: 6px; border: 1px solid #E2E8F0;">
                    <h4 style="margin: 0 0 6px 0; color: #374151; font-size: 12px;">Légende des couleurs</h4>
                    <div style="display: flex; justify-content: space-around; font-size: 10px;">
                      <div style="display: flex; align-items: center;">
                        <div style="width: 8px; height: 8px; background-color: #10B981; border-radius: 50%; margin-right: 3px;"></div>
                        <span style="color: #64748B;">Très satisfaisant (0-3)</span>
                      </div>
                      <div style="display: flex; align-items: center;">
                        <div style="width: 8px; height: 8px; background-color: #F59E0B; border-radius: 50%; margin-right: 3px;"></div>
                        <span style="color: #64748B;">Modérément satisfaisant (4-6)</span>
                      </div>
                      <div style="display: flex; align-items: center;">
                        <div style="width: 8px; height: 8px; background-color: #EF4444; border-radius: 50%; margin-right: 3px;"></div>
                        <span style="color: #64748B;">Peu satisfaisant (7-10)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style="margin-top: 8px; font-size: 9px; color: #9CA3AF; text-align: center;">
                    <p style="margin: 0;">Scores détaillés disponibles dans l'application</p>
                  </div>
                  
                  <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #E2E8F0; text-align: center;">
                    <p style="margin: 0; font-size: 10px; color: #9CA3AF;">Rapport généré avec l'application de suivi RCH</p>
                  </div>
                </div>
              `;
            })()}
          ` : `
            <div style="display: flex; flex-direction: column; height: 100%; justify-content: center; align-items: center;">
              <div style="text-align: center; color: #9CA3AF;">
                <h3 style="margin: 0; color: #64748B;">Aucun questionnaire IBDisk disponible</h3>
                <p style="margin: 10px 0; font-size: 14px;">Remplissez un questionnaire IBDisk dans l'application pour voir vos résultats ici.</p>
              </div>
              
              <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #9CA3AF;">Rapport généré avec l'application de suivi RCH</p>
              </div>
            </div>
          `}
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
      <AppCard style={styles.infoCard}>
        <View style={styles.infoTitleContainer}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#4A90E2" />
          <AppText variant="body" style={styles.infoTitle}>Rapport Médical</AppText>
        </View>
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
            { value: 'complet', label: 'Tout' },
            { value: '90', label: '90j' },
            { value: '30', label: '30j' },
            { value: '7', label: '7j' }
          ]}
          style={styles.segmentedButtons}
        />
      </AppCard>

      <AppCard style={styles.statsCard}>
        <AppText variant="body" style={styles.statsTitle}>Données Disponibles</AppText>
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
        <AppText variant="body" style={styles.contentTitle}>Contenu du Rapport</AppText>
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
            Aucune donnée disponible pour générer un rapport. 
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
  infoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8
  },
  infoTitle: {
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
