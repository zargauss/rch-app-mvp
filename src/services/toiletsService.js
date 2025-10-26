// Service pour récupérer les toilettes publiques via l'API Etalab
// https://public.api.data.gouv.fr/api/v2/catalog/datasets/wc-publics/records

export const TOILETS_API_URL = 'https://public.api.data.gouv.fr/api/v2/catalog/datasets/wc-publics/records';

/**
 * Récupère les toilettes publiques dans un rayon donné autour d'une position
 * @param {number} latitude - Latitude de la position de l'utilisateur
 * @param {number} longitude - Longitude de la position de l'utilisateur
 * @param {number} radius - Rayon de recherche en mètres (défaut: 1000m)
 * @param {number} limit - Nombre maximum de résultats (défaut: 25)
 * @returns {Promise<Array>} Liste des toilettes trouvées
 */
export const fetchNearbyToilets = async (latitude, longitude, radius = 1000, limit = 25) => {
  console.log('🔍 Recherche des toilettes publiques...', { latitude, longitude, radius });
  
  // Stratégie: essayer data.gouv.fr en premier (données françaises), puis Overpass, puis mock
  
  // 1. Essayer l'API publique data.gouv.fr avec recherche géolocalisée
  try {
    console.log('🔄 Tentative 1: API data.gouv.fr (toilettes publiques)...');
    
    // Utiliser l'API OpenDataSoft qui agrège plusieurs sources
    const dataGouvUrl = `https://data.opendatasoft.com/api/explore/v2.1/catalog/datasets/toilettes-publiques@datailedefrance/records?where=distance(geo_point_2d, geom'POINT(${longitude} ${latitude})', ${radius}m)&limit=${limit}`;
    
    console.log('🌐 URL data.gouv:', dataGouvUrl);
    
    try {
      const response = await fetch(dataGouvUrl, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 data.gouv.fr réponse:', data);
        console.log('📊 Nombre de résultats:', data.results ? data.results.length : 0);
        
        if (data.results && data.results.length > 0) {
          const toilets = data.results.map((record, index) => {
            const coords = record.geo_point_2d || {};
            return {
              id: record.recordid || `toilet-${index}`,
              name: record.nom || record.adresse || 'Toilette publique',
              address: record.adresse || record.voie || 'Adresse non disponible',
              openingHours: record.horaire || record.horaires || 'Horaires non disponibles',
              pmrAccess: record.acces_pmr === 'Oui' || record.pmr === 'true' ? 'Accessible PMR' : 'Information non disponible',
              latitude: coords.lat,
              longitude: coords.lon,
              type: record.type || 'Public',
              free: record.acces === 'Gratuit' || record.gratuit !== 'non',
              babyChanging: record.relais_bebe === 'Oui' ? 'Table à langer disponible' : 'Information non disponible'
            };
          }).filter(t => t.latitude && t.longitude);
          
          if (toilets.length > 0) {
            console.log(`✅ ${toilets.length} toilettes trouvées via data.gouv.fr`);
            return toilets;
          }
        }
      } else {
        console.log('⚠️ data.gouv.fr HTTP:', response.status);
      }
    } catch (error) {
      console.log('⚠️ API data.gouv.fr échouée:', error.message);
    }
  } catch (error) {
    console.log('⚠️ Erreur data.gouv.fr:', error.message);
  }
  
  // 2. Essayer l'API Overpass d'OpenStreetMap
  try {
    console.log('🔄 Tentative 2: API Overpass OpenStreetMap...');
    return await fetchOverpassAPI(latitude, longitude, radius, limit);
  } catch (error) {
    console.log('⚠️ API Overpass échouée:', error.message);
  }
  
  // 3. Utiliser les données de test en dernier recours
  console.error('❌ Toutes les API ont échoué');
  console.log('🔄 Utilisation des données de test en fallback...');
  return getMockToilets();
};

// Parser la réponse de l'API Etalab
const parseEtalabResponse = (data) => {
  if (!data.records || !Array.isArray(data.records)) {
    throw new Error('Format de réponse API invalide');
  }
  
  const toilets = data.records.map((record, index) => {
    const fields = record.fields || {};
    const geometry = fields.geo_shape || fields.geo_point_2d || {};
    
    return {
      id: record.recordid || `toilet-${index}`,
      name: fields.nom || fields.name || 'Toilettes publiques',
      address: fields.adresse || fields.address || 'Adresse non disponible',
      openingHours: fields.horaires || fields.opening_hours || 'Horaires non disponibles',
      pmrAccess: fields.pmr || fields.accessibility || 'Information non disponible',
      latitude: geometry.coordinates ? geometry.coordinates[1] : fields.latitude,
      longitude: geometry.coordinates ? geometry.coordinates[0] : fields.longitude,
      type: fields.type || 'Public',
      free: fields.gratuit !== false,
      babyChanging: fields.table_langer || 'Non disponible'
    };
  }).filter(toilet => toilet.latitude && toilet.longitude);
  
  console.log(`✅ ${toilets.length} toilettes parsées depuis l'API Etalab`);
  return toilets;
};

