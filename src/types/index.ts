export interface Sensor {
  id: string;
  name: string;
  coordinates: [number, number];
  data: {
    temperature: number;
    humidity: number;
    airQualityIndex: number;
    noiseLevel: number;
  };
  lastUpdated: string;
  status: 'active' | 'inactive';
}

export interface GreenZone {
  id: string;
  name: string;
  polygon: [number, number][];
  area: number;
  type: string;
  description?: string;
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  maxZoom: number;
  minZoom?: number;
}

export interface AppConfig {
  ENVIRONMENT: 'DEV' | 'INT' | 'PROD';
  API: {
    baseUrl: string;
  };
  DATA: {
    sensors: string;
    greenzones: string;
  };
  FEATURES: {
    enableHeatmap: boolean;
    enableGreenZones: boolean;
  };
  MAP: {
    controls_settings: Record<string, MapControlSetting>;
    map_controls: Record<string, MapControlLayout>;
    map_settings: {
      center: number[]; // Will be exactly 2 numbers [lat, lng]
      zoom: number;
      maxZoom: number;
      minZoom: number;
      scrollWheelZoom?: boolean;
      doubleClickZoom?: boolean;
      boxZoom?: boolean;
      keyboard?: boolean;
      displayControlLabel?: boolean;
    };
    default_tile_layer?: string;
    default_attribution?: string;
    tile_layers?: Record<string, {
      name: string;
      url: string;
      attribution: string;
    }>;
  };
}

export interface MapControlSetting {
  enabled: boolean;
  label: string;
  icon?: string;
  tooltip?: string;
}

export interface MapControlLayout {
  position: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
  elements: MapControlElement[];
}

export interface MapControlElement {
  type: 'toggle' | 'switch';
  items: string[];
}

export interface APIResponse<T> {
  data: T | null;
  success: boolean;
  message?: string;
}

export interface HeatmapPoint {
  coordinates: [number, number];
  intensity: number;
}

export type Language = 'en' | 'pt';

// Utility types for better type safety
export type SensorStatus = Sensor['status'];
export type SensorData = Sensor['data'];
export type GreenZoneType = GreenZone['type'];
export type MapControlType = keyof AppConfig['MAP']['controls_settings'];
export type Environment = AppConfig['ENVIRONMENT'];

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// API Response wrapper types
export type SensorsResponse = APIResponse<Sensor[]>;
export type GreenZonesResponse = APIResponse<GreenZone[]>;
export type SensorResponse = APIResponse<Sensor>;
