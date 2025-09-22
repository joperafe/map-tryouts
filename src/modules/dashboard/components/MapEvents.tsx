import { useMapEvents } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';

interface MapEventsProps {
  onMapClick: (e: LeafletMouseEvent) => void;
}

export function MapEvents({ onMapClick }: MapEventsProps) {
  useMapEvents({
    click: onMapClick
  });

  return null;
};
