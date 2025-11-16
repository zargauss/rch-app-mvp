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
  return `Tu es un assistant médical spécialisé dans l'analyse des facteurs déclencheurs de MICI (Crohn, RCH).

Analyse cette note patient et extrais UNIQUEMENT des tags courts (1-3 mots max) qui pourraient influencer les symptômes digestifs.

Catégories à analyser :
- ALIMENTATION : type d'aliment, mode de cuisson, quantité (ex: "produits laitiers", "friture", "repas copieux", "alcool", "café", "épices")
- STRESS : événements, émotions (ex: "stress travail", "anxiété", "conflit", "deadline")
- SOMMEIL : qualité, durée (ex: "insomnie", "nuit courte", "sommeil agité")
- MÉDICAMENTS : prise, oubli (ex: "antibiotique", "AINS", "oubli traitement")
- ACTIVITÉ : sport, effort (ex: "sport intense", "sédentarité", "marche")
- ENVIRONNEMENT : météo, voyage (ex: "canicule", "voyage", "restaurant")
- SYMPTÔMES ASSOCIÉS : autres signes (ex: "fatigue", "fièvre", "douleur articulaire")

Note patient : "${noteContent}"

Retourne UNIQUEMENT un JSON avec les tags pertinents :
{
  "tags": ["tag1", "tag2", "tag3"],
  "confiance": "haute|moyenne|faible"
}

Règles :
- Maximum 8 tags par note
- Prioriser les facteurs connus pour impacter les MICI
- Ignorer le banal (ex: "eau", "respiration")
- Si rien de pertinent : {"tags": [], "confiance": "faible"}`;
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
    console.log('🌐 Appel à Gemini avec le modèle: gemini-2.0-flash-exp');

    // Appel à l'API Gemini avec le SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
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
              enum: ["haute", "moyenne", "faible"]
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

      // Validation du niveau de confiance
      const confiance = ['haute', 'moyenne', 'faible'].includes(parsed.confiance)
        ? parsed.confiance
        : 'faible';

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
