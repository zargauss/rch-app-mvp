# 🏥 RCH App - Suivi Personnel de Rectocolite Hémorragique

> Application mobile de suivi médical pour la gestion personnelle de la Rectocolite Hémorragique (RCH)

**⚠️ Note importante** : Projet personnel à but de démonstration de compétences Product Management. Non destiné à un usage médical sans supervision professionnelle.

---

## 📋 Le Problème

En tant que patient atteint de RCH, j'ai identifié un vide dans l'écosystème des applications de santé :

**Le constat :**
- 250 000 patients atteints de MICI en France
- Zéro application dédiée au suivi de la RCH sur les stores français
- Seules solutions : carnets papier ou notes éparses sur téléphone
- Besoin non couvert : tracking structuré avec scores cliniques validés

**L'impact :**
- Impossible de fournir des données fiables aux médecins pour l'adaptation thérapeutique
- Décisions médicales basées sur du déclaratif flou plutôt qu'un suivi objectif
- Perte d'informations entre les consultations (espacées de 3-6 mois)

## ✨ La Solution

Une Progressive Web App simple et efficace qui permet un suivi quotidien structuré :

### Fonctionnalités principales

**📊 Score de Lichtiger adapté**
- Évaluation clinique standardisée (nombre de selles, douleurs, saignements, bien-être)
- Calcul automatique du score sur 21 points
- Visualisation de l'évolution dans le temps

**🎯 IBD-Disk**
- Évaluation de la qualité de vie (10 dimensions)
- Suivi de l'impact de la maladie sur le quotidien
- Graphique radar pour visualisation globale

**💊 Suivi traitement & observance**
- Tracking des prises médicamenteuses
- Calcul automatique du taux d'observance
- Historique des modifications de traitement

**📈 Analyse & visualisation**
- Graphiques d'évolution (symptômes, scores, observance)
- Détection des patterns et corrélations
- Vue d'ensemble sur différentes périodes

**📄 Export professionnel**
- Export PDF structuré pour consultations médicales
- Synthèse claire des données sur période donnée
- Prêt à partager avec l'équipe soignante

**📝 Notes libres**
- Espace pour contexte (stress, voyages, changements alimentaires)
- Facilite la compréhension des variations

---

## 🎯 Démarche Product Management

### Phase 1 : Discovery (Semaine 1)

**Recherche utilisateur**
- Auto-observation pendant 2 semaines préalables
- Identification des pain points personnels quotidiens
- Revue des solutions existantes (Google Play/App Store)
- Résultat : Aucune app dédiée RCH, seulement trackers génériques

