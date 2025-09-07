import { LatLngExpression, Map as LeafletMap } from 'leaflet';
import React from 'react';

// Core Map Types
export interface MapConfig {
  initialCenter: LatLngExpression;
  initialZoom: number;
  minZoom?: number;
  maxZoom?: number;
  tileLayerUrl?: string;
  tileLayerAttribution?: string;
  layers?: Layer[];
  controls?: ControlsConfig;
  features?: FeaturesConfig;
  theme?: 'light' | 'dark' | 'auto';
  plugins?: MapPlugin[];
  events?: MapEvents;
}

// Layer Types
export interface BaseLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity?: number;
  zIndex?: number;
}

export interface MarkerLayer extends BaseLayer {
  type: 'marker';
  data: MarkerData[];
  icon?: MarkerIconConfig;
}

export interface PolygonLayer extends BaseLayer {
  type: 'polygon';
  data: PolygonData[];
  style?: PolygonStyleConfig;
}

export interface HeatmapLayer extends BaseLayer {
  type: 'heatmap';
  data: HeatmapPoint[];
  config?: HeatmapConfig;
}

export type Layer = MarkerLayer | PolygonLayer | HeatmapLayer;

// Metadata type for extensibility
export type LayerMetadata = Record<string, string | number | boolean | null>;

// Data Types
export interface MarkerData {
  id: string;
  position: LatLngExpression;
  popup?: PopupContent;
  tooltip?: string;
  metadata?: LayerMetadata;
}

export interface PolygonData {
  id: string;
  positions: LatLngExpression[];
  popup?: PopupContent;
  tooltip?: string;
  metadata?: LayerMetadata;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

// Drawing shape types
export interface DrawnShape {
  type: 'polygon' | 'polyline' | 'rectangle' | 'circle' | 'marker';
  coordinates: LatLngExpression[];
  properties?: LayerMetadata;
}

// Style Configuration
export interface MarkerIconConfig {
  iconUrl?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
  popupAnchor?: [number, number];
  shadowUrl?: string;
  shadowSize?: [number, number];
  className?: string;
  html?: string; // For DivIcon
}

export interface PolygonStyleConfig {
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  weight?: number;
  opacity?: number;
  dashArray?: string;
}

export interface HeatmapConfig {
  radius?: number;
  blur?: number;
  maxZoom?: number;
  gradient?: Record<number, string>;
}

// Popup Content
export interface PopupContent {
  title?: string;
  content: string | React.ReactNode;
  maxWidth?: number;
  className?: string;
}

// Control Configuration
export interface MapControl {
  id: string;
  type: 'button' | 'toggle' | 'dropdown';
  icon: string;
  label?: string;
  tooltip?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onClick?: (control: MapControl) => void;
  disabled?: boolean;
  visible?: boolean;
}

export interface ControlsConfig {
  showZoom?: boolean;
  showFullscreen?: boolean;
  showLayers?: boolean;
  showMeasurement?: boolean;
  showDrawing?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  spacing?: number;
}

// Feature Configuration
export interface FeaturesConfig {
  clickableMarkers?: boolean;
  draggableMarkers?: boolean;
  zoomOnMarkerClick?: boolean;
  clustering?: boolean;
  drawing?: {
    enabled: boolean;
    tools?: ('polygon' | 'polyline' | 'rectangle' | 'circle' | 'marker')[];
    style?: Partial<PolygonStyleConfig>;
  };
  measurement?: {
    enabled: boolean;
    units?: 'metric' | 'imperial';
    showArea?: boolean;
    showDistance?: boolean;
  };
  layerControl?: {
    enabled: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  fullscreen?: {
    enabled: boolean;
  };
  geolocation?: {
    enabled: boolean;
    autoLocate?: boolean;
    showMarker?: boolean;
  };
}

// Events
export interface MapEvents {
  onMapClick?: (event: { latlng: LatLngExpression; originalEvent: MouseEvent }) => void;
  onMapMove?: (center: LatLngExpression, zoom: number) => void;
  onLayerToggle?: (layerId: string, visible: boolean) => void;
  onMarkerClick?: (marker: MarkerData) => void;
  onPolygonClick?: (polygon: PolygonData) => void;
  onDrawCreated?: (shape: DrawnShape) => void;
  onDrawDeleted?: (shapes: DrawnShape[]) => void;
  onMeasurement?: (result: MeasurementResult) => void;
}

export interface MeasurementResult {
  distance?: number;
  area?: number;
  coordinates: LatLngExpression[];
  units: 'metric' | 'imperial';
}

// Main Component Props
export interface InteractiveMapProps {
  config: MapConfig;
  layers: Layer[];
  controls?: ControlsConfig;
  features?: FeaturesConfig;
  events?: MapEvents;
  className?: string;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark' | 'auto';
}

// Theme Configuration
export interface ThemeConfig {
  light: {
    background: string;
    text: string;
    border: string;
    controlBackground: string;
    controlBorder: string;
  };
  dark: {
    background: string;
    text: string;
    border: string;
    controlBackground: string;
    controlBorder: string;
  };
}

// Plugin System
export interface MapPlugin {
  id: string;
  name: string;
  version: string;
  initialize: (map: LeafletMap) => void;
  destroy?: (map: LeafletMap) => void;
}

export interface PluginConfig {
  plugins: MapPlugin[];
  enabled: boolean;
}
