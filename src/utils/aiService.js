// Service IA utilisant Google Gemini API
// Documentation: https://ai.google.dev/docs

const GOOGLE_AI_API_KEY = 'YOUR_API_KEY_HERE'; // À remplacer par votre clé API
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Sources médicales officielles sur la RCH
const RCH_MEDICAL_SOURCES = `
SOURCES MÉDICALES OFFICIELLES - RECTCOLITE HÉMORRAGIQUE (RCH)

1. DÉFINITION ET ÉPIDÉMIOLOGIE:
- La Rectocolite Hémorragique (RCH) est une maladie inflammatoire chronique de l'intestin (MICI)
- Elle touche uniquement le côlon et le rectum
- Prévalence: 1-2 cas pour 1000 habitants en France
- Pic d'incidence entre 20-40 ans
- Légère prédominance féminine

2. SYMPTÔMES PRINCIPAUX:
- Diarrhée chronique (plus de 4 semaines)
- Selles sanglantes (rectorragies)
- Douleurs abdominales
- Urgences défécatoires
- Fatigue et perte de poids
- Fièvre lors des poussées

3. DIAGNOSTIC:
- Coloscopie avec biopsies (examen de référence)
- Examens biologiques (VS, CRP, calprotectine fécale)
- Score de Lichtiger pour évaluer la sévérité
- Exclusion des autres causes (infections, maladie de Crohn)

4. TRAITEMENTS:
- Aminosalicylés (5-ASA): traitement de première ligne
- Corticostéroïdes: lors des poussées
- Immunosuppresseurs: azathioprine, méthotrexate
- Biothérapies: anti-TNF, anti-intégrines
- Chirurgie: colectomie totale en cas d'échec médical

5. SURVEILLANCE:
- Coloscopie de surveillance tous les 1-3 ans
- Dosage de la calprotectine fécale
- Surveillance des effets secondaires des traitements
- Dépistage du cancer colorectal

6. COMPLICATIONS:
- Mégacôlon toxique (urgence chirurgicale)
- Perforation colique
- Hémorragie digestive sévère
- Cancer colorectal (risque augmenté)
- Ostéoporose (corticostéroïdes)

7. FACTEURS DÉCLENCHANTS:
- Stress psychologique
- Infections
- Arrêt brutal des traitements
- Certains médicaments (AINS)
- Tabagisme (facteur protecteur paradoxal)

8. CONSEILS AUX PATIENTS:
- Respecter scrupuleusement les traitements
- Éviter l'automédication
- Maintenir une alimentation équilibrée
- Gérer le stress
- Consulter rapidement en cas de poussée
- Arrêter le tabac progressivement

IMPORTANT: Ces informations sont basées sur les recommandations médicales officielles. 
Toute question médicale spécifique doit être discutée avec le médecin traitant.
`;

export const sendMessageToAI = async (userMessage) => {
  try {
    // Récupérer la clé API stockée
    const apiKey = getGoogleAIAPIKey();
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error('Clé API Google AI non configurée');
    }

    // Construire le prompt avec les sources médicales
    const prompt = `
Tu es un assistant IA spécialisé dans la Rectocolite Hémorragique (RCH). 
Tu dois répondre UNIQUEMENT en te basant sur les sources médicales officielles fournies ci-dessous.

SOURCES MÉDICALES:
${RCH_MEDICAL_SOURCES}

QUESTION DU PATIENT: ${userMessage}

INSTRUCTIONS:
1. Réponds UNIQUEMENT en te basant sur les sources médicales ci-dessus
2. Si la question n'est pas couverte par ces sources, dis-le clairement
3. Utilise un langage simple et accessible
4. Rappelle toujours de consulter un médecin pour les questions spécifiques
5. Ne donne JAMAIS de conseils médicaux personnalisés
6. Limite ta réponse à 300 mots maximum
7. Réponds en français

RÉPONSE:
`;

    const response = await fetch(`${GOOGLE_AI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 400,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Réponse IA invalide');
    }

  } catch (error) {
    console.error('Erreur service IA:', error);
    
    // Réponses de fallback basées sur les sources
    const fallbackResponses = {
      'symptômes': 'Les principaux symptômes de la RCH sont la diarrhée chronique, les selles sanglantes, les douleurs abdominales et les urgences défécatoires. En cas de symptômes préoccupants, consultez votre médecin.',
      'traitement': 'Les traitements de la RCH incluent les aminosalicylés (5-ASA), les corticostéroïdes lors des poussées, et les immunosuppresseurs. Le choix dépend de la sévérité et doit être discuté avec votre gastro-entérologue.',
      'alimentation': 'Il est recommandé de maintenir une alimentation équilibrée et d\'éviter les aliments qui aggravent vos symptômes. Consultez un diététicien spécialisé en MICI pour des conseils personnalisés.',
      'stress': 'Le stress peut déclencher des poussées de RCH. Il est important de gérer le stress par des techniques de relaxation, du sport adapté, ou un suivi psychologique si nécessaire.'
    };

    // Recherche de mots-clés dans la question
    const lowerMessage = userMessage.toLowerCase();
    for (const [keyword, response] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    return 'Désolé, je rencontre un problème technique. Veuillez réessayer ou consulter votre médecin pour des questions spécifiques.';
  }
};

// Fonction pour configurer l'API key
export const setGoogleAIAPIKey = (apiKey) => {
  // En production, cette clé devrait être stockée de manière sécurisée
  // Pour le développement, on peut la stocker dans le localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('google_ai_api_key', apiKey);
  }
};

// Fonction pour récupérer l'API key
export const getGoogleAIAPIKey = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('google_ai_api_key') || GOOGLE_AI_API_KEY;
  }
  return GOOGLE_AI_API_KEY;
};
