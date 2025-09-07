import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MeasurementControlsProps {
  enabled: boolean;
  onMeasurement?: (result: { distance?: number; area?: number; coordinates: L.LatLng[] }) => void;
}

export const MeasurementControls: React.FC<MeasurementControlsProps> = ({
  enabled,
  onMeasurement,
}) => {
  const map = useMap();
  const isDrawingRef = useRef(false);
  const coordinatesRef = useRef<L.LatLng[]>([]);
  const measurementLayerRef = useRef<L.FeatureGroup | null>(null);
  const tempPolylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!map || !enabled) return;

    // Create measurement layer if it doesn't exist
    if (!measurementLayerRef.current) {
      measurementLayerRef.current = new L.FeatureGroup();
      map.addLayer(measurementLayerRef.current);
    }

    const measurementLayer = measurementLayerRef.current;

    const calculateDistance = (coords: L.LatLng[]): number => {
      let totalDistance = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        totalDistance += coords[i].distanceTo(coords[i + 1]);
      }
      return totalDistance;
    };

    const calculateArea = (coords: L.LatLng[]): number => {
      if (coords.length < 3) return 0;
      
      // Simple area calculation (not geodesic)
      let area = 0;
      const n = coords.length;
      
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coords[i].lng * coords[j].lat;
        area -= coords[j].lng * coords[i].lat;
      }
      
      return Math.abs(area) / 2 * 111320 * 111320; // Rough conversion to square meters
    };

    const addMarker = (latlng: L.LatLng, index: number) => {
      const marker = L.marker(latlng, {
        icon: L.divIcon({
          className: 'measurement-marker',
          html: `<div style="background: red; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px;">${index + 1}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(measurementLayer);
      
      markersRef.current.push(marker);
      return marker;
    };

    const updateMeasurement = (coords: L.LatLng[]) => {
      if (coords.length < 2) return;

      const distance = calculateDistance(coords);
      const area = coords.length > 2 ? calculateArea(coords) : 0;

      onMeasurement?.({
        distance: distance,
        area: area,
        coordinates: coords,
      });
    };

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingRef.current) {
        // Start new measurement
        isDrawingRef.current = true;
        coordinatesRef.current = [e.latlng];
        
        // Clear previous measurement
        measurementLayer.clearLayers();
        markersRef.current = [];
        tempPolylineRef.current = null;
        
        // Add first marker
        addMarker(e.latlng, 0);
      } else {
        // Add point to current measurement
        coordinatesRef.current = [...coordinatesRef.current, e.latlng];
        
        // Add marker
        addMarker(e.latlng, coordinatesRef.current.length - 1);
        
        // Update polyline
        if (tempPolylineRef.current) {
          measurementLayer.removeLayer(tempPolylineRef.current);
        }
        
        tempPolylineRef.current = L.polyline(coordinatesRef.current, {
          color: 'red',
          weight: 3,
          opacity: 0.8,
        }).addTo(measurementLayer);
        
        // Add distance labels
        const coords = coordinatesRef.current;
        if (coords.length > 1) {
          const distance = coords[coords.length - 2].distanceTo(coords[coords.length - 1]);
          const midpoint = L.latLng(
            (coords[coords.length - 2].lat + coords[coords.length - 1].lat) / 2,
            (coords[coords.length - 2].lng + coords[coords.length - 1].lng) / 2
          );
          
          const distanceText = distance > 1000 
            ? `${(distance / 1000).toFixed(2)} km`
            : `${distance.toFixed(0)} m`;
          
          L.marker(midpoint, {
            icon: L.divIcon({
              className: 'measurement-label',
              html: `<div style="background: white; padding: 2px 6px; border: 1px solid red; border-radius: 3px; font-size: 11px; white-space: nowrap;">${distanceText}</div>`,
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            }),
          }).addTo(measurementLayer);
        }
        
        updateMeasurement(coordinatesRef.current);
      }
    };

    const handleMapDoubleClick = () => {
      if (isDrawingRef.current) {
        // Finish measurement
        isDrawingRef.current = false;
        updateMeasurement(coordinatesRef.current);
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawingRef.current) {
        // Cancel measurement
        isDrawingRef.current = false;
        coordinatesRef.current = [];
        measurementLayer.clearLayers();
        markersRef.current = [];
        tempPolylineRef.current = null;
      }
    };

    map.on('click', handleMapClick);
    map.on('dblclick', handleMapDoubleClick);
    document.addEventListener('keydown', handleEscKey);

    // Change cursor when measuring
    map.getContainer().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDoubleClick);
      document.removeEventListener('keydown', handleEscKey);
      map.getContainer().style.cursor = '';
      isDrawingRef.current = false;
      coordinatesRef.current = [];
    };
  }, [map, enabled, onMeasurement]);

  // Cleanup when disabled
  useEffect(() => {
    if (!enabled && measurementLayerRef.current && map) {
      map.removeLayer(measurementLayerRef.current);
      measurementLayerRef.current = null;
      isDrawingRef.current = false;
      coordinatesRef.current = [];
      markersRef.current = [];
      tempPolylineRef.current = null;
    }
  }, [enabled, map]);

  return null;
};
