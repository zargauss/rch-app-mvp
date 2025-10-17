import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import AppText from '../components/ui/AppText';
import AppCard from '../components/ui/AppCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import { storage } from '../utils/storage';

const IBDiskQuestionnaireScreen = () => {
  const navigation = useNavigation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const questions = [
    {
      id: 'abdominal_pain',
      icon: '🫀',
      title: 'Douleur abdominale',
      question: 'J\'ai eu des douleurs au ventre ou à l\'estomac'
    },
    {
      id: 'bowel_regulation',
      icon: '🚽',
      title: 'Régulation de la défécation',
      question: 'J\'ai eu des selles urgentes que j\'ai eu du mal à gérer ; trouver des toilettes à temps a été un problème et j\'ai parfois eu des difficultés d\'essuyage/nettoyage'
    },
    {
      id: 'social_life',
      icon: '🤝',
      title: 'Vie sociale',
      question: 'J\'ai eu des difficultés dans ma relation aux autres et/ou des difficultés d\'intégration'
    },
    {
      id: 'professional_activities',
      icon: '🏢',
      title: 'Activités professionnelles et scolaires',
      question: 'J\'ai eu des difficultés dans mes activités professionnelles ou dans mes études ou dans la réalisation des tâches quotidiennes'
    },
    {
      id: 'sleep',
      icon: '⏰',
      title: 'Sommeil',
      question: 'J\'ai eu des difficultés de sommeil, par exemple des problèmes d\'endormissement, des réveils nocturnes fréquents ou des réveils très matinaux sans possibilité de rendormissement'
    },
    {
      id: 'energy',
      icon: '😴',
      title: 'Énergie',
      question: 'Je ne me suis jamais senti(e) véritablement reposé(e), j\'ai manqué d\'énergie, je me suis senti(e) fatigué(e)'
    },
    {
      id: 'stress_anxiety',
      icon: '😔',
      title: 'Niveau de stress, anxiété',
      question: 'Je me suis senti(e) triste, mon moral a été bas, ou je me suis senti(e) déprimé(e) et/ou inquiet(ète) et/ou anxieux(euse)'
    },
    {
      id: 'self_image',
      icon: '👤',
      title: 'Image de soi',
      question: 'Je n\'aime pas mon corps ou certaines parties de mon corps'
    },
    {
      id: 'intimate_life',
      icon: '💕',
      title: 'Vie intime',
      question: 'J\'ai eu des difficultés d\'ordre psychologique et/ou physique dans ma sexualité'
    },
    {
      id: 'joint_pain',
      icon: '🦵',
      title: 'Douleur articulaire',
      question: 'Mes articulations me font souffrir'
    }
  ];

  // Charger les réponses existantes
  useEffect(() => {
    const savedAnswers = storage.getString('ibdiskCurrentAnswers');
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        setAnswers(parsedAnswers);
        // Trouver la première question non répondue
        const firstUnanswered = questions.findIndex(q => !parsedAnswers[q.id]);
        if (firstUnanswered !== -1) {
          setCurrentQuestion(firstUnanswered);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des réponses:', e);
      }
    }
  }, []);

  const handleAnswerChange = (value) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);
    
    // Sauvegarder automatiquement
    storage.set('ibdiskCurrentAnswers', JSON.stringify(newAnswers));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Vérifier que toutes les questions sont répondues
      const unansweredQuestions = questions.filter(q => answers[q.id] === undefined);
      if (unansweredQuestions.length > 0) {
        Alert.alert(
          'Questionnaire incomplet',
          'Veuillez répondre à toutes les questions avant de valider.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Sauvegarder le questionnaire complet
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const questionnaireData = {
        date: todayStr,
        timestamp: today.getTime(),
        answers: answers,
        completed: true
      };

      // Sauvegarder dans l'historique
      const historyJson = storage.getString('ibdiskHistory');
      const history = historyJson ? JSON.parse(historyJson) : [];
      
      // Vérifier si un questionnaire existe déjà pour aujourd'hui
      const existingIndex = history.findIndex(h => h.date === todayStr);
      if (existingIndex >= 0) {
        history[existingIndex] = questionnaireData;
      } else {
        history.push(questionnaireData);
      }
      
      // Trier par date (plus récent en premier)
      history.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      storage.set('ibdiskHistory', JSON.stringify(history));
      
      // Supprimer les réponses temporaires
      storage.delete('ibdiskCurrentAnswers');
      
      // Marquer comme utilisé aujourd'hui
      storage.set('ibdiskLastUsed', today.getTime().toString());
      
      Alert.alert(
        'Questionnaire terminé',
        'Merci d\'avoir rempli le questionnaire IBDisk. Vos réponses ont été enregistrées.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ?.id];

  return (
    <ScrollView style={styles.container}>
      <AppCard style={styles.headerCard}>
        <AppText variant="headlineLarge" style={styles.title}>
          Votre quotidien
        </AppText>
        <AppText variant="bodyMedium" style={styles.subtitle}>
          Pour chaque item, sélectionnez le chiffre qui correspond au ressenti pendant la semaine qui vient de s'écouler
        </AppText>
        
        {/* Barre de progression */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
          <AppText variant="labelSmall" style={styles.progressText}>
            {currentQuestion + 1} / {questions.length}
          </AppText>
        </View>
      </AppCard>

      <AppCard style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <AppText style={styles.questionIcon}>{currentQ?.icon}</AppText>
          <AppText variant="headlineSmall" style={styles.questionTitle}>
            {currentQ?.title}
          </AppText>
        </View>
        
        <AppText variant="bodyLarge" style={styles.questionText}>
          {currentQ?.question}
        </AppText>

        {/* Échelle de notation */}
        <View style={styles.scaleContainer}>
          <View style={styles.scaleHeader}>
            <AppText variant="bodyMedium" style={styles.scaleTitle}>
              Échelle de notation
            </AppText>
            <View style={styles.scoreDisplay}>
              <AppText variant="headlineLarge" style={styles.scoreValue}>
                {currentAnswer !== undefined ? currentAnswer : '-'}
              </AppText>
              <AppText variant="labelSmall" style={styles.scoreLabel}>
                / 10
              </AppText>
            </View>
          </View>
          
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={currentAnswer !== undefined ? currentAnswer : 5}
            onValueChange={(value) => handleAnswerChange(Math.round(value))}
            minimumTrackTintColor="#059669"
            maximumTrackTintColor="#E2E8F0"
            thumbTintColor="#059669"
          />
          
          {/* Marqueurs de l'échelle */}
          <View style={styles.scaleMarkers}>
            {Array.from({ length: 11 }, (_, i) => (
              <AppText key={i} variant="labelSmall" style={styles.markerText}>
                {i}
              </AppText>
            ))}
          </View>
          
          {/* Labels explicatifs */}
          <View style={styles.scaleLabels}>
            <AppText variant="labelSmall" style={styles.scaleLabelLeft}>
              Pas du tout d'accord
            </AppText>
            <AppText variant="labelSmall" style={styles.scaleLabelRight}>
              Tout à fait d'accord
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Boutons de navigation */}
      <View style={styles.navigationContainer}>
        <SecondaryButton
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
          style={styles.navButton}
        >
          Précédent
        </SecondaryButton>
        
        <PrimaryButton
          onPress={handleNext}
          loading={isLoading}
          disabled={currentAnswer === undefined}
          style={styles.navButton}
        >
          {currentQuestion === questions.length - 1 ? 'Terminer' : 'Suivant'}
        </PrimaryButton>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  headerCard: {
    margin: 20,
    marginBottom: 16,
    padding: 20,
  },
  title: {
    color: '#2D3748',
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 22,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  progressText: {
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  questionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  questionTitle: {
    color: '#2D3748',
    fontWeight: '700',
    flex: 1,
  },
  questionText: {
    color: '#475569',
    marginBottom: 24,
    lineHeight: 24,
  },
  scaleContainer: {
    marginTop: 8,
    backgroundColor: '#F8FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scaleTitle: {
    color: '#374151',
    fontWeight: '600',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#059669',
  },
  scoreValue: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 32,
  },
  scoreLabel: {
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 8,
  },
  scaleMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  markerText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 10,
    textAlign: 'center',
    width: 20,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  scaleLabelLeft: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'left',
  },
  scaleLabelRight: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'right',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
});

export default IBDiskQuestionnaireScreen;