**Définition du besoin minimal**
- Tracking médical structuré avec scores cliniques validés
- Solution utilisable immédiatement (pas d'onboarding complexe)
- Données stockées localement (contrainte privacy)

### Phase 2 : Conception & Priorisation (Semaine 1)

**MVP défini**
- Score de Lichtiger (score clinique de référence)
- Tracking quotidien simplifié
- Export PDF basique

**Architecture décidée**
- Progressive Web App (accessibilité multi-device)
- Local storage (pas de serveur = pas de contraintes HDS)
- Développement assisté par IA (Claude/Cursor) pour accélération

### Phase 3 : Développement Itératif (Semaines 2-3)

**7-8 itérations basées sur l'usage réel**

- **V1** : Core features (Score Lichtiger + tracking de base)
- **V2-V3** : Ajout graphiques & visualisations
- **V4** : Intégration IBD-Disk
- **V5-V6** : Module traitement/observance
- **V7** : Notes libres + améliorations UX
- **V8** : Export PDF professionnel

**Principe appliqué** : Déploiement rapide → Usage quotidien → Feedback immédiat → Itération

### Phase 4 : Validation & Mesure (En cours)

**Méthodologie "dogfooding"**
- Utilisation quotidienne personnelle depuis 3 semaines
- Tracking de 100% des jours (vs 0% avant)
- Amélioration continue basée sur irritants réels

---

## 📊 Résultats & Impact

### Résultats mesurés (3 semaines d'utilisation)

**Quantitatifs**
- ✅ Passage de 0% à 100% de tracking quotidien
- ✅ Score de Lichtiger passé de 8 à 4 (amélioration clinique visible)
- ✅ Observance traitement : 95% (vs estimation subjective avant)
- ✅ Document PDF structuré prêt en 2 clics pour consultation

**Qualitatifs**
- Visualisation de patterns invisibles auparavant (ex: corrélation stress/symptômes)
- Confiance accrue dans les données présentées au médecin
- Réduction de l'anxiété liée à la perte d'information entre consultations

### Limites assumées

**Actuelles**
- Mono-utilisateur (pas de validation externe du parcours)
- Export/import manuel (pas de sync cloud)
- Pas de chiffrement implémenté (prévu en roadmap)
- Interface mobile-first (desktop fonctionnel mais non optimisé)

**Réglementaires**
- Non marqué CE (dispositif médical Classe I minimum requis)
- Non conforme HDS (hébergement données de santé)
- Usage personnel uniquement, pas de distribution publique

---

## 🛠️ Stack Technique

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

**Design**
- Palette médicale professionnelle (bleu #2C5AA0, vert #4CAF50)
- Design system cohérent
- Animations fluides et feedback utilisateur

**Deployment**
- Vercel (hébergement PWA)
- CI/CD automatisé
- Déploiement continu depuis GitHub

**Développement**
- IA-assisted coding (Claude, Cursor)
- Itérations rapides (déploiement journalier)
- Tests manuels en conditions réelles

---

## 💡 Apprentissages Clés

### Sur le Product Management

**1. L'avantage du "dogfooding"**
- Être son propre utilisateur = feedback instantané et sans filtre
- Détection immédiate des irritants UX
- Priorisation naturelle basée sur l'usage réel vs hypothèses

**2. L'IA comme accélérateur de prototypage**
- Capacité d'un non-développeur à créer un produit fonctionnel
- Focus possible sur la stratégie produit vs technique
- Démocratisation de la création de MVP

**3. Les contraintes réglementaires santé**
- Barrière d'entrée importante même pour solutions simples
- Le passage "outil personnel" → "produit public" = saut qualitatif majeur
- Compromis nécessaires : features vs conformité

### Sur la Santé Numérique

**Le paradoxe du marché**
- Besoin évident (250k patients) mais offre inexistante
- Explication probable : complexité réglementaire + marché de niche
- Opportunité pour acteurs établis avec ressources compliance

---

## 🚀 Roadmap

### Court terme (1-2 mois)

- [ ] Chiffrement des données sensibles
- [ ] Amélioration de la portabilité (export/import JSON)
- [ ] Tests avec 2-3 utilisateurs de confiance
- [ ] Refactoring architecture (HomeScreen trop volumineux)

### Moyen terme (3-6 mois)

- [ ] Évaluation potentiel distribution (association patients / partenariat)
- [ ] Étude de faisabilité conformité réglementaire
- [ ] Ajout corrélations alimentaires
- [ ] Mode "poussée" avec alertes précoces

### Long terme (envisagé)

- Synchronisation cloud sécurisée (si conformité HDS)
- Intégration HealthKit/Google Fit
- Partage sécurisé avec équipe soignante
- Expansion à d'autres MICI (Crohn)

---

## 📸 Captures d'écran

[À ajouter : 3-5 screenshots annotés des principales fonctionnalités]

---

## 🔗 Liens

- 🌐 **Application en ligne** : [https://rch-app-mvp.vercel.app](https://rch-app-mvp.vercel.app)
- 📂 **Code source** : [https://github.com/davidhoff-pm/rch-app-mvp](https://github.com/davidhoff-pm/rch-app-mvp)
- 📧 **Contact** : david.hoffnung@gmail.com

---

## 📄 License

MIT License - Projet personnel à but éducatif et de démonstration.

**Disclaimer médical** : Cette application est un projet personnel de démonstration de compétences Product Management. Elle n'est pas un dispositif médical certifié et ne doit pas être utilisée comme outil de diagnostic ou de décision thérapeutique sans supervision médicale appropriée.

---

**Développé par David Hoffnung**  
Docteur en Pharmacie | Product Manager Santé Numérique  
Dans le cadre d'un projet personnel d'apprentissage et de portfolio professionnel

*Dernière mise à jour : Novembre 2025*
