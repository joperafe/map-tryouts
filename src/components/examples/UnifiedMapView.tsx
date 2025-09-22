import React, { useEffect } from 'react';
import { useMapData, useUI, useSensorLayers } from '../../contexts/store';

/**
 * Example MapView component using the unified store
 * 
 * Demonstrates:
 * - Using useMapData for sensors, green zones, air quality data
 * - Using useUI for loading states and notifications
 * - Using useSensorLayers for layer management
 * - Dispatching async actions to fetch data
 * - Proper error handling with user feedback
 */
export const UnifiedMapView: React.FC = () => {
  const {
    sensors,
    greenZones,
    airQualityStations,
    loading,
    errors,
    layersVisible,
    refreshSensors,
    refreshAllLayers,
    setLayerVisibility,
  } = useMapData();

  const { addNotification } = useUI();
  
  const {
    setSensorLayer,
    setLayerLoading,
    getActiveSensors,
  } = useSensorLayers();

  // Load initial data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshAllLayers();
        addNotification({
          type: 'success',
          message: 'Map data loaded successfully',
          duration: 3000,
        });
      } catch {
        addNotification({
          type: 'error',
          message: 'Failed to load map data',
          duration: 5000,
        });
      }
    };

    loadData();
  }, [refreshAllLayers, addNotification]);

  // Update sensor layers when sensor data changes
  useEffect(() => {
    if (sensors.length > 0) {
      setSensorLayer('sensors', sensors);
    }
  }, [sensors, setSensorLayer]);

  const handleRefreshSensors = async () => {
    try {
      setLayerLoading('sensors', true);
      await refreshSensors();
      addNotification({
        type: 'success',
        message: 'Sensors refreshed successfully',
        duration: 2000,
      });
    } catch {
      addNotification({
        type: 'error',
        message: 'Failed to refresh sensors',
        duration: 5000,
      });
    }
  };

  const handleToggleLayer = (layer: keyof typeof layersVisible) => {
    const newVisibility = !layersVisible[layer];
    setLayerVisibility(layer, newVisibility);
    addNotification({
      type: 'info',
      message: `${layer} layer ${newVisibility ? 'enabled' : 'disabled'}`,
      duration: 2000,
    });
  };

  const activeSensors = getActiveSensors();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Climate Dashboard - Unified Store Demo</h1>
      
      {/* Loading indicators */}
      {(loading.sensors || loading.greenZones || loading.airQuality) && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p>Loading map data...</p>
          <div className="mt-2 space-y-1">
            {loading.sensors && <div className="text-sm">• Loading sensors...</div>}
            {loading.greenZones && <div className="text-sm">• Loading green zones...</div>}
            {loading.airQuality && <div className="text-sm">• Loading air quality data...</div>}
          </div>
        </div>
      )}

      {/* Error displays */}
      {(errors.sensors || errors.greenZones || errors.airQuality) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Errors loading data:</p>
          <div className="mt-2 space-y-1">
            {errors.sensors && <div className="text-sm">• Sensors: {errors.sensors}</div>}
            {errors.greenZones && <div className="text-sm">• Green Zones: {errors.greenZones}</div>}
            {errors.airQuality && <div className="text-sm">• Air Quality: {errors.airQuality}</div>}
          </div>
        </div>
      )}

      {/* Layer controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Sensors Layer</h3>
          <p className="text-sm text-gray-600 mb-2">{sensors.length} sensors loaded</p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleToggleLayer('sensors')}
              className={`px-3 py-1 rounded text-sm ${
                layersVisible.sensors
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {layersVisible.sensors ? 'Visible' : 'Hidden'}
            </button>
            <button
              onClick={handleRefreshSensors}
              disabled={loading.sensors}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
            >
              {loading.sensors ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Green Zones</h3>
          <p className="text-sm text-gray-600 mb-2">{greenZones.length} zones loaded</p>
          <button
            onClick={() => handleToggleLayer('greenZones')}
            className={`px-3 py-1 rounded text-sm ${
              layersVisible.greenZones
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {layersVisible.greenZones ? 'Visible' : 'Hidden'}
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Air Quality</h3>
          <p className="text-sm text-gray-600 mb-2">{airQualityStations.length} stations loaded</p>
          <button
            onClick={() => handleToggleLayer('airQuality')}
            className={`px-3 py-1 rounded text-sm ${
              layersVisible.airQuality
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {layersVisible.airQuality ? 'Visible' : 'Hidden'}
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Active Sensors</h3>
          <p className="text-sm text-gray-600 mb-2">{activeSensors.length} active</p>
          <p className="text-xs text-gray-500">From sensor layers</p>
        </div>
      </div>

      {/* Data summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">Sensors ({sensors.length})</h3>
            {sensors.length > 0 ? (
              <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {sensors.slice(0, 5).map((sensor) => (
                  <li key={sensor.id} className="flex justify-between">
                    <span>{sensor.name || `Sensor ${sensor.id}`}</span>
                    <span className="text-gray-500">{sensor.status}</span>
                  </li>
                ))}
                {sensors.length > 5 && (
                  <li className="text-gray-500">... and {sensors.length - 5} more</li>
                )}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No sensors loaded</p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Green Zones ({greenZones.length})</h3>
            {greenZones.length > 0 ? (
              <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {greenZones.slice(0, 5).map((zone) => (
                  <li key={zone.id} className="flex justify-between">
                    <span>{zone.name || `Zone ${zone.id}`}</span>
                    <span className="text-gray-500">{zone.type}</span>
                  </li>
                ))}
                {greenZones.length > 5 && (
                  <li className="text-gray-500">... and {greenZones.length - 5} more</li>
                )}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No green zones loaded</p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Air Quality Stations ({airQualityStations.length})</h3>
            {airQualityStations.length > 0 ? (
              <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {airQualityStations.slice(0, 5).map((station) => (
                  <li key={station.id} className="flex justify-between">
                    <span>Station {station.id}</span>
                    <span className="text-gray-500">AQI: {station.airQualityIndex || 'N/A'}</span>
                  </li>
                ))}
                {airQualityStations.length > 5 && (
                  <li className="text-gray-500">... and {airQualityStations.length - 5} more</li>
                )}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No air quality stations loaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};