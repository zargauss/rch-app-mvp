import React, { useEffect, useRef } from 'react';
import { Platform, View, StyleSheet, Dimensions } from 'react-native';
import WebView from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const SimpleMapComponent = ({ 
  userLocation, 
  toilets, 
  onToiletSelect, 
  onNavigate,
  onMapMove
}) => {
  const mapRef = useRef(null);
  const leafletLoaded = useRef(false);
  const lastCenter = useRef(null);
  const lastZoom = useRef(null);

  // Fonction pour charger Leaflet.js dynamiquement
  const loadLeaflet = () => {
    return new Promise((resolve) => {
      if (window.L) {
        resolve();
        return;
      }

      // Charger CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Charger JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        leafletLoaded.current = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  };

  // Fonction pour créer la carte Leaflet
  const createLeafletMap = async () => {
    if (!leafletLoaded.current) {
      await loadLeaflet();
    }

    if (!window.L || !mapRef.current) return;

    // Nettoyer la carte existante
    if (window.mapInstance) {
      window.mapInstance.remove();
    }

    console.log('🗺️ Création de la carte Leaflet avec:', { userLocation, toiletsCount: toilets.length });

    // Créer la carte
    const map = window.L.map(mapRef.current).setView(
      [userLocation.latitude, userLocation.longitude], 
      15
    );

    // Ajouter les tuiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Marqueur utilisateur
    const userIcon = window.L.divIcon({
      className: 'user-marker',
      html: '<div style="background: #007AFF; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    window.L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .addTo(map)
      .bindPopup('Votre position');

    console.log('✅ Marqueur utilisateur ajouté');

    // Marqueurs toilettes
    toilets.forEach((toilet, index) => {
      console.log(`🚽 Ajout marqueur toilette ${index + 1}:`, toilet.name, toilet.latitude, toilet.longitude);
      
      const toiletIcon = window.L.divIcon({
        className: 'toilet-marker',
        html: `<div style="background: #FF3B30; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = window.L.marker([toilet.latitude, toilet.longitude], { icon: toiletIcon })
        .addTo(map);

      // Popup avec bouton de navigation
      const popupContent = `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${toilet.name}</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${toilet.address}</p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #888;">🕒 ${toilet.openingHours}</p>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: #888;">♿ ${toilet.pmrAccess}</p>
          <button 
            onclick="navigateToToilet(${index})"
            style="
              background: #007AFF; 
              color: white; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 6px; 
              font-size: 14px; 
              cursor: pointer;
              width: 100%;
            "
          >
            Guide moi vers mon trône
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Gérer le clic sur le marqueur
      marker.on('click', () => {
        console.log('🚽 Toilette sélectionnée:', toilet.name);
        if (onToiletSelect) {
          onToiletSelect(toilet);
        }
      });
    });

    // Fonction globale pour la navigation
    window.navigateToToilet = (toiletIndex) => {
      const toilet = toilets[toiletIndex];
      console.log('🧭 Navigation vers toilette:', toilet.name);
      if (onNavigate) {
        onNavigate(toilet);
      }
    };

    // Détecter les changements de position et zoom
    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      // Vérifier si la position ou le zoom ont changé significativement
      if (!lastCenter.current || 
          Math.abs(center.lat - lastCenter.current.lat) > 0.001 ||
          Math.abs(center.lng - lastCenter.current.lng) > 0.001 ||
          Math.abs(zoom - lastZoom.current) > 1) {
        
        console.log('🗺️ Mouvement de carte détecté:', { center, zoom });
        lastCenter.current = { lat: center.lat, lng: center.lng };
        lastZoom.current = zoom;
        
        if (onMapMove) {
          onMapMove(center.lat, center.lng, zoom);
        }
      }
    });

    window.mapInstance = map;
    console.log('✅ Carte Leaflet créée avec succès');
  };

  useEffect(() => {
    if (Platform.OS === 'web' && userLocation && toilets.length > 0) {
      // Ne recréer la carte que si elle n'existe pas encore
      if (!window.mapInstance) {
        createLeafletMap();
      } else {
        // Si la carte existe déjà, mettre à jour uniquement les marqueurs
        updateMapMarkers();
      }
    }
  }, [userLocation, toilets]);

  // Fonction pour mettre à jour les marqueurs sans recréer la carte
  const updateMapMarkers = () => {
    if (!window.mapInstance || !window.L) return;

    const map = window.mapInstance;

    // Supprimer tous les marqueurs existants sauf l'utilisateur
    map.eachLayer((layer) => {
      if (layer instanceof window.L.Marker && layer !== window.userMarker) {
        map.removeLayer(layer);
      }
    });

    // Réajouter les marqueurs de toilettes
    toilets.forEach((toilet, index) => {
      const toiletIcon = window.L.divIcon({
        className: 'toilet-marker',
        html: '<div style="background: #8B4513; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🚻</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = window.L.marker([toilet.latitude, toilet.longitude], { icon: toiletIcon })
        .addTo(map);

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${toilet.name}</h3>
          <p style="margin: 4px 0; font-size: 13px; color: #666;">📍 ${toilet.address}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #666;">🕒 ${toilet.openingHours}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #666;">♿ ${toilet.pmrAccess}</p>
          <button 
            onclick="window.navigateToToilet(${index})" 
            style="
              width: 100%; 
              margin-top: 8px; 
              padding: 10px; 
              background: #007AFF; 
              color: white; 
              border: none; 
              border-radius: 8px; 
              font-size: 14px; 
              font-weight: 600;
              cursor: pointer;
            "
          >
            📍 Guide moi vers mon trône
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    console.log('✅ Marqueurs mis à jour:', toilets.length, 'toilettes');
  };

  // Pour le web, utiliser directement Leaflet
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <div 
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '400px'
          }}
        />
      </View>
    );
  }

  // Pour React Native, utiliser WebView
  const generateMapHTML = () => {
    if (!userLocation || toilets.length === 0) {
      return `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5;">
          <p style="color: #666;">Chargement de la carte...</p>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Carte des toilettes</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100%; }
          .user-marker { background: #007AFF !important; }
          .toilet-marker { background: #FF3B30 !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Initialiser la carte
          const map = L.map('map').setView([${userLocation.latitude}, ${userLocation.longitude}], 15);
          
          // Ajouter les tuiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Marqueur utilisateur
          const userIcon = L.divIcon({
            className: 'user-marker',
            html: '<div style="background: #007AFF; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userIcon })
            .addTo(map)
            .bindPopup('Votre position');

          // Marqueurs toilettes
          const toilets = ${JSON.stringify(toilets)};
          console.log('🚽 Toilettes à afficher:', toilets.length);
          
          toilets.forEach((toilet, index) => {
            console.log('🚽 Ajout marqueur toilette:', toilet.name, toilet.latitude, toilet.longitude);
            
            const toiletIcon = L.divIcon({
              className: 'toilet-marker',
              html: '<div style="background: #FF3B30; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            const marker = L.marker([toilet.latitude, toilet.longitude], { icon: toiletIcon })
              .addTo(map);

            const popupContent = \`
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">\${toilet.name}</h3>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">\${toilet.address}</p>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #888;">🕒 \${toilet.openingHours}</p>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #888;">♿ \${toilet.pmrAccess}</p>
                <button 
                  onclick="navigateToToilet(\${index})"
                  style="background: #007AFF; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; width: 100%;"
                >
                  Guide moi vers mon trône
                </button>
              </div>
            \`;

            marker.bindPopup(popupContent);

            marker.on('click', () => {
              console.log('🚽 Toilette sélectionnée:', toilet.name);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'toiletSelect',
                toilet: toilet
              }));
            });
          });

          // Fonction pour la navigation
          function navigateToToilet(index) {
            const toilet = toilets[index];
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'navigate',
              toilet: toilet
            }));
          }

          // Détecter les changements de position et zoom
          let lastCenter = null;
          let lastZoom = null;
          
          map.on('moveend', () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            
            // Vérifier si la position ou le zoom ont changé significativement
            if (!lastCenter || 
                Math.abs(center.lat - lastCenter.lat) > 0.001 ||
                Math.abs(center.lng - lastCenter.lng) > 0.001 ||
                Math.abs(zoom - lastZoom) > 1) {
              
              console.log('🗺️ Mouvement de carte détecté:', { center, zoom });
              lastCenter = { lat: center.lat, lng: center.lng };
              lastZoom = zoom;
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapMove',
                center: { lat: center.lat, lng: center.lng },
                zoom: zoom
              }));
            }
          });
        </script>
      </body>
      </html>
    `;
  };

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'toiletSelect' && onToiletSelect) {
        onToiletSelect(data.toilet);
      } else if (data.type === 'navigate' && onNavigate) {
        onNavigate(data.toilet);
      } else if (data.type === 'mapMove' && onMapMove) {
        onMapMove(data.center.lat, data.center.lng, data.zoom);
      }
    } catch (error) {
      console.error('Erreur parsing message WebView:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        source={{ html: generateMapHTML() }}
        onMessage={onMessage}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
  },
});

export default SimpleMapComponent;