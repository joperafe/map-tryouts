import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { MapControls } from './MapControls';
import { SensorPopup } from './SensorPopup';
import { DrawingControls } from './DrawingControls';
import { MeasurementControls } from './MeasurementControls';
import { AddSensorPanel, type NewSensorData } from './AddSensorPanel';
import { TempSensorMarker } from './TempSensorMarker';
import { MapEvents } from './MapEvents';
import { AirQualityLayer } from '../../../components/map/AirQualityLayer';
import { useMapData } from '../../../contexts';
import { useSensorLayers } from '../../../contexts';
import { useMapSettings } from '../../../hooks';
import { useApp } from '../../../contexts';
import { AIR_QUALITY_COLORS } from '../../../types/airQuality';
import type { Sensor, AppConfig } from '../../../types';
import { getAirQualityColor } from '../../../utils';

// Fix for default markers in React-Leaflet
const iconPrototype = L.Icon.Default.prototype as { _getIconUrl?: () => string };
delete iconPrototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  mapConfig: AppConfig['MAP'];
  showSensors?: boolean;
  showGreenZones?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  mapConfig,
  showSensors = true,
  showGreenZones = true,
}) => {
  const { t } = useTranslation();
  const mapSettings = useMapSettings();
  const { debug } = useApp();
  const sensorLayers = useSensorLayers();
  
  // Get data from global context
  const { 
    sensors, 
    greenZones, 
    airQualityStations, 
    loading, 
    errors, 
    refreshAirQuality,
    currentBaseMap
  } = useMapData();
  
  // Get current tile layer configuration
  const getCurrentTileLayer = () => {
    const tileLayers = mapSettings?.tile_layers;
    if (!tileLayers || !tileLayers[currentBaseMap]) {
      // Fallback to default OpenStreetMap
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      };
    }
    
    const config = tileLayers[currentBaseMap] as { url: string; attribution: string };
    return {
      url: config.url,
      attribution: config.attribution
    };
  };
  
  // Helper functions for layer control management
  const getLayerToggleItems = () => {
    return mapSettings?.controls_settings.layer_toggle?.items;
  };

  // Helper to check if a layer control is enabled in the configuration
  const isLayerControlEnabled = (layerId: string) => {
    const layerToggleItems = getLayerToggleItems();
    return layerToggleItems && layerToggleItems.includes(layerId);
  };
  
  const [layersVisible, setLayersVisible] = useState({
    sensors: showSensors,
    greenZones: showGreenZones,
    heatmap: false,
    airQuality: true, // Enable by default to show air quality data
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [drawnItems, setDrawnItems] = useState<L.Layer[]>([]);
  const [measurementResult, setMeasurementResult] = useState<{
    distance?: number;
    area?: number;
    coordinates: L.LatLng[];
  } | null>(null);
  
  // Add Sensor functionality
  const [showAddSensorPanel, setShowAddSensorPanel] = useState(false);
  const [tempSensors, setTempSensors] = useState<Array<{
    id: string;
    name: string;
    position: [number, number];
    type: import('./AddSensorPanel').SensorType;
  }>>([]);
  const [isSelectingPosition, setIsSelectingPosition] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<L.LatLng | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapControlsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Handle ESC key to exit map actions
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (drawingMode) {
          setDrawingMode(false);
          console.log('Drawing mode disabled (ESC pressed)');
        }
        if (measurementMode) {
          setMeasurementMode(false);
          setMeasurementResult(null); // Clear any measurement results
          console.log('Measurement mode disabled (ESC pressed)');
        }
        if (showLayerPanel) {
          setShowLayerPanel(false);
          console.log('Layer panel closed (ESC pressed)');
        }
        if (isFullscreen) {
          setIsFullscreen(false);
          console.log('Exiting fullscreen mode (ESC pressed)');
        }
      }
    };

    // Add event listener when any mode is active
    if (drawingMode || measurementMode || showLayerPanel || isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawingMode, measurementMode, showLayerPanel, isFullscreen]);

  // Update CSS variables for controls dimensions
  useEffect(() => {
    const updateControlsDimensions = () => {
      if (mapControlsRef.current && mapContainerRef.current) {
        const controlsRect = mapControlsRef.current.getBoundingClientRect();
        const controlsHeight = controlsRect.height + 16; // Add some margin
        const controlsWidth = controlsRect.width + 16; // Add some margin
        
        // Set CSS custom properties for controls dimensions
        mapContainerRef.current.style.setProperty('--controls-height', `${controlsHeight}px`);
        mapContainerRef.current.style.setProperty('--controls-width', `${controlsWidth}px`);
      }
    };

    // Update on mount and when controls change
    updateControlsDimensions();
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateControlsDimensions);
    if (mapControlsRef.current) {
      resizeObserver.observe(mapControlsRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [showLayerPanel, drawingMode, measurementMode, isFullscreen]); // Rerun when active controls change

  // Handle cursor changes for drawing and measurement modes
  useEffect(() => {
    const mapContainer = mapContainerRef.current?.querySelector('.leaflet-container');
    if (mapContainer) {
      const element = mapContainer as HTMLElement;
      if (drawingMode || measurementMode) {
        element.style.cursor = 'crosshair';
        element.classList.add(drawingMode ? 'drawing-active' : 'measurement-active');
      } else {
        element.style.cursor = '';
        element.classList.remove('drawing-active', 'measurement-active');
      }
    }
  }, [drawingMode, measurementMode]);

  // Update layer visibility when mapSettings change
  useEffect(() => {
    if (mapSettings) {
      setLayersVisible(prev => ({
        sensors: (isLayerControlEnabled('sensors') ?? false) && prev.sensors,
        greenZones: (isLayerControlEnabled('greenZones') ?? false) && prev.greenZones,  
        heatmap: (isLayerControlEnabled('heatmap') ?? false) && prev.heatmap,
        airQuality: (isLayerControlEnabled('airQuality') ?? false) && prev.airQuality,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapSettings]);

  // Sync sensor data with sensor layers state
  useEffect(() => {
    if (sensors.length > 0) {
      sensorLayers.setSensorLayer('sensors', sensors);
    }
    sensorLayers.setLayerVisibility('sensors', layersVisible.sensors);
    sensorLayers.setLayerLoading('sensors', loading.sensors);
    if (errors.sensors) {
      sensorLayers.setLayerError('sensors', errors.sensors);
    }
  }, [sensors, layersVisible.sensors, loading.sensors, errors.sensors, sensorLayers]);

  // Sync air quality stations with sensor layers state
  useEffect(() => {
    if (airQualityStations.length > 0) {
      // Convert air quality stations to sensor format for consistency
      const airQualitySensors = airQualityStations.map(station => ({
        id: station.id,
        name: `Air Quality Station ${station.id}`,
        coordinates: [station.latitude, station.longitude] as [number, number],
        status: 'active' as const,
        data: {
          airQualityIndex: station.airQualityIndex,
          temperature: station.measurements.temperature || 0,
          humidity: station.measurements.humidity || 0,
          noiseLevel: 0, // Air quality stations don't measure noise
        },
        lastUpdated: station.lastUpdated.toISOString(),
        type: 'air_quality' as const
      }));
      sensorLayers.setSensorLayer('airQuality', airQualitySensors);
    }
    sensorLayers.setLayerVisibility('airQuality', layersVisible.airQuality);
    sensorLayers.setLayerLoading('airQuality', loading.airQuality);
    if (errors.airQuality) {
      sensorLayers.setLayerError('airQuality', errors.airQuality);
    }
  }, [airQualityStations, layersVisible.airQuality, loading.airQuality, errors.airQuality, sensorLayers]);

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;

    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen().catch(console.error);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleLayers = () => {
    // Toggle layer panel visibility
    setShowLayerPanel(!showLayerPanel);
  };

  const toggleDrawing = () => {
    const newDrawingMode = !drawingMode;
    setDrawingMode(newDrawingMode);
    setMeasurementMode(false); // Disable measurement when drawing
    
    if (newDrawingMode) {
      console.log('Drawing mode enabled - Use the drawing tools that appear on the map. Press ESC to exit.');
      // Force cursor change on map container
      setTimeout(() => {
        const mapContainer = mapContainerRef.current?.querySelector('.leaflet-container');
        if (mapContainer) {
          (mapContainer as HTMLElement).style.cursor = 'crosshair';
        }
      }, 100);
    } else {
      console.log('Drawing mode disabled');
      // Reset cursor
      setTimeout(() => {
        const mapContainer = mapContainerRef.current?.querySelector('.leaflet-container');
        if (mapContainer) {
          (mapContainer as HTMLElement).style.cursor = '';
        }
      }, 100);
    }
  };

  const toggleMeasurement = () => {
    setMeasurementMode(!measurementMode);
    setDrawingMode(false); // Disable drawing when measuring
  };

  const handleDrawCreated = (layer: L.Layer) => {
    setDrawnItems(prev => [...prev, layer]);
  };

  const handleDrawDeleted = (layers: L.Layer[]) => {
    setDrawnItems(prev => prev.filter(item => !layers.includes(item)));
  };

  const handleMeasurement = (result: { distance?: number; area?: number; coordinates: L.LatLng[] }) => {
    setMeasurementResult(result);
  };

  // Add Sensor handlers
  const handleAddSensor = (sensorData: NewSensorData) => {
    const newSensor = {
      id: `temp-sensor-${Date.now()}`,
      name: sensorData.name,
      position: [sensorData.position.lat, sensorData.position.lng] as [number, number],
      type: sensorData.type
    };
    
    setTempSensors(prev => [...prev, newSensor]);
    setSelectedPosition(null);
    setIsSelectingPosition(false);
    
    console.log('New sensor added:', newSensor);
  };

  const handleRemoveTempSensor = (sensorId: string) => {
    setTempSensors(prev => prev.filter(sensor => sensor.id !== sensorId));
    console.log('Temp sensor removed:', sensorId);
  };

  const handlePositionModeToggle = () => {
    setIsSelectingPosition(!isSelectingPosition);
    if (!isSelectingPosition) {
      setSelectedPosition(null);
      console.log('Position selection mode enabled - Click on the map to select a position');
    } else {
      console.log('Position selection mode disabled');
    }
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isSelectingPosition) {
      setSelectedPosition(e.latlng);
      console.log('Position selected:', e.latlng);
    }
  };

  const handleRefreshAllLayers = async () => {
    console.log('Refreshing all active layers...');
    setIsRefreshing(true);
    
    // Create a registry of available refresh functions for each layer type
    const layerRefreshFunctions: Record<string, () => Promise<void>> = {
      airQuality: refreshAirQuality,
      // Add more layer refresh functions here as they become available:
      // sensors: refreshSensorData,
      // greenZones: refreshGreenZoneData,
      // heatmap: refreshHeatmapData,
    };
    
    // Collect refresh promises for all visible layers that have refresh functions
    const refreshPromises = Object.entries(layersVisible)
      .filter(([layerType, isVisible]) => {
        const hasRefreshFunction = layerType in layerRefreshFunctions;
        if (isVisible && hasRefreshFunction) {
          console.log(`Refreshing ${layerType} layer...`);
          return true;
        }
        return false;
      })
      .map(([layerType]) => layerRefreshFunctions[layerType]());
    
    try {
      if (refreshPromises.length === 0) {
        console.log('No active layers with refresh functionality found');
      } else {
        await Promise.all(refreshPromises);
        console.log(`Successfully refreshed ${refreshPromises.length} active layer(s)`);
      }
    } catch (error) {
      console.error('Error refreshing layers:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleControlClick = (controlType: string) => {
    switch (controlType) {
      case 'layer_toggle':
        toggleLayers();
        break;
      case 'draw':
        toggleDrawing();
        break;
      case 'fullscreen':
        toggleFullscreen();
        break;
      case 'measurement':
        toggleMeasurement();
        break;
      case 'add_sensor':
        setShowAddSensorPanel(true);
        break;
      case 'refresh':
        handleRefreshAllLayers();
        break;
      case 'base_map_selector':
        // This will be handled by the MapControls component as a dropdown
        break;
      default:
        console.warn(`Unknown control type: ${controlType}`);
        break;
    }
  };

  const createSensorIcon = (sensor: Sensor) => {
    const color = getAirQualityColor(sensor.data.airQualityIndex);
    const status = sensor.status === 'active' ? '●' : '○';
    
    return L.divIcon({
      html: `<div class="sensor-marker ${sensor.status}" style="background-color: ${color};">${status}</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const getZoneColor = (type: string): string => {
    switch (type) {
      case 'urban_park':
        return '#22c55e';
      case 'nature_reserve':
        return '#16a34a';
      case 'community_garden':
        return '#65a30d';
      case 'forest':
        return '#15803d';
      default:
        return '#10b981';
    }
  };

  const getAirQualityLegend = () => {
    const stationCounts = airQualityStations.reduce((acc, station) => {
      acc[station.qualityLevel] = (acc[station.qualityLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(AIR_QUALITY_COLORS).map(([level, color]) => ({
      level,
      color,
      count: stationCounts[level] || 0,
    }));
  };

  // Access data layers from mapSettings
  const getDataLayers = () => {
    return mapSettings?.data_layers;
  };

  // Helper to get the first control position (fallback to topright)
  const getControlPosition = () => {
    const controls = mapSettings?.map_controls;
    if (controls) {
      const firstControl = Object.values(controls)[0];
      return firstControl?.position || "topright";
    }
    return "topright";
  };

  const getDataForLayer = (layerKey: string) => {
    const dataMap = {
      sensors,
      greenZones,
      airQualityStations,
    };
    return dataMap[layerKey as keyof typeof dataMap] || [];
  };

  const getLoadingForLayer = (layerKey: string) => {
    const loadingMap = {
      sensors: loading.sensors,
      greenZones: loading.greenZones,
      airQualityStations: loading.airQuality,
      airQuality: loading.airQuality,
    };
    return loadingMap[layerKey as keyof typeof loadingMap] || false;
  };

  const getErrorForLayer = (layerKey: string) => {
    const errorMap = {
      sensors: errors.sensors,
      greenZones: errors.greenZones,
      airQualityStations: errors.airQuality,
      airQuality: errors.airQuality,
    };
    return errorMap[layerKey as keyof typeof errorMap];
  };

  const getRefreshFunctionForLayer = (layerKey: string) => {
    const refreshMap = {
      airQuality: refreshAirQuality,
      airQualityStations: refreshAirQuality,
      // Add more refresh functions here as needed
    };
    return refreshMap[layerKey as keyof typeof refreshMap];
  };

  const renderLayerToggle = (layerId: string, layerConfig: import('../../../types').MapDataLayer) => {
    const isLoading = getLoadingForLayer(layerConfig.count_key || layerId);
    const error = getErrorForLayer(layerConfig.count_key || layerId);
    const data = getDataForLayer(layerConfig.count_key || layerId);
    const refreshFunction = getRefreshFunctionForLayer(layerConfig.count_key || layerId);
    const isVisible = layersVisible[layerId as keyof typeof layersVisible];

    return (
      <label key={layerId} className="flex items-center">
        <input
          type="checkbox"
          checked={isVisible}
          onChange={(e) => setLayersVisible(prev => ({ ...prev, [layerId]: e.target.checked }))}
          className="mr-2"
          disabled={isLoading}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              {/* Backend data indicator - show blinking red dot for layers with real API URLs */}
              {layerConfig.api_url && (
                <span className="backend-data-indicator"></span>
              )}
              {layerConfig.icon && <span>{layerConfig.icon}</span>}
              {layerConfig.translationKey 
                ? t(layerConfig.translationKey, { count: Array.isArray(data) ? data.length : 0 })
                : (layerConfig.count_key 
                    ? `${t(layerConfig.label)} (${Array.isArray(data) ? data.length : 0})`
                    : t(layerConfig.label)
                  )
              }
            </span>
            {layerConfig.count_key && (
              <span className="text-sm text-gray-500">
                {isLoading ? '...' : (Array.isArray(data) ? data.length : 0)}
              </span>
            )}
          </div>
          {error && layerConfig.offline_label && (
            <div className="text-xs text-red-600 mt-1">
              {t(layerConfig.offline_label)}
            </div>
          )}
        </div>
        {layerConfig.refreshable && refreshFunction && (
          <button
            onClick={(e) => {
              e.preventDefault();
              refreshFunction();
            }}
            disabled={isLoading}
            className="ml-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Refresh ${layerConfig.label.toLowerCase()}`}
          >
            <svg
              className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </label>
    );
  };

  return (
    <div 
      className={`map-container ${isFullscreen ? 'fixed inset-0 z-[9999] bg-white' : ''}`}
      ref={mapContainerRef}
    >
      {/* Mode indicator banner */}
      {(drawingMode || measurementMode) && (
        <div 
          className={`absolute z-[10] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
            getControlPosition().includes('right') 
              ? 'right-4' 
              : getControlPosition().includes('left') 
                ? 'left-4' 
                : 'left-1/2 transform -translate-x-1/2'
          }`}
          style={{
            top: getControlPosition().includes('top') ? '1rem' : 'auto',
            bottom: getControlPosition().includes('bottom') ? '1rem' : 'auto',
            right: getControlPosition().includes('right') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : 'auto',
            left: getControlPosition().includes('left') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : getControlPosition().includes('right') 
                ? 'auto' 
                : '50%',
            transform: !getControlPosition().includes('left') && !getControlPosition().includes('right') 
              ? 'translateX(-50%)' 
              : 'none'
          }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {drawingMode && (
                <>
                  <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  {t('DASHBOARD_MAP_MODES_DRAWING_ACTIVE')}
                </>
              )}
              {measurementMode && (
                <>
                  <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  {t('DASHBOARD_MAP_MODES_MEASUREMENT_ACTIVE')}
                </>
              )}
            </span>
            <span className="text-xs bg-blue-700 px-2 py-1 rounded">
              {t('DASHBOARD_MAP_MODES_PRESS_ESC')}
            </span>
          </div>
        </div>
      )}

      <MapContainer
        center={(mapSettings?.map_settings.center || mapConfig.map_settings.center) as [number, number]}
        zoom={mapSettings?.map_settings.zoom || mapConfig.map_settings.zoom}
        className={`h-full w-full z-0 ${drawingMode ? 'drawing-mode' : ''} ${measurementMode ? 'measurement-mode' : ''} ${isSelectingPosition ? 'position-selecting' : ''}`}
        zoomControl={false}
        style={{ cursor: drawingMode || measurementMode || isSelectingPosition ? 'crosshair' : 'grab' }}
        ref={mapRef}
      >
        <TileLayer
          key={currentBaseMap} // Force re-render when base map changes
          attribution={getCurrentTileLayer().attribution}
          url={getCurrentTileLayer().url}
        />

        {/* Map Events Handler */}
        <MapEvents onMapClick={handleMapClick} />

        {/* Drawing Controls */}
        <DrawingControls
          enabled={drawingMode}
          position={getControlPosition()}
          onDrawCreated={handleDrawCreated}
          onDrawDeleted={handleDrawDeleted}
        />

        {/* Measurement Controls */}
        <MeasurementControls
          enabled={measurementMode}
          onMeasurement={handleMeasurement}
        />
        
        {/* Temporary Sensors (newly added) */}
        {tempSensors.map(tempSensor => (
          <TempSensorMarker
            key={tempSensor.id}
            id={tempSensor.id}
            name={tempSensor.name}
            position={tempSensor.position}
            type={tempSensor.type}
            onRemove={handleRemoveTempSensor}
          />
        ))}

        {/* Position Selection Marker */}
        {selectedPosition && isSelectingPosition && (
          <Marker
            position={[selectedPosition.lat, selectedPosition.lng]}
            icon={L.divIcon({
              html: `
                <div style="
                  background: #3B82F6;
                  border: 3px solid white;
                  border-radius: 50%;
                  width: 20px;
                  height: 20px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  animation: pulse 2s infinite;
                "></div>
              `,
              className: 'position-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          />
        )}
        
        {/* Sensors */}
        {layersVisible.sensors && isLayerControlEnabled('sensors') && sensors.map(sensor => (
          <Marker
            key={sensor.id}
            position={sensor.coordinates}
            icon={createSensorIcon(sensor)}
            eventHandlers={{
              click: () => {
                // Handle sensor click
                console.log('Sensor clicked:', sensor.id);
              },
            }}
          >
            <Popup>
              <SensorPopup 
                sensor={sensor}
                onClose={() => {
                  // Handle popup close
                  console.log('Popup closed');
                }}
              />
            </Popup>
          </Marker>
        ))}

        {/* Green Zones */}
        {layersVisible.greenZones && isLayerControlEnabled('greenZones') && greenZones.map(zone => (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: getZoneColor(zone.type),
              fillColor: getZoneColor(zone.type),
              fillOpacity: 0.3,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-3">
                <h3 className="font-semibold text-lg mb-2">{zone.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{zone.description}</p>
                <div className="text-xs space-y-1">
                  <div>{t('DASHBOARD_MAP_GREEN_ZONE_TYPES_TYPE_LABEL')}: {t(`DASHBOARD_MAP_GREEN_ZONE_TYPES_${zone.type.toUpperCase()}`)}</div>
                  <div>{t('DASHBOARD_MAP_GREEN_ZONE_TYPES_AREA_LABEL')}: {zone.area} {t('DASHBOARD_MAP_UNITS_SQUARE_METERS')}</div>
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Air Quality Stations */}
        {isLayerControlEnabled('airQuality') && (
          <AirQualityLayer
            stations={airQualityStations}
            visible={layersVisible.airQuality}
            onStationClick={(station) => {
              console.log('Air quality station clicked:', station.id);
            }}
          />
        )}
        {/* Debug info for air quality - only show when debug is enabled */}
        {layersVisible.airQuality && isLayerControlEnabled('airQuality') && debug && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'red', color: 'white', padding: '10px', zIndex: 1000 }}>
            🔍 DEBUG: {airQualityStations.length} stations, visible: {layersVisible.airQuality.toString()}
          </div>
        )}
      </MapContainer>

      {/* Map Controls */}
      <MapControls
        ref={mapControlsRef}
        controlsSettings={mapSettings?.controls_settings || {}}
        mapControls={mapSettings?.map_controls || {}}
        mapSettings={mapSettings?.map_settings || mapConfig.map_settings}
        onControlClick={handleControlClick}
        activeControls={new Set([
          ...(drawingMode ? ['draw'] : []),
          ...(measurementMode ? ['measurement'] : []),
          ...(isFullscreen ? ['fullscreen'] : []),
          ...(showLayerPanel ? ['layer_toggle'] : []),
          ...(isRefreshing ? ['refresh'] : []),
        ])}
      />

      {/* Drawing Mode Indicator */}
      {drawingMode && (
        <div 
          className={`absolute z-[10] bg-blue-500 text-white px-3 py-2 rounded-lg text-sm max-w-xs`}
          style={{
            top: 'auto',
            bottom: getControlPosition().includes('bottom') 
              ? 'calc(var(--controls-height, 5rem) + 0.5rem)' 
              : 'auto',
            right: getControlPosition().includes('right') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : 'auto',
            left: getControlPosition().includes('left') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : getControlPosition().includes('right') 
                ? 'auto' 
                : '1rem',
          }}
        >
          <div className="font-semibold">{t('DASHBOARD_MAP_MODES_DRAWING_ACTIVE')}</div>
          <div className="text-xs mt-1">{t('DASHBOARD_MAP_MODES_DRAWING_INDICATOR')}</div>
          {drawnItems.length > 0 && (
            <div className="mt-2 text-xs border-t border-blue-400 pt-2">
              {t('DASHBOARD_MAP_MODES_SHAPES_DRAWN')}: {drawnItems.length}
            </div>
          )}
        </div>
      )}

      {/* Measurement Mode Indicator */}
      {measurementMode && (
        <div 
          className={`absolute z-[10] bg-green-500 text-white px-3 py-2 rounded-lg text-sm max-w-xs`}
          style={{
            top: '4rem',
            bottom: getControlPosition().includes('bottom') 
              ? drawingMode 
                ? 'calc(var(--controls-height, 5rem) + 6rem)' // Stack above drawing indicator
                : 'calc(var(--controls-height, 5rem) + 0.5rem)'
              : 'auto',
            right: getControlPosition().includes('right') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : 'auto',
            left: getControlPosition().includes('left') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : getControlPosition().includes('right') 
                ? 'auto' 
                : '1rem',
          }}
        >
          <div className="font-semibold">{t('DASHBOARD_MAP_MODES_MEASUREMENT_ACTIVE')}</div>
          <div className="text-xs mt-1">{t('DASHBOARD_MAP_MODES_MEASUREMENT_INDICATOR')}</div>
          {measurementResult && (
            <div className="mt-2 text-xs border-t border-green-400 pt-2">
              {measurementResult.distance && (
                <div>{t('DASHBOARD_MAP_MODES_DISTANCE')}: {(measurementResult.distance / 1000).toFixed(2)} {t('DASHBOARD_MAP_UNITS_KILOMETERS')}</div>
              )}
              {measurementResult.area && measurementResult.area > 0 && (
                <div>{t('DASHBOARD_MAP_MODES_AREA')}: {(measurementResult.area / 1000000).toFixed(2)} {t('DASHBOARD_MAP_UNITS_SQUARE_KILOMETERS')}</div>
              )}
              <div>{t('DASHBOARD_MAP_MODES_POINTS')}: {measurementResult.coordinates.length}</div>
            </div>
          )}
        </div>
      )}

      {/* Layer Toggle Panel */}
      {showLayerPanel && (
        <div 
          className={`absolute z-[10] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs ${
            getControlPosition().includes('right') ? 'right-4' : 'left-4'
          }`}
          style={{
            top: getControlPosition().includes('top') 
              ? 'calc(var(--controls-height, 5rem) + 0.5rem)' 
              : 'auto'
          }}
        >
          <h3 className="font-semibold mb-2">{t('DASHBOARD_MAP_LAYERS_PANEL_TITLE')}</h3>
          <div className="space-y-3">
            {/* Dynamic layers from configuration */}
            {getLayerToggleItems()?.map((layerId: string) => {
              const dataLayers = getDataLayers();
              const layerConfig = dataLayers?.[layerId];
              if (!layerConfig || !layerConfig.enabled) return null;
              return renderLayerToggle(layerId, layerConfig);
            })}
            
            {/* Air Quality Legend - only show when air quality layer is visible and has legend enabled */}
            {getDataLayers()?.airQuality?.showLegend && 
             layersVisible.airQuality && 
             airQualityStations.length > 0 && (
              <div className="ml-6 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                <div className="font-medium mb-1">Air Quality Index</div>
                <div className="space-y-1">
                  {getAirQualityLegend().map(({ level, color, count }) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span>{level}</span>
                      </div>
                      <span className="text-gray-500">{count || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Sensor Panel */}
      <AddSensorPanel
        isOpen={showAddSensorPanel}
        onClose={() => setShowAddSensorPanel(false)}
        onAddSensor={handleAddSensor}
        selectedPosition={selectedPosition}
        isSelectingPosition={isSelectingPosition}
        onPositionModeToggle={handlePositionModeToggle}
      />
    </div>
  );
};
