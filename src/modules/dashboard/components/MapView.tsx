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
import type { Sensor, GreenZone, AppConfig } from '../../../types';
import { getConfig } from '../../../config';
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
  sensors: Sensor[];
  greenZones: GreenZone[];
  mapConfig: AppConfig['MAP'];
  showSensors?: boolean;
  showGreenZones?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  sensors,
  greenZones,
  mapConfig,
  showSensors = true,
  showGreenZones = true,
}) => {
  const { t } = useTranslation();
  const config = getConfig();
  const [layersVisible, setLayersVisible] = useState({
    sensors: showSensors,
    greenZones: showGreenZones,
    heatmap: false,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
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
      
      // Add visual indicator that ESC can be used
      if (drawingMode || measurementMode) {
        console.log('Press ESC to exit current mode');
      }
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
        console.log('mapControlsRef.current :: ', mapControlsRef.current);
        const controlsRect = mapControlsRef.current.getBoundingClientRect();
        const controlsHeight = controlsRect.height + 16; // Add some margin
        const controlsWidth = controlsRect.width + 16; // Add some margin
        
        // Set CSS custom properties for controls dimensions
        mapContainerRef.current.style.setProperty('--controls-height', `${controlsHeight}px`);
        mapContainerRef.current.style.setProperty('--controls-width', `${controlsWidth}px`);
        
        console.log('Controls dimensions updated:', { height: controlsHeight, width: controlsWidth });
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
    if (measurementMode) {
      console.log('Measurement mode disabled');
    } else {
      console.log('Measurement mode enabled - Click on the map to start measuring. Press ESC to exit.');
    }
  };

  const handleDrawCreated = (layer: L.Layer) => {
    setDrawnItems(prev => [...prev, layer]);
    console.log('Shape drawn:', layer);
  };

  const handleDrawDeleted = (layers: L.Layer[]) => {
    setDrawnItems(prev => prev.filter(item => !layers.includes(item)));
    console.log('Shapes deleted:', layers);
  };

  const handleMeasurement = (result: { distance?: number; area?: number; coordinates: L.LatLng[] }) => {
    setMeasurementResult(result);
    console.log('Measurement result:', {
      distance: result.distance ? `${(result.distance / 1000).toFixed(2)} km` : undefined,
      area: result.area ? `${(result.area / 1000000).toFixed(2)} km²` : undefined,
      points: result.coordinates.length,
    });
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

  return (
    <div 
      className={`map-container ${isFullscreen ? 'fixed inset-0 z-[9999] bg-white' : ''}`}
      ref={mapContainerRef}
    >
      {/* Mode indicator banner */}
      {(drawingMode || measurementMode) && (
        <div 
          className={`absolute z-[1000] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
            Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('right') 
              ? 'right-4' 
              : Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('left') 
                ? 'left-4' 
                : 'left-1/2 transform -translate-x-1/2'
          }`}
          style={{
            top: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('top') ? '1rem' : 'auto',
            bottom: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('bottom') ? '1rem' : 'auto',
            right: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('right') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : 'auto',
            left: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('left') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('right') 
                ? 'auto' 
                : '50%',
            transform: !Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('left') && !Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('right') 
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
        center={mapConfig.map_settings.center as [number, number]}
        zoom={mapConfig.map_settings.zoom}
        className={`h-full w-full z-0 ${drawingMode ? 'drawing-mode' : ''} ${measurementMode ? 'measurement-mode' : ''} ${isSelectingPosition ? 'position-selecting' : ''}`}
        zoomControl={false}
        style={{ cursor: drawingMode || measurementMode || isSelectingPosition ? 'crosshair' : 'grab' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Events Handler */}
        <MapEvents onMapClick={handleMapClick} />

        {/* Drawing Controls */}
        <DrawingControls
          enabled={drawingMode}
          position={Object.values(config.environment.MAP.map_controls)[0]?.position || "topright"}
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
        {layersVisible.sensors && sensors.map(sensor => (
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
        {layersVisible.greenZones && greenZones.map(zone => (
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
      </MapContainer>

      {/* Map Controls */}
      <MapControls
        ref={mapControlsRef}
        controlsSettings={config.environment.MAP.controls_settings}
        mapControls={config.environment.MAP.map_controls}
        onControlClick={handleControlClick}
        activeControls={new Set([
          ...(drawingMode ? ['draw'] : []),
          ...(measurementMode ? ['measurement'] : []),
          ...(isFullscreen ? ['fullscreen'] : []),
          ...(showLayerPanel ? ['layer_toggle'] : []),
        ])}
      />

      {/* Drawing Mode Indicator */}
      {drawingMode && (
        <div 
          className={`absolute z-[1000] bg-blue-500 text-white px-3 py-2 rounded-lg text-sm max-w-xs`}
          style={{
            top: 'auto',
            bottom: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('bottom') 
              ? 'calc(var(--controls-height, 5rem) + 0.5rem)' 
              : 'auto',
            right: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('right') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : 'auto',
            left: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('left') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('right') 
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
          className={`absolute z-[1000] bg-green-500 text-white px-3 py-2 rounded-lg text-sm max-w-xs`}
          style={{
            top: '4rem',
            bottom: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('bottom') 
              ? drawingMode 
                ? 'calc(var(--controls-height, 5rem) + 6rem)' // Stack above drawing indicator
                : 'calc(var(--controls-height, 5rem) + 0.5rem)'
              : 'auto',
            right: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('right') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : 'auto',
            left: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('left') 
              ? 'calc(var(--controls-width, 5rem) + 1rem)' 
              : Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('right') 
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
          className={`absolute z-[1000] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs ${
            Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('right') ? 'right-4' : 'left-4'
          }`}
          style={{
            top: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('top') 
              ? 'calc(var(--controls-height, 5rem) + 0.5rem)' 
              : 'auto',
            bottom: Object.values(config.environment.MAP.map_controls)[0]?.position || "topright".includes('bottom') 
              ? 'calc(var(--controls-height, 5rem) + 0.5rem)' 
              : 'auto',
          }}
        >
          <h3 className="font-semibold mb-2">{t('DASHBOARD_MAP_LAYERS_PANEL_TITLE')}</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={layersVisible.sensors}
                onChange={(e) => setLayersVisible(prev => ({ ...prev, sensors: e.target.checked }))}
                className="mr-2"
              />
              {t('DASHBOARD_MAP_LAYERS_PANEL_SENSORS_COUNT', { count: sensors.length })}
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={layersVisible.greenZones}
                onChange={(e) => setLayersVisible(prev => ({ ...prev, greenZones: e.target.checked }))}
                className="mr-2"
              />
              {t('DASHBOARD_MAP_LAYERS_PANEL_GREEN_ZONES_COUNT', { count: greenZones.length })}
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={layersVisible.heatmap}
                onChange={(e) => setLayersVisible(prev => ({ ...prev, heatmap: e.target.checked }))}
                className="mr-2"
              />
              {t('DASHBOARD_MAP_LAYERS_PANEL_TEMPERATURE_HEATMAP')}
            </label>
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
