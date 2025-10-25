import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function SimpleMapComponent({ userLocation, toilets, onToiletSelect }) {
  const webViewRef = useRef(null);

  const generateMapHTML = () => {
    const userLat = userLocation?.latitude || 48.8566;
    const userLon = userLocation?.longitude || 2.3522;
    
    const toiletsMarkers = toilets.map(toilet => `
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
                  name: '${toilet.name}',
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
              name: '${toilet.name}',
              address: '${toilet.address}',
              hours: '${toilet.hours}',
              pmrAccess: '${toilet.pmrAccess}',
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
          }
          #map {
            width: 100%;
            height: 100vh;
          }
          .leaflet-popup-content {
            margin: 8px 12px;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Initialiser la carte
          const map = L.map('map').setView([${userLat}, ${userLon}], 15);
          
          // Ajouter les tuiles OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);
          
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
          
          // Marqueurs des toilettes
          ${toiletsMarkers}
          
          // Centrer la carte sur l'utilisateur
          map.setView([${userLat}, ${userLon}], 15);
        </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'toiletSelect' && onToiletSelect) {
        onToiletSelect(data.toilet);
      } else if (data.type === 'navigate') {
        // Ouvrir la navigation
        const url = \`https://www.google.com/maps/dir/\${${userLat}},\${${userLon}}/\${data.toilet.lat},\${data.toilet.lon}\`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Erreur parsing message WebView:', error);
    }
  };

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
