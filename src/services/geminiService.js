// Service pour l'analyse de notes avec Google Gemini API
// Extraction de tags pertinents pour l'analyse des facteurs déclencheurs de MICI

const GEMINI_API_KEY = 'AIzaSyCYTGrCIfRu0PPj-U0_PBwZ8deo_wZyNJ0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

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
 * Parse la réponse de l'API Gemini pour extraire le JSON
 * @param {string} responseText - Texte de réponse de l'API
 * @returns {Object|null} Objet parsé avec tags et confiance, ou null si erreur
 */
const parseGeminiResponse = (responseText) => {
  try {
    // La réponse peut contenir du markdown avec des backticks
    // On cherche le JSON entre ```json et ``` ou directement le JSON
    let jsonText = responseText;

    // Retirer les backticks markdown si présents
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      // Chercher le premier objet JSON dans la réponse
      const directJsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (directJsonMatch) {
        jsonText = directJsonMatch[0];
      }
    }

    const parsed = JSON.parse(jsonText.trim());

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

    return { tags, confiance };
  } catch (error) {
    console.error('❌ Erreur lors du parsing de la réponse Gemini:', error);
    return null;
  }
};

/**
 * Analyse une note avec l'API Gemini pour extraire les tags
 * @param {string} noteContent - Le contenu de la note à analyser
 * @returns {Promise<{tags: string[], confiance: string}>} Résultat de l'analyse
 */
export const analyzeNoteWithAI = async (noteContent) => {
  try {
    console.log('🤖 Envoi de la note à Gemini pour analyse...');

    // Vérification que la note n'est pas vide
    if (!noteContent || noteContent.trim().length === 0) {
      console.warn('⚠️ Note vide, aucune analyse effectuée');
      return { tags: [], confiance: 'faible' };
    }

    // Préparation du prompt
    const prompt = generateMedicalPrompt(noteContent);

    // Configuration du timeout (15 secondes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // Appel à l'API Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3, // Plus conservateur pour des réponses médicales cohérentes
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API Gemini:', response.status, errorText);
      throw new Error(`Erreur API Gemini: ${response.status}`);
    }

    // Récupération de la réponse
    const data = await response.json();

    // Extraction du texte généré
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('❌ Pas de texte généré par Gemini');
      return { tags: [], confiance: 'faible' };
    }

    console.log('📝 Réponse brute Gemini:', generatedText);

    // Parsing de la réponse
    const parsed = parseGeminiResponse(generatedText);

    if (!parsed) {
      return { tags: [], confiance: 'faible' };
    }

    console.log(`✅ Analyse terminée: ${parsed.tags.length} tag(s) extrait(s) (confiance: ${parsed.confiance})`);
    return parsed;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('⏱️ Timeout lors de l\'appel à Gemini (15s)');
    } else {
      console.error('❌ Erreur lors de l\'analyse AI:', error);
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
