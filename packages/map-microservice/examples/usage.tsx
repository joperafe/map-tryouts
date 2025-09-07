import React from 'react';
import { InteractiveMap, createMapConfig, createMarkerLayer, mapPresets } from '../src';

// Example 1: Basic Map
export const BasicMapExample: React.FC = () => {
  const config = mapPresets.basic();
  config.initialCenter = [40.7128, -74.0060]; // New York City
  config.initialZoom = 12;

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <InteractiveMap
        config={config}
        layers={[]}
      />
    </div>
  );
};

// Example 2: Map with Markers
export const MarkersMapExample: React.FC = () => {
  const config = createMapConfig({
    initialCenter: [38.7223, -9.1393], // Lisbon
    initialZoom: 11,
    controls: {
      showZoom: true,
      showFullscreen: true,
      showLayers: true,
    },
    features: {
      clickableMarkers: true,
      zoomOnMarkerClick: true,
    }
  });

  const markerLayer = createMarkerLayer(
    'sample-markers',
    'Sample Locations',
    [
      {
        lat: 38.7223,
        lng: -9.1393,
        popup: 'Lisbon City Center',
        metadata: { category: 'city', importance: 'high' }
      },
      {
        lat: 38.7369,
        lng: -9.1420,
        popup: 'Marquês de Pombal',
        metadata: { category: 'landmark', importance: 'medium' }
      },
      {
        lat: 38.6917,
        lng: -9.2158,
        popup: 'Belém Tower',
        metadata: { category: 'tourist', importance: 'high' }
      }
    ],
    {
      icon: {
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
      }
    }
  );

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <InteractiveMap
        config={config}
        layers={[markerLayer]}
        events={{
          onMarkerClick: (marker) => {
            console.log('Marker clicked:', marker);
          },
          onMapClick: (event) => {
            console.log('Map clicked at:', event.latlng);
          }
        }}
      />
    </div>
  );
};

// Example 3: Dashboard Map with All Features
export const DashboardMapExample: React.FC = () => {
  const config = mapPresets.dashboard();
  config.initialCenter = [51.505, -0.09]; // London
  config.initialZoom = 13;
  config.theme = 'auto';

  const layers = [
    createMarkerLayer('pois', 'Points of Interest', [
      { lat: 51.505, lng: -0.09, popup: 'London Eye Area' },
      { lat: 51.5074, lng: -0.1278, popup: 'Big Ben' },
      { lat: 51.5033, lng: -0.1195, popup: 'Westminster Bridge' }
    ])
  ];

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <InteractiveMap
        config={config}
        layers={layers}
        events={{
          onDrawCreated: (shape) => {
            console.log('Shape drawn:', shape);
          },
          onMeasurement: (result) => {
            console.log('Measurement:', result);
          }
        }}
      />
    </div>
  );
};

// Example 4: Analysis Map
export const AnalysisMapExample: React.FC = () => {
  const config = mapPresets.analysis();
  
  return (
    <div style={{ height: '500px', width: '100%' }}>
      <InteractiveMap
        config={config}
        layers={[]}
        theme="dark"
        events={{
          onDrawCreated: (shape) => {
            alert(`Created ${shape.type} with ${shape.coordinates.length} points`);
          },
          onMeasurement: (result) => {
            const message = result.area 
              ? `Area: ${result.area.toFixed(2)} m²`
              : `Distance: ${result.distance?.toFixed(2)} m`;
            alert(message);
          }
        }}
      />
    </div>
  );
};

// Example 5: Custom Configuration
export const CustomConfigExample: React.FC = () => {
  const config = createMapConfig({
    initialCenter: [37.7749, -122.4194], // San Francisco
    initialZoom: 12,
    minZoom: 8,
    maxZoom: 18,
    controls: {
      showZoom: true,
      showFullscreen: false,
      showLayers: true,
      showMeasurement: true,
      showDrawing: false,
    },
    features: {
      clickableMarkers: true,
      draggableMarkers: true,
      zoomOnMarkerClick: false,
      clustering: true,
      drawing: {
        enabled: false
      },
      measurement: {
        enabled: true,
        units: 'imperial',
        showArea: true,
        showDistance: true
      }
    },
    theme: 'light'
  });

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <InteractiveMap
        config={config}
        layers={[]}
        className="custom-map"
        style={{ border: '2px solid #ccc', borderRadius: '8px' }}
      />
    </div>
  );
};
