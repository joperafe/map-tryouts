import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

interface DrawingControlsProps {
  enabled: boolean;
  position?: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
  onDrawCreated?: (layer: L.Layer) => void;
  onDrawDeleted?: (layers: L.Layer[]) => void;
}

export const DrawingControls: React.FC<DrawingControlsProps> = ({
  enabled,
  position = 'topright',
  onDrawCreated,
  onDrawDeleted,
}) => {
  const map = useMap();
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const controlAddedRef = useRef(false);

  useEffect(() => {
    if (!map) return;

    if (enabled) {
      // Create a feature group to store drawn items if it doesn't exist
      if (!drawnItemsRef.current) {
        drawnItemsRef.current = new L.FeatureGroup();
        map.addLayer(drawnItemsRef.current);
      }

      // Create and add the draw control if it doesn't exist
      if (!drawControlRef.current) {
        drawControlRef.current = new L.Control.Draw({
          position: position,
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: true
            },
            polyline: {
              metric: true
            },
            rectangle: {
              showArea: true
            },
            circle: {
              showRadius: true,
              metric: true
            },
            marker: {},
            circlemarker: false,
          },
          edit: {
            featureGroup: drawnItemsRef.current,
            remove: true,
          },
        });
      }

      // Add control to map if not already added
      if (!controlAddedRef.current) {
        map.addControl(drawControlRef.current);
        controlAddedRef.current = true;
        
        console.log('✅ Drawing control added to map');
        
        // Force a map invalidation to ensure the control is rendered properly
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }

      // Add custom CSS class to map container for drawing mode
      const mapContainer = map.getContainer();
      if (mapContainer) {
        mapContainer.classList.add('drawing-active');
        console.log('✅ Drawing CSS class added to map container');
      }

      // Handle drawing events
      const handleDrawCreated = (e: L.LeafletEvent) => {
        const layer = (e as unknown as { layer: L.Layer }).layer;
        drawnItemsRef.current?.addLayer(layer);
        onDrawCreated?.(layer);
      };

      const handleDrawDeleted = (e: L.LeafletEvent) => {
        const layers = Object.values((e as unknown as { layers: { _layers: Record<string, L.Layer> } }).layers._layers);
        onDrawDeleted?.(layers);
      };

      // Remove existing listeners first to prevent duplicates
      map.off(L.Draw.Event.CREATED, handleDrawCreated);
      map.off(L.Draw.Event.DELETED, handleDrawDeleted);

      // Add event listeners
      map.on(L.Draw.Event.CREATED, handleDrawCreated);
      map.on(L.Draw.Event.DELETED, handleDrawDeleted);

    } else {
      // Remove control when disabled
      if (drawControlRef.current && controlAddedRef.current) {
        try {
          map.removeControl(drawControlRef.current);
          controlAddedRef.current = false;
          console.log('🔴 Drawing control removed from map');
        } catch {
          // Control might not be on the map
          console.warn('⚠️ Failed to remove drawing control from map');
        }
      }

      // Remove custom CSS class from map container
      const mapContainer = map.getContainer();
      if (mapContainer) {
        mapContainer.classList.remove('drawing-active');
        console.log('🔴 Drawing CSS class removed from map container');
      }

      // Remove event listeners
      map.off(L.Draw.Event.CREATED);
      map.off(L.Draw.Event.DELETED);
    }

    // Cleanup function
    return () => {
      if (drawControlRef.current && controlAddedRef.current) {
        try {
          map.removeControl(drawControlRef.current);
          controlAddedRef.current = false;
        } catch {
          // Control might not exist on map
        }
      }
      map.off(L.Draw.Event.CREATED);
      map.off(L.Draw.Event.DELETED);
    };
  }, [map, enabled, position, onDrawCreated, onDrawDeleted]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (drawnItemsRef.current && map) {
        try {
          map.removeLayer(drawnItemsRef.current);
        } catch {
          // Layer might not exist
        }
        drawnItemsRef.current = null;
      }
      if (drawControlRef.current) {
        drawControlRef.current = null;
      }
    };
  }, [map]);

  return null; // This component doesn't render anything visible
};
