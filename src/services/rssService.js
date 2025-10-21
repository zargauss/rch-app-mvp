// Service pour récupérer les actualités RSS de l'AFA (Association François Aupetit)
// https://www.afa.asso.fr/feed

export const RSS_FEED_URL = 'https://www.afa.asso.fr/feed';

// Fonction pour parser le XML RSS et extraire les articles
export const parseRSSFeed = (xmlText) => {
  try {
    console.log('Parsing du flux RSS...');
    const items = [];
    
    // Extraire les balises <item>
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 3) {
      const itemContent = match[1];
      
      // Extraire le titre (gérer différents formats)
      let title = '';
      const titleMatch1 = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const titleMatch2 = itemContent.match(/<title>(.*?)<\/title>/);
      if (titleMatch1) {
        title = titleMatch1[1].trim();
      } else if (titleMatch2) {
        title = titleMatch2[1].trim();
      }
      
      // Extraire le lien
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
      const link = linkMatch ? linkMatch[1].trim() : '';
      
      // Extraire la date
      const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
      const pubDate = dateMatch ? dateMatch[1].trim() : '';
      
      // Extraire la description (gérer différents formats)
      let description = '';
      const descMatch1 = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
      const descMatch2 = itemContent.match(/<description>(.*?)<\/description>/);
      if (descMatch1) {
        description = descMatch1[1].trim();
      } else if (descMatch2) {
        description = descMatch2[1].trim();
      }
      
      if (title && link) {
        items.push({
          title,
          link,
          pubDate,
          description: description.substring(0, 150) + (description.length > 150 ? '...' : ''),
          formattedDate: formatRSSDate(pubDate)
        });
        console.log(`Article trouvé: ${title}`);
      }
    }
    
    console.log(`✅ ${items.length} articles parsés avec succès`);
    return items;
  } catch (error) {
    console.error('Erreur lors du parsing RSS:', error);
    return [];
  }
};

// Fonction pour formater la date RSS
const formatRSSDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  } catch (error) {
    return 'Date inconnue';
  }
};

// Fonction pour récupérer le flux RSS
export const fetchRSSFeed = async () => {
  try {
    // En mode web, essayer plusieurs proxies CORS
    if (typeof window !== 'undefined') {
      console.log('Tentative de récupération du flux RSS AFA...');
      
      // Liste de proxies CORS à essayer
      const proxies = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://thingproxy.freeboard.io/fetch/'
      ];
      
      for (let i = 0; i < proxies.length; i++) {
        try {
          console.log(`Tentative avec le proxy ${i + 1}/${proxies.length}...`);
          const proxyUrl = proxies[i] + encodeURIComponent(RSS_FEED_URL);
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json, text/plain, */*',
            },
            timeout: 10000 // 10 secondes timeout
          });
          
          if (response.ok) {
            let data;
            if (proxies[i].includes('allorigins')) {
              // Format allorigins
              data = await response.json();
              if (data.contents) {
                console.log('✅ Flux RSS récupéré avec succès via allorigins');
                return parseRSSFeed(data.contents);
              }
            } else {
              // Format direct
              const xmlText = await response.text();
              console.log('✅ Flux RSS récupéré avec succès via proxy direct');
              return parseRSSFeed(xmlText);
            }
          }
        } catch (proxyError) {
          console.warn(`❌ Proxy ${i + 1} échoué:`, proxyError.message);
          continue; // Essayer le proxy suivant
        }
      }
      
      console.warn('⚠️ Tous les proxies ont échoué, utilisation des données de fallback');
      return getMockRSSData();
    }
    
    // En mode React Native, utiliser une approche différente
    // Pour l'instant, retourner des données de test
    return getMockRSSData();
  } catch (error) {
    console.warn('Erreur lors de la récupération du RSS, utilisation des données de fallback:', error.message);
    return getMockRSSData();
  }
};

// Données de test basées sur le vrai flux RSS de l'AFA
const getMockRSSData = () => {
  return [
    {
      title: "Les 24h à vélo d'Axel pour soutenir l'afa Crohn RCH !",
      link: "https://www.afa.asso.fr/les-24h-a-velo-daxel-pour-soutenir-lafa-crohn-rch/",
      pubDate: "Mon, 20 Oct 2025 10:34:24 +0000",
      description: "Axel relève un défi sportif exceptionnel pour sensibiliser aux MICI et soutenir la recherche...",
      formattedDate: "Il y a 2 jours"
    },
    {
      title: "Nouvelle rencontre conviviale à Chatel Guyon",
      link: "https://www.afa.asso.fr/nouvelle-rencontre-conviviale-a-chatel-guyon/",
      pubDate: "Tue, 14 Oct 2025 08:23:20 +0000",
      description: "L'AFA organise une nouvelle rencontre entre patients et familles pour échanger sur la vie avec les MICI...",
      formattedDate: "Il y a 8 jours"
    },
    {
      title: "À deux, on va plus loin : Charlotte et Elise relèvent le défi pour la recherche MICI",
      link: "https://www.afa.asso.fr/les-jumelles-relevent-le-defi-pour-la-recherche-mici/",
      pubDate: "Fri, 10 Oct 2025 13:17:36 +0000",
      description: "Les jumelles Charlotte et Elise s'engagent ensemble pour soutenir la recherche sur les MICI...",
      formattedDate: "Il y a 12 jours"
    }
  ];
};
