import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, RadioButton, Switch } from 'react-native-paper';
import AppText from '../components/ui/AppText';
import PrimaryButton from '../components/ui/PrimaryButton';
import AppCard from '../components/ui/AppCard';
import Slider from '@react-native-community/slider';
import storage from '../utils/storage';
import { getSurveyDayKey } from '../utils/dayKey';
import { useNavigation } from '@react-navigation/native';

function getTodayKey() {
  return getSurveyDayKey(new Date(), 7);
}

export default function DailySurveyScreen() {
  const navigation = useNavigation();
  const [fecalIncontinence, setFecalIncontinence] = useState('non');
  const [abdominalPain, setAbdominalPain] = useState(0); // 0..3 via slider
  const [generalState, setGeneralState] = useState(2); // 0..5 via slider (2=bon)
  const [antidiarrheal, setAntidiarrheal] = useState('non');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [dirty, setDirty] = useState(false);

  const todayKey = useMemo(() => getTodayKey(), []);

  useEffect(() => {
    const json = storage.getString('dailySurvey');
    if (json) {
      const map = JSON.parse(json);
      if (map && map[todayKey]) {
        setAlreadySubmitted(true);
        const s = map[todayKey];
        setFecalIncontinence(s.fecalIncontinence);
        // map pain and general to sliders
        const painMap = { aucune: 0, legeres: 1, moyennes: 2, intenses: 3 };
        const generalMap = { parfait: 0, tres_bon: 1, bon: 2, moyen: 3, mauvais: 4, tres_mauvais: 5 };
        if (typeof s.abdominalPain === 'string') setAbdominalPain(painMap[s.abdominalPain] ?? 0);
        if (typeof s.generalState === 'string') setGeneralState(generalMap[s.generalState] ?? 2);
        setAntidiarrheal(s.antidiarrheal);
      }
    }
  }, [todayKey]);

  const handleSave = () => {
    const json = storage.getString('dailySurvey');
    const map = json ? JSON.parse(json) : {};
    // allow edit: overwrite existing entry
    const painStr = ['aucune', 'legeres', 'moyennes', 'intenses'][abdominalPain] || 'aucune';
    const generalStr = ['parfait','tres_bon','bon','moyen','mauvais','tres_mauvais'][generalState] || 'bon';
    map[todayKey] = {
      date: todayKey,
      fecalIncontinence,
      abdominalPain: painStr,
      generalState: generalStr,
      antidiarrheal
    };
    storage.set('dailySurvey', JSON.stringify(map));
    setDirty(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <AppText variant="title" style={styles.title}>Bilan du jour</AppText>

      <AppCard style={styles.block}>
      <AppText style={styles.question}>Incontinence fécale</AppText>
      <RadioButton.Group onValueChange={(v)=>{setFecalIncontinence(v); setDirty(true);}} value={fecalIncontinence}>
        <View style={styles.row}><RadioButton value="oui" /><AppText>Oui</AppText></View>
        <View style={styles.row}><RadioButton value="non" /><AppText>Non</AppText></View>
      </RadioButton.Group>
      </AppCard>

      <AppCard style={styles.block}>
      <AppText style={styles.question}>Douleurs abdominales</AppText>
      <Slider minimumValue={0} maximumValue={3} step={1} value={abdominalPain} onValueChange={(v)=>{setAbdominalPain(v); setDirty(true);}} />
      <AppText>Intensité: {['Aucune','Légères','Moyennes','Intenses'][abdominalPain]}</AppText>
      </AppCard>

      <AppCard style={styles.block}>
      <AppText style={styles.question}>État général</AppText>
      <Slider minimumValue={0} maximumValue={5} step={1} value={generalState} onValueChange={(v)=>{setGeneralState(v); setDirty(true);}} />
      <AppText>Niveau: {['Parfait','Très bon','Bon','Moyen','Mauvais','Très mauvais'][generalState]}</AppText>
      </AppCard>

      <AppCard style={styles.block}>
      <AppText style={styles.question}>Prise d'un antidiarrhéique</AppText>
      <View style={styles.row}>
        <AppText>Oui</AppText>
        <Switch value={antidiarrheal === 'oui'} onValueChange={(v)=>{setAntidiarrheal(v ? 'oui' : 'non'); setDirty(true);}} />
      </View>
      </AppCard>

      <PrimaryButton onPress={handleSave} disabled={!dirty} style={styles.save}>
        Enregistrer mon bilan
      </PrimaryButton>
      {alreadySubmitted ? <Text style={styles.info}>Bilan déjà enregistré aujourd'hui (modifications possibles).</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    marginBottom: 16
  },
  question: {
    marginTop: 16,
    marginBottom: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  save: {
    marginTop: 24,
    alignSelf: 'flex-start'
  },
  info: {
    marginTop: 8
  },
  block: {
    marginBottom: 16
  }
});