// Fonction principale pour récupérer les toilettes via Overpass
const fetchOverpassAPI = async (latitude, longitude, radius, limit) => {
  console.log('🔄 Tentative avec API Overpass OpenStreetMap...');
  
  // Utiliser un rayon raisonnable (1500m par défaut)
  const searchRadius = Math.max(radius, 1500);
  
  // Requête Overpass QL correcte
  // [out:json] pour obtenir la réponse en JSON
  // ( ... ); pour chercher tous les types d'éléments
  // out center; pour obtenir uniquement le centre des ways/relations (plus efficace)
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="toilets"](around:${searchRadius},${latitude},${longitude});
      way["amenity"="toilets"](around:${searchRadius},${latitude},${longitude});
      relation["amenity"="toilets"](around:${searchRadius},${latitude},${longitude});
    );
    out center;
  `;
  
  console.log('📍 Recherche avec rayon:', searchRadius, 'm');
  console.log('🌐 Requête Overpass:', overpassQuery.trim());
  
  try {
    console.log('🔄 Requête POST vers Overpass API...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    // IMPORTANT: Utiliser POST avec la requête en body (pas en query string)
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('📡 Réponse Overpass:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 Données reçues d\'Overpass:', data);
    console.log('📊 Nombre d\'éléments bruts:', data.elements ? data.elements.length : 0);
    
    if (!data.elements || data.elements.length === 0) {
      console.log('⚠️ Aucune toilette trouvée dans un rayon de', searchRadius, 'm');
      throw new Error('Aucune toilette trouvée dans la zone');
    }
    
    const toilets = parseOverpassResponse(data, latitude, longitude);
    console.log('✅', toilets.length, 'toilettes parsées avec succès');
    
    return toilets;
    
  } catch (error) {
    console.log(`❌ API Overpass échouée:`, error.message);
    
    if (error.name === 'AbortError') {
      console.log('⏱️ Timeout de 20 secondes dépassé');
    }
    
    throw error;
  }
};

// Parser la réponse Overpass
const parseOverpassResponse = (data, userLat, userLon) => {
  console.log('🔍 Parsing des données Overpass...');
  
  if (!data.elements || !Array.isArray(data.elements)) {
    console.log('⚠️ Aucun élément trouvé dans la réponse Overpass');
    return [];
  }
  
  const toilets = data.elements.map((element, index) => {
    // Les 'nodes' ont lat/lon directement
    // Pour 'way' et 'relation' avec "out center;", on récupère le centre
    const lat = element.type === 'node' ? element.lat : element.center?.lat;
    const lon = element.type === 'node' ? element.lon : element.center?.lon;
    
    if (!lat || !lon) {
      console.log(`⚠️ Élément ${index} (type: ${element.type}) sans coordonnées valides`);
      return null;
    }
    
    const tags = element.tags || {};
    
    const toilet = {
      id: element.id || `osm-${element.type}-${index}`,
      name: tags.name || tags.brand || tags.operator || 'Toilettes publiques',
      address: buildAddress(tags),
      openingHours: tags.opening_hours || tags['opening_hours:covid19'] || 'Horaires non disponibles',
      pmrAccess: tags.wheelchair === 'yes' ? 'Accessible PMR' : 
                 tags.wheelchair === 'no' ? 'Non accessible PMR' : 
                 tags['toilets:wheelchair'] === 'yes' ? 'Accessible PMR' : 'Information non disponible',
      latitude: lat,
      longitude: lon,
      type: tags.operator || tags.access || 'Public',
      free: tags.fee === 'no' || !tags.fee,
      babyChanging: tags.changing_table === 'yes' || tags['changing_table:count'] ? 'Table à langer disponible' : 
                    tags.changing_table === 'no' ? 'Non disponible' : 'Information non disponible'
    };
    
    console.log(`✓ Toilette ${index + 1}:`, toilet.name, `(${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    return toilet;
  }).filter(toilet => toilet !== null);
  
  // Trier par distance de l'utilisateur
  const toiletsWithDistance = toilets.map(toilet => ({
    ...toilet,
    distance: calculateDistance(userLat, userLon, toilet.latitude, toilet.longitude)
  }));
  
  toiletsWithDistance.sort((a, b) => a.distance - b.distance);
  
  // Limiter à 25 résultats max
  const limitedToilets = toiletsWithDistance.slice(0, 25);
  
  console.log(`✅ ${limitedToilets.length} toilettes parsées et triées par distance`);
  return limitedToilets;
};

// Construire une adresse à partir des tags OSM
const buildAddress = (tags) => {
  const parts = [];
  
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
  
  if (parts.length > 0) {
    return parts.join(' ');
  }
  
  // Fallback avec d'autres tags
  if (tags['addr:full']) return tags['addr:full'];
  if (tags.address) return tags.address;
  
  return 'Adresse non disponible';
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
    distance: calculateDistance(userLat, userLon, toilet.latitude, toilet.longitude)
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
      address: 'Place de la République, 75011 Paris',
      openingHours: '7h-22h',
      pmrAccess: 'Accessible PMR',
      latitude: 48.8676,
      longitude: 2.3631,
      type: 'Municipal',
      free: true,
      babyChanging: 'Table à langer disponible'
    },
    {
      id: 'mock-2',
      name: 'Sanisette automatique',
      address: 'Rue de Rivoli, 75001 Paris',
      openingHours: 'Ouvert 24h/24',
      pmrAccess: 'Accessible PMR',
      latitude: 48.8566,
      longitude: 2.3522,
      type: 'Automatique',
      free: true,
      babyChanging: 'Non disponible'
    },
    {
      id: 'mock-3',
      name: 'Toilettes de gare',
      address: 'Gare du Nord, 75010 Paris',
      openingHours: '6h-23h',
      pmrAccess: 'Accessible PMR',
      latitude: 48.8808,
      longitude: 2.3553,
      type: 'Transport',
      free: true,
      babyChanging: 'Table à langer disponible'
    }
  ];
};