import React from 'react';
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

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  config,
  layers = [],
  className = '',
  style,
}) => {
  // Use layers from props or config, props take priority
  const mapLayers = layers.length > 0 ? layers : (config.layers || []);

  // Map configuration with defaults
  const mapConfig = {
    center: config.initialCenter,
    zoom: config.initialZoom,
    minZoom: config.minZoom || 1,
    maxZoom: config.maxZoom || 18,
    tileLayerUrl: config.tileLayerUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileLayerAttribution: config.tileLayerAttribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        minZoom={mapConfig.minZoom}
        maxZoom={mapConfig.maxZoom}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={mapConfig.tileLayerAttribution}
          url={mapConfig.tileLayerUrl}
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
