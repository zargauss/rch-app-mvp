// Service pour l'analyse de notes avec Google Gemini API
// Extraction de tags pertinents pour l'analyse des facteurs déclencheurs de MICI
// Utilise le SDK officiel @google/genai

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = 'AIzaSyCYTGrCIfRu0PPj-U0_PBwZ8deo_wZyNJ0';

// Initialisation du client Google GenAI
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});

/**
 * Génère le prompt médical pour l'analyse de la note
 * @param {string} noteContent - Le contenu de la note à analyser
 * @returns {string} Le prompt formaté
 */
const generateMedicalPrompt = (noteContent) => {
  return `Tu es un assistant médical spécialisé dans les MICI (maladies inflammatoires chroniques intestinales).

MISSION : Extraire les facteurs de risque ET les symptômes à partir de notes de patients atteints de RCH.

RÈGLE FONDAMENTALE :
1. Distingue FACTEURS DE RISQUE (alimentation, comportement) et SYMPTÔMES (manifestations physiques)
2. Ne tagge JAMAIS les noms de plats, seulement les COMPOSANTS à risque
3. Pour chaque symptôme, estime son intensité de 1 à 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTIE 1 : FACTEURS DE RISQUE (max 8 tags)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALIMENTATION - Taguer selon la composition :
- "viande-rouge" (bœuf, agneau - facteur inflammatoire)
- "charcuterie" (facteur inflammatoire)
- "produits-laitiers" (lactose)
- "fibres-crues" (crudités, salades, légumes crus)
- "fritures" (mode de cuisson)
- "graisses-saturées" (sauces, crème, fromage)
- "épices" (piment, curry, etc.)
- "alcool" (préciser si quantité : alcool-faible, alcool-modéré, alcool-fort)
- "café"
- "gluten" (si mentionné)
- "fast-food" (si la nature industrielle est le point clé)

COMPORTEMENT :
- "stress-travail"
- "stress-relationnel"
- "anxiété"
- "sommeil-insuffisant" (< 6h ou mention explicite)
- "sommeil-perturbé" (réveils, mauvaise qualité)
- "sport-intense" (si intensité inhabituelle mentionnée)
- "tabac"

EXCLUSIONS pour les tags :
- Noms de plats (bourguignon, tajine, carbonara)
- Noms de restaurants
- Aliments neutres (riz blanc, pâtes, pain blanc, poisson blanc, poulet)
- Émotions positives sans stress
- Activités routinières
- LES SYMPTÔMES (voir partie 2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTIE 2 : SYMPTÔMES (avec intensité 1-5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYMPTÔMES À DÉTECTER (hors selles qui sont traquées séparément) :
- "Douleurs abdominales" (crampes, douleurs ventre)
- "Fatigue" (épuisement, fatigué, crevé, dead)
- "Nausées" (envie de vomir, mal au cœur)
- "Fièvre" (température, fièvre, chaud)
- "Perte d'appétit" (pas faim, n'a rien mangé)
- "Douleurs articulaires" (douleur articulations, genoux, dos)
- "Ballonnements" (ventre gonflé, ballonné)
- "Maux de tête" (migraine, mal de crâne)

ÉCHELLE D'INTENSITÉ :
1 = Légère (mentionné en passant, peu gênant)
2 = Modérée (notable mais supportable)
3 = Importante (gênant, affecte les activités)
4 = Sévère (très gênant, limite les activités)
5 = Insupportable (ne peut rien faire)

EXEMPLES d'évaluation d'intensité :
- "un peu fatigué" → intensité: 1
- "fatigué" → intensité: 2
- "très fatigué" / "crevé" → intensité: 3
- "épuisé" / "dead" → intensité: 4
- "ne peux plus bouger" → intensité: 5
- "mal au ventre" → intensité: 2
- "grosses douleurs abdominales" → intensité: 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGIQUE D'EXTRACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour les TAGS :
1. Si un plat est mentionné, décompose-le mentalement en ingrédients
2. Ne garde que les ingrédients/modes de préparation à risque
3. Maximum 3 tags alimentaires par repas mentionné

Pour les SYMPTÔMES :
1. Cherche les manifestations physiques/sensations désagréables
2. Évalue l'intensité selon le vocabulaire utilisé
3. Ne pas confondre avec les facteurs de risque (ex: "stress" → tag, "mal de tête" → symptôme)

FORMAT DE SORTIE (JSON strict) :
{
  "tags": ["tag1", "tag2"],
  "symptoms": [
    {"nom": "Fatigue", "intensité": 3},
    {"nom": "Douleurs abdominales", "intensité": 2}
  ],
  "confiance": "haute|moyenne|basse"
}

Si pas de symptômes : "symptoms": []
Si pas de tags : "tags": []

Mets "confiance: basse" si la note est vague ou si tu dois inférer fortement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLES COMPLETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Note : "Bœuf bourguignon ce soir avec du pain"
Réponse : {
  "tags": ["viande-rouge"],
  "symptoms": [],
  "confiance": "haute"
}

Note : "McDo Big Mac frites, après j'avais mal au ventre"
Réponse : {
  "tags": ["fast-food", "fritures", "graisses-saturées"],
  "symptoms": [{"nom": "Douleurs abdominales", "intensité": 2}],
  "confiance": "haute"
}

Note : "Grosse journée de boulot, dead. Pas eu le temps de manger à midi, sandwich jambon beurre vite fait"
Réponse : {
  "tags": ["stress-travail", "charcuterie", "graisses-saturées"],
  "symptoms": [{"nom": "Fatigue", "intensité": 4}],
  "confiance": "haute"
}
Explication : "dead" indique une fatigue intense (4). Stress-travail = tag. Charcuterie/graisses = tags.

Note : "Poisson grillé et riz, eau plate. Bien dormi, forme olympique."
Réponse : {
  "tags": [],
  "symptoms": [],
  "confiance": "haute"
}

Note : "Pizza 4 fromages avec les collègues, 2 bières. Mal de crâne après"
Réponse : {
  "tags": ["produits-laitiers", "graisses-saturées", "alcool-modéré"],
  "symptoms": [{"nom": "Maux de tête", "intensité": 2}],
  "confiance": "haute"
}

Note : "Très mal au ventre ce matin, rien pu avaler"
Réponse : {
  "tags": [],
  "symptoms": [
    {"nom": "Douleurs abdominales", "intensité": 4},
    {"nom": "Perte d'appétit", "intensité": 3}
  ],
  "confiance": "haute"
}
Explication : "Très mal" → intensité 4. "Rien pu avaler" → perte d'appétit modérée à importante.

Analyse maintenant cette note :

"${noteContent}"`;
};

