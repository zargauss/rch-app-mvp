# Guide de la Dictée Vocale

## Vue d'ensemble

La fonctionnalité de dictée vocale permet aux utilisateurs de saisir leurs notes quotidiennes en parlant plutôt qu'en tapant au clavier. Cette fonctionnalité utilise l'**API Web Speech native du navigateur** (gratuite, sans API key nécessaire).

## Compatibilité navigateurs

| Navigateur | Support | Notes |
|------------|---------|-------|
| Chrome/Edge | ✅ Complet | Fonctionne parfaitement |
| Safari (iOS/macOS) | ✅ Complet | Fonctionne parfaitement |
| Firefox | ⚠️ Limité | Nécessite activation manuelle dans `about:config` |

## Fonctionnalités

### 1. Bouton microphone
- **Localisation**: En haut à droite du champ de saisie de note
- **États visuels**:
  - 🎤 **Repos**: Bouton bleu avec icône microphone grisée
  - 🔴 **Enregistrement**: Bouton rouge pulsant avec animation
  - ❌ **Erreur**: Message d'erreur affiché sous le champ

### 2. Transcription en temps réel
- Le texte s'affiche progressivement pendant que vous parlez
- Une bannière jaune montre la transcription en cours
- Arrêt automatique après 2-3 secondes de silence
- Le texte transcrit s'ajoute au texte existant (ne le remplace pas)

### 3. Gestion des erreurs

| Erreur | Message affiché | Solution |
|--------|----------------|----------|
| Permission refusée | "Autorisez l'accès au microphone..." | Autoriser l'accès dans les paramètres du navigateur |
| Pas de son détecté | "Aucun son détecté. Réessayez." | Vérifier le microphone et parler plus fort |
| Pas de microphone | "Aucun microphone détecté..." | Brancher un microphone |
| Navigateur non supporté | "Votre navigateur ne supporte pas..." | Utiliser Chrome ou Safari |

## Comment utiliser

### Étape 1: Ouvrir la modal de note
1. Depuis l'écran d'accueil, cliquez sur "+ Nouvelle note"
2. Ou modifiez une note existante

### Étape 2: Activer la dictée
1. Cliquez sur le bouton microphone 🎤 en haut à droite
2. Autorisez l'accès au microphone si demandé
3. Le bouton devient rouge et pulse 🔴

### Étape 3: Parler
1. Parlez clairement en français
2. Exemple: *"Grosse journée de stress, McDo ce midi"*
3. La transcription apparaît en temps réel dans une bannière jaune
4. L'enregistrement s'arrête automatiquement après un silence

### Étape 4: Vérifier et corriger
1. Le texte transcrit est ajouté au champ de note
2. Vous pouvez modifier manuellement si nécessaire
3. Vous pouvez recommencer la dictée en re-cliquant sur le bouton

## ⚠️ Problème avec Vercel

### Erreur "network" sur tous les domaines .vercel.app

**IMPORTANT** : La dictée vocale **ne fonctionne PAS** sur les domaines `.vercel.app` (ni preview, ni production). C'est une **limitation de l'API Web Speech de Google** qui bloque ces domaines.

### Solutions

#### Pour le développement (recommandé) ✅
```bash
# Clonez et lancez en local
git clone <votre-repo>
cd rch-app-mvp
npm install
npm run web

# Ouvrez http://localhost:19006
# ✨ La dictée fonctionnera parfaitement
```

#### Pour la production (OBLIGATOIRE) ⚠️

La dictée vocale nécessite un **domaine custom** pour fonctionner en production.

**Étapes pour configurer un domaine custom sur Vercel** :

1. Achetez un domaine (ex: chez Namecheap, OVH, etc.)
2. Dans Vercel :
   - Allez dans votre projet → Settings → Domains
   - Cliquez sur "Add Domain"
   - Entrez votre domaine : `app.votre-domaine.com`
   - Suivez les instructions pour configurer les DNS
3. Déployez et testez sur : `https://app.votre-domaine.com`
4. ✅ La dictée vocale fonctionnera !

**Exemples de domaines qui fonctionnent** :
- ✅ `https://app.mon-domaine.com`
- ✅ `https://sante.exemple.fr`
- ✅ `http://localhost:19006`
- ❌ `https://mon-app.vercel.app` (ne fonctionne PAS)
- ❌ `https://mon-app-preview.vercel.app` (ne fonctionne PAS)

