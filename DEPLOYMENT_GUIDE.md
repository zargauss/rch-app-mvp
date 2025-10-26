# 📱 Guide de déploiement - Application Native RCH Suivi

## 🎯 Objectif
Créer une **vraie app native** sans passer par les stores, avec des **mises à jour faciles**.

---

## 🚀 Option recommandée : EAS Build + Updates

### Étape 1 : Installation d'EAS CLI

```bash
npm install -g eas-cli
eas login
```

Si vous n'avez pas de compte Expo, créez-en un gratuitement sur [expo.dev](https://expo.dev)

---

### Étape 2 : Configuration du projet

Votre `eas.json` est déjà configuré ! Les profils disponibles :
- **preview** : Pour les tests internes (recommandé pour vous)
- **production** : Pour la version finale

---

### Étape 3 : Premier build Android (APK)

```bash
# Build APK pour distribution interne
eas build --platform android --profile preview
```

**Ce qui va se passer** :
1. EAS va créer un build natif dans le cloud (~15-20 min)
2. Vous recevrez un lien de téléchargement direct
3. Partagez ce lien pour installer l'APK sur n'importe quel Android

**Important** : Sur Android, il faudra autoriser l'installation d'applications de sources inconnues.

---

### Étape 4 : Build iOS (si nécessaire)

```bash
# Build iOS pour distribution interne
eas build --platform ios --profile preview
```

**Pour iOS** :
- Vous aurez besoin d'un compte Apple Developer (99$/an)
- Ou utilisez un certificat Ad-Hoc gratuit (limité à 100 appareils)

---

### Étape 5 : Installer l'application

#### **Android** :
1. Ouvrez le lien reçu sur votre téléphone
2. Téléchargez l'APK
3. Autorisez l'installation depuis Brave/Chrome
4. Installez et lancez !

#### **iOS** :
1. Utilisez TestFlight (si compte Apple Developer)
2. Ou installez directement via le profil de provisioning

---

## 🔄 Mises à jour instantanées (sans rebuild)

### Configuration des Updates

Installez le package :
```bash
npm install expo-updates
```

Dans `app.json`, ajoutez :
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[votre-project-id]",
      "enabled": true
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

### Publier une mise à jour

```bash
# Publier une mise à jour OTA
eas update --branch production --message "Fix notifications"
```

**Magie** ✨ :
- Les utilisateurs **reçoivent automatiquement** la mise à jour
- **Pas besoin de rebuild** ni de redistribuer l'APK
- La mise à jour se télécharge au lancement suivant de l'app

**Limitations des updates OTA** :
- ✅ Changements de code JavaScript/TypeScript
- ✅ Changements de ressources (images, etc.)
- ❌ Changements de dépendances natives (nécessite un rebuild)
- ❌ Changements dans `app.json` pour les permissions (nécessite un rebuild)

---

## 📦 Alternative : Distribution via Firebase App Distribution

Gratuit et très pratique pour les tests internes :

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Puis distribuez votre APK :
```bash
firebase appdistribution:distribute app-release.apk \
  --app YOUR_APP_ID \
  --groups "testers"
```

Les testeurs reçoivent une notification et peuvent installer l'app facilement.

---

## 🔑 Avantages de cette approche

| Fonctionnalité | PWA (actuel) | App Native (EAS) |
|----------------|--------------|------------------|
| Notifications en arrière-plan | ❌ | ✅ |
| Accès complet aux APIs natives | ⚠️ Limité | ✅ |
| Fonctionne hors ligne | ⚠️ Partiel | ✅ |
| Installation depuis stores | ❌ | ✅ (optionnel) |
| Mises à jour automatiques | ✅ | ✅ |
| Distribution directe | ✅ | ✅ |
| Icône sur l'écran d'accueil | ⚠️ Nécessite ajout manuel | ✅ |

---

## 💰 Coûts

- **EAS Build** : Gratuit jusqu'à 30 builds/mois
- **EAS Updates** : Gratuit
- **Firebase App Distribution** : Gratuit
- **Apple Developer** : 99$/an (uniquement pour iOS)

---

## 🎯 Workflow recommandé

1. **Développement** : Testez sur le web (Vercel) pour des itérations rapides
2. **Tests internes** : Créez un build Android preview toutes les semaines
3. **Mises à jour quotidiennes** : Utilisez EAS Updates pour les corrections
4. **Rebuild complet** : Uniquement quand vous ajoutez de nouvelles dépendances natives

---

## 🚀 Commandes rapides

```bash
# Build Android pour tests
eas build --platform android --profile preview

# Build iOS pour tests
eas build --platform ios --profile preview

# Publier une mise à jour (sans rebuild)
eas update --branch production

# Voir l'état des builds
eas build:list

# Voir l'état des updates
eas update:list
```

---

## 📞 Besoin d'aide ?

- Documentation EAS : https://docs.expo.dev/eas/
- Discord Expo : https://chat.expo.dev

