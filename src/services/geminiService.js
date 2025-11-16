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

MISSION : Extraire les facteurs de risque alimentaires et comportementaux à partir de notes de patients atteints de RCH.

RÈGLE FONDAMENTALE : Ne tagge JAMAIS les noms de plats ou recettes. Identifie uniquement les COMPOSANTS ou CARACTÉRISTIQUES du plat qui sont des facteurs de risque connus pour les MICI.

FACTEURS À EXTRAIRE (max 8 tags) :

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

EXCLUSIONS STRICTES :
- Noms de plats (bourguignon, tajine, carbonara, etc.)
- Noms de restaurants
- Aliments neutres (riz blanc, pâtes, pain blanc, poisson blanc, poulet)
- Émotions positives sans stress ("content", "heureux")
- Activités routinières

LOGIQUE D'EXTRACTION :
1. Si un plat est mentionné, décompose-le mentalement en ingrédients
2. Ne garde que les ingrédients/modes de préparation qui sont des facteurs de risque MICI
3. Maximum 3 tags alimentaires par repas mentionné
4. Si rien de problématique n'est identifiable, ne tagge pas

FORMAT DE SORTIE (JSON strict) :
{
  "tags": ["tag1", "tag2"],
  "confiance": "haute|moyenne|basse"
}

Mets "confiance: basse" si la note est vague ou si tu dois inférer fortement.

EXEMPLES :

Note : "Bœuf bourguignon ce soir avec du pain"
Réponse : {
  "tags": ["viande-rouge"],
  "confiance": "haute"
}
Explication : Le bourguignon contient du bœuf (viande rouge, facteur inflammatoire). Le vin dans la sauce est cuit donc négligeable. Pain = neutre.

Note : "McDo ce midi, Big Mac frites"
Réponse : {
  "tags": ["fast-food", "fritures", "graisses-saturées"],
  "confiance": "haute"
}

Note : "Salade césar au restaurant"
Réponse : {
  "tags": ["fibres-crues", "graisses-saturées"],
  "confiance": "haute"
}
Explication : Salade = crudités. Sauce césar = graisses saturées (parmesan, crème).

Note : "Pizza 4 fromages avec les collègues, 2 bières"
Réponse : {
  "tags": ["produits-laitiers", "graisses-saturées", "alcool-modéré"],
  "confiance": "haute"
}

Note : "Poisson grillé et riz, eau plate"
Réponse : {
  "tags": [],
  "confiance": "haute"
}
Explication : Aucun facteur de risque identifié.

Note : "Resto japonais, super soirée"
Réponse : {
  "tags": [],
  "confiance": "basse"
}
Explication : Pas assez de détails sur ce qui a été mangé. Japonais peut être sushi (cru mais poisson blanc généralement OK) ou tempura (fritures). Trop vague.

Note : "Grosse journée de boulot, dead. Pas eu le temps de manger à midi, sandwich jambon beurre vite fait"
Réponse : {
  "tags": ["stress-travail", "charcuterie", "graisses-saturées"],
  "confiance": "haute"
}

Analyse maintenant cette note :

"${noteContent}"`;
};

/**
 * Analyse une note avec l'API Gemini pour extraire les tags
 * @param {string} noteContent - Le contenu de la note à analyser
 * @returns {Promise<{tags: string[], confiance: string}>} Résultat de l'analyse
 */
export const analyzeNoteWithAI = async (noteContent) => {
  try {
    console.log('🤖 Envoi de la note à Gemini pour analyse...');
    console.log('📝 Contenu de la note:', noteContent);

    // Vérification que la note n'est pas vide
    if (!noteContent || noteContent.trim().length === 0) {
      console.warn('⚠️ Note vide, aucune analyse effectuée');
      return { tags: [], confiance: 'faible' };
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
            confiance: {
              type: Type.STRING,
              enum: ["haute", "moyenne", "basse"]
            }
          },
          required: ["tags", "confiance"]
        },
        temperature: 0.3, // Plus conservateur pour des réponses médicales cohérentes
      }
    });

    console.log('✅ Réponse reçue de Gemini');

    // Extraction du texte généré
    const generatedText = response.text;

    if (!generatedText) {
      console.error('❌ Pas de texte généré par Gemini');
      return { tags: [], confiance: 'faible' };
    }

    console.log('📝 Réponse brute Gemini:', generatedText);

    // Parsing de la réponse JSON
    try {
      const jsonText = generatedText.trim();
      const parsed = JSON.parse(jsonText);

      // Validation de la structure
      if (!parsed.tags || !Array.isArray(parsed.tags)) {
        console.warn('⚠️ Format de réponse invalide : pas de tableau tags');
        return { tags: [], confiance: 'faible' };
      }

      // Limitation à 8 tags max
      const tags = parsed.tags.slice(0, 8);

      // Validation du niveau de confiance (mapper "basse" vers "faible" pour compatibilité)
      let confiance = parsed.confiance;
      if (confiance === 'basse') {
        confiance = 'faible';
      }
      if (!['haute', 'moyenne', 'faible'].includes(confiance)) {
        confiance = 'faible';
      }

      console.log(`✅ Analyse terminée: ${tags.length} tag(s) extrait(s) (confiance: ${confiance})`);

      return { tags, confiance };
    } catch (parseError) {
      console.error('❌ Erreur lors du parsing JSON:', parseError);
      console.error('Texte reçu:', generatedText);
      return { tags: [], confiance: 'faible' };
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
    return { tags: [], confiance: 'faible' };
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
