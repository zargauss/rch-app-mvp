import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function SimpleMapComponent({ userLocation, toilets, onToiletSelect }) {
  const webViewRef = useRef(null);

  const generateMapHTML = () => {
    const userLat = userLocation?.latitude || 48.8566;
    const userLon = userLocation?.longitude || 2.3522;
    
    console.log('🗺️ Génération de la carte HTML avec:', { userLat, userLon, toiletsCount: toilets.length });
    
    const toiletsMarkers = toilets.map((toilet, index) => `
      L.marker([${toilet.coordinates.latitude}, ${toilet.coordinates.longitude}])
        .addTo(map)
        .bindPopup(\`
          <div style="font-family: Arial, sans-serif; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${toilet.name}</h3>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">📍 ${toilet.address}</p>
            <p style="margin: 4px 0; color: #666; font-size: 12px;">🕒 ${toilet.hours}</p>
            <p style="margin: 4px 0; color: #666; font-size: 12px;">♿ ${toilet.pmrAccess}</p>
            <button 
              onclick="window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'navigate',
                toilet: {
                  name: '${toilet.name.replace(/'/g, "\\'")}',
                  lat: ${toilet.coordinates.latitude},
                  lon: ${toilet.coordinates.longitude}
                }
              }))"
              style="
                background: #007AFF; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 6px; 
                font-size: 14px; 
                cursor: pointer; 
                margin-top: 8px;
                width: 100%;
              "
            >
              Guide moi vers mon trône
            </button>
          </div>
        \`)
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'toiletSelect',
            toilet: {
              id: '${toilet.id}',
              name: '${toilet.name.replace(/'/g, "\\'")}',
              address: '${toilet.address.replace(/'/g, "\\'")}',
              hours: '${toilet.hours.replace(/'/g, "\\'")}',
              pmrAccess: '${toilet.pmrAccess.replace(/'/g, "\\'")}',
              coordinates: {
                latitude: ${toilet.coordinates.latitude},
                longitude: ${toilet.coordinates.longitude}
              },
              distance: ${toilet.distance || 0}
            }
          }));
        });
    `).join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Carte des toilettes</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: #f0f0f0;
          }
          #map {
            width: 100%;
            height: 100vh;
            background: #e0e0e0;
          }
          .leaflet-popup-content {
            margin: 8px 12px;
            line-height: 1.4;
          }
          .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
          }
        </style>
      </head>
      <body>
        <div id="map">
          <div class="loading">Chargement de la carte...</div>
        </div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          console.log('🗺️ Initialisation de la carte Leaflet...');
          
          try {
            // Initialiser la carte
            const map = L.map('map').setView([${userLat}, ${userLon}], 15);
            console.log('✅ Carte Leaflet initialisée');
            
            // Ajouter les tuiles OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);
            console.log('✅ Tuiles OpenStreetMap ajoutées');
            
            // Marqueur de l'utilisateur
            const userIcon = L.divIcon({
              className: 'user-marker',
              html: '<div style="background: #007AFF; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            
            L.marker([${userLat}, ${userLon}], { icon: userIcon })
              .addTo(map)
              .bindPopup('<b>Votre position</b><br>Vous êtes ici')
              .openPopup();
            console.log('✅ Marqueur utilisateur ajouté');
            
            // Marqueurs des toilettes
            ${toiletsMarkers}
            console.log('✅ Marqueurs toilettes ajoutés');
            
            // Centrer la carte sur l'utilisateur
            map.setView([${userLat}, ${userLon}], 15);
            console.log('✅ Carte centrée sur l\'utilisateur');
            
            // Masquer le loading
            document.querySelector('.loading').style.display = 'none';
            
          } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation de la carte:', error);
            document.querySelector('.loading').innerHTML = 'Erreur lors du chargement de la carte: ' + error.message;
          }
        </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 Message reçu du WebView:', data);
      
      if (data.type === 'toiletSelect' && onToiletSelect) {
        onToiletSelect(data.toilet);
      } else if (data.type === 'navigate') {
        // Ouvrir la navigation
        const url = \`https://www.google.com/maps/dir/\${${userLat}},\${${userLon}}/\${data.toilet.lat},\${data.toilet.lon}\`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('❌ Erreur parsing message WebView:', error);
    }
  };

  console.log('🗺️ Rendu SimpleMapComponent avec:', { userLocation, toiletsCount: toilets.length });

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onError={(error) => console.error('❌ Erreur WebView:', error)}
        onLoadEnd={() => console.log('✅ WebView chargée')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  webview: {
    flex: 1,
  },
});
