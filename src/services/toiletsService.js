// Service pour récupérer les toilettes publiques via l'API Etalab
// https://public.api.data.gouv.fr/api/v2/catalog/datasets/wc-publics/records

export const TOILETS_API_URL = 'https://public.api.data.gouv.fr/api/v2/catalog/datasets/wc-publics/records';

/**
 * Récupère les toilettes publiques dans un rayon donné autour d'une position
 * @param {number} latitude - Latitude de la position de l'utilisateur
 * @param {number} longitude - Longitude de la position de l'utilisateur
 * @param {number} radius - Rayon de recherche en mètres (défaut: 1000m)
 * @param {number} limit - Nombre maximum de résultats (défaut: 20)
 * @returns {Promise<Array>} Liste des toilettes trouvées
 */
export const fetchNearbyToilets = async (latitude, longitude, radius = 1000, limit = 20) => {
  try {
    console.log('🔍 Recherche des toilettes publiques...', { latitude, longitude, radius });
    
    // Utiliser un proxy CORS pour éviter les erreurs de domaine
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${TOILETS_API_URL}?geofilter.distance=${latitude},${longitude},${radius}&limit=${limit}`)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 Données toilettes reçues:', data);
    
    if (!data.records || !Array.isArray(data.records)) {
      console.warn('⚠️ Format de données inattendu:', data);
      return [];
    }
    
    // Transformer les données pour notre usage
    const toilets = data.records.map(record => {
      const fields = record.fields;
      const coords = fields.geo_point_2d;
      
      if (!coords || !Array.isArray(coords) || coords.length !== 2) {
        console.warn('⚠️ Coordonnées manquantes pour:', fields.nom_etablissement);
        return null;
      }
      
      return {
        id: record.recordid || `toilet-${Date.now()}-${Math.random()}`,
        name: fields.nom_etablissement || 'Toilette publique',
        address: fields.adresse || 'Adresse non disponible',
        hours: fields.horaires || 'Horaires non disponibles',
        pmrAccess: fields.acces_pmr || 'Information non disponible',
        coordinates: {
          latitude: coords[0],
          longitude: coords[1]
        },
        // Informations supplémentaires si disponibles
        type: fields.type || 'Public',
        free: fields.gratuit !== false, // Par défaut gratuit
        babyChanging: fields.changement_bebe || 'Information non disponible'
      };
    }).filter(toilet => toilet !== null);
    
    console.log(`🚽 ${toilets.length} toilettes trouvées`);
    return toilets;
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des toilettes:', error);
    throw new Error(`Impossible de récupérer les toilettes: ${error.message}`);
  }
};

/**
 * Calcule la distance entre deux points géographiques (formule de Haversine)
 * @param {number} lat1 - Latitude du premier point
 * @param {number} lon1 - Longitude du premier point
 * @param {number} lat2 - Latitude du deuxième point
 * @param {number} lon2 - Longitude du deuxième point
 * @returns {number} Distance en mètres
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Trie les toilettes par distance par rapport à la position de l'utilisateur
 * @param {Array} toilets - Liste des toilettes
 * @param {number} userLat - Latitude de l'utilisateur
 * @param {number} userLon - Longitude de l'utilisateur
 * @returns {Array} Liste des toilettes triée par distance
 */
export const sortToiletsByDistance = (toilets, userLat, userLon) => {
  return toilets.map(toilet => ({
    ...toilet,
    distance: calculateDistance(userLat, userLon, toilet.coordinates.latitude, toilet.coordinates.longitude)
  })).sort((a, b) => a.distance - b.distance);
};

/**
 * Formate la distance pour l'affichage
 * @param {number} distance - Distance en mètres
 * @returns {string} Distance formatée
 */
export const formatDistance = (distance) => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

/**
 * Génère une URL de navigation vers une toilette
 * @param {number} userLat - Latitude de l'utilisateur
 * @param {number} userLon - Longitude de l'utilisateur
 * @param {number} toiletLat - Latitude de la toilette
 * @param {number} toiletLon - Longitude de la toilette
 * @returns {string} URL de navigation Google Maps
 */
export const generateNavigationUrl = (userLat, userLon, toiletLat, toiletLon) => {
  return `https://www.google.com/maps/dir/${userLat},${userLon}/${toiletLat},${toiletLon}`;
};

/**
 * Données de test pour le développement
 * @returns {Array} Liste de toilettes fictives
 */
export const getMockToilets = () => {
  return [
    {
      id: 'mock-1',
      name: 'Toilettes publiques - Place de la République',
      address: 'Place de la République, 75003 Paris',
      hours: 'Ouvert 24h/24',
      pmrAccess: 'Accessible PMR',
      coordinates: {
        latitude: 48.8676,
        longitude: 2.3631
      },
      type: 'Public',
      free: true,
      babyChanging: 'Table à langer disponible',
      distance: 150
    },
    {
      id: 'mock-2',
      name: 'Sanisette automatique',
      address: 'Rue de Rivoli, 75001 Paris',
      hours: 'Ouvert 24h/24',
      pmrAccess: 'Accessible PMR',
      coordinates: {
        latitude: 48.8566,
        longitude: 2.3522
      },
      type: 'Automatique',
      free: true,
      babyChanging: 'Non disponible',
      distance: 300
    },
    {
      id: 'mock-3',
      name: 'Toilettes municipales',
      address: 'Boulevard Saint-Germain, 75005 Paris',
      hours: '7h-22h',
      pmrAccess: 'Accessible PMR',
      coordinates: {
        latitude: 48.8500,
        longitude: 2.3400
      },
      type: 'Municipal',
      free: true,
      babyChanging: 'Table à langer disponible',
      distance: 450
    }
  ];
};
