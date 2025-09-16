import React, { useState } from 'react';
import type { LatLng } from 'leaflet';

export interface SensorType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  capabilities: string[];
}

export interface NewSensorData {
  type: SensorType;
  name: string;
  position: LatLng;
}

interface AddSensorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSensor: (sensorData: NewSensorData) => void;
  selectedPosition: LatLng | null;
  isSelectingPosition: boolean;
  onPositionModeToggle: () => void;
}

const SENSOR_TYPES: SensorType[] = [
  {
    id: 'temperature',
    name: 'Temperature Sensor',
    icon: '🌡️',
    color: 'bg-red-100 hover:bg-red-200 border-red-300',
    description: 'Measures ambient temperature',
    capabilities: ['Temperature monitoring', 'Heat index calculation']
  },
  {
    id: 'air-quality',
    name: 'Air Quality Monitor',
    icon: '🌫️',
    color: 'bg-purple-100 hover:bg-purple-200 border-purple-300',
    description: 'Monitors air pollution levels',
    capabilities: ['PM2.5/PM10 detection', 'AQI calculation', 'CO2 monitoring']
  },
  {
    id: 'humidity',
    name: 'Humidity Sensor',
    icon: '💧',
    color: 'bg-blue-100 hover:bg-blue-200 border-blue-300',
    description: 'Measures relative humidity',
    capabilities: ['Humidity monitoring', 'Dew point calculation']
  },
  {
    id: 'noise',
    name: 'Noise Monitor',
    icon: '🔊',
    color: 'bg-orange-100 hover:bg-orange-200 border-orange-300',
    description: 'Measures sound levels',
    capabilities: ['Decibel monitoring', 'Noise pollution tracking']
  },
  {
    id: 'weather',
    name: 'Weather Station',
    icon: '⛅',
    color: 'bg-green-100 hover:bg-green-200 border-green-300',
    description: 'Comprehensive weather monitoring',
    capabilities: ['Multi-parameter sensing', 'Weather predictions', 'Wind monitoring']
  },
  {
    id: 'environmental',
    name: 'Environmental Monitor',
    icon: '🌿',
    color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300',
    description: 'All-in-one environmental sensor',
    capabilities: ['Temperature', 'Humidity', 'Air Quality', 'Noise Level']
  }
];

export const AddSensorPanel: React.FC<AddSensorPanelProps> = ({
  isOpen,
  onClose,
  onAddSensor,
  selectedPosition,
  isSelectingPosition,
  onPositionModeToggle
}) => {
  const [selectedSensorType, setSelectedSensorType] = useState<SensorType | null>(null);
  const [sensorName, setSensorName] = useState('');
  const [step, setStep] = useState<'type' | 'details' | 'position'>('type');

  const handleSensorTypeSelect = (sensorType: SensorType) => {
    setSelectedSensorType(sensorType);
    setSensorName(`${sensorType.name} - ${new Date().toLocaleDateString()}`);
    setStep('details');
  };

  const handleNext = () => {
    if (step === 'details') {
      setStep('position');
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('type');
      setSelectedSensorType(null);
    } else if (step === 'position') {
      setStep('details');
    }
  };

  const handleAddSensor = () => {
    if (selectedSensorType && selectedPosition && sensorName) {
      onAddSensor({
        type: selectedSensorType,
        name: sensorName,
        position: selectedPosition
      });
      
      // Reset form
      setSelectedSensorType(null);
      setSensorName('');
      setStep('type');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close sensor panel"
      />
      
      {/* Side Panel */}
      <div className="relative ml-auto w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add New Sensor
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`px-2 py-1 rounded ${step === 'type' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                1. Type
              </div>
              <div className="w-4 h-px bg-gray-300"></div>
              <div className={`px-2 py-1 rounded ${step === 'details' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                2. Details
              </div>
              <div className="w-4 h-px bg-gray-300"></div>
              <div className={`px-2 py-1 rounded ${step === 'position' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                3. Position
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {step === 'type' && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Select Sensor Type
                </h3>
                <div className="space-y-3">
                  {SENSOR_TYPES.map((sensorType) => (
                    <button
                      key={sensorType.id}
                      onClick={() => handleSensorTypeSelect(sensorType)}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${sensorType.color}`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{sensorType.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {sensorType.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {sensorType.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {sensorType.capabilities.map((capability, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'details' && selectedSensorType && (
              <div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Sensor Type
                  </h3>
                  <div className={`p-3 rounded-lg border ${selectedSensorType.color}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{selectedSensorType.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedSensorType.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label 
                      htmlFor="sensor-name-input"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Sensor Name
                    </label>
                    <input
                      id="sensor-name-input"
                      type="text"
                      value={sensorName}
                      onChange={(e) => setSensorName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter sensor name"
                      aria-describedby="sensor-name-help"
                      required
                    />
                    <p id="sensor-name-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Choose a descriptive name for this sensor
                    </p>
                  </div>

                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Capabilities
                    </legend>
                    <div className="flex flex-wrap gap-2" role="list">
                      {selectedSensorType.capabilities.map((capability, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full"
                          role="listitem"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>
            )}

            {step === 'position' && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Set Sensor Position
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Position Selection
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {isSelectingPosition 
                        ? 'Click on the map to select a position for your sensor'
                        : 'Click the button below to start selecting a position on the map'
                      }
                    </p>
                  </div>

                  <button
                    onClick={onPositionModeToggle}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isSelectingPosition
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isSelectingPosition ? 'Cancel Position Selection' : 'Select Position on Map'}
                  </button>

                  {selectedPosition && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">
                          Position Selected
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Lat: {selectedPosition.lat.toFixed(6)}, Lng: {selectedPosition.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                disabled={step === 'type'}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  step === 'type'
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Back
              </button>

              {step === 'details' && (
                <button
                  onClick={handleNext}
                  disabled={!sensorName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              )}

              {step === 'position' && (
                <button
                  onClick={handleAddSensor}
                  disabled={!selectedPosition || !sensorName.trim()}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Sensor
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSensorPanel;
