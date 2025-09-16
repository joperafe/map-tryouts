import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { SensorType } from './AddSensorPanel';

interface TempSensorMarkerProps {
  id: string;
  name: string;
  position: [number, number];
  type: SensorType;
  onRemove: (id: string) => void;
}

// Create custom icons for different sensor types
const createSensorIcon = (sensorType: SensorType, size: number = 25) => {
  return L.divIcon({
    html: `
      <div style="
        background: white;
        border: 2px solid #3B82F6;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.5}px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        position: relative;
      ">
        ${sensorType.icon}
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #10B981;
          border: 1px solid white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'temp-sensor-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

export const TempSensorMarker: React.FC<TempSensorMarkerProps> = ({
  id,
  name,
  position,
  type,
  onRemove
}) => {
  return (
    <Marker
      position={position}
      icon={createSensorIcon(type, 30)}
    >
      <Popup>
        <div className="p-2">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{type.icon}</span>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              NEW
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            <strong>Type:</strong> {type.name}
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            <strong>Position:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
          
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-700 mb-1">Capabilities:</div>
            <div className="flex flex-wrap gap-1">
              {type.capabilities.map((capability, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onRemove(id)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
            >
              Remove
            </button>
            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors">
              Save
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default TempSensorMarker;
