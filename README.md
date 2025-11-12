# RCH Tracker
**Suivi personnel de la Rectocolite Hémorragique (RCH) · Progressive Web App**

> Side project démontrant une démarche Product Management complète, de l'identification du problème au déploiement d'une solution utilisable quotidiennement.

---

## 🎯 Le problème

En tant que patient atteint de RCH, j'ai identifié plusieurs lacunes dans les solutions existantes :

- **Applications généralistes** : Trop complexes, conçues pour toutes les MICI sans focus spécifique RCH
- **Friction au quotidien** : Saisie longue et répétitive qui décourage l'usage régulier
- **Absence de contexte médical** : Pas d'intégration du score de Lichtiger ni du questionnaire IBDisk
- **Manque de visualisation** : Difficile d'identifier les tendances et de préparer les rendez-vous médicaux

**Insight clé** : Les patients RCH ont besoin d'un outil rapide, spécialisé et actionnable pour leur suivi quotidien, pas d'une solution universelle.

## 💡 La solution

Une PWA optimisée pour le suivi RCH avec 3 piliers :

### 1. Enregistrement rapide
- Saisie d'une selle en < 10 secondes (échelle Bristol, sang, date/heure)
- Indicateur visuel de sang (bordure rouge) sans encombrement visuel
- Filtres intelligents (Selles / Symptômes / Notes)

### 2. Suivi médical structuré
- Calcul automatique du **score de Lichtiger** (0-20)
- Questionnaire **IBDisk** mensuel (qualité de vie)
- Historique complet avec visualisation calendaire

### 3. Insights actionnables
- Graphiques d'évolution (score, fréquence, sang)
- Heatmap horaire pour identifier les patterns
- Export PDF pour consultations médicales

## 🔄 Démarche Product

### Discovery (Semaine 1)
- **Auto-observation** : Utilisation pendant 2 semaines de 3 apps existantes
- **Pain points identifiés** :
  - Friction de saisie (6 taps minimum par entrée)
  - Absence de score Lichtiger automatique
  - Visualisations non adaptées au suivi RCH
- **Hypothèse** : Une app spécialisée RCH avec saisie ultra-rapide améliorerait l'adhérence

### Conception & MVP (Semaine 2-3)
- **Wireframing** : Focus sur la rapidité de saisie (modale centralisée, pré-remplissage)
- **Priorisation** : Scope MVP = Saisie selles + Score Lichtiger + Calendrier
- **Développement** : Utilisation de Claude (IA) pour accélérer le développement technique
  - Je spécifiais les specs fonctionnelles, l'UX et l'architecture
  - Claude générait le code que je validais/ajustais
- **Design system** : Palette unifiée (bleu #4C4DDC, codes couleur sémantiques)

### Itération continue (3+ semaines d'usage personnel)
Exemples d'améliorations basées sur l'usage réel :
- **Problème** : Icône sang faisait passer les entrées sur 2 lignes → **Solution** : Bordure rouge
- **Problème** : Onglet "Tout" peu utile dans l'historique → **Solution** : Supprimé, focus sur filtres spécifiques
- **Problème** : Champs date/heure se chevauchaient (PWA mobile) → **Solution** : Layout vertical
- **Ajout** : Graphique multi-axes (score + % sang) pour corréler les données

**Metrics d'usage personnel** :
- 100% d'adhérence sur 3 semaines (vs 40% sur apps précédentes)
- Temps moyen de saisie : 8 secondes
- Consultation médicale facilitée (export PDF des 30 derniers jours)

## 🛠 Stack technique

**Framework & UI**
- React Native + Expo (cross-platform : web, iOS, Android)
- React Native Paper (Material Design)
- Progressive Web App (installable, offline-capable)

**Data & State**
- MMKV (stockage local haute performance)
- React Context (state management)

**Visualisation & UX**
- React Native Chart Kit (graphiques)
- Expo Haptics (retours tactiles)
- Expo Notifications (rappels quotidiens)

**Deployment**
- Vercel (hébergement PWA)
- CI/CD automatisé

## 📸 Screenshots

_[À ajouter : captures d'écran annotées montrant le flow principal]_

## 🚀 Utilisation

**Accès PWA** : [URL à ajouter]

**Installation locale** :
```bash
git clone [repo]
npm install
npm run web
```

## 🔮 Roadmap

**En cours** :
- [ ] Export PDF multi-formats (médecin, CPAM, personnel)
- [ ] Rappels intelligents (notifications adaptatives)

**Backlog priorisé** :
- [ ] Synchronisation cloud (multi-device)
- [ ] Corrélation alimentation/symptômes
- [ ] Partage sécurisé avec médecins (RGPD compliant)

---

## 📝 Note sur le développement

Ce projet a été développé avec l'assistance de Claude AI (Anthropic) en tant qu'accélérateur technique. **Mon rôle Product** :
- Définition des specs fonctionnelles et user stories
- Conception UX/UI et design system
- Priorisation des features (MoSCoW)
- Tests utilisateur (dogfooding intensif)
- Itérations basées sur les données d'usage

Cette approche m'a permis de me concentrer sur la **démarche produit** plutôt que sur l'implémentation technique, tout en livrant une solution production-ready.

---

**Contact** : [Votre email/LinkedIn]
**Licence** : MIT (usage personnel uniquement, non médical)

> ⚠️ **Disclaimer** : Cet outil est un aide-mémoire personnel, pas un dispositif médical. Toujours consulter un professionnel de santé.
