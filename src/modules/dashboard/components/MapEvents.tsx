import React from 'react';
import { useMapEvents } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';

interface MapEventsProps {
  onMapClick: (e: LeafletMouseEvent) => void;
}

export const MapEvents: React.FC<MapEventsProps> = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick
  });

  return null;
};
