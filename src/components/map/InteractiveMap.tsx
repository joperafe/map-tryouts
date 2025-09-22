import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { InteractiveMapProps, MarkerLayer, PolygonLayer, HeatmapLayer } from './types';

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function InteractiveMap({
  mapConfig,
  layers = [],
  className = '',
  style,
}: InteractiveMapProps) {
  // Use layers from props or mapConfig data layers
  const mapLayers = layers.length > 0 ? layers : [];

  // Extract map settings from the MAP.map_settings structure
  const { map_settings } = mapConfig;
  
  // Get tile layer configuration
  const defaultTileLayer = mapConfig.default_tile_layer || 'openstreetmap';
  const tileLayerConfig = mapConfig.tile_layers?.[defaultTileLayer];
  
  // Map configuration using MAP.map_settings
  const leafletMapConfig = {
    center: [map_settings.center[0], map_settings.center[1]] as [number, number],
    zoom: map_settings.zoom,
    minZoom: map_settings.minZoom,
    maxZoom: map_settings.maxZoom,
    scrollWheelZoom: map_settings.scrollWheelZoom ?? true,
    doubleClickZoom: map_settings.doubleClickZoom ?? true,
    boxZoom: map_settings.boxZoom ?? true,
    keyboard: map_settings.keyboard ?? true,
  };

  // Tile layer configuration
  const tileConfig = {
    url: tileLayerConfig?.url || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: tileLayerConfig?.attribution || mapConfig.default_attribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  };

  const containerStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    ...style,
  };

  const renderLayer = (layer: MarkerLayer | PolygonLayer | HeatmapLayer) => {
    if (!layer.visible) return null;

    switch (layer.type) {
      case 'marker': {
        const markerLayer = layer as MarkerLayer;
        return markerLayer.data.map((markerData, index) => {
          let customIcon = undefined;
          if (markerLayer.icon && markerLayer.icon.iconUrl) {
            const iconOptions = {
              iconUrl: markerLayer.icon.iconUrl,
              iconSize: markerLayer.icon.iconSize,
              iconAnchor: markerLayer.icon.iconAnchor,
              popupAnchor: markerLayer.icon.popupAnchor,
            };
            customIcon = L.icon(iconOptions);
          }

          return (
            <Marker
              key={`${layer.id}-${index}`}
              position={markerData.position}
              icon={customIcon}
            >
              {markerData.popup && (
                <Popup>
                  <div dangerouslySetInnerHTML={{ __html: markerData.popup }} />
                </Popup>
              )}
            </Marker>
          );
        });
      }

      case 'polygon': {
        const polygonLayer = layer as PolygonLayer;
        return polygonLayer.data.map((polygonData, index) => (
          <Polygon
            key={`${layer.id}-${index}`}
            positions={polygonData.positions}
            pathOptions={polygonLayer.style}
          >
            {polygonData.popup && (
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: polygonData.popup }} />
              </Popup>
            )}
          </Polygon>
        ));
      }

      case 'heatmap':
        // For now, render heatmap as circles (simplified)
        return null;

      default:
        return null;
    }
  };

  return (
    <div 
      className={`interactive-map ${className}`}
      style={containerStyle}
    >
      <MapContainer
        center={leafletMapConfig.center}
        zoom={leafletMapConfig.zoom}
        minZoom={leafletMapConfig.minZoom}
        maxZoom={leafletMapConfig.maxZoom}
        scrollWheelZoom={leafletMapConfig.scrollWheelZoom}
        doubleClickZoom={leafletMapConfig.doubleClickZoom}
        boxZoom={leafletMapConfig.boxZoom}
        keyboard={leafletMapConfig.keyboard}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={tileConfig.attribution}
          url={tileConfig.url}
        />

        {/* Render all layers */}
        {mapLayers.map((layer) => (
          <div key={layer.id}>
            {renderLayer(layer)}
          </div>
        ))}
      </MapContainer>
    </div>
  );
};