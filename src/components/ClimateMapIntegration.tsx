import React from 'react';
import { 
  InteractiveMap, 
  adaptMapConfig,
  type MarkerLayer
} from '../../packages/map-microservice/src';
import { useInstanceSettings } from '../hooks';

// Example showing how to use the map microservice in the climate app
export const ClimateMapIntegration: React.FC = () => {
  const { instanceSettings } = useInstanceSettings();
  
  if (!instanceSettings) {
    return <div>Loading map configuration...</div>;
  }

  // Use the MAP configuration from settings
  const mapConfig = adaptMapConfig(instanceSettings.MAP);

  // Create climate monitoring stations layer
  const stationsLayer: MarkerLayer = {
    id: 'climate-stations',
    name: 'Climate Monitoring Stations',
    type: 'marker',
    visible: true,
    data: [
      {
        id: 'LIS001',
        position: [38.7223, -9.1393] as [number, number],
        popup: {
          content: 'Lisbon Central Station - 22.5°C, 65% humidity'
        }
      },
      {
        id: 'LIS002',
        position: [38.7370, -9.1420] as [number, number],
        popup: {
          content: 'Marquês Station - 21.8°C, 70% humidity'
        }
      },
      {
        id: 'BEL001',
        position: [38.6979, -9.2076] as [number, number],
        popup: {
          content: 'Belém Station - 20.9°C, 72% humidity'
        }
      }
    ]
  };

  const layers = [stationsLayer];

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
          mapConfig={mapConfig}
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
          <li>🌡️ Climate monitoring stations</li>
          <li>📍 Real-time temperature and humidity data</li>
          <li>📏 Drawing and measurement tools for area analysis</li>
          <li>🔍 Zoom and layer controls</li>
          <li>🌓 Automatic dark/light theme switching</li>
        </ul>
      </div>
    </div>
  );
};

export default ClimateMapIntegration;
