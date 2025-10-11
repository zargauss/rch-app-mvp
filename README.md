# RCH App MVP - Application de Suivi Médical

## 🏥 Application de Suivi RCH

Application mobile/web pour le suivi quotidien de la Rectocolite Hémorragique (RCH) avec calcul automatique du score de Lichtiger.

## ✨ Fonctionnalités

- **📱 Interface mobile-first** : Optimisée pour smartphone
- **📊 Suivi des selles** : Enregistrement avec échelle de Bristol
- **📈 Calcul automatique** : Score de Lichtiger en temps réel
- **📋 Bilans quotidiens** : Questionnaire médical complet
- **📊 Graphiques d'évolution** : Visualisation des tendances
- **📄 Export PDF** : Rapports médicaux professionnels
- **💾 Stockage local** : Données sauvegardées sur l'appareil

## 🚀 Déploiement Rapide

### Option 1 : Vercel (Recommandé - Gratuit)

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Build de l'application
npm run build

# 3. Déployer
vercel --prod
```

### Option 2 : Netlify

```bash
# 1. Build de l'application
npm run build

# 2. Glisser-déposer le dossier 'dist' sur netlify.com
```

### Option 3 : GitHub Pages

```bash
# 1. Build de l'application
npm run build

# 2. Push le dossier 'dist' sur votre repo GitHub
# 3. Activer GitHub Pages dans les settings
```

## 📱 Installation sur Téléphone

### Android
1. Ouvrir Chrome
2. Aller sur votre URL déployée
3. Menu Chrome → "Ajouter à l'écran d'accueil"
4. L'app apparaît comme une vraie app !

### iPhone
1. Ouvrir Safari
2. Aller sur votre URL déployée
3. Bouton Partager → "Sur l'écran d'accueil"
4. L'app apparaît comme une vraie app !

## 🔧 Développement Local

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm start

# Démarrer la version web
npm run web
```

## 📊 Score de Lichtiger

L'application calcule automatiquement le score de Lichtiger basé sur :
- Nombre de selles par jour
- Selles nocturnes (23h-6h)
- Présence de sang
- Incontinence fécale
- Douleurs abdominales
- État général
- Prise d'antidiarrhéiques

## 🎨 Design

- **Thème médical** : Couleurs professionnelles (bleu médical)
- **Interface clean** : Design épuré et accessible
- **Responsive** : S'adapte à tous les écrans
- **Accessibilité** : Optimisé pour l'usage médical

## 📱 PWA Ready

L'application est configurée comme Progressive Web App :
- Fonctionne hors ligne
- Installation sur l'écran d'accueil
- Notifications push (à venir)
- Synchronisation des données (à venir)

## 🔒 Confidentialité

- **Données locales** : Tout est stocké sur votre appareil
- **Aucun serveur** : Pas de transmission de données médicales
- **Export contrôlé** : Vous choisissez quand partager vos données

## 📞 Support

Pour toute question ou problème, consultez votre médecin traitant.

---

**⚠️ Avertissement Médical** : Cette application est un outil de suivi et ne remplace pas l'avis médical professionnel.
