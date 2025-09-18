import type { LatLngExpression, Map as LeafletMap } from 'leaflet';
import React from 'react';

// Core Map Settings (aligned with main app MAP.map_settings)
export interface MapSettings {
  center: number[]; // [lat, lng] - exactly 2 numbers
  zoom: number;
  maxZoom: number;
  minZoom: number;
  scrollWheelZoom?: boolean;
  doubleClickZoom?: boolean;
  boxZoom?: boolean;
  keyboard?: boolean;
  displayControlLabel?: boolean;
}

// Tile Layer Configuration (aligned with main app MAP.tile_layers)
export interface TileLayerConfig {
  name: string;
  url: string;
  attribution: string;
}

// Core Map Configuration (aligned with main app MAP structure)
export interface MapConfig {
  map_settings: MapSettings;
  default_tile_layer?: string;
  default_attribution?: string;
  tile_layers?: Record<string, TileLayerConfig>;
  data_layers?: Record<string, DataLayer>;
  controls_settings?: Record<string, ControlSetting>;
  map_controls?: Record<string, ControlLayout>;
}

// Data Layer Configuration (aligned with main app MAP.data_layers)
export interface DataLayer {
  enabled: boolean;
  visible: boolean;
  label: string;
  icon?: string;
  refreshable: boolean;
  count_key?: string;
  translationKey?: string;
  showLegend?: boolean;
  offline_label?: string;
  api_url?: string;
}

// Control Configuration (aligned with main app MAP.controls_settings)
export interface ControlSetting {
  enabled: boolean;
  label: string;
  icon?: string;
  tooltip?: string;
  shortcut?: string;
  items?: string[]; // Array of layer IDs for layer_toggle control
}

// Control Layout (aligned with main app MAP.map_controls)
export interface ControlLayout {
  position: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
  elements: ControlElement[];
}

export interface ControlElement {
  type: 'toggle' | 'switch';
  items: string[];
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

// Main Component Props (updated to use MAP structure)
export interface InteractiveMapProps {
  mapConfig: MapConfig; // Uses MAP structure from settings
  layers?: Layer[];
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