#### Alternative : Désactiver la fonctionnalité sur Vercel

Si vous ne pouvez pas configurer de domaine custom, vous pouvez cacher le bouton micro sur les domaines Vercel :

```javascript
// Dans NoteModal.js, ligne 262-273
// Option: Cacher complètement le bouton au lieu d'afficher un avertissement
{isSpeechSupported && typeof window !== 'undefined' && !window.location.hostname.includes('.vercel.app') && (
  <TouchableOpacity onPress={toggleRecording}>
    {/* Bouton micro */}
  </TouchableOpacity>
)}
```

## Tests à effectuer

### Test fonctionnel basique
```
1. Ouvrir une nouvelle note
2. Cliquer sur le bouton microphone
3. Dicter: "Grosse journée de stress, McDo ce midi"
4. Vérifier que la transcription est correcte
5. Sauvegarder la note
```

### Test d'ajout progressif
```
1. Taper manuellement: "Aujourd'hui,"
2. Cliquer sur le microphone
3. Dicter: "j'ai eu très mal au ventre"
4. Vérifier que les deux textes sont combinés avec un espace
```

### Test de gestion d'erreur
```
1. Cliquer sur le microphone
2. Refuser la permission → Vérifier le message d'erreur clair
3. Autoriser la permission
4. Ne rien dire pendant 5 secondes → Vérifier le message "Aucun son détecté"
```

### Test multi-navigateurs
```
1. Tester sur Chrome Desktop → ✅ Devrait fonctionner
2. Tester sur Safari iOS → ✅ Devrait fonctionner
3. Tester sur Firefox → ⚠️ Peut nécessiter configuration
```

## Architecture technique

### Fichiers modifiés/créés

1. **`/src/hooks/useSpeechRecognition.js`** (nouveau)
   - Hook React personnalisé
   - Gère toute la logique Web Speech API
   - États: isRecording, transcript, error, isSupported
   - Méthodes: startRecording, stopRecording, toggleRecording

2. **`/src/components/modals/NoteModal.js`** (modifié)
   - Intégration du hook useSpeechRecognition
   - Bouton microphone avec animation
   - Affichage de la transcription intermédiaire
   - Gestion des messages d'erreur

### Configuration Web Speech API

```javascript
{
  lang: 'fr-FR',              // Langue française
  continuous: false,           // Arrêt auto après phrase
  interimResults: true,        // Transcription progressive
  maxAlternatives: 1          // Une seule alternative
}
```

### Événements gérés

- `onstart`: Début de l'enregistrement → Animation démarre
- `onresult`: Transcription reçue → Ajout au texte
- `onend`: Fin de l'enregistrement → Animation s'arrête
- `onerror`: Erreur → Message explicatif

## Limitations connues

1. **Domaines .vercel.app** 🚫: L'API Web Speech **ne fonctionne PAS** sur les domaines `.vercel.app` (limitation de Google). **Solution OBLIGATOIRE pour production**: Configurez un domaine custom. Pour développement : utilisez localhost.
2. **Bruit ambiant**: La transcription peut être imprécise dans un environnement bruyant
3. **Accent/prononciation**: La qualité dépend de la clarté de la voix
4. **Firefox**: Support limité, nécessite configuration manuelle dans `about:config`
5. **Longueur**: Arrêt automatique après ~60 secondes d'enregistrement continu
6. **Hors ligne**: Nécessite une connexion internet (l'API utilise les serveurs Google)

## Améliorations futures possibles

- [ ] Ajouter un bouton d'arrêt manuel plus visible
- [ ] Permettre de choisir la langue (multilingue)
- [ ] Ajouter une visualisation du niveau sonore
- [ ] Sauvegarder les transcriptions pour amélioration continue
- [ ] Mode continu pour de longues notes
- [ ] Correction orthographique automatique post-transcription

## Support technique

Pour plus d'informations sur l'API Web Speech:
- [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Can I Use - Web Speech API](https://caniuse.com/speech-recognition)
- [W3C Specification](https://w3c.github.io/speech-api/)

---

**Note**: Cette fonctionnalité est un MVP (Minimum Viable Product). Des améliorations itératives peuvent être apportées en fonction des retours utilisateurs.
