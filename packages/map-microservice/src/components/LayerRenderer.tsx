import React from 'react';
import { Marker, Popup, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Layer, MarkerLayer, PolygonLayer, MapEvents } from '../types';

interface LayerRendererProps {
  layers: Layer[];
  events?: MapEvents;
}

export const LayerRenderer: React.FC<LayerRendererProps> = ({ layers, events }) => {
  const renderMarkerLayer = (layer: MarkerLayer) => {
    if (!layer.visible) return null;

    return layer.data.map(marker => (
      <Marker
        key={marker.id}
        position={marker.position}
        icon={layer.icon ? createCustomIcon(layer.icon) : undefined}
        eventHandlers={{
          click: () => events?.onMarkerClick?.(marker),
        }}
      >
        {marker.popup && (
          <Popup maxWidth={marker.popup.maxWidth} className={marker.popup.className}>
            {marker.popup.title && <h3 style={{ margin: 0, marginBottom: 8 }}>{marker.popup.title}</h3>}
            <div>{marker.popup.content}</div>
          </Popup>
        )}
        {marker.tooltip && (
          <Tooltip>{marker.tooltip}</Tooltip>
        )}
      </Marker>
    ));
  };

  const renderPolygonLayer = (layer: PolygonLayer) => {
    if (!layer.visible) return null;

    return layer.data.map(polygon => (
      <Polygon
        key={polygon.id}
        positions={polygon.positions}
        pathOptions={layer.style}
        eventHandlers={{
          click: () => events?.onPolygonClick?.(polygon),
        }}
      >
        {polygon.popup && (
          <Popup maxWidth={polygon.popup.maxWidth} className={polygon.popup.className}>
            {polygon.popup.title && <h3 style={{ margin: 0, marginBottom: 8 }}>{polygon.popup.title}</h3>}
            <div>{polygon.popup.content}</div>
          </Popup>
        )}
        {polygon.tooltip && (
          <Tooltip>{polygon.tooltip}</Tooltip>
        )}
      </Polygon>
    ));
  };

  const createCustomIcon = (iconConfig: NonNullable<MarkerLayer['icon']>) => {
    if (iconConfig.html) {
      return L.divIcon({
        html: iconConfig.html,
        className: iconConfig.className || '',
        iconSize: iconConfig.iconSize,
        iconAnchor: iconConfig.iconAnchor,
      });
    }

    return L.icon({
      iconUrl: iconConfig.iconUrl!,
      iconSize: iconConfig.iconSize,
      iconAnchor: iconConfig.iconAnchor,
      popupAnchor: iconConfig.popupAnchor,
      shadowUrl: iconConfig.shadowUrl,
      shadowSize: iconConfig.shadowSize,
    });
  };

  return (
    <>
      {layers.map(layer => {
        switch (layer.type) {
          case 'marker':
            return renderMarkerLayer(layer as MarkerLayer);
          case 'polygon':
            return renderPolygonLayer(layer as PolygonLayer);
          case 'heatmap':
            // TODO: Implement heatmap layer
            return null;
          default:
            return null;
        }
      })}
    </>
  );
};
