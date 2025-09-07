import React from 'react';
import { 
  InteractiveMap, 
  createMarkerLayer, 
  createHeatmapLayer,
  mapPresets 
} from '../../packages/map-microservice/src';

// Example showing how to use the map microservice in the climate app
export const ClimateMapIntegration: React.FC = () => {
  // Use the dashboard preset as a starting point
  const mapConfig = mapPresets.dashboard();
  
  // Customize for climate data
  mapConfig.initialCenter = [38.7223, -9.1393]; // Lisbon
  mapConfig.initialZoom = 10;
  mapConfig.theme = 'auto'; // Follow system theme

  // Create climate monitoring stations layer
  const stationsLayer = createMarkerLayer(
    'climate-stations',
    'Climate Monitoring Stations',
    [
      {
        lat: 38.7223,
        lng: -9.1393,
        popup: 'Lisbon Central Station - 22.5°C, 65% humidity',
        metadata: { 
          stationId: 'LIS001',
          temperature: 22.5,
          humidity: 65,
          type: 'urban'
        }
      },
      {
        lat: 38.7369,
        lng: -9.1420,
        popup: 'Marquês Station - 21.8°C, 70% humidity',
        metadata: { 
          stationId: 'LIS002',
          temperature: 21.8,
          humidity: 70,
          type: 'urban'
        }
      },
      {
        lat: 38.6917,
        lng: -9.2158,
        popup: 'Belém Station - 20.9°C, 72% humidity',
        metadata: { 
          stationId: 'BEL001',
          temperature: 20.9,
          humidity: 72,
          type: 'coastal'
        }
      }
    ],
    {
      icon: {
        iconUrl: '/icons/weather-station.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      }
    }
  );

  // Create temperature heatmap layer
  const temperatureLayer = createHeatmapLayer(
    'temperature-heatmap',
    'Temperature Heatmap',
    [
      { lat: 38.7223, lng: -9.1393, intensity: 0.8, metadata: { temp: 22.5 } },
      { lat: 38.7369, lng: -9.1420, intensity: 0.7, metadata: { temp: 21.8 } },
      { lat: 38.6917, lng: -9.2158, intensity: 0.6, metadata: { temp: 20.9 } },
      { lat: 38.7500, lng: -9.1000, intensity: 0.9, metadata: { temp: 24.1 } },
      { lat: 38.7000, lng: -9.2000, intensity: 0.5, metadata: { temp: 19.2 } },
    ],
    {
      config: {
        radius: 40,
        blur: 20,
        maxZoom: 15,
        gradient: {
          0.2: 'blue',
          0.4: 'cyan',
          0.6: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      }
    }
  );

  const layers = [stationsLayer, temperatureLayer];

  return (
    <div className="w-full h-full">
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Climate Data Visualization
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-200">
          Interactive map showing climate monitoring stations and temperature data. 
          Click on stations for details, use drawing tools to analyze specific areas.
        </p>
      </div>
      
      <div style={{ height: '600px', width: '100%' }}>
        <InteractiveMap
          config={mapConfig}
          layers={layers}
          className="border border-gray-300 dark:border-gray-600 rounded-lg"
          style={{ 
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-md font-medium mb-2">Map Features:</h4>
        <ul className="text-sm space-y-1">
          <li>🌡️ Temperature heatmap overlay</li>
          <li>📍 Climate monitoring stations with real-time data</li>
          <li>📏 Drawing and measurement tools for area analysis</li>
          <li>🔍 Zoom and layer controls</li>
          <li>🌓 Automatic dark/light theme switching</li>
        </ul>
      </div>
    </div>
  );
};

export default ClimateMapIntegration;