/**
 * Analyse une note avec l'API Gemini pour extraire les tags et symptômes
 * @param {string} noteContent - Le contenu de la note à analyser
 * @returns {Promise<{tags: string[], symptoms: Array<{nom: string, intensité: number}>, confiance: string}>} Résultat de l'analyse
 */
export const analyzeNoteWithAI = async (noteContent) => {
  try {
    console.log('🤖 Envoi de la note à Gemini pour analyse...');
    console.log('📝 Contenu de la note:', noteContent);

    // Vérification que la note n'est pas vide
    if (!noteContent || noteContent.trim().length === 0) {
      console.warn('⚠️ Note vide, aucune analyse effectuée');
      return { tags: [], symptoms: [], confiance: 'faible' };
    }

    // Préparation du prompt
    const prompt = generateMedicalPrompt(noteContent);
    console.log('📋 Prompt généré, longueur:', prompt.length, 'caractères');
    console.log('🌐 Appel à Gemini avec le modèle: gemini-2.0-flash');

    // Appel à l'API Gemini avec le SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            symptoms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nom: { type: Type.STRING },
                  intensité: { type: Type.NUMBER }
                },
                required: ["nom", "intensité"]
              }
            },
            confiance: {
              type: Type.STRING,
              enum: ["haute", "moyenne", "basse"]
            }
          },
          required: ["tags", "symptoms", "confiance"]
        },
        temperature: 0.3, // Plus conservateur pour des réponses médicales cohérentes
      }
    });

    console.log('✅ Réponse reçue de Gemini');

    // Extraction du texte généré
    const generatedText = response.text;

    if (!generatedText) {
      console.error('❌ Pas de texte généré par Gemini');
      return { tags: [], symptoms: [], confiance: 'faible' };
    }

    console.log('📝 Réponse brute Gemini:', generatedText);

    // Parsing de la réponse JSON
    try {
      const jsonText = generatedText.trim();
      const parsed = JSON.parse(jsonText);

      // Validation de la structure
      if (!parsed.tags || !Array.isArray(parsed.tags)) {
        console.warn('⚠️ Format de réponse invalide : pas de tableau tags');
        return { tags: [], symptoms: [], confiance: 'faible' };
      }

      if (!parsed.symptoms || !Array.isArray(parsed.symptoms)) {
        console.warn('⚠️ Format de réponse invalide : pas de tableau symptoms');
        parsed.symptoms = [];
      }

      // Limitation à 8 tags max
      const tags = parsed.tags.slice(0, 8);

      // Validation des symptômes
      const symptoms = parsed.symptoms
        .filter(s => s.nom && typeof s.intensité === 'number')
        .map(s => ({
          nom: s.nom,
          intensité: Math.max(1, Math.min(5, Math.round(s.intensité))) // Clamp 1-5
        }));

      // Validation du niveau de confiance (mapper "basse" vers "faible" pour compatibilité)
      let confiance = parsed.confiance;
      if (confiance === 'basse') {
        confiance = 'faible';
      }
      if (!['haute', 'moyenne', 'faible'].includes(confiance)) {
        confiance = 'faible';
      }

      console.log(`✅ Analyse terminée: ${tags.length} tag(s), ${symptoms.length} symptôme(s) (confiance: ${confiance})`);
      if (symptoms.length > 0) {
        console.log('📊 Symptômes détectés:', symptoms.map(s => `${s.nom} (${s.intensité}/5)`).join(', '));
      }

      return { tags, symptoms, confiance };
    } catch (parseError) {
      console.error('❌ Erreur lors du parsing JSON:', parseError);
      console.error('Texte reçu:', generatedText);
      return { tags: [], symptoms: [], confiance: 'faible' };
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse AI:', error);

    // Gestion spécifique des erreurs
    if (error instanceof Error) {
      if (error.message.includes("model")) {
        console.error("Le modèle spécifié n'est pas disponible. Vérifiez le nom du modèle.");
      }
      if (error.message.includes("API key")) {
        console.error("Clé API invalide ou manquante.");
      }
    }

    // En cas d'erreur, retourner un résultat vide
    return { tags: [], symptoms: [], confiance: 'faible' };
  }
};

/**
 * Teste la connexion à l'API Gemini
 * @returns {Promise<boolean>} true si la connexion réussit
 */
export const testGeminiConnection = async () => {
  try {
    const result = await analyzeNoteWithAI('Test de connexion');
    return result !== null;
  } catch (error) {
    console.error('❌ Test de connexion Gemini échoué:', error);
    return false;
  }
};
