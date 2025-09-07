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
  environment: 'DEV' | 'INT' | 'PROD';
  api: {
    baseUrl: string;
  };
  data: {
    sensors: string;
    greenzones: string;
  };
  features: {
    enableHeatmap: boolean;
    enableGreenZones: boolean;
  };
  mapControls: {
    position: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
    controls: MapControlConfig[];
  };
  map: MapConfig;
}

export interface MapControlConfig {
  type: 'layerToggle' | 'draw' | 'fullscreen' | 'measurement';
  enabled: boolean;
  label?: string;
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
export type MapControlType = MapControlConfig['type'];
export type Environment = AppConfig['environment'];

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
